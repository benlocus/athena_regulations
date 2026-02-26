<script lang="ts">
	import SearchBar from '$lib/components/search/SearchBar.svelte';

	let { titleSlug = '' }: { titleSlug?: string } = $props();
</script>

<header class="sticky top-0 z-50 border-b border-border bg-primary text-white shadow-sm">
	<div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
		<a href="/" class="flex shrink-0 items-center gap-2.5">
			<svg class="h-8 w-8 text-accent" viewBox="0 0 32 32" fill="none">
				<rect x="4" y="2" width="24" height="28" rx="2" stroke="currentColor" stroke-width="2" />
				<path d="M10 8h12M10 13h12M10 18h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				<circle cx="24" cy="24" r="6" fill="currentColor" />
				<path d="M22 24l1.5 1.5L26 22.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			<span class="text-lg font-semibold tracking-tight">MA Regulations</span>
		</a>

		<nav class="hidden items-center gap-6 md:flex">
			<a href="/regulations" class="text-sm font-medium text-white/80 transition-colors hover:text-white">
				Browse
			</a>
		</nav>

		<div class="ml-auto w-full max-w-md">
			<SearchBar />
		</div>
	</div>
</header>
