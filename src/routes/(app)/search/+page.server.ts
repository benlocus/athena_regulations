import type { PageServerLoad } from './$types';
import { searchRegulations } from '$lib/server/services/search';

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get('q') ?? '';
	const pageNum = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
	const limit = 20;
	const offset = (pageNum - 1) * limit;

	if (!query.trim()) {
		return { query, results: [], total: 0, page: pageNum };
	}

	const { results, total } = await searchRegulations(query, limit, offset);

	return { query, results, total, page: pageNum };
};
