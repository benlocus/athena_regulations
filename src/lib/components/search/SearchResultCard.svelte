<script lang="ts">
	import { formatSearchSnippet } from '$lib/utils/search-highlight';
	import type { SearchResult } from '$lib/types';

	let { result }: { result: SearchResult } = $props();

	let formattedSnippet = $derived(formatSearchSnippet(result.snippet));
</script>

<a
	href="/regulations/{result.titleSlug}/{result.slug}"
	class="block rounded-lg border border-border bg-surface p-5 transition-colors hover:border-primary/30 hover:bg-background"
>
	<div class="flex items-baseline gap-2">
		<span class="font-mono text-sm font-medium text-accent-dark">{result.sectionNumber}</span>
		<h3 class="font-serif text-lg font-semibold text-primary">{result.heading}</h3>
	</div>
	<p class="mt-2 font-serif text-sm leading-relaxed text-text-muted">
		{@html formattedSnippet}
	</p>
</a>
