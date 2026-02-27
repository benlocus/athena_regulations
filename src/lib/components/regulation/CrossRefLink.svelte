<script lang="ts">
	let { citation, href }: { citation: string; href: string } = $props();
</script>

<a
	{href}
	class="font-precision text-[0.8rem] text-red underline decoration-red/30 underline-offset-2 hover:decoration-red hover:text-ink transition-colors"
>
	{citation}
</a>
