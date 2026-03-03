<script lang="ts">
	import type { ContentNode as ContentNodeType, Annotation } from '$lib/types';
	import type { ContentSegment } from '$lib/utils/content-renderer';
	import { parseContent, applyHighlights } from '$lib/utils/content-renderer';
	import { getContext } from 'svelte';
	import CrossRefLink from './CrossRefLink.svelte';
	import ExternalRefBadge from './ExternalRefBadge.svelte';
	import AnnotationMark from '$lib/components/user/AnnotationMark.svelte';
	import Self from './ContentNode.svelte';

	let {
		node,
		titleSlug,
		refMap = {}
	}: {
		node: ContentNodeType;
		titleSlug: string;
		refMap?: Record<string, string>;
	} = $props();

	const annotationsMap = getContext<{ current: Map<string, Annotation[]> } | undefined>('annotations-map');
	const onHighlightClick = getContext<((annotationId: string) => void) | undefined>('on-highlight-click');

	function resolveRef(citation: string): string | null {
		return refMap[citation] ?? null;
	}

	let baseSegments: ContentSegment[] = $derived(
		node.content ? parseContent(node.content, resolveRef) : []
	);

	let segments: ContentSegment[] = $derived.by(() => {
		if (!annotationsMap?.current) return baseSegments;
		const nodeAnns = annotationsMap.current.get(node.id);
		if (!nodeAnns || nodeAnns.length === 0) return baseSegments;
		return applyHighlights(baseSegments, nodeAnns);
	});

	let depthClass = $derived(
		node.depth <= 1 ? '' : node.depth === 2 ? 'ml-5' : node.depth === 3 ? 'ml-9' : 'ml-12'
	);

	// When a paragraph has children, one is usually a _preamble text node that
	// duplicates the paragraph's own content + includes inline sub-items.
	// Skip rendering the paragraph's content to avoid duplication.
	let hasPreambleChild = $derived(
		node.children.some((c) => c.id.endsWith('_preamble'))
	);
	let skipOwnContent = $derived(
		segments.length > 0 && node.children.length > 0 && hasPreambleChild
	);
</script>

{#snippet renderSegments(segs: ContentSegment[])}
	{#each segs as seg}
		{#if seg.highlights?.length}
			<AnnotationMark color={seg.highlights[0].color} annotationId={seg.highlights[0].annotationId} onClick={onHighlightClick}>{#if seg.type === 'text'}{seg.text}{:else if seg.type === 'ref'}<CrossRefLink citation={seg.displayText} href={seg.href} />{:else}<ExternalRefBadge citation={seg.displayText} />{/if}</AnnotationMark>
		{:else}
			{#if seg.type === 'text'}{seg.text}{:else if seg.type === 'ref'}<CrossRefLink citation={seg.displayText} href={seg.href} />{:else}<ExternalRefBadge citation={seg.displayText} />{/if}
		{/if}
	{/each}
{/snippet}

<div id={node.id} class="group scroll-mt-20 {depthClass}">
	{#if node.type === 'section'}
		<!-- Top-level section: heading is rendered by SectionDetail, only render children -->
		<div class="space-y-0">
			{#each node.children as child}
				<Self node={child} {titleSlug} {refMap} />
			{/each}
		</div>

	{:else if node.type === 'subsection'}
		<div class="mt-10 mb-2">
			<div class="flex items-baseline gap-2.5 border-b border-border pb-2">
				{#if node.number}
					<span class="font-mono text-xs font-semibold text-destructive/70 tabular-nums">{node.number}</span>
				{/if}
				{#if node.heading}
					<span class="font-serif text-base font-semibold text-foreground">{node.heading}</span>
				{/if}
			</div>
		</div>
		{#if segments.length > 0 && node.children.length > 0}
			{#each node.children as child}
				<Self node={child} {titleSlug} {refMap} />
			{/each}
		{:else if segments.length > 0}
			<p class="mt-3 font-serif text-[0.9375rem] leading-[1.8] text-foreground whitespace-pre-line">
				{@render renderSegments(segments)}
			</p>
		{:else}
			{#each node.children as child}
				<Self node={child} {titleSlug} {refMap} />
			{/each}
		{/if}

	{:else if node.type === 'paragraph'}
		<div class="mt-3.5 flex gap-0 py-0.5">
			{#if node.number}
				<span class="mt-0 w-10 shrink-0 font-mono text-[0.7rem] font-medium text-muted-foreground/70 leading-[1.8] select-none tabular-nums">{node.number}</span>
			{/if}
			<div class="min-w-0 flex-1">
				{#if segments.length > 0 && !skipOwnContent}
					<p class="font-serif text-[0.9375rem] leading-[1.8] text-foreground whitespace-pre-line">
						{@render renderSegments(segments)}
					</p>
				{/if}
				{#each node.children as child}
					<Self node={child} {titleSlug} {refMap} />
				{/each}
			</div>
		</div>

	{:else if node.type === 'definition'}
		<div class="mt-5 border-l-2 border-destructive/20 bg-muted/40 py-3 pr-4 pl-4">
			{#if node.heading}
				<dt class="font-serif text-[0.9375rem] font-semibold text-foreground">{node.heading}</dt>
			{/if}
			{#if segments.length > 0 && !skipOwnContent}
				<dd class="mt-1 font-serif text-[0.9375rem] leading-[1.8] text-foreground whitespace-pre-line">
					{@render renderSegments(segments)}
				</dd>
			{/if}
			{#each node.children as child}
				<Self node={child} {titleSlug} {refMap} />
			{/each}
		</div>

	{:else}
		<!-- text node -->
		{#if segments.length > 0}
			<p class="mt-3 font-serif text-[0.9375rem] leading-[1.8] text-foreground whitespace-pre-line">
				{@render renderSegments(segments)}
			</p>
		{/if}
		{#each node.children as child}
			<Self node={child} {titleSlug} {refMap} />
		{/each}
	{/if}
</div>
