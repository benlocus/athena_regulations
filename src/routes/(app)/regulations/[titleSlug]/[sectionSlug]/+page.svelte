<script lang="ts">
	import Breadcrumbs from '$lib/components/layout/Breadcrumbs.svelte';
	import SectionDetail from '$lib/components/regulation/SectionDetail.svelte';
	import AmendmentHistory from '$lib/components/regulation/AmendmentHistory.svelte';
	import SectionNav from '$lib/components/regulation/SectionNav.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.section.sectionNumber}: {data.section.heading} - MA Regulations</title>
</svelte:head>

<div class="mx-auto max-w-4xl">
	<Breadcrumbs
		items={[
			{ label: 'Home', href: '/' },
			{ label: 'Regulations', href: '/regulations' },
			{ label: data.title.titleNumber, href: `/regulations/${data.title.slug}` },
			{ label: data.section.sectionNumber }
		]}
	/>

	<SectionDetail
		sectionNumber={data.section.sectionNumber}
		heading={data.section.heading}
		contentTree={data.section.contentTree}
		titleSlug={data.title.slug}
		refMap={data.refMap}
		isRepealed={data.section.isRepealed}
	/>

	<AmendmentHistory amendments={data.amendments} />

	<SectionNav
		prev={data.adjacent.prev}
		next={data.adjacent.next}
		titleSlug={data.title.slug}
	/>
</div>
