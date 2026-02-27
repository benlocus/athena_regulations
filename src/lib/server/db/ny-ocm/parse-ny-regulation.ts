/**
 * Parser for New York OCM regulation text (extracted from PDF via pdftotext).
 * Converts raw text into structured ContentNode[] trees.
 *
 * NY numbering hierarchy:
 *   (a) depth 1, (1) depth 2, (i) depth 3, (A) depth 4
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
 * Parse a NY regulation text file for a given part into structured sections.
 */
export function parseNYRegulation(text: string, partNumber: string): ParsedSection[] {
	const cleaned = cleanText(text, partNumber);
	const lines = cleaned.split('\n');
	const boundaries = findSectionBoundaries(lines, partNumber);
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
			partNumber
		);
		const plainText = flattenContentTree(contentTree);

		results.push({
			sectionNumber: boundary.sectionNumber,
			heading: boundary.heading,
			slug: boundary.sectionNumber.replace('.', '-'),
			contentTree,
			plainText,
			sortOrder: i
		});
	}

	return results;
}

/**
 * Clean raw PDF text: remove page numbers, headers/footers, form feeds.
 */
function cleanText(text: string, partNumber: string): string {
	const lines = text.split('\n');
	const cleaned: string[] = [];

	// Pattern for repeated page headers like "9 NYCRR Part 118"
	const headerPattern = new RegExp(
		`^\\s*9\\s*NYCRR\\s*Part\\s*${partNumber}\\s*$`,
		'i'
	);
	// Page number patterns
	const pageNumPattern = /^\s*(?:Page\s+\d+\s+of\s+\d+|\d{1,3})\s*$/i;
	// Form feed
	const formFeedPattern = /\f/g;

	for (const line of lines) {
		const stripped = line.replace(formFeedPattern, '');
		const trimmed = stripped.trim();

		if (headerPattern.test(trimmed)) continue;
		if (pageNumPattern.test(trimmed)) continue;
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
 * NY sections look like: "118.1 Definitions." or "120.2 Licensing."
 */
function findSectionBoundaries(lines: string[], partNumber: string): SectionBoundary[] {
	const boundaries: SectionBoundary[] = [];
	// Match lines like "118.1 Definitions." or "120.10 Some heading"
	const sectionPattern = new RegExp(
		`^\\s*(${partNumber}\\.\\d+)\\s+(.+?)\\s*$`
	);

	for (let i = 0; i < lines.length; i++) {
		const trimmed = lines[i].trim();
		const match = trimmed.match(sectionPattern);
		if (match) {
			const sectionNumber = match[1];
			let heading = match[2];
			// Remove trailing period from heading if present
			heading = heading.replace(/\.\s*$/, '');

			// Avoid matching section numbers embedded in body text:
			// A real heading line should be relatively short and not start with lowercase
			if (heading.length > 200) continue;

			// Check this isn't a duplicate (same section found twice)
			const existing = boundaries.find((b) => b.sectionNumber === sectionNumber);
			if (existing) continue;

			boundaries.push({ sectionNumber, heading, startLine: i });
		}
	}

	return boundaries;
}

/**
 * Parse a section body into a ContentNode tree.
 */
function parseSectionContent(
	sectionNumber: string,
	heading: string,
	bodyText: string,
	partNumber: string
): ContentNode[] {
	const root: ContentNode = {
		id: `${partNumber}-${sectionNumber}`,
		type: 'section',
		number: null,
		heading,
		content: '',
		children: [],
		depth: 0
	};

	const children = parseNumberedContent(bodyText, `${partNumber}-${sectionNumber}`, 0);
	if (children.length > 0) {
		root.children = children;
	} else {
		root.content = addCrossReferences(bodyText.trim(), partNumber);
	}

	return [root];
}

/**
 * Parse numbered content at a given depth.
 * NY hierarchy:
 *   Depth 1: (a), (b), (c) — Lowercase letters in parens
 *   Depth 2: (1), (2), (3) — Arabic in parens
 *   Depth 3: (i), (ii), (iii) — Roman numerals in parens
 *   Depth 4: (A), (B), (C) — Uppercase letters in parens
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
			// (1), (2), etc.
			pattern = /(?:^|\n)\((\d+)\)\s/;
			numberExtractor = (m) => `(${m})`;
			break;
		case 3:
			// (i), (ii), (iii), (iv), etc.
			pattern = /(?:^|\n)\((i{1,3}|iv|vi{0,3}|ix|x{0,3}i{0,3})\)\s/;
			numberExtractor = (m) => `(${m})`;
			break;
		case 4:
			// (A), (B), etc.
			pattern = /(?:^|\n)\(([A-Z])\)\s/;
			numberExtractor = (m) => `(${m})`;
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
	if (depth === 4 && matches.length > 1 && matches[0].raw !== 'A') return [];

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
					? /^\(\d+\)\s*/
					: depth === 3
						? /^\((?:i{1,3}|iv|vi{0,3}|ix|x{0,3}i{0,3})\)\s*/
						: /^\([A-Z]\)\s*/;
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
					firstChildPattern = /\(\d+\)\s/;
					break;
				case 3:
					firstChildPattern = /\((?:i{1,3}|iv|vi{0,3}|ix|x{0,3}i{0,3})\)\s/;
					break;
				case 4:
					firstChildPattern = /\([A-Z]\)\s/;
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
			content: addCrossReferences(content, parentId.split('-')[0]),
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
			content: addCrossReferences(preambleText, parentId.split('-')[0]),
			children: [],
			depth
		});
	}

	return nodes;
}

/**
 * Detect cross-references in text and wrap them with {{ref:...}} or {{extref:...}} syntax.
 */
function addCrossReferences(text: string, partNumber: string): string {
	// Internal references: "section 118.1" or "Section 120.3(a)"
	text = text.replace(
		/(?:(?:[Ss]ection|§)\s*)(\d+\.\d+)(?:\(([a-z0-9]+)\))?(?:\(([a-z0-9]+)\))?/g,
		(_match, secNum, sub1, sub2) => {
			const citation = `${secNum}${sub1 ? `(${sub1})` : ''}${sub2 ? `(${sub2})` : ''}`;
			return `{{ref:${citation}}}`;
		}
	);

	// Part references: "Part 118" or "Part 120"
	text = text.replace(
		/(?:Part\s+)(\d{3})(?!\.\d)/g,
		(_match, partNum) => {
			return `{{ref:${partNum}}}`;
		}
	);

	// External references: "Cannabis Law § 68" or "Cannabis Law Article 4"
	text = text.replace(
		/Cannabis\s+Law\s+(?:§\s*\d+[a-z]?(?:\([a-z0-9]+\))?|Article\s+\d+)/g,
		(match) => {
			return `{{extref:${match}}}`;
		}
	);

	return text;
}
