<script lang="ts">
	type TocSection = {
		sectionNumber: string;
		heading: string;
		slug: string;
		isRepealed: boolean;
	};

	let { sections, titleSlug }: { sections: TocSection[]; titleSlug: string } = $props();
</script>

<div class="overflow-hidden border border-border bg-background">
	<div class="border-b border-border bg-muted/60 px-5 py-3">
		<h2 class="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
			Table of Contents
		</h2>
		<p class="mt-0.5 font-mono text-[0.6875rem] text-muted-foreground/60">{sections.length} section{sections.length !== 1 ? 's' : ''}</p>
	</div>
	<ul>
		{#each sections as section}
			<li class="border-b border-border last:border-0">
				<a
					href="/regulations/{titleSlug}/{section.slug}"
					class="group flex items-baseline gap-3 px-5 py-2.5 transition-colors duration-100 hover:bg-muted/50 {section.isRepealed ? 'opacity-50' : ''}"
				>
					<span class="shrink-0 font-mono text-[0.6875rem] tabular-nums text-muted-foreground/60 group-hover:text-destructive transition-colors">{section.sectionNumber}</span>
					<span class="text-sm leading-snug text-foreground {section.isRepealed ? 'line-through' : ''}">
						{section.heading}
					</span>
					{#if section.isRepealed}
						<span class="ml-auto shrink-0 font-mono text-[0.5625rem] uppercase tracking-wider text-muted-foreground/50">Repealed</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</div>
