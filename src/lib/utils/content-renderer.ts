import type { ContentNode } from '$lib/types';

type ResolvedRef = {
	citation: string;
	href: string | null;
	displayText: string;
	isExternal: boolean;
};

/**
 * Parse content text and resolve cross-reference tokens.
 * Returns an array of text segments and resolved references.
 */
export type ContentSegment =
	| { type: 'text'; text: string }
	| { type: 'ref'; citation: string; href: string; displayText: string }
	| { type: 'extref'; citation: string; displayText: string };

export function parseContent(
	content: string,
	resolveRef: (citation: string) => string | null
): ContentSegment[] {
	const segments: ContentSegment[] = [];
	const pattern = /\{\{(ref|extref):([^}]+)\}\}/g;

	let lastIndex = 0;
	let match;

	while ((match = pattern.exec(content)) !== null) {
		// Add text before the match
		if (match.index > lastIndex) {
			segments.push({ type: 'text', text: content.slice(lastIndex, match.index) });
		}

		const refType = match[1];
		const citation = match[2];

		if (refType === 'ref') {
			const href = resolveRef(citation);
			segments.push({
				type: 'ref',
				citation,
				href: href || '#',
				displayText: citation
			});
		} else {
			segments.push({
				type: 'extref',
				citation,
				displayText: citation
			});
		}

		lastIndex = match.index + match[0].length;
	}

	// Add remaining text
	if (lastIndex < content.length) {
		segments.push({ type: 'text', text: content.slice(lastIndex) });
	}

	return segments;
}

/**
 * Flatten a content tree to plain text (for search indexing).
 */
export function flattenContentTree(nodes: ContentNode[]): string {
	const parts: string[] = [];

	function walk(node: ContentNode) {
		if (node.heading) parts.push(node.heading);
		if (node.content) {
			// Strip cross-reference markers for plain text
			parts.push(node.content.replace(/\{\{(ref|extref):([^}]+)\}\}/g, '$2'));
		}
		for (const child of node.children) {
			walk(child);
		}
	}

	for (const node of nodes) {
		walk(node);
	}

	return parts.join(' ');
}
