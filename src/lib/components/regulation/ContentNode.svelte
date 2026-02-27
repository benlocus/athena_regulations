<script lang="ts">
	import type { ContentNode as ContentNodeType } from '$lib/types';
	import type { ContentSegment } from '$lib/utils/content-renderer';
	import { parseContent } from '$lib/utils/content-renderer';
	import CrossRefLink from './CrossRefLink.svelte';
	import ExternalRefBadge from './ExternalRefBadge.svelte';
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

	function resolveRef(citation: string): string | null {
		return refMap[citation] ?? null;
	}

	let segments: ContentSegment[] = $derived(
		node.content ? parseContent(node.content, resolveRef) : []
	);

	let depthClass = $derived(
		node.depth <= 1 ? '' : node.depth === 2 ? 'ml-6' : node.depth === 3 ? 'ml-10' : 'ml-14'
	);
</script>

<div id={node.id} class="group scroll-mt-20 {depthClass}">
	{#if node.type === 'section'}
		<!-- Top-level section: heading is rendered by SectionDetail, only render children -->
		<div class="divide-y divide-border-gray/60">
			{#each node.children as child}
				<Self node={child} {titleSlug} {refMap} />
			{/each}
		</div>

	{:else if node.type === 'subsection'}
		<div class="mt-6 mb-3 border-l-2 border-red/40 pl-4">
			<div class="flex items-baseline gap-2">
				{#if node.number}
					<span class="font-authority text-lg font-bold text-red/70">{node.number}</span>
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
			<p class="font-clarity text-[0.95rem] leading-[1.7] text-dark-gray pl-4">
				{#each segments as seg}
					{#if seg.type === 'text'}{seg.text}{:else if seg.type === 'ref'}<CrossRefLink citation={seg.displayText} href={seg.href} />{:else}<ExternalRefBadge citation={seg.displayText} />{/if}
				{/each}
			</p>
		{:else}
			{#each node.children as child}
				<Self node={child} {titleSlug} {refMap} />
			{/each}
		{/if}

	{:else if node.type === 'paragraph'}
		<div class="mt-2.5 flex gap-3 py-1">
			{#if node.number}
				<span class="mt-0.5 shrink-0 font-precision text-[0.75rem] font-medium text-red/50 leading-[1.7]">{node.number}</span>
			{/if}
			<div class="min-w-0 flex-1">
				{#if segments.length > 0}
					<p class="font-clarity text-[0.95rem] leading-[1.7] text-dark-gray">
						{#each segments as seg}
							{#if seg.type === 'text'}{seg.text}{:else if seg.type === 'ref'}<CrossRefLink citation={seg.displayText} href={seg.href} />{:else}<ExternalRefBadge citation={seg.displayText} />{/if}
						{/each}
					</p>
				{/if}
				{#each node.children as child}
					<Self node={child} {titleSlug} {refMap} />
				{/each}
			</div>
		</div>

	{:else if node.type === 'definition'}
		<div class="mt-4 border-l-2 border-red/30 bg-light-gray py-3 pr-4 pl-5">
			{#if node.heading}
				<dt class="font-authority text-base font-bold text-ink">{node.heading}</dt>
			{/if}
			{#if segments.length > 0}
				<dd class="mt-1.5 font-clarity text-[0.95rem] leading-[1.7] text-dark-gray">
					{#each segments as seg}
						{#if seg.type === 'text'}{seg.text}{:else if seg.type === 'ref'}<CrossRefLink citation={seg.displayText} href={seg.href} />{:else}<ExternalRefBadge citation={seg.displayText} />{/if}
					{/each}
				</dd>
			{/if}
			{#each node.children as child}
				<Self node={child} {titleSlug} {refMap} />
			{/each}
		</div>

	{:else}
		<!-- text node -->
		{#if segments.length > 0}
			<p class="mt-2 font-clarity text-[0.95rem] leading-[1.7] text-dark-gray">
				{#each segments as seg}
					{#if seg.type === 'text'}{seg.text}{:else if seg.type === 'ref'}<CrossRefLink citation={seg.displayText} href={seg.href} />{:else}<ExternalRefBadge citation={seg.displayText} />{/if}
				{/each}
			</p>
		{/if}
		{#each node.children as child}
			<Self node={child} {titleSlug} {refMap} />
		{/each}
	{/if}
</div>
