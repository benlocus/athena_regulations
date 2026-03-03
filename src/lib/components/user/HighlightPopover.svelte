<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		position: { top: number; left: number };
		selectedText: string;
		nodeId: string;
		startOffset: number;
		endOffset: number;
		onSave: (data: {
			nodeId: string;
			highlightText: string;
			startOffset: number;
			endOffset: number;
			content: string;
			color: string;
		}) => void;
		onCancel: () => void;
	};

	let { position, selectedText, nodeId, startOffset, endOffset, onSave, onCancel }: Props =
		$props();

	let content = $state('');
	let color = $state('yellow');

	const colors = [
		{ value: 'yellow', label: 'Yellow', bg: '#fef9c3', active: '#f5d75e' },
		{ value: 'blue', label: 'Blue', bg: '#dbeafe', active: '#93c5fd' },
		{ value: 'green', label: 'Green', bg: '#dcfce7', active: '#86efac' },
		{ value: 'pink', label: 'Pink', bg: '#fce7f3', active: '#f9a8d4' }
	];

	function handleSubmit(e: Event) {
		e.preventDefault();
		onSave({
			nodeId,
			highlightText: selectedText,
			startOffset,
			endOffset,
			content: content.trim(),
			color
		});
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onCancel();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Backdrop -->
<button
	type="button"
	class="fixed inset-0 z-50"
	onclick={onCancel}
	aria-label="Close highlight popover"
></button>

<!-- Popover -->
<div
	class="fixed z-50 w-[17rem] border border-border bg-background shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
	style="top: {position.top}px; left: {position.left}px;"
>
	<!-- Selected text preview -->
	<div class="border-b border-border bg-muted/60 px-3 py-2">
		<p class="text-[0.7rem] italic leading-relaxed text-muted-foreground line-clamp-2">"{selectedText}"</p>
	</div>

	<form onsubmit={handleSubmit} class="p-2.5">
		<textarea
			bind:value={content}
			rows={2}
			placeholder="Add a note (optional)..."
			class="w-full resize-none border border-border bg-muted/40 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:bg-background focus:ring-0 focus:outline-none transition-colors"
		></textarea>

		<div class="mt-2 flex items-center justify-between">
			<div class="flex gap-1" role="radiogroup" aria-label="Highlight color">
				{#each colors as c (c.value)}
					<button
						type="button"
						role="radio"
						aria-checked={color === c.value}
						aria-label={c.label}
						onclick={() => (color = c.value)}
						class={cn(
							'h-4 w-4 rounded-full border transition-all duration-100',
							color === c.value ? 'scale-125 border-foreground/40' : 'border-transparent opacity-70 hover:opacity-100'
						)}
						style="background-color: {color === c.value ? c.active : c.bg};"
					></button>
				{/each}
			</div>

			<div class="flex items-center gap-1.5">
				<button
					type="button"
					onclick={onCancel}
					class="px-2 py-1 text-[0.6875rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					Cancel
				</button>
				<button
					type="submit"
					class="bg-destructive px-2.5 py-1 text-[0.6875rem] font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
				>
					Highlight
				</button>
			</div>
		</div>
	</form>
</div>
