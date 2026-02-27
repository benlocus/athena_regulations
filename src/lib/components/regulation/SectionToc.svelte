<script lang="ts">
	type TocSection = {
		sectionNumber: string;
		heading: string;
		slug: string;
		isRepealed: boolean;
	};

	let { sections, titleSlug }: { sections: TocSection[]; titleSlug: string } = $props();
</script>

<div class="overflow-hidden border border-border-gray bg-white">
	<div class="border-b border-border-gray bg-light-gray px-5 py-3">
		<h2 class="font-precision text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-medium-gray">
			Table of Contents
		</h2>
		<p class="mt-0.5 font-precision text-xs text-medium-gray">{sections.length} sections</p>
	</div>
	<ul class="divide-y divide-border-gray">
		{#each sections as section}
			<li class="even:bg-light-gray/30">
				<a
					href="/regulations/{titleSlug}/{section.slug}"
					class="group flex items-baseline gap-3 px-5 py-3 transition-colors hover:bg-light-gray {section.isRepealed ? 'opacity-60' : ''}"
				>
					<span class="shrink-0 font-precision text-sm text-medium-gray group-hover:text-red transition-colors">{section.sectionNumber}</span>
					<span class="text-sm font-medium text-dark-gray group-hover:text-ink transition-colors {section.isRepealed ? 'line-through' : ''}">
						{section.heading}
					</span>
					{#if section.isRepealed}
						<span class="ml-auto shrink-0 bg-light-gray px-1.5 py-0.5 font-precision text-[0.625rem] uppercase tracking-wider text-medium-gray">Repealed</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</div>
