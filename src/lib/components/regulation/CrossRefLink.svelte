<script lang="ts">
	let { citation, href }: { citation: string; href: string } = $props();
</script>

<a
	{href}
	class="inline-flex items-center rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 font-mono text-xs font-medium text-primary transition-colors hover:bg-primary/10 hover:underline"
>
	{citation}
</a>
