<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		color?: string;
		annotationId: string;
		onClick?: (annotationId: string) => void;
		children: import('svelte').Snippet;
	};

	let { color = 'yellow', annotationId, onClick, children }: Props = $props();

	const colorMap: Record<string, string> = {
		yellow: 'bg-highlight-yellow/60 hover:bg-highlight-yellow',
		blue: 'bg-highlight-blue/60 hover:bg-highlight-blue',
		green: 'bg-highlight-green/60 hover:bg-highlight-green',
		pink: 'bg-highlight-pink/60 hover:bg-highlight-pink'
	};
</script>

<mark
	role="button"
	tabindex="0"
	class={cn(
		'cursor-pointer px-0.5 transition-colors',
		colorMap[color] ?? colorMap.yellow
	)}
	onclick={() => onClick?.(annotationId)}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onClick?.(annotationId);
		}
	}}
>
	{@render children()}
</mark>
