<script lang="ts">
	import Breadcrumbs from '$lib/components/layout/Breadcrumbs.svelte';
	import SectionToc from '$lib/components/regulation/SectionToc.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.title.codeNumber} {data.title.titleNumber}: {data.title.title} - MA Regulations</title>
</svelte:head>

<div class="mx-auto max-w-4xl">
	<Breadcrumbs
		items={[
			{ label: 'Home', href: '/' },
			{ label: 'Regulations', href: '/regulations' },
			{ label: `${data.title.titleNumber}` }
		]}
	/>

	<div class="mb-8">
		<p class="font-mono text-sm font-medium text-accent-dark">
			{data.title.codeNumber} {data.title.titleNumber}
		</p>
		<h1 class="mt-1 font-serif text-3xl font-bold text-primary">
			{data.title.title}
		</h1>
		{#if data.title.description}
			<p class="mt-3 text-text-muted">{data.title.description}</p>
		{/if}
	</div>

	<SectionToc sections={data.sections} titleSlug={data.title.slug} />
</div>
