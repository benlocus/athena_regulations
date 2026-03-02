/**
 * Parser for NJ CRC guidance documents (extracted from PDF via pdftotext).
 * Guidance documents are less structured than regulations — typically headings and paragraphs.
 * Each major heading becomes a section; body text becomes the content tree.
 */
import type { ContentNode } from '$lib/types/index.js';
import { flattenContentTree } from '$lib/utils/content-renderer.js';

export type ParsedSection = {
	sectionNumber: string;
	heading: string;
	slug: string;
	contentTree: ContentNode[];
	plainText: string;
	sortOrder: number;
};

/**
 * Parse a guidance document into structured sections.
 * Sections are determined by major headings (all-caps or bold lines).
 */
export function parseNJGuidance(text: string, documentId: string): ParsedSection[] {
	const cleaned = cleanGuidanceText(text);
	const lines = cleaned.split('\n');
	const headings = findHeadings(lines);
	const results: ParsedSection[] = [];

	if (headings.length === 0) {
		// No headings found — treat the entire document as a single section
		const root: ContentNode = {
			id: `${documentId}-1`,
			type: 'section',
			number: null,
			heading: 'Full Document',
			content: addGuidanceCrossReferences(cleaned.trim()),
			children: [],
			depth: 0
		};

		return [
			{
				sectionNumber: `${documentId}-1`,
				heading: 'Full Document',
				slug: `${documentId}-1`,
				contentTree: [root],
				plainText: flattenContentTree([root]),
				sortOrder: 0
			}
		];
	}

	for (let i = 0; i < headings.length; i++) {
		const heading = headings[i];
		const endLine = i + 1 < headings.length ? headings[i + 1].startLine : lines.length;
		const bodyLines = lines.slice(heading.startLine + 1, endLine);
		const bodyText = joinWrappedLines(bodyLines).trim();

		const sectionNum = `${documentId}-${i + 1}`;
		const sectionId = sectionNum;

		const root: ContentNode = {
			id: sectionId,
			type: 'section',
			number: null,
			heading: heading.text,
			content: addGuidanceCrossReferences(bodyText),
			children: [],
			depth: 0
		};

		const contentTree = [root];

		results.push({
			sectionNumber: sectionNum,
			heading: heading.text,
			slug: sectionNum,
			contentTree,
			plainText: flattenContentTree(contentTree),
			sortOrder: i
		});
	}

	return results;
}

function cleanGuidanceText(text: string): string {
	const lines = text.split('\n');
	const cleaned: string[] = [];
	const formFeedPattern = /\f/g;
	const pageNumPattern = /^\s*(?:Page\s+\d+\s+of\s+\d+|\d{1,3})\s*$/i;

	for (const line of lines) {
		const stripped = line.replace(formFeedPattern, '');
		const trimmed = stripped.trim();

		if (pageNumPattern.test(trimmed)) continue;
		if (/^[-_=]{3,}$/.test(trimmed)) continue;

		cleaned.push(stripped);
	}

	return cleaned.join('\n');
}

function joinWrappedLines(lines: string[]): string {
	const paragraphs: string[] = [];
	let current: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();
		if (trimmed === '') {
			if (current.length > 0) {
				paragraphs.push(current.join(' '));
				current = [];
			}
			paragraphs.push('');
		} else {
			current.push(trimmed);
		}
	}

	if (current.length > 0) {
		paragraphs.push(current.join(' '));
	}

	return paragraphs.join('\n');
}

type HeadingInfo = {
	text: string;
	startLine: number;
};

/**
 * Find major section headings in guidance text.
 * Headings are detected as:
 * - All-caps lines of reasonable length (3-100 chars)
 * - Lines that are substantially shorter than surrounding text and followed by body text
 */
function findHeadings(lines: string[]): HeadingInfo[] {
	const headings: HeadingInfo[] = [];

	for (let i = 0; i < lines.length; i++) {
		const trimmed = lines[i].trim();
		if (!trimmed) continue;

		// All-caps headings (common in guidance docs)
		if (
			trimmed.length >= 3 &&
			trimmed.length <= 100 &&
			trimmed === trimmed.toUpperCase() &&
			/[A-Z]/.test(trimmed) &&
			!/^\d+$/.test(trimmed)
		) {
			// Verify it's followed by content (not just another heading)
			const nextNonEmpty = lines.slice(i + 1).find((l) => l.trim() !== '');
			if (nextNonEmpty) {
				headings.push({
					text: toTitleCase(trimmed),
					startLine: i
				});
			}
		}
	}

	return headings;
}

function toTitleCase(str: string): string {
	return str
		.toLowerCase()
		.split(' ')
		.map((word) => {
			if (['a', 'an', 'the', 'and', 'or', 'of', 'in', 'for', 'to', 'with'].includes(word)) {
				return word;
			}
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(' ')
		.replace(/^./, (c) => c.toUpperCase());
}

function addGuidanceCrossReferences(text: string): string {
	// N.J.A.C. references
	text = text.replace(
		/N\.?J\.?A\.?C\.?\s+17:30-(\d+\.\d+)(?:\(([a-z0-9]+)\))?/g,
		(_match, secNum, sub1) => {
			const citation = `17:30-${secNum}${sub1 ? `(${sub1})` : ''}`;
			return `{{ref:${citation}}}`;
		}
	);

	// N.J.S.A. references
	text = text.replace(
		/N\.?J\.?S\.?A\.?\s+24:6I-\d+[a-z]?/g,
		(match) => `{{extref:${match}}}`
	);

	// Federal CFR references
	text = text.replace(
		/\d+\s+C\.F\.R\.\s+(?:Part\s+\d+|\u00a7\s*\d+[a-z]?(?:\.\d+)?)/g,
		(match) => `{{extref:${match}}}`
	);

	return text;
}
