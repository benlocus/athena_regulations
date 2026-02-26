<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="mx-auto max-w-2xl px-4 py-24 text-center">
	<p class="font-mono text-6xl font-bold text-primary/20">{$page.status}</p>
	<h1 class="mt-4 font-serif text-2xl font-bold text-primary">
		{#if $page.status === 404}
			Page Not Found
		{:else}
			Something Went Wrong
		{/if}
	</h1>
	<p class="mt-3 text-text-muted">
		{$page.error?.message ?? 'An unexpected error occurred.'}
	</p>
	<a
		href="/"
		class="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-light"
	>
		<svg class="h-4 w-4" viewBox="0 0 16 16" fill="none">
			<path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
		Back to Home
	</a>
</div>
