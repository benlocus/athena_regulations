import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { regulationTitles, regulatoryCodes, sections } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	const { titleSlug } = params;

	const titleRows = await db
		.select({
			id: regulationTitles.id,
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
		.where(eq(regulationTitles.slug, titleSlug))
		.limit(1);

	if (titleRows.length === 0) {
		return json(
			{ error: { code: 'NOT_FOUND', message: 'Regulation title not found' } },
			{ status: 404 }
		);
	}

	const titleDetail = titleRows[0];

	const sectionList = await db
		.select({
			id: sections.id,
			sectionNumber: sections.sectionNumber,
			heading: sections.heading,
			slug: sections.slug,
			sortOrder: sections.sortOrder,
			isRepealed: sections.isRepealed
		})
		.from(sections)
		.where(eq(sections.titleId, titleDetail.id))
		.orderBy(sections.sortOrder);

	return json({
		data: {
			...titleDetail,
			sections: sectionList
		}
	});
};
