<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Annotation } from '$lib/types';

	type Props = {
		annotation: Annotation;
		currentUserId?: string;
		isActive?: boolean;
		onClickHighlight: (annotationId: string) => void;
		onEdit: (annotation: Annotation) => void;
		onDelete: (id: string) => void;
	};

	let { annotation, currentUserId, isActive = false, onClickHighlight, onEdit, onDelete }: Props = $props();

	let isOwn = $derived(currentUserId === annotation.userId);

	const colorStrip: Record<string, string> = {
		yellow: 'border-l-highlight-yellow',
		blue: 'border-l-highlight-blue',
		green: 'border-l-highlight-green',
		pink: 'border-l-highlight-pink'
	};

	const colorDot: Record<string, string> = {
		yellow: 'bg-highlight-yellow',
		blue: 'bg-highlight-blue',
		green: 'bg-highlight-green',
		pink: 'bg-highlight-pink'
	};

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div
	id="margin-comment-{annotation.id}"
	class={cn(
		'border-l-3 border border-border-gray bg-white px-3 py-2.5 transition-all',
		colorStrip[annotation.color] ?? colorStrip.yellow,
		isActive && 'ring-2 ring-ink/10 shadow-sm'
	)}
>
	{#if annotation.highlightText}
		<button
			type="button"
			onclick={() => onClickHighlight(annotation.id)}
			class="mb-1.5 flex w-full items-start gap-1.5 text-left"
		>
			<span class={cn('mt-1 h-2 w-2 shrink-0 rounded-full', colorDot[annotation.color] ?? colorDot.yellow)}></span>
			<span class="line-clamp-2 text-xs italic leading-snug text-medium-gray">"{annotation.highlightText}"</span>
		</button>
	{/if}

	{#if annotation.authorName && !isOwn}
		<p class="mb-1 text-[0.65rem] font-medium text-medium-gray">{annotation.authorName}</p>
	{/if}

	{#if annotation.content}
		<p class="text-[0.8rem] leading-relaxed text-dark-gray">{annotation.content}</p>
	{/if}

	<div class="mt-1.5 flex items-center justify-between">
		<span class="text-[0.65rem] text-medium-gray">{formatDate(annotation.createdAt)}</span>
		{#if isOwn}
			<div class="flex gap-0.5">
				<button
					type="button"
					onclick={() => onEdit(annotation)}
					class="px-1.5 py-0.5 text-[0.65rem] text-medium-gray transition-colors hover:text-ink"
				>
					Edit
				</button>
				<button
					type="button"
					onclick={() => onDelete(annotation.id)}
					class="px-1.5 py-0.5 text-[0.65rem] text-medium-gray transition-colors hover:text-red"
				>
					Delete
				</button>
			</div>
		{/if}
	</div>
</div>
