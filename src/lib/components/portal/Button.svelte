<script lang="ts">
	import { tv, type VariantProps } from 'tailwind-variants';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	const button = tv({
		base: 'inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50',
		variants: {
			variant: {
				default: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline: 'border border-border bg-background text-foreground hover:bg-muted',
				ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground'
			},
			size: {
				sm: 'h-8 px-3 text-xs rounded-md',
				md: 'h-9 px-4 text-sm rounded-md',
				lg: 'h-10 px-5 text-sm rounded-md'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'md'
		}
	});

	type ButtonVariants = VariantProps<typeof button>;

	let {
		variant = 'default',
		size = 'md',
		class: className = '',
		children,
		...rest
	}: HTMLButtonAttributes & ButtonVariants & { children: Snippet; class?: string } = $props();
</script>

<button class="{button({ variant, size })} {className}" {...rest}>
	{@render children()}
</button>
