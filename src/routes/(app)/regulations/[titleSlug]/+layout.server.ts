import type { LayoutServerLoad } from './$types';
import { getTitle, getSections } from '$lib/server/services/regulations';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ params }) => {
	const title = await getTitle(params.titleSlug);

	if (!title) {
		error(404, 'Regulation title not found');
	}

	const sectionsList = await getSections(title.id);

	return {
		title,
		sections: sectionsList
	};
};
