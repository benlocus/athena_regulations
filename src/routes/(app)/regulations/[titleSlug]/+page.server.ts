import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { title, sections } = await parent();
	return { title, sections };
};
