import type { PageServerLoad } from './$types';
import { getCodes } from '$lib/server/services/regulations';

export const load: PageServerLoad = async () => {
	const codes = await getCodes();
	return { codes };
};
