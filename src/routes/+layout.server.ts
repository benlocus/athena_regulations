import type { LayoutServerLoad } from './$types';
import { getNavigationTree } from '$lib/server/services/regulations';

export const load: LayoutServerLoad = async ({ locals }) => {
	const navigation = await getNavigationTree();

	return {
		session: locals.session
			? { id: locals.session.user.id, name: locals.session.user.name, email: locals.session.user.email }
			: null,
		navigation
	};
};
