<script lang="ts">
	type NavItem = {
		sectionNumber: string;
		heading: string;
		slug: string;
	} | null;

	let { prev, next, titleSlug }: { prev: NavItem; next: NavItem; titleSlug: string } = $props();
</script>

<nav class="mt-10 flex items-stretch gap-4 border-t border-border pt-6" aria-label="Section navigation">
	{#if prev}
		<a
			href="/regulations/{titleSlug}/{prev.slug}"
			class="flex min-w-0 flex-1 flex-col rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/30 hover:bg-background"
		>
			<span class="text-xs font-medium text-text-muted">Previous</span>
			<span class="mt-1 truncate font-mono text-xs text-primary">{prev.sectionNumber}</span>
			<span class="mt-0.5 truncate text-sm font-medium text-text">{prev.heading}</span>
		</a>
	{:else}
		<div class="flex-1"></div>
	{/if}

	{#if next}
		<a
			href="/regulations/{titleSlug}/{next.slug}"
			class="flex min-w-0 flex-1 flex-col items-end rounded-lg border border-border bg-surface p-4 text-right transition-colors hover:border-primary/30 hover:bg-background"
		>
			<span class="text-xs font-medium text-text-muted">Next</span>
			<span class="mt-1 truncate font-mono text-xs text-primary">{next.sectionNumber}</span>
			<span class="mt-0.5 truncate text-sm font-medium text-text">{next.heading}</span>
		</a>
	{:else}
		<div class="flex-1"></div>
	{/if}
</nav>
