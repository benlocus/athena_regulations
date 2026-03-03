<script lang="ts">
	let { citation, href }: { citation: string; href: string } = $props();
</script>

<a
	{href}
	class="font-mono text-[0.8em] text-destructive underline decoration-destructive/25 underline-offset-[3px] hover:decoration-destructive transition-colors duration-100 whitespace-nowrap"
>
	{citation}
</a>
