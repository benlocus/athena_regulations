<script lang="ts">
	import type { Annotation } from '$lib/types';
	import MarginComment from './MarginComment.svelte';

	type Props = {
		annotations: Annotation[];
		currentUserId?: string;
		activeAnnotationId?: string | null;
		highlightPositions?: Map<string, number>;
		onClickHighlight: (annotationId: string) => void;
		onEdit: (annotation: Annotation) => void;
		onDelete: (id: string) => void;
	};

	let {
		annotations,
		currentUserId,
		activeAnnotationId = null,
		highlightPositions = new Map(),
		onClickHighlight,
		onEdit,
		onDelete
	}: Props = $props();

	// Only show inline (highlight) annotations, sorted by startOffset
	let inlineAnnotations = $derived(
		annotations
			.filter((a) => a.nodeId && a.startOffset != null && a.endOffset != null)
			.sort((a, b) => (a.startOffset ?? 0) - (b.startOffset ?? 0))
	);

	function resolveCollisions(items: { id: string; top: number }[], minGap = 80) {
		const sorted = [...items].sort((a, b) => a.top - b.top);
		for (let i = 1; i < sorted.length; i++) {
			if (sorted[i].top < sorted[i - 1].top + minGap) {
				sorted[i].top = sorted[i - 1].top + minGap;
			}
		}
		return sorted;
	}

	let positionedAnnotations = $derived.by(() => {
		if (highlightPositions.size === 0) {
			return inlineAnnotations.map((a) => ({ annotation: a, top: undefined as number | undefined }));
		}

		const items = inlineAnnotations
			.filter((a) => highlightPositions.has(a.id))
			.map((a) => ({ id: a.id, top: highlightPositions.get(a.id)! }));

		const resolved = resolveCollisions(items);
		const topMap = new Map(resolved.map((r) => [r.id, r.top]));

		return inlineAnnotations.map((a) => ({
			annotation: a,
			top: topMap.get(a.id)
		}));
	});
</script>

{#if inlineAnnotations.length > 0}
	<div>
		{#each positionedAnnotations as { annotation, top } (annotation.id)}
			<MarginComment
				{annotation}
				{currentUserId}
				{top}
				isActive={activeAnnotationId === annotation.id}
				{onClickHighlight}
				{onEdit}
				{onDelete}
			/>
		{/each}
	</div>
{/if}
