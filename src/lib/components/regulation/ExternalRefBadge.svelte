<script lang="ts">
	let { citation }: { citation: string } = $props();
</script>

<span
	class="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-xs font-medium text-accent-dark"
>
	<svg class="h-3 w-3" viewBox="0 0 16 16" fill="none">
		<path d="M6 3H3v10h10v-3M10 2h4v4M7 9l7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
	</svg>
	{citation}
</span>
