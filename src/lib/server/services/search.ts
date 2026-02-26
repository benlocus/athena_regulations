import { db } from '$lib/server/db';
import { sections, regulationTitles } from '$lib/server/db/schema';
import { sql, eq } from 'drizzle-orm';
import type { SearchResult } from '$lib/types';

export async function searchRegulations(query: string, limit = 20, offset = 0): Promise<{ results: SearchResult[]; total: number }> {
	if (!query.trim()) {
		return { results: [], total: 0 };
	}

	const tsQuery = query
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((term) => term.replace(/[^\w]/g, ''))
		.filter(Boolean)
		.join(' & ');

	if (!tsQuery) {
		return { results: [], total: 0 };
	}

	const [results, countResult] = await Promise.all([
		db
			.select({
				sectionId: sections.id,
				sectionNumber: sections.sectionNumber,
				heading: sections.heading,
				slug: sections.slug,
				titleSlug: regulationTitles.slug,
				snippet: sql<string>`ts_headline('english', ${sections.plainText}, to_tsquery('english', ${tsQuery}), 'StartSel=<b>, StopSel=</b>, MaxWords=50, MinWords=20, MaxFragments=2')`,
				rank: sql<number>`ts_rank(to_tsvector('english', ${sections.plainText}), to_tsquery('english', ${tsQuery}))`
			})
			.from(sections)
			.innerJoin(regulationTitles, eq(sections.titleId, regulationTitles.id))
			.where(sql`to_tsvector('english', ${sections.plainText}) @@ to_tsquery('english', ${tsQuery})`)
			.orderBy(sql`ts_rank(to_tsvector('english', ${sections.plainText}), to_tsquery('english', ${tsQuery})) DESC`)
			.limit(limit)
			.offset(offset),
		db
			.select({ count: sql<number>`count(*)::int` })
			.from(sections)
			.where(sql`to_tsvector('english', ${sections.plainText}) @@ to_tsquery('english', ${tsQuery})`)
	]);

	return {
		results,
		total: countResult[0]?.count ?? 0
	};
}
