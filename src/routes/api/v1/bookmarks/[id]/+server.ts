import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { bookmarks, sections, regulationTitles } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '$lib/server/auth';

export const GET: RequestHandler = async (event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session) {
		return json(
			{ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
			{ status: 401 }
		);
	}

	const { id } = event.params;

	const rows = await db
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
		.where(and(eq(bookmarks.id, id), eq(bookmarks.userId, session.user.id)))
		.limit(1);

	if (rows.length === 0) {
		return json(
			{ error: { code: 'NOT_FOUND', message: 'Bookmark not found' } },
			{ status: 404 }
		);
	}

	return json({ data: rows[0] });
};

export const DELETE: RequestHandler = async (event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session) {
		return json(
			{ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
			{ status: 401 }
		);
	}

	const { id } = event.params;

	const deleted = await db
		.delete(bookmarks)
		.where(and(eq(bookmarks.id, id), eq(bookmarks.userId, session.user.id)))
		.returning();

	if (deleted.length === 0) {
		return json(
			{ error: { code: 'NOT_FOUND', message: 'Bookmark not found' } },
			{ status: 404 }
		);
	}

	return json({ data: { deleted: true } });
};
