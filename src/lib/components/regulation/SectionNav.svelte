<script lang="ts">
	type NavItem = {
		sectionNumber: string;
		heading: string;
		slug: string;
	} | null;

	let { prev, next, titleSlug }: { prev: NavItem; next: NavItem; titleSlug: string } = $props();
</script>

<nav class="mt-10 flex items-stretch gap-4 border-t border-border-gray pt-6" aria-label="Section navigation">
	{#if prev}
		<a
			href="/regulations/{titleSlug}/{prev.slug}"
			class="group flex min-w-0 flex-1 flex-col border border-border-gray bg-white p-4 transition-colors hover:border-red/40"
		>
			<span class="font-precision text-[0.625rem] text-medium-gray uppercase tracking-[0.15em]">Previous</span>
			<span class="mt-1 truncate font-precision text-xs text-red/50 group-hover:text-red transition-colors">{prev.sectionNumber}</span>
			<span class="mt-0.5 truncate font-authority text-sm font-medium text-dark-gray group-hover:text-ink transition-colors">{prev.heading}</span>
		</a>
	{:else}
		<div class="flex-1"></div>
	{/if}

	{#if next}
		<a
			href="/regulations/{titleSlug}/{next.slug}"
			class="group flex min-w-0 flex-1 flex-col items-end border border-border-gray bg-white p-4 text-right transition-colors hover:border-red/40"
		>
			<span class="font-precision text-[0.625rem] text-medium-gray uppercase tracking-[0.15em]">Next</span>
			<span class="mt-1 truncate font-precision text-xs text-red/50 group-hover:text-red transition-colors">{next.sectionNumber}</span>
			<span class="mt-0.5 truncate font-authority text-sm font-medium text-dark-gray group-hover:text-ink transition-colors">{next.heading}</span>
		</a>
	{:else}
		<div class="flex-1"></div>
	{/if}
</nav>
