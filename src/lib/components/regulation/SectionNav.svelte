<script lang="ts">
	type NavItem = {
		sectionNumber: string;
		heading: string;
		slug: string;
	} | null;

	let { prev, next, titleSlug }: { prev: NavItem; next: NavItem; titleSlug: string } = $props();
</script>

<nav class="mt-12 border-t border-border pt-6" aria-label="Section navigation">
	<div class="grid grid-cols-2 gap-3">
		<div>
			{#if prev}
				<a
					href="/regulations/{titleSlug}/{prev.slug}"
					class="group flex flex-col gap-0.5 p-4 border border-border bg-background hover:border-foreground/20 hover:bg-muted/50 transition-all duration-150"
				>
					<span class="flex items-center gap-1.5 font-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground">
						<svg class="h-3 w-3 shrink-0" viewBox="0 0 12 12" fill="none">
							<path d="M8 1L3 6l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
						Previous
					</span>
					<span class="font-mono text-[0.6875rem] text-destructive/70 group-hover:text-destructive transition-colors">{prev.sectionNumber}</span>
					<span class="mt-0.5 text-sm font-medium text-foreground leading-snug line-clamp-2">{prev.heading}</span>
				</a>
			{/if}
		</div>

		<div class="flex justify-end">
			{#if next}
				<a
					href="/regulations/{titleSlug}/{next.slug}"
					class="group flex flex-col items-end gap-0.5 p-4 border border-border bg-background hover:border-foreground/20 hover:bg-muted/50 transition-all duration-150 w-full text-right"
				>
					<span class="flex items-center gap-1.5 font-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground">
						Next
						<svg class="h-3 w-3 shrink-0" viewBox="0 0 12 12" fill="none">
							<path d="M4 1l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</span>
					<span class="font-mono text-[0.6875rem] text-destructive/70 group-hover:text-destructive transition-colors">{next.sectionNumber}</span>
					<span class="mt-0.5 text-sm font-medium text-foreground leading-snug line-clamp-2">{next.heading}</span>
				</a>
			{/if}
		</div>
	</div>
</nav>
