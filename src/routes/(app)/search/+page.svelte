<script lang="ts">
	import Breadcrumbs from '$lib/components/layout/Breadcrumbs.svelte';
	import SearchResults from '$lib/components/search/SearchResults.svelte';

	let { data } = $props();

	let totalPages = $derived(Math.ceil(data.total / 20));
</script>

<svelte:head>
	<title>{data.query ? `"${data.query}" - Search` : 'Search'} - MA Regulations</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
	<Breadcrumbs
		items={[
			{ label: 'Home', href: '/' },
			{ label: 'Search' }
		]}
	/>

	{#if data.query}
		<SearchResults results={data.results} total={data.total} query={data.query} />

		{#if totalPages > 1}
			<nav class="mt-8 flex items-center justify-center gap-2" aria-label="Search pagination">
				{#if data.page > 1}
					<a
						href="/search?q={encodeURIComponent(data.query)}&page={data.page - 1}"
						class="border border-border-gray bg-white px-4 py-2 text-sm font-medium text-dark-gray transition-colors hover:bg-light-gray"
					>
						Previous
					</a>
				{/if}
				<span class="px-3 text-sm text-medium-gray">
					Page {data.page} of {totalPages}
				</span>
				{#if data.page < totalPages}
					<a
						href="/search?q={encodeURIComponent(data.query)}&page={data.page + 1}"
						class="border border-border-gray bg-white px-4 py-2 text-sm font-medium text-dark-gray transition-colors hover:bg-light-gray"
					>
						Next
					</a>
				{/if}
			</nav>
		{/if}
	{:else}
		<div class="py-16 text-center">
			<svg class="mx-auto h-16 w-16 text-medium-gray/30" viewBox="0 0 24 24" fill="none">
				<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5" />
				<path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			</svg>
			<h1 class="mt-4 font-authority text-2xl font-bold text-ink">Search Regulations</h1>
			<p class="mt-2 text-medium-gray">Enter a search term to find relevant regulation sections.</p>
		</div>
	{/if}
</div>
