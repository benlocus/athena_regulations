import type { ContentNode, Annotation } from '$lib/types';

type ResolvedRef = {
	citation: string;
	href: string | null;
	displayText: string;
	isExternal: boolean;
};

export type HighlightInfo = {
	annotationId: string;
	color: string;
};

/**
 * Parse content text and resolve cross-reference tokens.
 * Returns an array of text segments and resolved references.
 */
export type ContentSegment =
	| { type: 'text'; text: string; highlights?: HighlightInfo[] }
	| { type: 'ref'; citation: string; href: string; displayText: string; highlights?: HighlightInfo[] }
	| { type: 'extref'; citation: string; displayText: string; highlights?: HighlightInfo[] };

/**
 * Replace \n with a space unless followed by a list marker pattern.
 * Fixes mid-sentence line breaks from PDF-extracted text.
 */
function normalizeNewlines(text: string): string {
	return text.replace(
		/\n(?!\s*(?:\(\d+\)|\([a-z]\)|\d+\.\s|[a-z]\.\s|[ivx]+\.\s))/g,
		' '
	);
}

export function parseContent(
	content: string,
	resolveRef: (citation: string) => string | null
): ContentSegment[] {
	const normalized = normalizeNewlines(content);
	const segments: ContentSegment[] = [];
	const pattern = /\{\{(ref|extref):([^}]+)\}\}/g;

	let lastIndex = 0;
	let match;

	while ((match = pattern.exec(normalized)) !== null) {
		// Add text before the match
		if (match.index > lastIndex) {
			segments.push({ type: 'text', text: normalized.slice(lastIndex, match.index) });
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
	if (lastIndex < normalized.length) {
		segments.push({ type: 'text', text: normalized.slice(lastIndex) });
	}

	return segments;
}

/**
 * Get the display-text length of a segment.
 */
function segmentDisplayLength(seg: ContentSegment): number {
	if (seg.type === 'text') return seg.text.length;
	return seg.displayText.length;
}

/**
 * Apply highlight annotations to parsed content segments.
 * Splits text segments at highlight boundaries so each sub-segment
 * can be wrapped in a <mark> element.
 */
export function applyHighlights(
	segments: ContentSegment[],
	nodeAnnotations: Annotation[]
): ContentSegment[] {
	// Filter to only annotations with valid offsets
	const highlights = nodeAnnotations.filter(
		(a) => a.startOffset != null && a.endOffset != null && a.startOffset < a.endOffset
	);

	if (highlights.length === 0) return segments;

	const result: ContentSegment[] = [];
	let offset = 0;

	for (const seg of segments) {
		const segLen = segmentDisplayLength(seg);
		const segStart = offset;
		const segEnd = offset + segLen;

		// Find highlights that overlap this segment
		const overlapping = highlights.filter(
			(h) => h.startOffset! < segEnd && h.endOffset! > segStart
		);

		if (overlapping.length === 0) {
			result.push(seg);
			offset = segEnd;
			continue;
		}

		if (seg.type !== 'text') {
			// Ref/extref segments are atomic — mark the whole segment
			result.push({
				...seg,
				highlights: overlapping.map((h) => ({
					annotationId: h.id,
					color: h.color
				}))
			});
			offset = segEnd;
			continue;
		}

		// Text segment: split at highlight boundaries
		// Collect all boundary points within this segment
		const points = new Set<number>();
		points.add(0);
		points.add(segLen);

		for (const h of overlapping) {
			const relStart = Math.max(0, h.startOffset! - segStart);
			const relEnd = Math.min(segLen, h.endOffset! - segStart);
			points.add(relStart);
			points.add(relEnd);
		}

		const sorted = Array.from(points).sort((a, b) => a - b);

		for (let i = 0; i < sorted.length - 1; i++) {
			const sliceStart = sorted[i];
			const sliceEnd = sorted[i + 1];
			if (sliceStart === sliceEnd) continue;

			const absStart = segStart + sliceStart;
			const absEnd = segStart + sliceEnd;

			const activeHighlights = overlapping.filter(
				(h) => h.startOffset! < absEnd && h.endOffset! > absStart
			);

			const subText = seg.text.slice(sliceStart, sliceEnd);
			result.push({
				type: 'text',
				text: subText,
				highlights: activeHighlights.length > 0
					? activeHighlights.map((h) => ({ annotationId: h.id, color: h.color }))
					: undefined
			});
		}

		offset = segEnd;
	}

	return result;
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
