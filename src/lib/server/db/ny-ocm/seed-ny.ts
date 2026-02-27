import { existsSync, readFileSync } from 'fs';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, inArray } from 'drizzle-orm';
import * as schema from '../schema.js';
import { NY_PARTS } from './part-config.js';
import { parseNYRegulation } from './parse-ny-regulation.js';
import { extractSectionNumber } from '../../../utils/citation-parser.js';
import type { ContentNode } from '../../../types/index.js';

const CODE_NUMBER = '9 NYCRR';

async function seedNY() {
	const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/regulations';
	const client = postgres(connectionString);
	const db = drizzle(client, { schema });

	console.log('🌱 Starting NY OCM database seed...');

	// 1. Upsert the regulatory code for NY
	let [existingCode] = await db
		.select()
		.from(schema.regulatoryCodes)
		.where(eq(schema.regulatoryCodes.codeNumber, CODE_NUMBER))
		.limit(1);

	if (!existingCode) {
		[existingCode] = await db
			.insert(schema.regulatoryCodes)
			.values({
				codeNumber: CODE_NUMBER,
				title: 'Office of Cannabis Management Regulations',
				jurisdiction: 'New York'
			})
			.returning();
		console.log('📝 Created regulatory code: 9 NYCRR');
	} else {
		console.log('📝 Using existing regulatory code: 9 NYCRR');
	}

	const codeId = existingCode.id;

	// Track all section IDs across parts for cross-reference resolution
	const globalSectionIdMap: Record<string, string> = {};

	// 2. Seed each part
	for (const part of NY_PARTS) {
		if (!existsSync(part.sourceFile)) {
			console.warn(`⚠️  Skipping Part ${part.partNumber}: source file not found (${part.sourceFile})`);
			continue;
		}

		console.log(`\n📦 Seeding Part ${part.partNumber}: ${part.title}`);

		const rawText = readFileSync(part.sourceFile, 'utf-8');
		console.log(`   📄 Read ${rawText.length} characters`);

		const parsedSections = parseNYRegulation(rawText, part.partNumber);
		console.log(`   📑 Parsed ${parsedSections.length} sections`);

		// Delete existing data for this part (jurisdiction-scoped)
		const [existingTitle] = await db
			.select()
			.from(schema.regulationTitles)
			.where(eq(schema.regulationTitles.slug, part.slug))
			.limit(1);

		if (existingTitle) {
			const existingSections = await db
				.select({ id: schema.sections.id })
				.from(schema.sections)
				.where(eq(schema.sections.titleId, existingTitle.id));

			const sectionIds = existingSections.map((s) => s.id);

			if (sectionIds.length > 0) {
				await db.delete(schema.annotations).where(inArray(schema.annotations.sectionId, sectionIds));
				await db.delete(schema.bookmarks).where(inArray(schema.bookmarks.sectionId, sectionIds));
				await db.delete(schema.amendments).where(inArray(schema.amendments.sectionId, sectionIds));
				await db
					.delete(schema.crossReferences)
					.where(inArray(schema.crossReferences.sourceSectionId, sectionIds));
				await db.delete(schema.sections).where(eq(schema.sections.titleId, existingTitle.id));
			}

			await db.delete(schema.regulationTitles).where(eq(schema.regulationTitles.id, existingTitle.id));
			console.log(`   🗑️  Cleared existing Part ${part.partNumber} data`);
		}

		// Insert regulation title for this part
		const [title] = await db
			.insert(schema.regulationTitles)
			.values({
				codeId,
				titleNumber: `Part ${part.partNumber}`,
				title: part.title,
				description: `9 NYCRR Part ${part.partNumber} - ${part.title}`,
				slug: part.slug,
				sortOrder: part.sortOrder
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

		// Insert cross-references (intra-part, first pass)
		let crossRefCount = 0;
		for (const section of parsedSections) {
			const refs = extractCrossRefs(section.contentTree);

			for (const ref of refs) {
				const targetSectionNum = extractSectionNumber(ref.targetCitation);
				const targetSectionId = sectionIdMap[targetSectionNum] || null;

				const subsectionMatch = ref.targetCitation.match(/^\d+\.\d+(.*)/);
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

	// 3. Second pass: resolve cross-part references
	console.log('\n🔗 Resolving cross-part references...');
	let resolvedCount = 0;

	// Find all unresolved internal cross-refs for NY sections
	const allNYSectionIds = Object.values(globalSectionIdMap);
	if (allNYSectionIds.length > 0) {
		const unresolvedRefs = await db
			.select()
			.from(schema.crossReferences)
			.where(inArray(schema.crossReferences.sourceSectionId, allNYSectionIds));

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

	console.log(`   ✅ Resolved ${resolvedCount} cross-part references`);

	console.log('\n✅ NY OCM seed complete!');
	console.log(`   - ${Object.keys(globalSectionIdMap).length} total sections across all parts`);

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

seedNY().catch((err) => {
	console.error('NY seed failed:', err);
	process.exit(1);
});
