import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { regulationTitles, sections, crossReferences, amendments } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { slugToSection } from '$lib/utils/slug';
import type { ContentNode } from '$lib/types';

function contentTreeToHtml(nodes: ContentNode[]): string {
	return nodes.map(nodeToHtml).join('');
}

function nodeToHtml(node: ContentNode): string {
	const children = node.children.length > 0 ? contentTreeToHtml(node.children) : '';
	const content = escapeHtml(node.content);

	switch (node.type) {
		case 'section':
			return `<section id="${escapeHtml(node.id)}">${node.heading ? `<h2>${escapeHtml(node.heading)}</h2>` : ''}${content}${children}</section>`;
		case 'subsection':
			return `<div class="subsection" id="${escapeHtml(node.id)}">${node.number ? `<span class="number">${escapeHtml(node.number)}</span> ` : ''}${content}${children}</div>`;
		case 'paragraph':
			return `<p id="${escapeHtml(node.id)}">${node.number ? `<span class="number">${escapeHtml(node.number)}</span> ` : ''}${content}</p>${children}`;
		case 'definition':
			return `<dl id="${escapeHtml(node.id)}"><dt>${node.heading ? escapeHtml(node.heading) : ''}</dt><dd>${content}${children}</dd></dl>`;
		case 'text':
			return `<span id="${escapeHtml(node.id)}">${content}</span>${children}`;
		default:
			return `${content}${children}`;
	}
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export const GET: RequestHandler = async ({ params, url }) => {
	const { titleSlug, sectionSlug } = params;
	const format = url.searchParams.get('format') || 'tree';

	if (!['tree', 'plain', 'html'].includes(format)) {
		return json(
			{ error: { code: 'BAD_REQUEST', message: 'Invalid format. Must be tree, plain, or html' } },
			{ status: 400 }
		);
	}

	const titleRows = await db
		.select({ id: regulationTitles.id })
		.from(regulationTitles)
		.where(eq(regulationTitles.slug, titleSlug))
		.limit(1);

	if (titleRows.length === 0) {
		return json(
			{ error: { code: 'NOT_FOUND', message: 'Regulation title not found' } },
			{ status: 404 }
		);
	}

	const sectionNumber = slugToSection(sectionSlug);

	const sectionRows = await db
		.select()
		.from(sections)
		.where(and(eq(sections.titleId, titleRows[0].id), eq(sections.sectionNumber, sectionNumber)))
		.limit(1);

	if (sectionRows.length === 0) {
		return json(
			{ error: { code: 'NOT_FOUND', message: 'Section not found' } },
			{ status: 404 }
		);
	}

	const section = sectionRows[0];

	const [refs, amends] = await Promise.all([
		db
			.select()
			.from(crossReferences)
			.where(eq(crossReferences.sourceSectionId, section.id)),
		db
			.select()
			.from(amendments)
			.where(eq(amendments.sectionId, section.id))
			.orderBy(amendments.sortOrder)
	]);

	let content: string | ContentNode[];
	if (format === 'plain') {
		content = section.plainText;
	} else if (format === 'html') {
		content = contentTreeToHtml(section.contentTree);
	} else {
		content = section.contentTree;
	}

	return json({
		data: {
			id: section.id,
			sectionNumber: section.sectionNumber,
			heading: section.heading,
			slug: section.slug,
			sortOrder: section.sortOrder,
			isRepealed: section.isRepealed,
			content,
			format,
			crossReferences: refs,
			amendments: amends,
			createdAt: section.createdAt,
			updatedAt: section.updatedAt
		}
	});
};
