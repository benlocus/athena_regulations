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
		node.depth <= 1 ? '' : node.depth === 2 ? 'ml-6' : node.depth === 3 ? 'ml-12' : 'ml-16'
	);
</script>

<div id={node.id} class="group scroll-mt-20 {depthClass}">
	{#if node.type === 'section'}
		<!-- Top-level section: heading is rendered by SectionDetail, only render children -->
		{#each node.children as child}
			<Self node={child} {titleSlug} {refMap} />
		{/each}

	{:else if node.type === 'subsection'}
		<div class="mt-5 mb-2">
			{#if node.number}
				<span class="mr-1.5 font-serif font-semibold text-primary">{node.number}</span>
			{/if}
			{#if node.heading}
				<span class="font-serif font-semibold">{node.heading}</span>
			{/if}
		</div>
		{#if segments.length > 0 && node.children.length > 0}
			<!-- If subsection has both content and children, the content might be duplicated as a text child. Only render children. -->
			{#each node.children as child}
				<Self node={child} {titleSlug} {refMap} />
			{/each}
		{:else if segments.length > 0}
			<p class="font-serif text-base leading-relaxed text-text">
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
		<div class="mt-1.5 flex gap-1.5">
			{#if node.number}
				<span class="shrink-0 font-serif text-sm font-medium text-text-muted">{node.number}</span>
			{/if}
			<div>
				{#if segments.length > 0}
					<p class="font-serif text-base leading-relaxed text-text">
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
		<div class="mt-3 rounded-md border-l-4 border-accent bg-accent/5 py-2 pr-3 pl-4">
			{#if node.heading}
				<dt class="font-serif font-semibold text-primary">{node.heading}</dt>
			{/if}
			{#if segments.length > 0}
				<dd class="mt-1 font-serif text-base leading-relaxed text-text">
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
			<p class="mt-1.5 font-serif text-base leading-relaxed text-text">
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
