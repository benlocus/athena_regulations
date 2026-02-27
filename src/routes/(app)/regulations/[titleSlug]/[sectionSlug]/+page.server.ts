import type { PageServerLoad } from './$types';
import {
	getSection,
	getSectionCrossReferences,
	getSectionAmendments,
	getAdjacentSections
} from '$lib/server/services/regulations';
import { isBookmarked } from '$lib/server/services/bookmarks';
import { listAnnotationsForSection } from '$lib/server/services/annotations';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, parent, locals }) => {
	const { title } = await parent();

	const section = await getSection(title.id, params.sectionSlug);

	if (!section) {
		error(404, 'Section not found');
	}

	const [crossRefs, amendmentsList, adjacent] = await Promise.all([
		getSectionCrossReferences(section.id),
		getSectionAmendments(section.id),
		getAdjacentSections(title.id, section.sortOrder)
	]);

	// Build a map from citation -> href for cross-reference resolution
	const refMap: Record<string, string> = {};
	for (const ref of crossRefs) {
		if (ref.targetSlug && ref.targetTitleSlug) {
			let href = `/regulations/${ref.targetTitleSlug}/${ref.targetSlug}`;
			if (ref.targetSubsection) {
				href += `#${ref.targetSubsection}`;
			}
			refMap[ref.targetCitation] = href;
		}
	}

	// Auth-dependent data
	let userBookmarked = false;
	let sectionAnnotations: Awaited<ReturnType<typeof listAnnotationsForSection>> = [];

	if (locals.session) {
		const [bookmarkResult, annotationsResult] = await Promise.all([
			isBookmarked(locals.session.user.id, section.id),
			listAnnotationsForSection(locals.session.user.id, section.id)
		]);
		userBookmarked = !!bookmarkResult;
		sectionAnnotations = annotationsResult;
	}

	return {
		section,
		refMap,
		amendments: amendmentsList,
		adjacent,
		title,
		isBookmarked: userBookmarked,
		annotations: sectionAnnotations
	};
};
