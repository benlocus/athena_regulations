import type { PageServerLoad } from './$types';
import { getTitles } from '$lib/server/services/regulations';

export const load: PageServerLoad = async () => {
	const titles = await getTitles();

	// Group titles by jurisdiction
	const jurisdictionMap = new Map<string, typeof titles>();
	for (const title of titles) {
		const jurisdiction = title.jurisdiction;
		if (!jurisdictionMap.has(jurisdiction)) {
			jurisdictionMap.set(jurisdiction, []);
		}
		jurisdictionMap.get(jurisdiction)!.push(title);
	}

	const jurisdictions = Array.from(jurisdictionMap.entries()).map(([name, titles]) => ({
		name,
		titles
	}));

	return { jurisdictions };
};
