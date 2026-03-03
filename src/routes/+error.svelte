<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
	<p class="font-mono text-7xl font-bold text-foreground/[0.06]">{$page.status}</p>
	<div class="mt-2 h-0.5 w-10 bg-destructive mx-auto"></div>
	<h1 class="mt-4 font-serif text-2xl font-bold text-foreground">
		{#if $page.status === 404}
			Page Not Found
		{:else if $page.status === 403}
			Access Denied
		{:else}
			Something Went Wrong
		{/if}
	</h1>
	<p class="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
		{$page.error?.message ?? 'An unexpected error occurred. Please try again.'}
	</p>
	<a
		href="/"
		class="mt-8 inline-flex items-center gap-2 rounded-sm bg-destructive px-5 py-2.5 text-xs font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
	>
		<svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
			<path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
		Back to Home
	</a>
</div>
