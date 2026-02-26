import { db } from '$lib/server/db';
import { annotations, sections, regulationTitles } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function createAnnotation(
	userId: string,
	sectionId: string,
	content: string,
	opts: { nodeId?: string | null; highlightText?: string | null; color?: string } = {}
) {
	const [annotation] = await db
		.insert(annotations)
		.values({
			userId,
			sectionId,
			content,
			nodeId: opts.nodeId ?? null,
			highlightText: opts.highlightText ?? null,
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

export async function listAnnotationsForSection(userId: string, sectionId: string) {
	return db
		.select()
		.from(annotations)
		.where(and(eq(annotations.userId, userId), eq(annotations.sectionId, sectionId)))
		.orderBy(desc(annotations.createdAt));
}
