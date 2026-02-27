<script lang="ts">
	import type { ContentNode as ContentNodeType } from '$lib/types';
	import ContentNode from './ContentNode.svelte';

	let {
		sectionNumber,
		heading,
		contentTree,
		titleSlug,
		refMap = {},
		isRepealed = false
	}: {
		sectionNumber: string;
		heading: string;
		contentTree: ContentNodeType[];
		titleSlug: string;
		refMap?: Record<string, string>;
		isRepealed?: boolean;
	} = $props();
</script>

<article class="mx-auto max-w-none">
	<header class="mb-8 pb-5">
		<p class="font-precision text-[0.625rem] text-red/60 uppercase tracking-[0.25em]">{sectionNumber}</p>
		<h1 class="mt-1.5 font-authority text-[1.75rem] font-bold leading-tight text-ink lg:text-[2.25rem] pb-2 border-b-2 border-red">
			{heading}
		</h1>
		{#if isRepealed}
			<div class="mt-3 inline-flex items-center gap-1.5 border-l-2 border-red/30 bg-light-gray px-4 py-2 text-sm font-medium text-medium-gray">
				<svg class="h-4 w-4" viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" />
					<path d="M4 12L12 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
				This section has been repealed
			</div>
		{/if}
	</header>

	<div class="regulation-content max-w-[65ch]">
		{#each contentTree as node}
			<ContentNode {node} {titleSlug} {refMap} />
		{/each}
	</div>
</article>
