<script lang="ts">
	import { formatSearchSnippet } from '$lib/utils/search-highlight';
	import type { SearchResult } from '$lib/types';

	let { result }: { result: SearchResult } = $props();

	let formattedSnippet = $derived(formatSearchSnippet(result.snippet));
</script>

<a
	href="/regulations/{result.titleSlug}/{result.slug}"
	class="group block border-b border-border py-5 transition-colors hover:bg-muted"
>
	<div class="flex items-baseline gap-2">
		<span class="font-mono text-sm text-muted-foreground group-hover:text-destructive transition-colors">{result.sectionNumber}</span>
		<h3 class="font-serif text-lg font-semibold text-foreground group-hover:text-foreground transition-colors">{result.heading}</h3>
	</div>
	<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
		{@html formattedSnippet}
	</p>
</a>
