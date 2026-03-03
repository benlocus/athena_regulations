export type ParsedCitation = {
	sectionNumber: string;
	subsections: string[];
	full: string;
};

/**
 * Parse a citation string like "500.105(2)(b)" or "17:30-6.5(a)" into its components.
 * Returns the section number and any subsection parts.
 *
 * Supported formats:
 *   - MA: "500.105", "500.105(2)(b)"
 *   - NY: "118.1", "120.3(a)"
 *   - NJ: "17:30-6.5", "17:30-6.5(a)"
 */
export function parseCitation(citation: string): ParsedCitation {
	// Try NJ format first: "17:30-X.Y" (has colons and hyphens)
	const njMatch = citation.match(/^(\d+:\d+-\d+\.\d+)(.*)?$/);
	if (njMatch) {
		const sectionNumber = njMatch[1];
		const rest = njMatch[2] || '';
		const subsections: string[] = [];
		const subPattern = /(\([^)]+\)|\d+\.|[ivxlc]+\.)/g;
		let subMatch;
		while ((subMatch = subPattern.exec(rest)) !== null) {
			subsections.push(subMatch[1]);
		}
		return { sectionNumber, subsections, full: citation };
	}

	// MA/NY format: "500.105" or "118.1"
	const match = citation.match(/^(\d+\.\d+)(.*)?$/);
	if (!match) {
		return { sectionNumber: citation, subsections: [], full: citation };
	}

	const sectionNumber = match[1];
	const rest = match[2] || '';

	const subsections: string[] = [];
	const subPattern = /(\([^)]+\)|\d+\.|[ivxlc]+\.)/g;
	let subMatch;
	while ((subMatch = subPattern.exec(rest)) !== null) {
		subsections.push(subMatch[1]);
	}

	return {
		sectionNumber,
		subsections,
		full: citation
	};
}

/**
 * Build a citation string from components.
 */
export function buildCitation(sectionNumber: string, subsections: string[] = []): string {
	return sectionNumber + subsections.join('');
}

/**
 * Extract the section number from a full citation.
 * e.g., "500.105(2)(b)" -> "500.105"
 */
export function extractSectionNumber(citation: string): string {
	return parseCitation(citation).sectionNumber;
}
