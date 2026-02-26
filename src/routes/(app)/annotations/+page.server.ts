import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import { listAnnotations } from '$lib/server/services/annotations';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
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
