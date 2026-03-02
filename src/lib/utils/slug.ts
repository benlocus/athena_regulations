/** Convert a section number like "500.105" or "17:30-10.1" to a URL slug */
export function sectionToSlug(sectionNumber: string): string {
	return sectionNumber.replace(/:/g, '-').replace(/\./g, '-').replace(/\s+/g, '-').toLowerCase();
}

/** Convert a URL slug like "500-105" back to a section number like "500.105" */
export function slugToSection(slug: string): string {
	// Only replace the first hyphen with a dot (e.g., "500-105" -> "500.105")
	return slug.replace('-', '.');
}

/** Generate a title slug from code number and title number */
export function titleToSlug(codeNumber: string, titleNumber: string): string {
	return `${codeNumber}-${titleNumber}`
		.replace(/\s+/g, '-')
		.replace(/\./g, '-')
		.toLowerCase();
}
