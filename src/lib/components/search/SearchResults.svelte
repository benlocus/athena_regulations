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
		<h1 class="font-serif text-2xl font-bold text-primary">Search Results</h1>
		<span class="text-sm text-text-muted">
			{total} result{total !== 1 ? 's' : ''} for "{query}"
		</span>
	</div>

	{#if results.length === 0}
		<div class="rounded-lg border border-border bg-surface py-16 text-center">
			<svg class="mx-auto h-12 w-12 text-text-muted/40" viewBox="0 0 24 24" fill="none">
				<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5" />
				<path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			</svg>
			<p class="mt-4 text-text-muted">No results found for "{query}"</p>
			<p class="mt-1 text-sm text-text-muted/70">Try different keywords or check your spelling</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each results as result}
				<SearchResultCard {result} />
			{/each}
		</div>
	{/if}
</div>
