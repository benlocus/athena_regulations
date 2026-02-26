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
	<header class="mb-6 border-b border-border pb-4">
		<p class="font-mono text-sm font-medium text-accent-dark">{sectionNumber}</p>
		<h1 class="mt-1 font-serif text-2xl font-bold leading-tight text-primary lg:text-3xl">
			{heading}
		</h1>
		{#if isRepealed}
			<div class="mt-2 inline-flex items-center gap-1.5 rounded-md bg-secondary/10 px-3 py-1.5 text-sm font-medium text-secondary">
				<svg class="h-4 w-4" viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" />
					<path d="M4 12L12 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
				This section has been repealed
			</div>
		{/if}
	</header>

	<div class="regulation-content">
		{#each contentTree as node}
			<ContentNode {node} {titleSlug} {refMap} />
		{/each}
	</div>
</article>
