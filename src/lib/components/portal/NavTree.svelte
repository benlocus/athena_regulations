<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		open = $bindable(false),
		active = false,
		children,
		href
	}: {
		label: string;
		open?: boolean;
		active?: boolean;
		children?: Snippet;
		href?: string;
	} = $props();
</script>

{#if children}
	<div>
		<button
			onclick={() => (open = !open)}
			class="flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs font-medium transition-colors {active ? 'text-destructive' : 'text-foreground hover:text-foreground hover:bg-muted'}"
		>
			<svg
				class="h-3 w-3 shrink-0 text-muted-foreground transition-transform {open ? 'rotate-90' : ''}"
				viewBox="0 0 16 16"
				fill="none"
			>
				<path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			<span class="truncate">{label}</span>
		</button>
		{#if open}
			<div class="ml-3 border-l border-border pl-2">
				{@render children()}
			</div>
		{/if}
	</div>
{:else if href}
	<a
		{href}
		class="block rounded-sm px-2 py-1.5 text-xs transition-colors {active ? 'bg-destructive/5 font-medium text-destructive' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
	>
		{label}
	</a>
{:else}
	<span class="block px-2 py-1.5 text-xs text-muted-foreground">{label}</span>
{/if}
