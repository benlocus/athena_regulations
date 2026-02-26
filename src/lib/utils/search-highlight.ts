/**
 * Highlight matching terms in a text snippet.
 * PostgreSQL ts_headline returns <b>...</b> markers.
 * This function converts them to <mark> tags for styling.
 */
export function formatSearchSnippet(snippet: string): string {
	return snippet
		.replace(/<b>/g, '<mark class="bg-highlight-yellow rounded px-0.5">')
		.replace(/<\/b>/g, '</mark>');
}

/**
 * Strip HTML tags from a snippet for plain text display.
 */
export function stripHighlights(snippet: string): string {
	return snippet.replace(/<\/?b>/g, '').replace(/<\/?mark[^>]*>/g, '');
}
