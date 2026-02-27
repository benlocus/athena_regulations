import { db } from '$lib/server/db';
import { annotations, sections, regulationTitles, user } from '$lib/server/db/schema';
import { eq, and, desc, like, inArray, sql } from 'drizzle-orm';

export async function createAnnotation(
	userId: string,
	sectionId: string,
	content: string,
	opts: {
		nodeId?: string | null;
		highlightText?: string | null;
		startOffset?: number | null;
		endOffset?: number | null;
		color?: string;
	} = {}
) {
	const [annotation] = await db
		.insert(annotations)
		.values({
			userId,
			sectionId,
			content,
			nodeId: opts.nodeId ?? null,
			highlightText: opts.highlightText ?? null,
			startOffset: opts.startOffset ?? null,
			endOffset: opts.endOffset ?? null,
			color: opts.color ?? 'yellow'
		})
		.returning();
	return annotation;
}

export async function getAnnotation(userId: string, annotationId: string) {
	const [annotation] = await db
		.select()
		.from(annotations)
		.where(and(eq(annotations.id, annotationId), eq(annotations.userId, userId)));
	return annotation ?? null;
}

export async function updateAnnotation(
	userId: string,
	annotationId: string,
	data: { content?: string; color?: string }
) {
	const [updated] = await db
		.update(annotations)
		.set({ ...data, updatedAt: new Date() })
		.where(and(eq(annotations.id, annotationId), eq(annotations.userId, userId)))
		.returning();
	return updated ?? null;
}

export async function deleteAnnotation(userId: string, annotationId: string) {
	const [deleted] = await db
		.delete(annotations)
		.where(and(eq(annotations.id, annotationId), eq(annotations.userId, userId)))
		.returning();
	return !!deleted;
}

export async function listAnnotations(userId: string) {
	return db
		.select({
			id: annotations.id,
			userId: annotations.userId,
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
			titleSlug: regulationTitles.slug,
			titleName: regulationTitles.title
		})
		.from(annotations)
		.innerJoin(sections, eq(annotations.sectionId, sections.id))
		.innerJoin(regulationTitles, eq(sections.titleId, regulationTitles.id))
		.where(eq(annotations.userId, userId))
		.orderBy(desc(annotations.updatedAt));
}

const ORG_SHARED_DOMAIN = 'tenaxstrategies.com';

export async function listAnnotationsForSection(
	userId: string,
	sectionId: string,
	userEmail?: string
) {
	// If user is in the shared org domain, also show annotations from other org users
	const isOrgUser = userEmail?.endsWith(`@${ORG_SHARED_DOMAIN}`);

	if (isOrgUser) {
		return db
			.select({
				id: annotations.id,
				userId: annotations.userId,
				sectionId: annotations.sectionId,
				nodeId: annotations.nodeId,
				content: annotations.content,
				highlightText: annotations.highlightText,
				startOffset: annotations.startOffset,
				endOffset: annotations.endOffset,
				color: annotations.color,
				createdAt: annotations.createdAt,
				updatedAt: annotations.updatedAt,
				authorName: user.name
			})
			.from(annotations)
			.innerJoin(user, eq(annotations.userId, user.id))
			.where(
				and(
					eq(annotations.sectionId, sectionId),
					like(user.email, `%@${ORG_SHARED_DOMAIN}`)
				)
			)
			.orderBy(desc(annotations.createdAt));
	}

	return db
		.select({
			id: annotations.id,
			userId: annotations.userId,
			sectionId: annotations.sectionId,
			nodeId: annotations.nodeId,
			content: annotations.content,
			highlightText: annotations.highlightText,
			startOffset: annotations.startOffset,
			endOffset: annotations.endOffset,
			color: annotations.color,
			createdAt: annotations.createdAt,
			updatedAt: annotations.updatedAt,
			authorName: sql<string | null>`null`.as('author_name')
		})
		.from(annotations)
		.where(and(eq(annotations.userId, userId), eq(annotations.sectionId, sectionId)))
		.orderBy(desc(annotations.createdAt));
}
