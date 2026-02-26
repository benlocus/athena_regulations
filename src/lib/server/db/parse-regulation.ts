/**
 * Parser for Massachusetts regulation text (extracted from PDF via pdftotext).
 * Converts raw text into structured ContentNode[] trees.
 */
import type { ContentNode } from '$lib/types';
import { extractSectionNumber } from '$lib/utils/citation-parser';
import { sectionToSlug } from '$lib/utils/slug';
import { flattenContentTree } from '$lib/utils/content-renderer';

// Section definitions from the TOC
const SECTION_HEADERS: Record<string, string> = {
	'500.001': 'Purpose',
	'500.002': 'Definitions',
	'500.003': 'Colocated Marijuana Operations (CMOs)',
	'500.005': 'Fees',
	'500.029': 'Registration and Conduct of Laboratory Agents',
	'500.030': 'Registration of Marijuana Establishment Agents',
	'500.031': 'Denial of a Marijuana Establishment Agent Registration Card',
	'500.032': 'Revocation of a Marijuana Establishment Agent Registration Card',
	'500.033': 'Void Registration Cards',
	'500.040':
		'Leadership Rating Program for Marijuana Establishments and Marijuana-related Businesses',
	'500.050': 'Marijuana Establishments',
	'500.100': 'Application for Licensing of Marijuana Establishments',
	'500.101': 'Application Requirements',
	'500.102': 'Action on Applications',
	'500.103': 'Licensure and Renewal',
	'500.104': 'Notification and Approval of Changes',
	'500.105': 'General Operational Requirements for Marijuana Establishments',
	'500.110': 'Security Requirements for Marijuana Establishments',
	'500.120': 'Additional Operational Requirements for Indoor and Outdoor Marijuana Cultivators',
	'500.130': 'Additional Operational Requirements for Marijuana Product Manufacturers',
	'500.140': 'Additional Operational Requirements for Retail Sale',
	'500.141': 'Additional Operational Requirements for Social Consumption Establishments',
	'500.145':
		'Additional Operational Requirements for Delivery of Marijuana, Marijuana Products, Marijuana Accessories, and Marijuana Establishment Branded Goods to Consumers and as Permitted, to Patients or Caregivers',
	'500.146': 'Additional Operational Requirements for Marijuana Delivery Operators',
	'500.147':
		'Operational Requirements for Marijuana Research Facility Licensees and Research Permits',
	'500.150': 'Edibles',
	'500.160': 'Testing of Marijuana and Marijuana Products',
	'500.170': 'Municipal Requirements',
	'500.180':
		'Host Community Agreement Requirements for License Applicants, Marijuana Establishments, Host Communities',
	'500.181': 'Minimum Acceptable Equity Standards Governing Municipalities and Host Communities',
	'500.200': 'Counties of Dukes County and Nantucket',
	'500.300': 'Complaints Process',
	'500.301': 'Inspections and Compliance',
	'500.302': 'Compliance Examination',
	'500.303':
		'Unannounced Purchase for Purpose of Investigative Testing (Secret Shopper Program)',
	'500.310': 'Deficiency Statements',
	'500.320': 'Plans of Correction',
	'500.321': 'Administrative Hold',
	'500.330': 'Limitation of Sales',
	'500.335': 'Removal and Prohibition of Marijuana and Marijuana Products',
	'500.340': 'Quarantine Order',
	'500.350': 'Cease and Desist Order and Summary Suspension Order',
	'500.360': 'Fines',
	'500.370': 'Order to Show Cause',
	'500.400': 'Marijuana Establishments: Grounds for Denial of Application for Licensure',
	'500.415': 'Void Marijuana Establishment License',
	'500.450':
		'Marijuana Establishment License: Grounds for Suspension, Revocation and Denial of Renewal Applications',
	'500.500': 'Hearings and Appeals of Actions on Licenses',
	'500.800': 'Suitability Standard for Licensure and Registration',
	'500.801': 'Suitability Standard for Licensure',
	'500.802': 'Suitability Standard for Registration as a Marijuana Establishment Agent',
	'500.803': 'Suitability Standard for Registration as a Laboratory Agent',
	'500.820': 'Confidentiality',
	'500.830': 'Petitions for the Adoption, Amendment or Repeal of Regulations',
	'500.840': 'Non-conflict with Other Laws',
	'500.850': 'Waivers',
	'500.860': 'Notice',
	'500.900': 'Severability'
};

const SECTION_ORDER = Object.keys(SECTION_HEADERS);

/**
 * Find section boundaries in the raw text.
 * Each section starts with "500.NNN: Title" at the beginning of a line
 * and ends where the next section begins.
 */
export function findSectionBoundaries(
	lines: string[]
): Array<{ sectionNumber: string; startLine: number; endLine: number }> {
	const boundaries: Array<{ sectionNumber: string; startLine: number; endLine: number }> = [];
	const sectionStarts: Array<{ sectionNumber: string; line: number }> = [];

	// Find the start of the actual content (after TOC)
	// The TOC ends and content starts around line 68 (500.001: Purpose body text)
	let contentStartLine = 0;
	for (let i = 0; i < lines.length; i++) {
		if (lines[i] === '500.001: Purpose' && i > 60) {
			contentStartLine = i;
			break;
		}
	}

	// Now find each section start in the content area
	const sectionPattern = /^(500\.\d{3}):\s+(.+)/;
	const continuedPattern = /^500\.\d{3}: continued$/;

	for (let i = contentStartLine; i < lines.length; i++) {
		const line = lines[i].trim();

		// Skip "continued" headers (these are page breaks in the PDF)
		if (continuedPattern.test(line)) continue;

		const match = line.match(sectionPattern);
		if (match) {
			const sectionNum = match[1];
			// Only process known sections
			if (SECTION_HEADERS[sectionNum]) {
				// Check if this is a true section start (not a reference within text)
				// True section starts typically have the full title matching our known headers
				const title = match[2];
				const knownTitle = SECTION_HEADERS[sectionNum];

				// Check if title starts with the known title (may have slight variations)
				if (
					knownTitle.startsWith(title.slice(0, 20)) ||
					title.startsWith(knownTitle.slice(0, 20))
				) {
					// Avoid duplicate starts (some sections appear in TOC and content)
					const alreadyFound = sectionStarts.find((s) => s.sectionNumber === sectionNum);
					if (!alreadyFound || i > alreadyFound.line + 100) {
						if (alreadyFound) {
							// Replace with later occurrence (the actual content, not TOC)
							alreadyFound.line = i;
						} else {
							sectionStarts.push({ sectionNumber: sectionNum, line: i });
						}
					}
				}
			}
		}
	}

	// Sort by line number
	sectionStarts.sort((a, b) => a.line - b.line);

	// Create boundaries
	for (let i = 0; i < sectionStarts.length; i++) {
		const endLine = i + 1 < sectionStarts.length ? sectionStarts[i + 1].line : lines.length;

		boundaries.push({
			sectionNumber: sectionStarts[i].sectionNumber,
			startLine: sectionStarts[i].line,
			endLine
		});
	}

	return boundaries;
}

/**
 * Parse a section's raw text into a ContentNode tree.
 */
export function parseSectionContent(
	sectionNumber: string,
	lines: string[]
): ContentNode[] {
	// Remove section header line, continued markers, and empty lines
	const cleanedLines: string[] = [];
	const continuedPattern = new RegExp(`^${sectionNumber.replace('.', '\\.')}: continued$`);
	let skipHeader = true;

	for (const line of lines) {
		const trimmed = line.trim();
		if (skipHeader && trimmed.startsWith(`${sectionNumber}:`)) {
			skipHeader = false;
			continue;
		}
		if (continuedPattern.test(trimmed)) continue;
		cleanedLines.push(trimmed);
	}

	// Join into paragraphs (blank lines separate paragraphs)
	const text = cleanedLines.join('\n');

	// Parse the hierarchical structure
	const root: ContentNode = {
		id: sectionNumber,
		type: 'section',
		number: null,
		heading: SECTION_HEADERS[sectionNumber] || null,
		content: '',
		children: [],
		depth: 0
	};

	// Try to parse numbered subsections
	const parsedChildren = parseNumberedContent(text, sectionNumber, 0);
	if (parsedChildren.length > 0) {
		root.children = parsedChildren;
	} else {
		// No numbered content found, store as plain text
		root.content = addCrossReferences(text.trim());
	}

	return [root];
}

/**
 * Parse numbered content at a given depth.
 * Depth 1: (1), (2), (3) — Arabic in parens
 * Depth 2: (a), (b), (c) — Lowercase letters in parens
 * Depth 3: 1., 2., 3. — Arabic with period
 * Depth 4: i., ii., iii. — Roman numerals with period
 */
function parseNumberedContent(
	text: string,
	parentId: string,
	parentDepth: number
): ContentNode[] {
	const depth = parentDepth + 1;
	const nodes: ContentNode[] = [];

	let pattern: RegExp;
	let numberExtractor: (match: string) => string;

	switch (depth) {
		case 1:
			// (1), (2), etc.
			pattern = /(?:^|\n)\((\d+)\)\s/;
			numberExtractor = (m) => `(${m})`;
			break;
		case 2:
			// (a), (b), etc.
			pattern = /(?:^|\n)\(([a-z])\)\s/;
			numberExtractor = (m) => `(${m})`;
			break;
		case 3:
			// 1., 2., etc. (not section numbers like 500.xxx)
			pattern = /(?:^|\n)(\d+)\.\s/;
			numberExtractor = (m) => `${m}.`;
			break;
		case 4:
			// i., ii., iii., etc.
			pattern = /(?:^|\n)(i{1,3}|iv|vi{0,3}|ix|x{0,3})\.\s/;
			numberExtractor = (m) => `${m}.`;
			break;
		default:
			return [];
	}

	// Find all matches and their positions
	const allPattern = new RegExp(pattern.source, 'gm');
	const matches: Array<{ index: number; number: string; raw: string }> = [];

	let match;
	while ((match = allPattern.exec(text)) !== null) {
		const numMatch =
			depth === 1
				? match[1]
				: depth === 2
					? match[1]
					: depth === 3
						? match[1]
						: match[1];

		// For depth 3, make sure we're not matching section numbers (e.g., "500.")
		if (depth === 3) {
			const beforeIndex = match.index > 0 ? text[match.index - 1] : '\n';
			if (beforeIndex !== '\n' && match.index !== 0) continue;
			// Check this isn't part of a section number like "500.001"
			const before = text.slice(Math.max(0, match.index - 5), match.index);
			if (/\d{3}$/.test(before)) continue;
		}

		matches.push({
			index: match.index,
			number: numberExtractor(numMatch),
			raw: numMatch
		});
	}

	if (matches.length === 0) return [];

	// Check if the numbering is sequential (validates we found real structure)
	if (depth === 1 && matches.length > 1) {
		const first = parseInt(matches[0].raw);
		if (first !== 1) return []; // Should start with (1)
	}

	// Extract preamble text (before first numbered item)
	const preambleText = text.slice(0, matches[0].index).trim();

	// Parse each numbered section
	for (let i = 0; i < matches.length; i++) {
		const startIdx = matches[i].index;
		const endIdx = i + 1 < matches.length ? matches[i + 1].index : text.length;
		let sectionText = text.slice(startIdx, endIdx).trim();

		// Remove the number prefix
		const prefixPattern =
			depth === 1
				? /^\(\d+\)\s*/
				: depth === 2
					? /^\([a-z]\)\s*/
					: depth === 3
						? /^\d+\.\s*/
						: /^(?:i{1,3}|iv|vi{0,3}|ix|x{0,3})\.\s*/;
		sectionText = sectionText.replace(prefixPattern, '');

		const nodeId = `${parentId}${matches[i].number}`;

		// Try to extract heading (bold text before content, typically on same line)
		let heading: string | null = null;
		let content = sectionText;

		// Recursively parse children
		const children = parseNumberedContent(content, nodeId, depth);

		if (children.length > 0) {
			// Extract content before the first child
			const firstChildPattern =
				depth === 1
					? /\([a-z]\)\s/
					: depth === 2
						? /\d+\.\s/
						: depth === 3
							? /(?:i{1,3}|iv|vi{0,3}|ix|x{0,3})\.\s/
							: null;

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
			heading,
			content: addCrossReferences(content),
			children,
			depth
		};

		nodes.push(node);
	}

	// If there was preamble text, add it to parent's content
	// (caller should handle this)
	if (preambleText && nodes.length > 0) {
		// Store preamble as a text node at the beginning
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
	// Internal references: "935 CMR 500.XXX" or "500.XXX"
	text = text.replace(
		/(?:935\s+CMR\s+)?500\.(\d{3})(?:\((\d+)\))?(?:\(([a-z])\))?/g,
		(match, section, subsec1, subsec2) => {
			const citation = `500.${section}${subsec1 ? `(${subsec1})` : ''}${subsec2 ? `(${subsec2})` : ''}`;
			// Don't double-wrap
			if (text.includes(`{{ref:${citation}}}`)) return match;
			return `{{ref:${citation}}}`;
		}
	);

	// External references: M.G.L. c. XX
	text = text.replace(/M\.G\.L\.\s+c\.\s+\d+[A-Z]?(?:,\s*§\s*\d+[a-z]?(?:\([a-z0-9]+\))?)?/g, (match) => {
		return `{{extref:${match}}}`;
	});

	return text;
}

/**
 * Parse the definitions section (500.002) which has a special format:
 * term means definition text.
 */
function parseDefinitions(text: string, sectionNumber: string): ContentNode[] {
	const root: ContentNode = {
		id: sectionNumber,
		type: 'section',
		number: null,
		heading: SECTION_HEADERS[sectionNumber] || 'Definitions',
		content:
			'For the purposes of 935 CMR 500.000, the following terms shall have the following meanings:',
		children: [],
		depth: 0
	};

	// Split by definition entries
	// Each definition starts with a capitalized term followed by "means"
	const defPattern =
		/^([A-Z][A-Za-z\s\-\/()]+?)(?:\s+means|\s+shall have the same meaning|\s+shall mean)\s/gm;
	const matches: Array<{ index: number; term: string }> = [];

	let match;
	while ((match = defPattern.exec(text)) !== null) {
		matches.push({ index: match.index, term: match[1].trim() });
	}

	for (let i = 0; i < matches.length; i++) {
		const startIdx = matches[i].index;
		const endIdx = i + 1 < matches.length ? matches[i + 1].index : text.length;
		const defText = text.slice(startIdx, endIdx).trim();

		const node: ContentNode = {
			id: `${sectionNumber}_def_${i}`,
			type: 'definition',
			number: null,
			heading: matches[i].term,
			content: addCrossReferences(defText),
			children: [],
			depth: 1
		};

		// Check for sub-items (a), (b), etc.
		const subChildren = parseNumberedContent(defText, node.id, 1);
		if (subChildren.length > 0) {
			node.children = subChildren;
		}

		root.children.push(node);
	}

	return [root];
}

export type ParsedSection = {
	sectionNumber: string;
	heading: string;
	slug: string;
	contentTree: ContentNode[];
	plainText: string;
	sortOrder: number;
};

/**
 * Parse the full regulation text file into structured sections.
 */
export function parseRegulationText(rawText: string): ParsedSection[] {
	const lines = rawText.split('\n');
	const boundaries = findSectionBoundaries(lines);
	const results: ParsedSection[] = [];

	for (const boundary of boundaries) {
		const sectionLines = lines.slice(boundary.startLine, boundary.endLine);
		const sectionText = sectionLines.join('\n');

		let contentTree: ContentNode[];

		if (boundary.sectionNumber === '500.002') {
			// Definitions section has special format
			contentTree = parseDefinitions(sectionText, boundary.sectionNumber);
		} else {
			contentTree = parseSectionContent(boundary.sectionNumber, sectionLines);
		}

		const plainText = flattenContentTree(contentTree);
		const sortOrder = SECTION_ORDER.indexOf(boundary.sectionNumber);

		results.push({
			sectionNumber: boundary.sectionNumber,
			heading: SECTION_HEADERS[boundary.sectionNumber] || boundary.sectionNumber,
			slug: sectionToSlug(boundary.sectionNumber),
			contentTree,
			plainText,
			sortOrder: sortOrder >= 0 ? sortOrder : 999
		});
	}

	return results;
}
