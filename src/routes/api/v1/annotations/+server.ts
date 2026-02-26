import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { annotations, sections, regulationTitles } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { z } from 'zod';

const createAnnotationSchema = z.object({
	sectionId: z.string().uuid(),
	nodeId: z.string().nullable().optional(),
	content: z.string().min(1, 'Content is required'),
	highlightText: z.string().nullable().optional(),
	color: z.string().optional().default('yellow')
});

export const GET: RequestHandler = async (event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session) {
		return json(
			{ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
			{ status: 401 }
		);
	}

	const sectionId = event.url.searchParams.get('sectionId');

	const selectFields = {
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
	};

	const whereClause = sectionId
		? and(eq(annotations.userId, session.user.id), eq(annotations.sectionId, sectionId))
		: eq(annotations.userId, session.user.id);

	const results = await db
		.select(selectFields)
		.from(annotations)
		.innerJoin(sections, eq(annotations.sectionId, sections.id))
		.innerJoin(regulationTitles, eq(sections.titleId, regulationTitles.id))
		.where(whereClause)
		.orderBy(annotations.createdAt);

	return json({ data: results });
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

	const parsed = createAnnotationSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } },
			{ status: 400 }
		);
	}

	const { sectionId, nodeId, content, highlightText, color } = parsed.data;

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
		.insert(annotations)
		.values({
			userId: session.user.id,
			sectionId,
			nodeId: nodeId ?? null,
			content,
			highlightText: highlightText ?? null,
			color
		})
		.returning();

	return json({ data: inserted[0] }, { status: 201 });
};
