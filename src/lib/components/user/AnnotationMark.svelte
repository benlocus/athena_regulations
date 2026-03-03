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
		yellow: 'bg-highlight-yellow/50 hover:bg-highlight-yellow/80',
		blue: 'bg-highlight-blue/50 hover:bg-highlight-blue/80',
		green: 'bg-highlight-green/50 hover:bg-highlight-green/80',
		pink: 'bg-highlight-pink/50 hover:bg-highlight-pink/80'
	};
</script>

<mark
	data-annotation-id={annotationId}
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
