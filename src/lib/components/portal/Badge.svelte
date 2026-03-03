<script lang="ts">
	import { tv, type VariantProps } from 'tailwind-variants';
	import type { Snippet } from 'svelte';

	const badge = tv({
		base: 'inline-flex items-center rounded-full font-medium',
		variants: {
			variant: {
				default: 'bg-muted text-muted-foreground',
				primary: 'bg-destructive/10 text-destructive',
				success: 'bg-highlight-green text-green-700',
				warning: 'bg-highlight-yellow text-amber-700'
			},
			size: {
				sm: 'px-2 py-0.5 text-[0.625rem]',
				md: 'px-2.5 py-0.5 text-xs'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'sm'
		}
	});

	type BadgeVariants = VariantProps<typeof badge>;

	let {
		variant = 'default',
		size = 'sm',
		class: className = '',
		children
	}: BadgeVariants & { children: Snippet; class?: string } = $props();
</script>

<span class="{badge({ variant, size })} {className}">
	{@render children()}
</span>
