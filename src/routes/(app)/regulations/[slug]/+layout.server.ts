import type { LayoutServerLoad } from './$types';
import { getTitle, getCode, getSections, getTitlesByCode } from '$lib/server/services/regulations';
import { error, redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ params }) => {
	// Try as title slug first (most common case for section pages)
	const title = await getTitle(params.slug);

	if (title) {
		const sectionsList = await getSections(title.id);
		return {
			kind: 'title' as const,
			title,
			sections: sectionsList
		};
	}

	// Try as code slug
	const code = await getCode(params.slug);
	if (!code) {
		error(404, 'Not found');
	}

	// If code has exactly 1 title, redirect directly to it
	const codeTitles = await getTitlesByCode(code.id);
	if (codeTitles.length === 1) {
		redirect(307, `/regulations/${codeTitles[0].slug}`);
	}

	return {
		kind: 'code' as const,
		code,
		codeTitles
	};
};
