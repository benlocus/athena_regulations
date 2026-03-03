<script lang="ts">
	import type { ContentNode as ContentNodeType, Annotation } from '$lib/types';
	import { setContext } from 'svelte';
	import ContentNode from './ContentNode.svelte';

	let {
		sectionNumber,
		heading,
		contentTree,
		titleSlug,
		refMap = {},
		isRepealed = false,
		annotations = [],
		onHighlightClick
	}: {
		sectionNumber: string;
		heading: string;
		contentTree: ContentNodeType[];
		titleSlug: string;
		refMap?: Record<string, string>;
		isRepealed?: boolean;
		annotations?: Annotation[];
		onHighlightClick?: (annotationId: string) => void;
	} = $props();

	// Build a Map<nodeId, Annotation[]> for context
	let annotationsMap = $derived.by(() => {
		const map = new Map<string, Annotation[]>();
		for (const ann of annotations) {
			if (ann.nodeId && ann.startOffset != null && ann.endOffset != null) {
				const list = map.get(ann.nodeId) ?? [];
				list.push(ann);
				map.set(ann.nodeId, list);
			}
		}
		return map;
	});

	// Use a getter so children reactively track annotation changes
	setContext('annotations-map', {
		get current() { return annotationsMap; }
	});
	setContext('on-highlight-click', onHighlightClick);
</script>

<article class="mx-auto max-w-none">
	<header class="mb-10 pb-6 border-b border-border">
		<p class="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-destructive/70 mb-1.5">{sectionNumber}</p>
		<h1 class="font-serif text-[1.625rem] font-bold leading-[1.25] text-foreground lg:text-[1.875rem]">
			{heading}
		</h1>
		{#if isRepealed}
			<div class="mt-4 inline-flex items-center gap-2 bg-muted border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
				<svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
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
