import { auth } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (session) {
		redirect(302, '/');
	}
};

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required', email });
		}

		try {
			const response = await auth.api.signInEmail({
				body: { email, password }
			});

			if (!response) {
				return fail(401, { error: 'Invalid email or password', email });
			}
		} catch {
			return fail(401, { error: 'Invalid email or password', email });
		}

		redirect(302, '/');
	}
} satisfies Actions;
