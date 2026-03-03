<script lang="ts">
	import { tv, type VariantProps } from 'tailwind-variants';
	import type { Snippet } from 'svelte';

	const card = tv({
		base: 'border border-border bg-background transition-all',
		variants: {
			hover: {
				true: 'hover:border-destructive/30 hover:shadow-sm',
				false: ''
			},
			padding: {
				none: '',
				sm: 'p-4',
				md: 'p-6',
				lg: 'p-8'
			}
		},
		defaultVariants: {
			hover: false,
			padding: 'md'
		}
	});

	type CardVariants = VariantProps<typeof card>;

	let {
		hover = false,
		padding = 'md',
		class: className = '',
		children
	}: CardVariants & { children: Snippet; class?: string } = $props();
</script>

<div class="{card({ hover, padding })} {className}">
	{@render children()}
</div>
