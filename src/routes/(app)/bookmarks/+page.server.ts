import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import { listBookmarks } from '$lib/server/services/bookmarks';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) {
		redirect(302, '/login');
	}

	const bookmarks = await listBookmarks(session.user.id);

	return {
		bookmarks: bookmarks.map((b) => ({
			...b,
			createdAt: b.createdAt.toISOString()
		}))
	};
};
