import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { bookmarks, sections, regulationTitles } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { z } from 'zod';

const createBookmarkSchema = z.object({
	sectionId: z.string().uuid(),
	nodeId: z.string().nullable().optional(),
	label: z.string().nullable().optional()
});

export const GET: RequestHandler = async (event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session) {
		return json(
			{ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
			{ status: 401 }
		);
	}

	const userBookmarks = await db
		.select({
			id: bookmarks.id,
			sectionId: bookmarks.sectionId,
			nodeId: bookmarks.nodeId,
			label: bookmarks.label,
			createdAt: bookmarks.createdAt,
			sectionNumber: sections.sectionNumber,
			sectionHeading: sections.heading,
			sectionSlug: sections.slug,
			titleSlug: regulationTitles.slug
		})
		.from(bookmarks)
		.innerJoin(sections, eq(bookmarks.sectionId, sections.id))
		.innerJoin(regulationTitles, eq(sections.titleId, regulationTitles.id))
		.where(eq(bookmarks.userId, session.user.id))
		.orderBy(bookmarks.createdAt);

	return json({ data: userBookmarks });
};

export const POST: RequestHandler = async (event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session) {
		return json(
			{ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
			{ status: 401 }
		);
	}

	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		return json(
			{ error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
			{ status: 400 }
		);
	}

	const parsed = createBookmarkSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } },
			{ status: 400 }
		);
	}

	const { sectionId, nodeId, label } = parsed.data;

	// Verify section exists
	const sectionRows = await db
		.select({ id: sections.id })
		.from(sections)
		.where(eq(sections.id, sectionId))
		.limit(1);

	if (sectionRows.length === 0) {
		return json(
			{ error: { code: 'NOT_FOUND', message: 'Section not found' } },
			{ status: 404 }
		);
	}

	const inserted = await db
		.insert(bookmarks)
		.values({
			userId: session.user.id,
			sectionId,
			nodeId: nodeId ?? null,
			label: label ?? null
		})
		.returning();

	return json({ data: inserted[0] }, { status: 201 });
};
