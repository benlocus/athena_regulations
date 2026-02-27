<script lang="ts">
	import type { SearchResult } from '$lib/types';
	import SearchResultCard from './SearchResultCard.svelte';

	let {
		results,
		total,
		query
	}: {
		results: SearchResult[];
		total: number;
		query: string;
	} = $props();
</script>

<div>
	<div class="mb-4 flex items-baseline gap-2">
		<h1 class="inline-block border-b-2 border-red pb-1.5 font-authority text-2xl font-bold text-ink">Search Results</h1>
		<span class="text-sm text-medium-gray">
			{total} result{total !== 1 ? 's' : ''} for "{query}"
		</span>
	</div>

	{#if results.length === 0}
		<div class="border border-border-gray bg-white py-16 text-center">
			<svg class="mx-auto h-12 w-12 text-medium-gray/40" viewBox="0 0 24 24" fill="none">
				<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5" />
				<path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			</svg>
			<p class="mt-4 text-medium-gray">No results found for "{query}"</p>
			<p class="mt-1 text-sm text-medium-gray">Try different keywords or check your spelling</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each results as result}
				<SearchResultCard {result} />
			{/each}
		</div>
	{/if}
</div>
