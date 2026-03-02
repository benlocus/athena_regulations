/**
 * Parser for CREAMMA statutory text (N.J.S.A. 24:6I-31 through 24:6I-56).
 * Converts raw legislative text into structured ContentNode[] trees.
 *
 * Statutory text is structurally different from administrative code:
 * - Sections identified by "24:6I-XX" or "C.24:6I-XX"
 * - Subsection hierarchy: a., (1), (a), (i)
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
 * Parse CREAMMA statute text into structured sections.
 */
export function parseNJStatute(text: string): ParsedSection[] {
	const cleaned = cleanStatuteText(text);
	const lines = cleaned.split('\n');
	const boundaries = findStatuteSectionBoundaries(lines);
	const results: ParsedSection[] = [];

	for (let i = 0; i < boundaries.length; i++) {
		const boundary = boundaries[i];
		const endLine = i + 1 < boundaries.length ? boundaries[i + 1].startLine : lines.length;
		const sectionLines = lines.slice(boundary.startLine, endLine);

		// Remove the section heading line
		const bodyLines = sectionLines.slice(1);
		const bodyText = joinWrappedLines(bodyLines);

		const sectionId = `24-6i-${boundary.sectionNumber}`;
		const root: ContentNode = {
			id: sectionId,
			type: 'section',
			number: null,
			heading: boundary.heading,
			content: '',
			children: [],
			depth: 0
		};

		const children = parseStatuteContent(bodyText, sectionId, 0);
		if (children.length > 0) {
			root.children = children;
		} else {
			root.content = addStatuteCrossReferences(bodyText.trim());
		}

		const contentTree = [root];
		const plainText = flattenContentTree(contentTree);

		results.push({
			sectionNumber: `24:6I-${boundary.sectionNumber}`,
			heading: boundary.heading,
			slug: `24-6i-${boundary.sectionNumber}`,
			contentTree,
			plainText,
			sortOrder: i
		});
	}

	return results;
}

function cleanStatuteText(text: string): string {
	const lines = text.split('\n');
	const cleaned: string[] = [];
	const formFeedPattern = /\f/g;
	const pageNumPattern = /^\s*(?:Page\s+\d+\s+of\s+\d+|\d{1,3})\s*$/i;
	const headerPattern = /^\s*(?:P\.L\.\s+2021|CHAPTER\s+16)\s*$/i;

	for (const line of lines) {
		const stripped = line.replace(formFeedPattern, '');
		const trimmed = stripped.trim();

		if (pageNumPattern.test(trimmed)) continue;
		if (headerPattern.test(trimmed)) continue;
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

type SectionBoundary = {
	sectionNumber: string;
	heading: string;
	startLine: number;
};

function findStatuteSectionBoundaries(lines: string[]): SectionBoundary[] {
	// Match "C.24:6I-33 Definitions relative to the regulation and use of cannabis"
	// or "24:6I-33. Definitions" or "24:6I-33 Definitions"
	const sectionPattern = /^(?:C\.)?24:6I-(\d+[a-z]?)\.?\s+(.+?)\.?\s*$/;

	const lastSeen = new Map<string, SectionBoundary>();
	const order: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const trimmed = lines[i].trim();
		const match = trimmed.match(sectionPattern);
		if (!match) continue;

		const sectionNumber = match[1];
		let heading = match[2];
		heading = heading.replace(/\.\s*$/, '');

		if (heading.length > 200) continue;

		if (!lastSeen.has(sectionNumber)) {
			order.push(sectionNumber);
		}
		lastSeen.set(sectionNumber, { sectionNumber, heading, startLine: i });
	}

	return order.map((num) => lastSeen.get(num)!);
}

/**
 * Parse statutory numbered content.
 * NJ statute hierarchy: a., (1), (a), (i)
 */
function parseStatuteContent(
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
			// a., b., c. — lowercase letters with period
			pattern = /(?:^|\n)([a-z])\.\s/;
			numberExtractor = (m) => `${m}.`;
			break;
		case 2:
			// (1), (2), etc.
			pattern = /(?:^|\n)\((\d+)\)\s/;
			numberExtractor = (m) => `(${m})`;
			break;
		case 3:
			// (a), (b), etc.
			pattern = /(?:^|\n)\(([a-z])\)\s/;
			numberExtractor = (m) => `(${m})`;
			break;
		case 4:
			// (i), (ii), etc.
			pattern = /(?:^|\n)\((i{1,3}|iv|vi{0,3}|ix|x{0,3}i{0,3})\)\s/;
			numberExtractor = (m) => `(${m})`;
			break;
		default:
			return [];
	}

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
	if (depth === 3 && matches.length > 1 && matches[0].raw !== 'a') return [];
	if (depth === 4 && matches.length > 1 && matches[0].raw !== 'i') return [];

	const preambleText = text.slice(0, matches[0].index).trim();

	for (let i = 0; i < matches.length; i++) {
		const startIdx = matches[i].index;
		const endIdx = i + 1 < matches.length ? matches[i + 1].index : text.length;
		let sectionText = text.slice(startIdx, endIdx).trim();

		// Remove the number prefix
		const prefixPattern =
			depth === 1
				? /^[a-z]\.\s*/
				: depth === 2
					? /^\(\d+\)\s*/
					: depth === 3
						? /^\([a-z]\)\s*/
						: /^\((?:i{1,3}|iv|vi{0,3}|ix|x{0,3}i{0,3})\)\s*/;
		sectionText = sectionText.replace(prefixPattern, '');

		const nodeId = `${parentId}-${matches[i].number}`;
		const children = parseStatuteContent(sectionText, nodeId, depth);

		let content = sectionText;
		if (children.length > 0) {
			const nextDepth = depth + 1;
			let firstChildPattern: RegExp | null = null;
			switch (nextDepth) {
				case 2:
					firstChildPattern = /\(\d+\)\s/;
					break;
				case 3:
					firstChildPattern = /\([a-z]\)\s/;
					break;
				case 4:
					firstChildPattern = /\((?:i{1,3}|iv|vi{0,3}|ix|x{0,3}i{0,3})\)\s/;
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

		nodes.push({
			id: nodeId,
			type: depth <= 1 ? 'subsection' : 'paragraph',
			number: matches[i].number,
			heading: null,
			content: addStatuteCrossReferences(content),
			children,
			depth
		});
	}

	if (preambleText && nodes.length > 0) {
		nodes.unshift({
			id: `${parentId}_preamble`,
			type: 'text',
			number: null,
			heading: null,
			content: addStatuteCrossReferences(preambleText),
			children: [],
			depth
		});
	}

	return nodes;
}

function addStatuteCrossReferences(text: string): string {
	// Internal statute references: "section 33" or "Section 37"
	text = text.replace(
		/(?:[Ss]ection)\s+(\d+)\s+of\s+(?:this\s+act|P\.L\.\s*2021,?\s*c\.?\s*16)/g,
		(_match, secNum) => `{{ref:24:6I-${secNum}}}`
	);

	// N.J.S.A. references
	text = text.replace(
		/N\.?J\.?S\.?A\.?\s+([\d:]+[A-Z]?-[\d]+[a-z]?)/g,
		(_match, cite) => `{{extref:N.J.S.A. ${cite}}}`
	);

	// N.J.A.C. references
	text = text.replace(
		/N\.?J\.?A\.?C\.?\s+([\d:]+[-\d.]+)/g,
		(_match, cite) => `{{ref:${cite}}}`
	);

	return text;
}
