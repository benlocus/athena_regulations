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
		{ value: 'yellow', label: 'Yellow', class: 'bg-highlight-yellow' },
		{ value: 'blue', label: 'Blue', class: 'bg-highlight-blue' },
		{ value: 'green', label: 'Green', class: 'bg-highlight-green' },
		{ value: 'pink', label: 'Pink', class: 'bg-highlight-pink' }
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
	class="fixed z-50 w-72 border border-border-gray bg-white shadow-lg"
	style="top: {position.top}px; left: {position.left}px;"
>
	<div class="border-b border-border-gray px-3 py-2">
		<p class="text-xs italic text-medium-gray line-clamp-2">"{selectedText}"</p>
	</div>

	<form onsubmit={handleSubmit} class="p-3">
		<textarea
			bind:value={content}
			rows={2}
			placeholder="Add a comment (optional)..."
			class="w-full resize-none border border-border-gray bg-light-gray px-3 py-2 text-sm text-dark-gray placeholder:text-medium-gray focus:border-dark-gray focus:ring-0 focus:outline-none"
		></textarea>

		<div class="mt-2 flex items-center justify-between">
			<div class="flex gap-1.5" role="radiogroup" aria-label="Highlight color">
				{#each colors as c (c.value)}
					<button
						type="button"
						role="radio"
						aria-checked={color === c.value}
						aria-label={c.label}
						onclick={() => (color = c.value)}
						class={cn(
							'h-5 w-5 rounded-full border-2 transition-transform',
							c.class,
							color === c.value ? 'scale-110 border-ink' : 'border-transparent'
						)}
					></button>
				{/each}
			</div>

			<div class="flex gap-2">
				<button
					type="button"
					onclick={onCancel}
					class="px-2.5 py-1 text-xs font-medium text-medium-gray transition-colors hover:text-dark-gray"
				>
					Cancel
				</button>
				<button
					type="submit"
					class="bg-red px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-ink"
				>
					Highlight
				</button>
			</div>
		</div>
	</form>
</div>
