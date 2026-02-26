import { db } from '$lib/server/db';
import { bookmarks, sections, regulationTitles } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function createBookmark(
	userId: string,
	sectionId: string,
	nodeId: string | null = null,
	label: string | null = null
) {
	const [bookmark] = await db
		.insert(bookmarks)
		.values({ userId, sectionId, nodeId, label })
		.onConflictDoNothing()
		.returning();
	return bookmark ?? null;
}

export async function deleteBookmark(userId: string, bookmarkId: string) {
	const [deleted] = await db
		.delete(bookmarks)
		.where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
		.returning();
	return !!deleted;
}

export async function deleteBookmarkBySection(
	userId: string,
	sectionId: string,
	nodeId: string | null = null
) {
	const conditions = [eq(bookmarks.userId, userId), eq(bookmarks.sectionId, sectionId)];
	if (nodeId) {
		conditions.push(eq(bookmarks.nodeId, nodeId));
	}
	const [deleted] = await db
		.delete(bookmarks)
		.where(and(...conditions))
		.returning();
	return !!deleted;
}

export async function getBookmark(userId: string, bookmarkId: string) {
	const [bookmark] = await db
		.select()
		.from(bookmarks)
		.where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)));
	return bookmark ?? null;
}

export async function isBookmarked(
	userId: string,
	sectionId: string,
	nodeId: string | null = null
) {
	const conditions = [eq(bookmarks.userId, userId), eq(bookmarks.sectionId, sectionId)];
	if (nodeId) {
		conditions.push(eq(bookmarks.nodeId, nodeId));
	}
	const [result] = await db
		.select({ id: bookmarks.id })
		.from(bookmarks)
		.where(and(...conditions))
		.limit(1);
	return result ?? null;
}

export async function listBookmarks(userId: string) {
	return db
		.select({
			id: bookmarks.id,
			userId: bookmarks.userId,
			sectionId: bookmarks.sectionId,
			nodeId: bookmarks.nodeId,
			label: bookmarks.label,
			createdAt: bookmarks.createdAt,
			sectionNumber: sections.sectionNumber,
			sectionHeading: sections.heading,
			sectionSlug: sections.slug,
			titleSlug: regulationTitles.slug,
			titleName: regulationTitles.title
		})
		.from(bookmarks)
		.innerJoin(sections, eq(bookmarks.sectionId, sections.id))
		.innerJoin(regulationTitles, eq(sections.titleId, regulationTitles.id))
		.where(eq(bookmarks.userId, userId))
		.orderBy(desc(bookmarks.createdAt));
}
