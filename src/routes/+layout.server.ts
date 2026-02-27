import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		session: locals.session
			? { id: locals.session.user.id, name: locals.session.user.name, email: locals.session.user.email }
			: null
	};
};
