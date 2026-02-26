import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { annotations, sections, regulationTitles } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { z } from 'zod';

const updateAnnotationSchema = z.object({
	content: z.string().min(1, 'Content is required').optional(),
	highlightText: z.string().nullable().optional(),
	color: z.string().optional()
});

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
			id: annotations.id,
			sectionId: annotations.sectionId,
			nodeId: annotations.nodeId,
			content: annotations.content,
			highlightText: annotations.highlightText,
			color: annotations.color,
			createdAt: annotations.createdAt,
			updatedAt: annotations.updatedAt,
			sectionNumber: sections.sectionNumber,
			sectionHeading: sections.heading,
			sectionSlug: sections.slug,
			titleSlug: regulationTitles.slug
		})
		.from(annotations)
		.innerJoin(sections, eq(annotations.sectionId, sections.id))
		.innerJoin(regulationTitles, eq(sections.titleId, regulationTitles.id))
		.where(and(eq(annotations.id, id), eq(annotations.userId, session.user.id)))
		.limit(1);

	if (rows.length === 0) {
		return json(
			{ error: { code: 'NOT_FOUND', message: 'Annotation not found' } },
			{ status: 404 }
		);
	}

	return json({ data: rows[0] });
};

export const PUT: RequestHandler = async (event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session) {
		return json(
			{ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
			{ status: 401 }
		);
	}

	const { id } = event.params;

	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		return json(
			{ error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
			{ status: 400 }
		);
	}

	const parsed = updateAnnotationSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } },
			{ status: 400 }
		);
	}

	const updateData = parsed.data;

	// Verify the annotation belongs to the user
	const existing = await db
		.select({ id: annotations.id })
		.from(annotations)
		.where(and(eq(annotations.id, id), eq(annotations.userId, session.user.id)))
		.limit(1);

	if (existing.length === 0) {
		return json(
			{ error: { code: 'NOT_FOUND', message: 'Annotation not found' } },
			{ status: 404 }
		);
	}

	const updated = await db
		.update(annotations)
		.set({
			...updateData,
			updatedAt: new Date()
		})
		.where(and(eq(annotations.id, id), eq(annotations.userId, session.user.id)))
		.returning();

	return json({ data: updated[0] });
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
		.delete(annotations)
		.where(and(eq(annotations.id, id), eq(annotations.userId, session.user.id)))
		.returning();

	if (deleted.length === 0) {
		return json(
			{ error: { code: 'NOT_FOUND', message: 'Annotation not found' } },
			{ status: 404 }
		);
	}

	return json({ data: { deleted: true } });
};
