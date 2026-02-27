import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Better Auth handles /api/auth/* routes
	const authResponse = await svelteKitHandler({ event, resolve, auth });
	if (authResponse) return authResponse;

	const session = await auth.api.getSession({ headers: event.request.headers });
	event.locals.session = session;

	return resolve(event);
};
