<script lang="ts">
	import { formatSearchSnippet } from '$lib/utils/search-highlight';
	import type { SearchResult } from '$lib/types';

	let { result }: { result: SearchResult } = $props();

	let formattedSnippet = $derived(formatSearchSnippet(result.snippet));
</script>

<a
	href="/regulations/{result.titleSlug}/{result.slug}"
	class="group block border-b border-border-gray py-5 transition-colors hover:bg-light-gray"
>
	<div class="flex items-baseline gap-2">
		<span class="font-precision text-sm text-red/50 group-hover:text-red transition-colors">{result.sectionNumber}</span>
		<h3 class="font-authority text-lg font-semibold text-ink group-hover:text-red transition-colors">{result.heading}</h3>
	</div>
	<p class="mt-2 font-clarity text-sm leading-relaxed text-medium-gray">
		{@html formattedSnippet}
	</p>
</a>
