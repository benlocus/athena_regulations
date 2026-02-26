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

<form onsubmit={handleSubmit} class="rounded-md border border-border bg-surface p-3">
	<textarea
		bind:value={content}
		rows={3}
		placeholder="Add a note..."
		class="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
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
						color === c.value ? 'scale-110 border-primary' : 'border-transparent'
					)}
				></button>
			{/each}
		</div>

		<div class="flex gap-2">
			<button
				type="button"
				onclick={onCancel}
				class="rounded-md px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text"
			>
				Cancel
			</button>
			<button
				type="submit"
				disabled={!content.trim()}
				class="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-light disabled:opacity-50"
			>
				{initialContent ? 'Update' : 'Save'}
			</button>
		</div>
	</div>
</form>
