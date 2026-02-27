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
				asResponse: true
			});

			if (!response.ok) {
				return fail(401, { error: 'Invalid email or password', email });
			}

			// Forward session cookies from Better Auth response
			for (const cookie of response.headers.getSetCookie()) {
				const [nameValue, ...parts] = cookie.split(';');
				const [name, ...valueParts] = nameValue.split('=');
				const value = valueParts.join('=');
				let path = '/';
				let maxAge: number | undefined;
				let httpOnly = false;
				let secure = false;
				let sameSite: 'lax' | 'strict' | 'none' = 'lax';
				for (const part of parts) {
					const trimmed = part.trim().toLowerCase();
					if (trimmed.startsWith('max-age=')) maxAge = parseInt(trimmed.split('=')[1]);
					if (trimmed === 'httponly') httpOnly = true;
					if (trimmed === 'secure') secure = true;
					if (trimmed.startsWith('samesite=')) sameSite = trimmed.split('=')[1] as typeof sameSite;
					if (trimmed.startsWith('path=')) path = part.trim().split('=')[1];
				}
				cookies.set(name.trim(), value, { path, maxAge, httpOnly, secure, sameSite });
			}
		} catch {
			return fail(401, { error: 'Invalid email or password', email });
		}

		redirect(302, '/');
	}
} satisfies Actions;
