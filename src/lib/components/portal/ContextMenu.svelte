<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		x,
		y,
		visible = false,
		onClose,
		children
	}: {
		x: number;
		y: number;
		visible: boolean;
		onClose: () => void;
		children: Snippet;
	} = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if visible}
	<!-- Backdrop -->
	<button
		type="button"
		class="fixed inset-0 z-[60]"
		onclick={onClose}
		aria-label="Close context menu"
	></button>
	<!-- Menu -->
	<div
		class="fixed z-[60] min-w-[180px] border border-border bg-background py-1 shadow-lg"
		style="top: {y}px; left: {x}px;"
		role="menu"
	>
		{@render children()}
	</div>
{/if}
