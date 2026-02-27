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
		const name = formData.get('name') as string;
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		if (!name || !email || !password) {
			return fail(400, { error: 'All fields are required', name, email });
		}

		if (password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters', name, email });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match', name, email });
		}

		try {
			const response = await auth.api.signUpEmail({
				body: { name, email, password },
				asResponse: true,
				headers: request.headers
			});

			if (!response.ok) {
				return fail(400, { error: 'An account with this email may already exist', name, email });
			}

			// Forward session cookies from Better Auth response
			for (const c of response.headers.getSetCookie()) {
				const { name: cookieName, value, opts } = parseCookieHeader(c);
				cookies.set(cookieName, decodeURIComponent(value), opts);
			}
		} catch {
			return fail(400, { error: 'An account with this email may already exist', name, email });
		}

		redirect(302, '/');
	}
} satisfies Actions;
