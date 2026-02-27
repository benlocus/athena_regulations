import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Set session on locals before resolving (svelteKitHandler calls resolve internally)
	const session = await auth.api.getSession({ headers: event.request.headers });
	event.locals.session = session;

	return svelteKitHandler({ event, resolve, auth });
};
