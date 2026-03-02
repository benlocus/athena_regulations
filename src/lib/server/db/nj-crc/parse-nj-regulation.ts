/**
 * Parser for New Jersey CRC regulation text (N.J.A.C. 17:30, extracted from PDF via pdftotext).
 * Converts raw text into structured ContentNode[] trees.
 *
 * NJ numbering hierarchy:
 *   (a) depth 1, 1. depth 2, i. depth 3
 *
 * Section format: 17:30-{subchapter}.{section} (e.g., 17:30-10.1)
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
 * Parse a NJ regulation text file for a given subchapter into structured sections.
 */
export function parseNJRegulation(text: string, subchapterNumber: string): ParsedSection[] {
	const cleaned = cleanText(text, subchapterNumber);
	const lines = cleaned.split('\n');
	const boundaries = findSectionBoundaries(lines, subchapterNumber);
	const results: ParsedSection[] = [];

	for (let i = 0; i < boundaries.length; i++) {
		const boundary = boundaries[i];
		const endLine = i + 1 < boundaries.length ? boundaries[i + 1].startLine : lines.length;
		const sectionLines = lines.slice(boundary.startLine, endLine);

		// Remove the section heading line itself
		const bodyLines = sectionLines.slice(1);
		const bodyText = joinWrappedLines(bodyLines);

		const contentTree = parseSectionContent(
			boundary.sectionNumber,
			boundary.heading,
			bodyText,
			subchapterNumber
		);
		const plainText = flattenContentTree(contentTree);

		results.push({
			sectionNumber: boundary.sectionNumber,
			heading: boundary.heading,
			slug: njSectionToSlug(boundary.sectionNumber),
			contentTree,
			plainText,
			sortOrder: i
		});
	}

	return results;
}

/**
 * Convert an NJ section number to a URL slug.
 * "17:30-10.1" -> "17-30-10-1"
 */
export function njSectionToSlug(sectionNumber: string): string {
	return sectionNumber.replace(/:/g, '-').replace(/\./g, '-');
}

/**
 * Clean raw PDF text: remove page numbers, headers/footers, form feeds.
 */
function cleanText(text: string, subchapterNumber: string): string {
	const lines = text.split('\n');
	const cleaned: string[] = [];

	// Pattern for repeated page headers like "N.J.A.C. 17:30" or "SUBCHAPTER 10"
	const headerPattern1 = /^\s*N\.?J\.?A\.?C\.?\s*17:30\s*$/i;
	const headerPattern2 = new RegExp(
		`^\\s*(?:SUBCHAPTER|Subchapter)\\s+${subchapterNumber}\\s*$`
	);
	// Common NJ admin code header patterns
	const headerPattern3 = /^\s*PERSONAL USE CANNABIS RULES?\s*$/i;
	const headerPattern4 = /^\s*(?:TREASURY|Treasury)\s*[-—]\s*(?:GENERAL|General)\s*$/i;
	// Page number patterns
	const pageNumPattern = /^\s*(?:Page\s+\d+\s+of\s+\d+|\d{1,3})\s*$/i;
	// Supplement date pattern (e.g., "Supp. 3-6-23")
	const suppPattern = /^\s*Supp\.\s+\d{1,2}-\d{1,2}-\d{2,4}\s*$/i;
	// Chapter heading that repeats on each page
	const chapterPattern = /^\s*CHAPTER\s+30\s*$/i;
	// Form feed
	const formFeedPattern = /\f/g;

	for (const line of lines) {
		const stripped = line.replace(formFeedPattern, '');
		const trimmed = stripped.trim();

		if (headerPattern1.test(trimmed)) continue;
		if (headerPattern2.test(trimmed)) continue;
		if (headerPattern3.test(trimmed)) continue;
		if (headerPattern4.test(trimmed)) continue;
		if (pageNumPattern.test(trimmed)) continue;
		if (suppPattern.test(trimmed)) continue;
		if (chapterPattern.test(trimmed)) continue;
		// Skip lines that are just dashes or underscores (separators)
		if (/^[-_=]{3,}$/.test(trimmed)) continue;

		cleaned.push(stripped);
	}

	return cleaned.join('\n');
}

/**
 * Join lines that are wrapped mid-sentence. Consecutive non-blank lines
 * are joined with a space, blank lines are preserved as paragraph breaks.
 */
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

type SectionBoundary = {
	sectionNumber: string;
	heading: string;
	startLine: number;
};

/**
 * Find section boundaries in the cleaned text.
 * NJ sections use "17:30-10.1 Heading" format.
 * Many PDFs have a TOC listing all sections first, then the full body.
 * We keep the LAST occurrence of each section (the body, not the TOC).
 */
function findSectionBoundaries(lines: string[], subchapterNumber: string): SectionBoundary[] {
	// Match "17:30-10.1 Cannabis cultivator premises" or
	// "N.J.A.C. 17:30-10.1 Cannabis cultivator premises"
	const sectionPattern = new RegExp(
		`^(?:N\\.?J\\.?A\\.?C\\.?\\s+)?17:30-${subchapterNumber}\\.(\\d+)\\s+(.+?)\\s*$`
	);

	// First pass: collect ALL occurrences, keeping the last one for each section number
	const lastSeen = new Map<string, SectionBoundary>();
	const order: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const trimmed = lines[i].trim();
		const match = trimmed.match(sectionPattern);
		if (!match) continue;

		const sectionNumber = `17:30-${subchapterNumber}.${match[1]}`;
		let heading = match[2];
		heading = heading.replace(/\.\s*$/, '');

		// Skip lines too long to be headings (body text that happens to match)
		if (heading.length > 200) continue;

		if (!lastSeen.has(sectionNumber)) {
			order.push(sectionNumber);
		}
		lastSeen.set(sectionNumber, { sectionNumber, heading, startLine: i });
	}

	// Return in document order
	return order.map((num) => lastSeen.get(num)!);
}

/**
 * Parse a section body into a ContentNode tree.
 */
function parseSectionContent(
	sectionNumber: string,
	heading: string,
	bodyText: string,
	subchapterNumber: string
): ContentNode[] {
	const sectionId = `17-30-${subchapterNumber}-${sectionNumber}`;
	const root: ContentNode = {
		id: sectionId,
		type: 'section',
		number: null,
		heading,
		content: '',
		children: [],
		depth: 0
	};

	const children = parseNumberedContent(bodyText, sectionId, 0);
	if (children.length > 0) {
		root.children = children;
	} else {
		root.content = addCrossReferences(bodyText.trim());
	}

	return [root];
}

/**
 * Parse numbered content at a given depth.
 * NJ hierarchy:
 *   Depth 1: (a), (b), (c) — Lowercase letters in parens
 *   Depth 2: 1., 2., 3. — Arabic numerals with period
 *   Depth 3: i., ii., iii. — Roman numerals with period
 */
function parseNumberedContent(
	text: string,
	parentId: string,
	parentDepth: number
): ContentNode[] {
	const depth = parentDepth + 1;
	const nodes: ContentNode[] = [];

	let pattern: RegExp;
	let numberExtractor: (m: string) => string;

	switch (depth) {
		case 1:
			// (a), (b), etc.
			pattern = /(?:^|\n)\(([a-z])\)\s/;
			numberExtractor = (m) => `(${m})`;
			break;
		case 2:
			// 1., 2., etc.
			pattern = /(?:^|\n)(\d+)\.\s/;
			numberExtractor = (m) => `${m}.`;
			break;
		case 3:
			// i., ii., iii., iv., etc.
			pattern = /(?:^|\n)(i{1,3}|iv|vi{0,3}|ix|x{0,3}i{0,3})\.\s/;
			numberExtractor = (m) => `${m}.`;
			break;
		default:
			return [];
	}

	// Find all matches
	const allPattern = new RegExp(pattern.source, 'gm');
	const matches: Array<{ index: number; number: string; raw: string }> = [];

	let match;
	while ((match = allPattern.exec(text)) !== null) {
		matches.push({
			index: match.index,
			number: numberExtractor(match[1]),
			raw: match[1]
		});
	}

	if (matches.length === 0) return [];

	// Validate sequential start
	if (depth === 1 && matches.length > 1 && matches[0].raw !== 'a') return [];
	if (depth === 2 && matches.length > 1 && matches[0].raw !== '1') return [];
	if (depth === 3 && matches.length > 1 && matches[0].raw !== 'i') return [];

	// Extract preamble text (before first numbered item)
	const preambleText = text.slice(0, matches[0].index).trim();

	for (let i = 0; i < matches.length; i++) {
		const startIdx = matches[i].index;
		const endIdx = i + 1 < matches.length ? matches[i + 1].index : text.length;
		let sectionText = text.slice(startIdx, endIdx).trim();

		// Remove the number prefix
		const prefixPattern =
			depth === 1
				? /^\([a-z]\)\s*/
				: depth === 2
					? /^\d+\.\s*/
					: /^(?:i{1,3}|iv|vi{0,3}|ix|x{0,3}i{0,3})\.\s*/;
		sectionText = sectionText.replace(prefixPattern, '');

		const nodeId = `${parentId}-${matches[i].number}`;

		// Recursively parse children
		const children = parseNumberedContent(sectionText, nodeId, depth);

		let content = sectionText;
		if (children.length > 0) {
			// Extract content before the first child
			const nextDepth = depth + 1;
			let firstChildPattern: RegExp | null = null;
			switch (nextDepth) {
				case 2:
					firstChildPattern = /\d+\.\s/;
					break;
				case 3:
					firstChildPattern = /(?:i{1,3}|iv|vi{0,3}|ix|x{0,3}i{0,3})\.\s/;
					break;
			}

			if (firstChildPattern) {
				const firstChildMatch = content.match(firstChildPattern);
				if (firstChildMatch && firstChildMatch.index !== undefined) {
					content = content.slice(0, firstChildMatch.index).trim();
				} else {
					content = '';
				}
			}
		}

		const node: ContentNode = {
			id: nodeId,
			type: depth <= 1 ? 'subsection' : 'paragraph',
			number: matches[i].number,
			heading: null,
			content: addCrossReferences(content),
			children,
			depth
		};

		nodes.push(node);
	}

	// Add preamble text node if present
	if (preambleText && nodes.length > 0) {
		nodes.unshift({
			id: `${parentId}_preamble`,
			type: 'text',
			number: null,
			heading: null,
			content: addCrossReferences(preambleText),
			children: [],
			depth
		});
	}

	return nodes;
}

/**
 * Detect cross-references in text and wrap them with {{ref:...}} or {{extref:...}} syntax.
 */
function addCrossReferences(text: string): string {
	// Internal references: "N.J.A.C. 17:30-10.1(a)" or "17:30-10.1"
	text = text.replace(
		/(?:N\.?J\.?A\.?C\.?\s+)?17:30-(\d+\.\d+)(?:\(([a-z0-9]+)\))?(?:(\d+)\.)?/g,
		(_match, secNum, sub1, sub2) => {
			const citation = `17:30-${secNum}${sub1 ? `(${sub1})` : ''}${sub2 ? `${sub2}.` : ''}`;
			return `{{ref:${citation}}}`;
		}
	);

	// External statute references: "N.J.S.A. 24:6I-37" or "N.J.S.A. 24:6I-37a"
	text = text.replace(
		/N\.?J\.?S\.?A\.?\s+24:6I-\d+[a-z]?/g,
		(match) => `{{extref:${match}}}`
	);

	// Federal CFR references: "21 C.F.R. Part 110" or "21 C.F.R. § 820"
	text = text.replace(
		/\d+\s+C\.F\.R\.\s+(?:Part\s+\d+|\u00a7\s*\d+[a-z]?(?:\.\d+)?)/g,
		(match) => `{{extref:${match}}}`
	);

	// Federal USC references: "21 U.S.C. § 802"
	text = text.replace(
		/\d+\s+U\.S\.C\.\s+(?:\u00a7\s*)?\d+[a-z]?/g,
		(match) => `{{extref:${match}}}`
	);

	return text;
}
