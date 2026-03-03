import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, inArray } from 'drizzle-orm';
import * as schema from './schema.js';
import { parseRegulationText } from './parse-regulation.js';
import { extractSectionNumber } from '../../utils/citation-parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function seed() {
	const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/regulations';
	const client = postgres(connectionString);
	const db = drizzle(client, { schema });

	console.log('🌱 Starting database seed...');

	// 1. Read the raw regulation text
	const rawText = readFileSync('/tmp/935-cmr-500.txt', 'utf-8');
	console.log(`📄 Read regulation text: ${rawText.length} characters`);

	// 2. Parse sections
	const parsedSections = parseRegulationText(rawText);
	console.log(`📑 Parsed ${parsedSections.length} sections`);

	// 3. Save seed data as JSON files for review
	const seedDataDir = join(__dirname, 'seed-data');
	mkdirSync(seedDataDir, { recursive: true });

	for (const section of parsedSections) {
		const filename = section.sectionNumber.replace('.', '-') + '.json';
		writeFileSync(
			join(seedDataDir, filename),
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
	console.log(`💾 Saved seed data to ${seedDataDir}`);

	// 4. Clear existing MA data (jurisdiction-scoped delete)
	console.log('🗑️  Clearing existing MA data...');
	const [existingCode] = await db
		.select()
		.from(schema.regulatoryCodes)
		.where(eq(schema.regulatoryCodes.codeNumber, '935 CMR'))
		.limit(1);

	if (existingCode) {
		const maTitles = await db
			.select({ id: schema.regulationTitles.id })
			.from(schema.regulationTitles)
			.where(eq(schema.regulationTitles.codeId, existingCode.id));

		const titleIds = maTitles.map((t) => t.id);

		if (titleIds.length > 0) {
			const maSections = await db
				.select({ id: schema.sections.id })
				.from(schema.sections)
				.where(inArray(schema.sections.titleId, titleIds));

			const sectionIds = maSections.map((s) => s.id);

			if (sectionIds.length > 0) {
				await db.delete(schema.annotations).where(inArray(schema.annotations.sectionId, sectionIds));
				await db.delete(schema.bookmarks).where(inArray(schema.bookmarks.sectionId, sectionIds));
				await db.delete(schema.amendments).where(inArray(schema.amendments.sectionId, sectionIds));
				await db
					.delete(schema.crossReferences)
					.where(inArray(schema.crossReferences.sourceSectionId, sectionIds));
				await db.delete(schema.sections).where(inArray(schema.sections.titleId, titleIds));
			}

			await db
				.delete(schema.regulationTitles)
				.where(eq(schema.regulationTitles.codeId, existingCode.id));
		}

		await db.delete(schema.regulatoryCodes).where(eq(schema.regulatoryCodes.codeNumber, '935 CMR'));
	}

	// 5. Insert regulatory code
	console.log('📝 Inserting regulatory code...');
	const [code] = await db
		.insert(schema.regulatoryCodes)
		.values({
			codeNumber: '935 CMR',
			title: 'Cannabis Control Commission Regulations',
			jurisdiction: 'Massachusetts',
			slug: '935-cmr'
		})
		.returning();

	// 6. Insert regulation title
	const [title] = await db
		.insert(schema.regulationTitles)
		.values({
			codeId: code.id,
			titleNumber: '500.000',
			title: 'Adult Use of Marijuana',
			description:
				'Regulations governing the adult use of marijuana in the Commonwealth of Massachusetts, implementing St. 2017, c. 55, An Act to Ensure Safe Access to Marijuana, and M.G.L. c. 94G.',
			slug: '935-cmr-500',
			sortOrder: 0
		})
		.returning();

	console.log(`📝 Created regulation title: ${title.title} (${title.slug})`);

	// 7. Insert sections
	console.log('📝 Inserting sections...');
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
	}

	console.log(`✅ Inserted ${Object.keys(sectionIdMap).length} sections`);

	// 8. Extract and insert cross-references
	console.log('🔗 Extracting cross-references...');
	let crossRefCount = 0;

	for (const section of parsedSections) {
		const refs = extractCrossRefs(section.contentTree, section.sectionNumber);

		for (const ref of refs) {
			const targetSectionNum = extractSectionNumber(ref.targetCitation);
			const targetSectionId = sectionIdMap[targetSectionNum] || null;

			// Determine subsection part
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

	console.log(`✅ Inserted ${crossRefCount} cross-references`);

	// 9. Insert amendment history
	console.log('📝 Inserting amendment history...');
	const amendmentData = [
		{
			sectionNumber: '500.001',
			type: 'adopted',
			date: '2018-03-09',
			register: 'Issue 1346',
			description: 'Initial adoption of adult use marijuana regulations'
		},
		{
			sectionNumber: '500.002',
			type: 'amended',
			date: '2023-11-03',
			register: 'Issue 1504',
			description: 'Updated definitions for delivery, social consumption, and research'
		},
		{
			sectionNumber: '500.105',
			type: 'amended',
			date: '2023-11-03',
			register: 'Issue 1504',
			description: 'Updated general operational requirements'
		},
		{
			sectionNumber: '500.110',
			type: 'amended',
			date: '2023-11-03',
			register: 'Issue 1504',
			description: 'Updated security requirements'
		},
		{
			sectionNumber: '500.140',
			type: 'amended',
			date: '2023-11-03',
			register: 'Issue 1504',
			description: 'Updated retail sale requirements'
		},
		{
			sectionNumber: '500.150',
			type: 'amended',
			date: '2023-11-03',
			register: 'Issue 1504',
			description: 'Updated edibles requirements'
		},
		{
			sectionNumber: '500.160',
			type: 'amended',
			date: '2023-11-03',
			register: 'Issue 1504',
			description: 'Updated testing requirements'
		}
	];

	for (const amendment of amendmentData) {
		const sectionId = sectionIdMap[amendment.sectionNumber];
		if (sectionId) {
			await db.insert(schema.amendments).values({
				sectionId,
				amendmentType: amendment.type,
				effectiveDate: amendment.date,
				massRegister: amendment.register,
				description: amendment.description,
				sortOrder: 0
			});
		}
	}

	console.log(`✅ Inserted ${amendmentData.length} amendments`);

	// 10. Save metadata
	writeFileSync(
		join(seedDataDir, 'metadata.json'),
		JSON.stringify(
			{
				code: {
					codeNumber: '935 CMR',
					title: 'Cannabis Control Commission Regulations',
					jurisdiction: 'Massachusetts'
				},
				title: {
					titleNumber: '500.000',
					title: 'Adult Use of Marijuana',
					slug: '935-cmr-500'
				},
				sectionCount: parsedSections.length,
				crossRefCount,
				sections: parsedSections.map((s) => ({
					sectionNumber: s.sectionNumber,
					heading: s.heading,
					slug: s.slug
				}))
			},
			null,
			2
		)
	);

	console.log('✅ Seed complete!');
	console.log(`   - ${parsedSections.length} sections`);
	console.log(`   - ${crossRefCount} cross-references`);
	console.log(`   - ${amendmentData.length} amendments`);

	await client.end();
}

type CrossRefInfo = {
	sourceNodeId: string;
	targetCitation: string;
	displayText: string;
	isExternal: boolean;
};

function extractCrossRefs(
	nodes: import('../../types/index.js').ContentNode[],
	sectionNumber: string
): CrossRefInfo[] {
	const refs: CrossRefInfo[] = [];
	const refPattern = /\{\{(ref|extref):([^}]+)\}\}/g;

	function walk(node: import('../../types/index.js').ContentNode) {
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

seed().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
