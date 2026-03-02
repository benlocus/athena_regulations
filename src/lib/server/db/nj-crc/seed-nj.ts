import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, inArray } from 'drizzle-orm';
import * as schema from '../schema.js';
import { NJ_SUBCHAPTERS, NJ_STATUTE, NJ_GUIDANCE_DOCS } from './subchapter-config.js';
import { parseNJRegulation } from './parse-nj-regulation.js';
import { parseNJStatute } from './parse-nj-statute.js';
import { parseNJGuidance } from './parse-nj-guidance.js';
import { extractSectionNumber } from '../../../utils/citation-parser.js';
import type { ContentNode } from '../../../types/index.js';

const REGULATION_CODE = 'N.J.A.C. 17:30';
const STATUTE_CODE = 'N.J.S.A. 24:6I';
const GUIDANCE_CODE = 'NJ CRC Guidance';
const SEED_DATA_DIR = 'src/lib/server/db/nj-crc/seed-data';

const priorityOnly = process.argv.includes('--priority-only');

async function seedNJ() {
	const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/regulations';
	const client = postgres(connectionString);
	const db = drizzle(client, { schema });

	console.log('🌱 Starting NJ CRC database seed...');
	if (priorityOnly) {
		console.log('   ⚡ Priority-only mode: seeding subchapters 10 and 11 only');
	}

	// Ensure seed-data directory exists
	mkdirSync(SEED_DATA_DIR, { recursive: true });

	// ── 1. Seed N.J.A.C. 17:30 Regulations ──────────────────────────

	let [regCode] = await db
		.select()
		.from(schema.regulatoryCodes)
		.where(eq(schema.regulatoryCodes.codeNumber, REGULATION_CODE))
		.limit(1);

	if (!regCode) {
		[regCode] = await db
			.insert(schema.regulatoryCodes)
			.values({
				codeNumber: REGULATION_CODE,
				title: 'Cannabis Regulatory Commission Personal Use Cannabis Rules',
				jurisdiction: 'New Jersey'
			})
			.returning();
		console.log(`📝 Created regulatory code: ${REGULATION_CODE}`);
	} else {
		console.log(`📝 Using existing regulatory code: ${REGULATION_CODE}`);
	}

	const regCodeId = regCode.id;

	// Track all section IDs across subchapters for cross-reference resolution
	const globalSectionIdMap: Record<string, string> = {};

	// Seed each subchapter
	const subchaptersToSeed = priorityOnly
		? NJ_SUBCHAPTERS.filter((s) => s.priority)
		: NJ_SUBCHAPTERS;

	for (const subchapter of subchaptersToSeed) {
		if (!existsSync(subchapter.sourceFile)) {
			console.warn(
				`⚠️  Skipping Subchapter ${subchapter.subchapterNumber}: source file not found (${subchapter.sourceFile})`
			);
			continue;
		}

		console.log(`\n📦 Seeding Subchapter ${subchapter.subchapterNumber}: ${subchapter.title}`);

		const rawText = readFileSync(subchapter.sourceFile, 'utf-8');
		console.log(`   📄 Read ${rawText.length} characters`);

		const parsedSections = parseNJRegulation(rawText, subchapter.subchapterNumber);
		console.log(`   📑 Parsed ${parsedSections.length} sections`);

		// Save seed data JSON for review
		for (const section of parsedSections) {
			const filename = `${SEED_DATA_DIR}/${section.slug}.json`;
			writeFileSync(
				filename,
				JSON.stringify(
					{
						sectionNumber: section.sectionNumber,
						heading: section.heading,
						slug: section.slug,
						contentTree: section.contentTree,
						sortOrder: section.sortOrder
					},
					null,
					2
				)
			);
		}

		// Delete existing data for this subchapter
		const [existingTitle] = await db
			.select()
			.from(schema.regulationTitles)
			.where(eq(schema.regulationTitles.slug, subchapter.slug))
			.limit(1);

		if (existingTitle) {
			const existingSections = await db
				.select({ id: schema.sections.id })
				.from(schema.sections)
				.where(eq(schema.sections.titleId, existingTitle.id));

			const sectionIds = existingSections.map((s) => s.id);

			if (sectionIds.length > 0) {
				await db
					.delete(schema.annotations)
					.where(inArray(schema.annotations.sectionId, sectionIds));
				await db.delete(schema.bookmarks).where(inArray(schema.bookmarks.sectionId, sectionIds));
				await db.delete(schema.amendments).where(inArray(schema.amendments.sectionId, sectionIds));
				await db
					.delete(schema.crossReferences)
					.where(inArray(schema.crossReferences.sourceSectionId, sectionIds));
				await db.delete(schema.sections).where(eq(schema.sections.titleId, existingTitle.id));
			}

			await db
				.delete(schema.regulationTitles)
				.where(eq(schema.regulationTitles.id, existingTitle.id));
			console.log(`   🗑️  Cleared existing Subchapter ${subchapter.subchapterNumber} data`);
		}

		// Insert regulation title for this subchapter
		const [title] = await db
			.insert(schema.regulationTitles)
			.values({
				codeId: regCodeId,
				titleNumber: `Subchapter ${subchapter.subchapterNumber}`,
				title: subchapter.title,
				description: `N.J.A.C. 17:30 Subchapter ${subchapter.subchapterNumber} - ${subchapter.title}`,
				slug: subchapter.slug,
				sortOrder: subchapter.sortOrder
			})
			.returning();

		// Insert sections
		const sectionIdMap: Record<string, string> = {};

		for (const section of parsedSections) {
			const [inserted] = await db
				.insert(schema.sections)
				.values({
					titleId: title.id,
					sectionNumber: section.sectionNumber,
					heading: section.heading,
					slug: section.slug,
					contentTree: section.contentTree,
					plainText: section.plainText,
					sortOrder: section.sortOrder
				})
				.returning();

			sectionIdMap[section.sectionNumber] = inserted.id;
			globalSectionIdMap[section.sectionNumber] = inserted.id;
		}

		console.log(`   ✅ Inserted ${Object.keys(sectionIdMap).length} sections`);

		// Insert cross-references (intra-subchapter, first pass)
		let crossRefCount = 0;
		for (const section of parsedSections) {
			const refs = extractCrossRefs(section.contentTree);

			for (const ref of refs) {
				const targetSectionNum = extractSectionNumber(ref.targetCitation);
				const targetSectionId = sectionIdMap[targetSectionNum] || null;

				const subsectionMatch = ref.targetCitation.match(/^\d+:\d+-\d+\.\d+(.*)/);
				const targetSubsection = subsectionMatch?.[1] || null;

				await db.insert(schema.crossReferences).values({
					sourceSectionId: sectionIdMap[section.sectionNumber],
					sourceNodeId: ref.sourceNodeId,
					targetCitation: ref.targetCitation,
					targetSectionId,
					targetSubsection: targetSubsection || null,
					referenceType: ref.isExternal ? 'external_statute' : 'internal',
					displayText: ref.displayText
				});

				crossRefCount++;
			}
		}

		console.log(`   🔗 Inserted ${crossRefCount} cross-references`);
	}

	// ── 2. Resolve cross-subchapter references ──────────────────────

	console.log('\n🔗 Resolving cross-subchapter references...');
	let resolvedCount = 0;

	const allNJSectionIds = Object.values(globalSectionIdMap);
	if (allNJSectionIds.length > 0) {
		const unresolvedRefs = await db
			.select()
			.from(schema.crossReferences)
			.where(inArray(schema.crossReferences.sourceSectionId, allNJSectionIds));

		for (const ref of unresolvedRefs) {
			if (ref.targetSectionId !== null) continue;
			if (ref.referenceType === 'external_statute') continue;

			const targetSectionNum = extractSectionNumber(ref.targetCitation);
			const targetId = globalSectionIdMap[targetSectionNum];

			if (targetId) {
				await db
					.update(schema.crossReferences)
					.set({ targetSectionId: targetId })
					.where(eq(schema.crossReferences.id, ref.id));
				resolvedCount++;
			}
		}
	}

	console.log(`   ✅ Resolved ${resolvedCount} cross-subchapter references`);

	// ── 3. Seed CREAMMA Statute (if not priority-only) ──────────────

	if (!priorityOnly && existsSync(NJ_STATUTE.sourceFile)) {
		console.log('\n📜 Seeding CREAMMA statute...');

		let [statCode] = await db
			.select()
			.from(schema.regulatoryCodes)
			.where(eq(schema.regulatoryCodes.codeNumber, STATUTE_CODE))
			.limit(1);

		if (!statCode) {
			[statCode] = await db
				.insert(schema.regulatoryCodes)
				.values({
					codeNumber: STATUTE_CODE,
					title: 'Cannabis Regulatory, Enforcement Assistance, and Marketplace Modernization Act',
					jurisdiction: 'New Jersey'
				})
				.returning();
		}

		const rawText = readFileSync(NJ_STATUTE.sourceFile, 'utf-8');
		const parsedSections = parseNJStatute(rawText);
		console.log(`   📑 Parsed ${parsedSections.length} statutory sections`);

		// Delete existing
		const [existingTitle] = await db
			.select()
			.from(schema.regulationTitles)
			.where(eq(schema.regulationTitles.slug, NJ_STATUTE.slug))
			.limit(1);

		if (existingTitle) {
			const existingSections = await db
				.select({ id: schema.sections.id })
				.from(schema.sections)
				.where(eq(schema.sections.titleId, existingTitle.id));

			const sectionIds = existingSections.map((s) => s.id);

			if (sectionIds.length > 0) {
				await db
					.delete(schema.crossReferences)
					.where(inArray(schema.crossReferences.sourceSectionId, sectionIds));
				await db.delete(schema.sections).where(eq(schema.sections.titleId, existingTitle.id));
			}

			await db
				.delete(schema.regulationTitles)
				.where(eq(schema.regulationTitles.id, existingTitle.id));
		}

		const [title] = await db
			.insert(schema.regulationTitles)
			.values({
				codeId: statCode.id,
				titleNumber: '24:6I',
				title: NJ_STATUTE.title,
				description: 'N.J.S.A. 24:6I-31 through 24:6I-56 (P.L. 2021, c.16)',
				slug: NJ_STATUTE.slug,
				sortOrder: 0
			})
			.returning();

		for (const section of parsedSections) {
			await db.insert(schema.sections).values({
				titleId: title.id,
				sectionNumber: section.sectionNumber,
				heading: section.heading,
				slug: section.slug,
				contentTree: section.contentTree,
				plainText: section.plainText,
				sortOrder: section.sortOrder
			});
		}

		console.log(`   ✅ Inserted ${parsedSections.length} CREAMMA sections`);
	}

	// ── 4. Seed Guidance Documents (if not priority-only) ───────────

	if (!priorityOnly) {
		let guidanceSeeded = false;

		for (const doc of NJ_GUIDANCE_DOCS) {
			if (!existsSync(doc.sourceFile)) {
				console.warn(`⚠️  Skipping guidance doc "${doc.title}": source file not found`);
				continue;
			}

			if (!guidanceSeeded) {
				console.log('\n📋 Seeding guidance documents...');

				let [guidCode] = await db
					.select()
					.from(schema.regulatoryCodes)
					.where(eq(schema.regulatoryCodes.codeNumber, GUIDANCE_CODE))
					.limit(1);

				if (!guidCode) {
					await db
						.insert(schema.regulatoryCodes)
						.values({
							codeNumber: GUIDANCE_CODE,
							title: 'Cannabis Regulatory Commission Guidance Documents',
							jurisdiction: 'New Jersey'
						})
						.returning();
				}

				guidanceSeeded = true;
			}

			const [guidCode] = await db
				.select()
				.from(schema.regulatoryCodes)
				.where(eq(schema.regulatoryCodes.codeNumber, GUIDANCE_CODE))
				.limit(1);

			const rawText = readFileSync(doc.sourceFile, 'utf-8');
			const parsedSections = parseNJGuidance(rawText, doc.documentId);
			console.log(`   📑 Parsed ${parsedSections.length} sections from "${doc.title}"`);

			// Delete existing
			const [existingTitle] = await db
				.select()
				.from(schema.regulationTitles)
				.where(eq(schema.regulationTitles.slug, doc.slug))
				.limit(1);

			if (existingTitle) {
				const existingSections = await db
					.select({ id: schema.sections.id })
					.from(schema.sections)
					.where(eq(schema.sections.titleId, existingTitle.id));

				const sectionIds = existingSections.map((s) => s.id);

				if (sectionIds.length > 0) {
					await db
						.delete(schema.crossReferences)
						.where(inArray(schema.crossReferences.sourceSectionId, sectionIds));
					await db
						.delete(schema.sections)
						.where(eq(schema.sections.titleId, existingTitle.id));
				}

				await db
					.delete(schema.regulationTitles)
					.where(eq(schema.regulationTitles.id, existingTitle.id));
			}

			const [title] = await db
				.insert(schema.regulationTitles)
				.values({
					codeId: guidCode.id,
					titleNumber: doc.documentId,
					title: doc.title,
					description: `NJ CRC Guidance: ${doc.title}`,
					slug: doc.slug,
					sortOrder: doc.sortOrder
				})
				.returning();

			for (const section of parsedSections) {
				await db.insert(schema.sections).values({
					titleId: title.id,
					sectionNumber: section.sectionNumber,
					heading: section.heading,
					slug: section.slug,
					contentTree: section.contentTree,
					plainText: section.plainText,
					sortOrder: section.sortOrder
				});
			}

			console.log(`   ✅ Inserted ${parsedSections.length} sections for "${doc.title}"`);
		}
	}

	// ── Summary ─────────────────────────────────────────────────────

	console.log('\n✅ NJ CRC seed complete!');
	console.log(`   - ${Object.keys(globalSectionIdMap).length} total regulation sections`);

	await client.end();
}

type CrossRefInfo = {
	sourceNodeId: string;
	targetCitation: string;
	displayText: string;
	isExternal: boolean;
};

function extractCrossRefs(nodes: ContentNode[]): CrossRefInfo[] {
	const refs: CrossRefInfo[] = [];
	const refPattern = /\{\{(ref|extref):([^}]+)\}\}/g;

	function walk(node: ContentNode) {
		if (node.content) {
			let match;
			while ((match = refPattern.exec(node.content)) !== null) {
				refs.push({
					sourceNodeId: node.id,
					targetCitation: match[2],
					displayText: match[2],
					isExternal: match[1] === 'extref'
				});
			}
		}
		for (const child of node.children) {
			walk(child);
		}
	}

	for (const node of nodes) {
		walk(node);
	}

	return refs;
}

seedNJ().catch((err) => {
	console.error('NJ seed failed:', err);
	process.exit(1);
});
