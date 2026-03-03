<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import AnnotationForm from './AnnotationForm.svelte';
	import type { Annotation } from '$lib/types';

	type Props = {
		open: boolean;
		sectionId: string;
		annotations: Annotation[];
		currentUserId?: string;
		editingId?: string | null;
		onClose: () => void;
		onSave: (data: { content: string; color: string; id?: string }) => void;
		onDelete: (id: string) => void;
	};

	let {
		open,
		sectionId,
		annotations,
		currentUserId,
		editingId = null,
		onClose,
		onSave,
		onDelete
	}: Props = $props();

	let localEditingId = $state<string | null>(editingId ?? null);

	// Sync localEditingId when editingId prop changes from the parent
	$effect(() => {
		localEditingId = editingId ?? null;
	});

	let editing = $derived(
		localEditingId ? (annotations.find((a) => a.id === localEditingId) ?? null) : null
	);

	function startEdit(annotation: Annotation) {
		localEditingId = annotation.id;
	}

	function cancelEdit() {
		localEditingId = null;
	}

	function handleSave(data: { content: string; color: string }) {
		onSave({ ...data, id: editing?.id });
		localEditingId = null;
	}

	const colorMap: Record<string, string> = {
		yellow: 'border-l-[#f5d75e]',
		blue: 'border-l-[#93c5fd]',
		green: 'border-l-[#86efac]',
		pink: 'border-l-[#f9a8d4]'
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
		class="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[1px]"
		onclick={onClose}
		aria-label="Close annotations panel"
	></button>

	<!-- Panel -->
	<aside class="fixed top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-border bg-background shadow-xl">
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-border px-4 py-3">
			<div>
				<h2 class="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">Annotations</h2>
				{#if annotations.length > 0}
					<p class="mt-0.5 font-mono text-[0.6875rem] text-muted-foreground/60">{annotations.length} note{annotations.length !== 1 ? 's' : ''}</p>
				{/if}
			</div>
			<button
				type="button"
				onclick={onClose}
				class="p-1.5 text-muted-foreground transition-colors hover:text-foreground"
				aria-label="Close"
			>
				<svg viewBox="0 0 16 16" fill="none" class="h-4 w-4">
					<path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			</button>
		</div>

		<div class="flex-1 overflow-y-auto">
			<!-- Add note form -->
			{#if !editing}
				<div class="border-b border-border p-3">
					<AnnotationForm onSave={handleSave} onCancel={onClose} />
				</div>
			{/if}

			<!-- Empty state -->
			{#if annotations.length === 0 && !editing}
				<div class="flex flex-col items-center justify-center px-4 py-12 text-center">
					<p class="text-xs text-muted-foreground">No annotations yet.</p>
					<p class="mt-0.5 text-xs text-muted-foreground/60">Select text to highlight it.</p>
				</div>
			{/if}

			<!-- Annotations list -->
			<div class="divide-y divide-border">
				{#each annotations as annotation (annotation.id)}
					{@const isOwn = currentUserId === annotation.userId}
					{#if editing?.id === annotation.id}
						<div class="p-3">
							<AnnotationForm
								initialContent={annotation.content}
								initialColor={annotation.color}
								onSave={handleSave}
								onCancel={cancelEdit}
							/>
						</div>
					{:else}
						<div
							class={cn(
								'border-l-[3px] px-4 py-3 transition-colors hover:bg-muted/30',
								colorMap[annotation.color] ?? colorMap.yellow
							)}
						>
							{#if annotation.authorName && !isOwn}
								<p class="mb-1 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{annotation.authorName}</p>
							{/if}
							{#if annotation.highlightText}
								<p class="mb-1.5 text-xs italic leading-relaxed text-muted-foreground">
									"{annotation.highlightText}"
								</p>
							{/if}
							{#if annotation.content}
								<p class="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{annotation.content}</p>
							{/if}
							<div class="mt-2 flex items-center justify-between">
								<span class="font-mono text-[0.625rem] tabular-nums text-muted-foreground/60">
									{formatDate(annotation.createdAt)}
								</span>
								{#if isOwn}
									<div class="flex gap-0">
										<button
											type="button"
											onclick={() => startEdit(annotation)}
											class="px-2 py-0.5 text-[0.6875rem] text-muted-foreground transition-colors hover:text-foreground"
										>
											Edit
										</button>
										<button
											type="button"
											onclick={() => onDelete(annotation.id)}
											class="px-2 py-0.5 text-[0.6875rem] text-muted-foreground transition-colors hover:text-destructive"
										>
											Delete
										</button>
									</div>
								{/if}
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</aside>
{/if}
