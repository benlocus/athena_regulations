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
		class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-medium-gray"
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
		class="w-full border border-border-gray bg-light-gray py-2 pr-3 pl-9 text-sm text-dark-gray placeholder-medium-gray transition-colors focus:border-red/40 focus:bg-white focus:outline-none"
	/>
</form>
