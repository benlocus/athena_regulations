/**
 * Parse a raw Set-Cookie header string into name, value, and SvelteKit-compatible options.
 */
export function parseCookieHeader(header: string) {
	const [nameValue, ...parts] = header.split(';');
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

	return {
		name: name.trim(),
		value,
		opts: { path, maxAge, httpOnly, secure, sameSite }
	};
}
