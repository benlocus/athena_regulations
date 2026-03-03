<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		onclick,
		icon,
		disabled = false,
		danger = false,
		children
	}: {
		onclick: () => void;
		icon?: Snippet;
		disabled?: boolean;
		danger?: boolean;
		children: Snippet;
	} = $props();
</script>

<button
	type="button"
	role="menuitem"
	{disabled}
	onclick={() => { onclick(); }}
	class="flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors
		{disabled ? 'pointer-events-none opacity-50' : ''}
		{danger ? 'text-destructive hover:bg-destructive/5' : 'text-foreground hover:bg-muted'}"
>
	{#if icon}
		<span class="h-3.5 w-3.5 shrink-0 text-muted-foreground">
			{@render icon()}
		</span>
	{/if}
	{@render children()}
</button>
