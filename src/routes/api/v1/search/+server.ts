import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { sections, regulationTitles } from '$lib/server/db/schema';
import { sql, eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim();
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
	const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get('per_page') || '20', 10)));
	const offset = (page - 1) * perPage;

	if (!q) {
		return json(
			{ error: { code: 'BAD_REQUEST', message: 'Search query parameter "q" is required' } },
			{ status: 400 }
		);
	}

	const tsQuery = sql`websearch_to_tsquery('english', ${q})`;

	const results = await db
		.select({
			sectionId: sections.id,
			sectionNumber: sections.sectionNumber,
			heading: sections.heading,
			slug: sections.slug,
			titleSlug: regulationTitles.slug,
			snippet: sql<string>`ts_headline('english', ${sections.plainText}, ${tsQuery}, 'MaxWords=50, MinWords=20, StartSel=<mark>, StopSel=</mark>')`,
			rank: sql<number>`ts_rank(${sections.searchVector}::tsvector, ${tsQuery})`
		})
		.from(sections)
		.innerJoin(regulationTitles, eq(sections.titleId, regulationTitles.id))
		.where(sql`${sections.searchVector}::tsvector @@ ${tsQuery}`)
		.orderBy(sql`ts_rank(${sections.searchVector}::tsvector, ${tsQuery}) desc`)
		.limit(perPage)
		.offset(offset);

	const countResult = await db
		.select({
			total: sql<number>`cast(count(*) as int)`
		})
		.from(sections)
		.where(sql`${sections.searchVector}::tsvector @@ ${tsQuery}`);

	const total = countResult[0]?.total ?? 0;

	return json({
		data: results,
		pagination: {
			page,
			perPage,
			total,
			totalPages: Math.ceil(total / perPage)
		}
	});
};
