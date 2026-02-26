<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import AnnotationForm from './AnnotationForm.svelte';
	import type { Annotation } from '$lib/types';

	type Props = {
		open: boolean;
		sectionId: string;
		annotations: Annotation[];
		editingId?: string | null;
		onClose: () => void;
		onSave: (data: { content: string; color: string; id?: string }) => void;
		onDelete: (id: string) => void;
	};

	let {
		open,
		sectionId,
		annotations,
		editingId = null,
		onClose,
		onSave,
		onDelete
	}: Props = $props();

	let editing = $state<Annotation | null>(null);

	$effect(() => {
		if (editingId) {
			editing = annotations.find((a) => a.id === editingId) ?? null;
		}
	});

	function startEdit(annotation: Annotation) {
		editing = annotation;
	}

	function cancelEdit() {
		editing = null;
	}

	function handleSave(data: { content: string; color: string }) {
		onSave({ ...data, id: editing?.id });
		editing = null;
	}

	const colorMap: Record<string, string> = {
		yellow: 'bg-highlight-yellow',
		blue: 'bg-highlight-blue',
		green: 'bg-highlight-green',
		pink: 'bg-highlight-pink'
	};

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

{#if open}
	<!-- Backdrop -->
	<button
		type="button"
		class="fixed inset-0 z-40 bg-black/30"
		onclick={onClose}
		aria-label="Close annotations panel"
	></button>

	<!-- Panel -->
	<aside
		class={cn(
			'fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-lg'
		)}
	>
		<div class="flex items-center justify-between border-b border-border px-4 py-3">
			<h2 class="font-serif text-lg font-semibold text-primary">Annotations</h2>
			<button
				type="button"
				onclick={onClose}
				class="rounded-md p-1.5 text-text-muted transition-colors hover:text-text"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					class="h-5 w-5"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<div class="flex-1 overflow-y-auto p-4">
			{#if !editing}
				<div class="mb-4">
					<AnnotationForm onSave={handleSave} onCancel={onClose} />
				</div>
			{/if}

			{#if annotations.length === 0 && !editing}
				<p class="py-8 text-center text-sm text-text-muted">
					No annotations for this section yet
				</p>
			{/if}

			<div class="space-y-3">
				{#each annotations as annotation (annotation.id)}
					{#if editing?.id === annotation.id}
						<AnnotationForm
							initialContent={annotation.content}
							initialColor={annotation.color}
							onSave={handleSave}
							onCancel={cancelEdit}
						/>
					{:else}
						<div
							class={cn(
								'rounded-md border border-border p-3',
								colorMap[annotation.color] ?? 'bg-highlight-yellow'
							)}
						>
							{#if annotation.highlightText}
								<p class="mb-2 text-xs italic text-text-muted">
									"{annotation.highlightText}"
								</p>
							{/if}
							<p class="whitespace-pre-wrap text-sm text-text">{annotation.content}</p>
							<div class="mt-2 flex items-center justify-between">
								<span class="text-xs text-text-muted">
									{formatDate(annotation.createdAt)}
								</span>
								<div class="flex gap-1">
									<button
										type="button"
										onclick={() => startEdit(annotation)}
										class="rounded px-2 py-0.5 text-xs text-text-muted transition-colors hover:text-primary"
									>
										Edit
									</button>
									<button
										type="button"
										onclick={() => onDelete(annotation.id)}
										class="rounded px-2 py-0.5 text-xs text-text-muted transition-colors hover:text-red-600"
									>
										Delete
									</button>
								</div>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</aside>
{/if}
