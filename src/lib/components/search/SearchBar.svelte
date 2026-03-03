<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let query = $state($page.url.searchParams.get('q') ?? '');

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const trimmed = query.trim();
		if (trimmed) {
			goto(`/search?q=${encodeURIComponent(trimmed)}`);
		}
	}
</script>

<form onsubmit={handleSubmit} class="relative">
	<svg
		class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
		viewBox="0 0 16 16"
		fill="none"
	>
		<circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" />
		<path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
	</svg>
	<input
		type="search"
		bind:value={query}
		placeholder="Search regulations..."
		class="h-7 w-full border border-border bg-muted py-1 pr-3 pl-9 text-xs text-foreground placeholder-muted-foreground transition-colors focus:border-destructive/40 focus:bg-background focus:outline-none"
	/>
</form>
