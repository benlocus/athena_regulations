import { auth } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { parseCookieHeader } from '$lib/server/auth/cookies';

export const load: PageServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (session) {
		redirect(302, '/');
	}
};

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required', email });
		}

		try {
			const response = await auth.api.signInEmail({
				body: { email, password },
				asResponse: true,
				headers: request.headers
			});

			if (!response.ok) {
				return fail(401, { error: 'Invalid email or password', email });
			}

			// Forward session cookies from Better Auth response
			for (const c of response.headers.getSetCookie()) {
				const { name, value, opts } = parseCookieHeader(c);
				cookies.set(name, decodeURIComponent(value), opts);
			}
		} catch {
			return fail(401, { error: 'Invalid email or password', email });
		}

		redirect(302, '/');
	}
} satisfies Actions;
