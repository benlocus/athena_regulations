import type { PageServerLoad } from './$types';
import { getTitles } from '$lib/server/services/regulations';

export const load: PageServerLoad = async () => {
	const titles = await getTitles();
	return { titles };
};
