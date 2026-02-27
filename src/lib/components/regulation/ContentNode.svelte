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
		node.depth <= 1 ? '' : node.depth === 2 ? 'ml-6' : node.depth === 3 ? 'ml-10' : 'ml-14'
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
		<div class="space-y-2 divide-y divide-border-gray/60">
			{#each node.children as child}
				<Self node={child} {titleSlug} {refMap} />
			{/each}
		</div>

	{:else if node.type === 'subsection'}
		<div class="mt-10 mb-4 border-l-2 border-rule-gray pl-5">
			<div class="flex items-baseline gap-2">
				{#if node.number}
					<span class="font-authority text-lg font-bold text-medium-gray">{node.number}</span>
				{/if}
				{#if node.heading}
					<span class="font-authority text-[1.1rem] font-semibold text-ink">{node.heading}</span>
				{/if}
			</div>
		</div>
		{#if segments.length > 0 && node.children.length > 0}
			{#each node.children as child}
				<Self node={child} {titleSlug} {refMap} />
			{/each}
		{:else if segments.length > 0}
			<p class="font-clarity text-base leading-[1.85] text-ink pl-4">
				{@render renderSegments(segments)}
			</p>
		{:else}
			{#each node.children as child}
				<Self node={child} {titleSlug} {refMap} />
			{/each}
		{/if}

	{:else if node.type === 'paragraph'}
		<div class="mt-4 flex gap-3 py-1.5">
			{#if node.number}
				<span class="mt-0.5 shrink-0 font-precision text-[0.75rem] font-medium text-subtle-gray leading-[1.85]">{node.number}</span>
			{/if}
			<div class="min-w-0 flex-1">
				{#if segments.length > 0}
					<p class="font-clarity text-base leading-[1.85] text-ink">
						{@render renderSegments(segments)}
					</p>
				{/if}
				{#each node.children as child}
					<Self node={child} {titleSlug} {refMap} />
				{/each}
			</div>
		</div>

	{:else if node.type === 'definition'}
		<div class="mt-6 border-l-2 border-rule-gray bg-light-gray py-3 pr-4 pl-5">
			{#if node.heading}
				<dt class="font-authority text-base font-bold text-ink">{node.heading}</dt>
			{/if}
			{#if segments.length > 0}
				<dd class="mt-1.5 font-clarity text-base leading-[1.85] text-ink">
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
			<p class="mt-2 font-clarity text-base leading-[1.85] text-ink">
				{@render renderSegments(segments)}
			</p>
		{/if}
		{#each node.children as child}
			<Self node={child} {titleSlug} {refMap} />
		{/each}
	{/if}
</div>
