<script lang="ts">
	type TocSection = {
		sectionNumber: string;
		heading: string;
		slug: string;
		isRepealed: boolean;
	};

	let { sections, titleSlug }: { sections: TocSection[]; titleSlug: string } = $props();
</script>

<div class="overflow-hidden rounded-lg border border-border bg-surface">
	<div class="border-b border-border bg-background px-5 py-3">
		<h2 class="text-sm font-semibold tracking-wide text-text-muted uppercase">
			Table of Contents
		</h2>
		<p class="mt-0.5 text-xs text-text-muted">{sections.length} sections</p>
	</div>
	<ul class="divide-y divide-border">
		{#each sections as section}
			<li>
				<a
					href="/regulations/{titleSlug}/{section.slug}"
					class="flex items-baseline gap-3 px-5 py-3 transition-colors hover:bg-background {section.isRepealed ? 'opacity-60' : ''}"
				>
					<span class="shrink-0 font-mono text-sm text-text-muted">{section.sectionNumber}</span>
					<span class="text-sm font-medium text-text {section.isRepealed ? 'line-through' : ''}">
						{section.heading}
					</span>
					{#if section.isRepealed}
						<span class="ml-auto shrink-0 rounded bg-secondary/10 px-1.5 py-0.5 text-xs text-secondary">Repealed</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</div>
