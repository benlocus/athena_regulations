/**
 * Format a citation string from section metadata.
 * Example: formatCitation("935 CMR", "500.001", "500.001(1)(a)") → "935 CMR § 500.001(1)(a)"
 * Example: formatCitation("9 NYCRR", "113.1", undefined) → "9 NYCRR § 113.1"
 */
export function formatCitation(codeNumber: string, sectionNumber: string, nodeId?: string): string {
	// If we have a nodeId that includes subsection info, extract it
	if (nodeId) {
		// nodeId format is like "500.001(1)(a)" — contains the section number plus subsection path
		// Extract the subsection part after the section number
		const sectionEscaped = sectionNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const match = nodeId.match(new RegExp(`^${sectionEscaped}(.*)`));
		if (match && match[1]) {
			return `${codeNumber} § ${sectionNumber}${match[1]}`;
		}
	}
	return `${codeNumber} § ${sectionNumber}`;
}
