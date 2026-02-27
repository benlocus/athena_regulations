import { redirect } from '@sveltejs/kit';
import { listAnnotations } from '$lib/server/services/annotations';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = locals.session;
	if (!session) {
		redirect(302, '/login');
	}

	const annotations = await listAnnotations(session.user.id);

	return {
		annotations: annotations.map((a) => ({
			...a,
			createdAt: a.createdAt.toISOString(),
			updatedAt: a.updatedAt.toISOString()
		}))
	};
};
