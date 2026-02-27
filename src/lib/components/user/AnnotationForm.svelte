<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		initialContent?: string;
		initialColor?: string;
		onSave: (data: { content: string; color: string }) => void;
		onCancel: () => void;
	};

	let { initialContent = '', initialColor = 'yellow', onSave, onCancel }: Props = $props();

	let content = $state(initialContent);
	let color = $state(initialColor);

	const colors = [
		{ value: 'yellow', label: 'Yellow', class: 'bg-highlight-yellow' },
		{ value: 'blue', label: 'Blue', class: 'bg-highlight-blue' },
		{ value: 'green', label: 'Green', class: 'bg-highlight-green' },
		{ value: 'pink', label: 'Pink', class: 'bg-highlight-pink' }
	];

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!content.trim()) return;
		onSave({ content: content.trim(), color });
		content = '';
		color = 'yellow';
	}
</script>

<form onsubmit={handleSubmit} class="border border-border-gray bg-white p-3">
	<textarea
		bind:value={content}
		rows={3}
		placeholder="Add a note..."
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
				class="px-3 py-1.5 text-xs font-medium text-medium-gray transition-colors hover:text-dark-gray"
			>
				Cancel
			</button>
			<button
				type="submit"
				disabled={!content.trim()}
				class="bg-red px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-ink disabled:opacity-50"
			>
				{initialContent ? 'Update' : 'Save'}
			</button>
		</div>
	</div>
</form>
