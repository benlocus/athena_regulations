<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Annotation } from '$lib/types';

	type Props = {
		annotation: Annotation;
		currentUserId?: string;
		isActive?: boolean;
		top?: number;
		onClickHighlight: (annotationId: string) => void;
		onEdit: (annotation: Annotation) => void;
		onDelete: (id: string) => void;
	};

	let { annotation, currentUserId, isActive = false, top, onClickHighlight, onEdit, onDelete }: Props = $props();

	let isOwn = $derived(currentUserId === annotation.userId);

	const colorStrip: Record<string, string> = {
		yellow: 'border-l-[3px] border-l-[#f5d75e]',
		blue: 'border-l-[3px] border-l-[#93c5fd]',
		green: 'border-l-[3px] border-l-[#86efac]',
		pink: 'border-l-[3px] border-l-[#f9a8d4]'
	};

	const colorDot: Record<string, string> = {
		yellow: 'bg-[#f5d75e]',
		blue: 'bg-[#93c5fd]',
		green: 'bg-[#86efac]',
		pink: 'bg-[#f9a8d4]'
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
		'border border-border bg-background px-2.5 py-2 transition-all duration-150',
		colorStrip[annotation.color] ?? colorStrip.yellow,
		isActive ? 'shadow-sm ring-1 ring-foreground/10' : 'hover:border-border/80'
	)}
	style={top != null ? `position: absolute; top: ${top}px; left: 0; right: 0;` : undefined}
>
	{#if annotation.highlightText}
		<button
			type="button"
			onclick={() => onClickHighlight(annotation.id)}
			class="mb-1.5 flex w-full items-start gap-1.5 text-left group"
		>
			<span class={cn('mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full', colorDot[annotation.color] ?? colorDot.yellow)}></span>
			<span class="line-clamp-2 text-[0.7rem] italic leading-snug text-muted-foreground group-hover:text-foreground/70 transition-colors">"{annotation.highlightText}"</span>
		</button>
	{/if}

	{#if annotation.authorName && !isOwn}
		<p class="mb-1 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{annotation.authorName}</p>
	{/if}

	{#if annotation.content}
		<p class="text-[0.75rem] leading-relaxed text-foreground">{annotation.content}</p>
	{/if}

	<div class="mt-1.5 flex items-center justify-between">
		<span class="text-[0.625rem] tabular-nums text-muted-foreground/60">{formatDate(annotation.createdAt)}</span>
		{#if isOwn}
			<div class="flex gap-0">
				<button
					type="button"
					onclick={() => onEdit(annotation)}
					class="px-1.5 py-0.5 text-[0.625rem] text-muted-foreground/60 transition-colors hover:text-foreground"
				>
					Edit
				</button>
				<button
					type="button"
					onclick={() => onDelete(annotation.id)}
					class="px-1.5 py-0.5 text-[0.625rem] text-muted-foreground/60 transition-colors hover:text-destructive"
				>
					Delete
				</button>
			</div>
		{/if}
	</div>
</div>
