import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { regulationTitles, regulatoryCodes, sections } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	const titles = await db
		.select({
			id: regulationTitles.id,
			titleNumber: regulationTitles.titleNumber,
			title: regulationTitles.title,
			description: regulationTitles.description,
			slug: regulationTitles.slug,
			sortOrder: regulationTitles.sortOrder,
			codeNumber: regulatoryCodes.codeNumber,
			jurisdiction: regulatoryCodes.jurisdiction,
			sectionCount: sql<number>`cast(count(${sections.id}) as int)`
		})
		.from(regulationTitles)
		.innerJoin(regulatoryCodes, eq(regulationTitles.codeId, regulatoryCodes.id))
		.leftJoin(sections, eq(sections.titleId, regulationTitles.id))
		.groupBy(regulationTitles.id, regulatoryCodes.id)
		.orderBy(regulationTitles.sortOrder);

	return json({ data: titles });
};
