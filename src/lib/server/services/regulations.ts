import { db } from '$lib/server/db';
import { regulatoryCodes, regulationTitles, sections, crossReferences, amendments } from '$lib/server/db/schema';
import { eq, asc, and } from 'drizzle-orm';

export async function getTitles() {
	return db
		.select({
			id: regulationTitles.id,
			codeId: regulationTitles.codeId,
			titleNumber: regulationTitles.titleNumber,
			title: regulationTitles.title,
			description: regulationTitles.description,
			slug: regulationTitles.slug,
			sortOrder: regulationTitles.sortOrder,
			codeNumber: regulatoryCodes.codeNumber,
			jurisdiction: regulatoryCodes.jurisdiction
		})
		.from(regulationTitles)
		.innerJoin(regulatoryCodes, eq(regulationTitles.codeId, regulatoryCodes.id))
		.orderBy(asc(regulationTitles.sortOrder));
}

export async function getTitle(slug: string) {
	const rows = await db
		.select({
			id: regulationTitles.id,
			codeId: regulationTitles.codeId,
			titleNumber: regulationTitles.titleNumber,
			title: regulationTitles.title,
			description: regulationTitles.description,
			slug: regulationTitles.slug,
			sortOrder: regulationTitles.sortOrder,
			codeNumber: regulatoryCodes.codeNumber,
			jurisdiction: regulatoryCodes.jurisdiction
		})
		.from(regulationTitles)
		.innerJoin(regulatoryCodes, eq(regulationTitles.codeId, regulatoryCodes.id))
		.where(eq(regulationTitles.slug, slug))
		.limit(1);

	return rows[0] ?? null;
}

export async function getSections(titleId: string) {
	return db
		.select({
			id: sections.id,
			titleId: sections.titleId,
			sectionNumber: sections.sectionNumber,
			heading: sections.heading,
			slug: sections.slug,
			sortOrder: sections.sortOrder,
			isRepealed: sections.isRepealed
		})
		.from(sections)
		.where(eq(sections.titleId, titleId))
		.orderBy(asc(sections.sortOrder));
}

export async function getSection(titleId: string, slug: string) {
	const rows = await db
		.select()
		.from(sections)
		.where(and(eq(sections.titleId, titleId), eq(sections.slug, slug)))
		.limit(1);

	return rows[0] ?? null;
}

export async function getSectionCrossReferences(sectionId: string) {
	return db
		.select({
			id: crossReferences.id,
			sourceSectionId: crossReferences.sourceSectionId,
			sourceNodeId: crossReferences.sourceNodeId,
			targetCitation: crossReferences.targetCitation,
			targetSectionId: crossReferences.targetSectionId,
			targetSubsection: crossReferences.targetSubsection,
			referenceType: crossReferences.referenceType,
			displayText: crossReferences.displayText,
			targetSlug: sections.slug,
			targetTitleSlug: regulationTitles.slug
		})
		.from(crossReferences)
		.leftJoin(sections, eq(crossReferences.targetSectionId, sections.id))
		.leftJoin(regulationTitles, eq(sections.titleId, regulationTitles.id))
		.where(eq(crossReferences.sourceSectionId, sectionId));
}

export async function getSectionAmendments(sectionId: string) {
	return db
		.select()
		.from(amendments)
		.where(eq(amendments.sectionId, sectionId))
		.orderBy(asc(amendments.sortOrder));
}

export async function getAdjacentSections(titleId: string, sortOrder: number) {
	const [prevRows, nextRows] = await Promise.all([
		db
			.select({ sectionNumber: sections.sectionNumber, heading: sections.heading, slug: sections.slug })
			.from(sections)
			.where(and(eq(sections.titleId, titleId), eq(sections.sortOrder, sortOrder - 1)))
			.limit(1),
		db
			.select({ sectionNumber: sections.sectionNumber, heading: sections.heading, slug: sections.slug })
			.from(sections)
			.where(and(eq(sections.titleId, titleId), eq(sections.sortOrder, sortOrder + 1)))
			.limit(1)
	]);

	return {
		prev: prevRows[0] ?? null,
		next: nextRows[0] ?? null
	};
}
