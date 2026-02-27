<script lang="ts">
	import type { Annotation } from '$lib/types';
	import MarginComment from './MarginComment.svelte';

	type Props = {
		annotations: Annotation[];
		currentUserId?: string;
		activeAnnotationId?: string | null;
		onClickHighlight: (annotationId: string) => void;
		onEdit: (annotation: Annotation) => void;
		onDelete: (id: string) => void;
	};

	let {
		annotations,
		currentUserId,
		activeAnnotationId = null,
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
</script>

{#if inlineAnnotations.length > 0}
	<div class="space-y-3">
		<h3 class="font-precision text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-medium-gray">
			Comments
		</h3>
		{#each inlineAnnotations as annotation (annotation.id)}
			<MarginComment
				{annotation}
				{currentUserId}
				isActive={activeAnnotationId === annotation.id}
				{onClickHighlight}
				{onEdit}
				{onDelete}
			/>
		{/each}
	</div>
{/if}
