<script lang="ts">
	import Breadcrumbs from '$lib/components/layout/Breadcrumbs.svelte';
	import SectionDetail from '$lib/components/regulation/SectionDetail.svelte';
	import AmendmentHistory from '$lib/components/regulation/AmendmentHistory.svelte';
	import SectionNav from '$lib/components/regulation/SectionNav.svelte';
	import BookmarkButton from '$lib/components/user/BookmarkButton.svelte';
	import AnnotationPanel from '$lib/components/user/AnnotationPanel.svelte';

	let { data } = $props();

	let annotationPanelOpen = $state(false);
	let serverAnnotations = $derived(data.annotations ?? []);
	let localEdits = $state<typeof serverAnnotations | null>(null);
	let localAnnotations = $derived(localEdits ?? serverAnnotations);

	// Reset local edits when server data changes (navigation)
	$effect(() => {
		serverAnnotations;
		localEdits = null;
	});

	async function handleAnnotationSave(saveData: { content: string; color: string; id?: string }) {
		if (saveData.id) {
			const res = await fetch(`/api/v1/annotations/${saveData.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: saveData.content, color: saveData.color })
			});
			if (res.ok) {
				const { data: updated } = await res.json();
				localEdits = localAnnotations.map((a) =>
					a.id === saveData.id ? { ...a, ...updated } : a
				);
			}
		} else {
			const res = await fetch('/api/v1/annotations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sectionId: data.section.id,
					content: saveData.content,
					color: saveData.color
				})
			});
			if (res.ok) {
				const { data: created } = await res.json();
				localEdits = [...localAnnotations, created];
			}
		}
	}

	async function handleAnnotationDelete(id: string) {
		const res = await fetch(`/api/v1/annotations/${id}`, { method: 'DELETE' });
		if (res.ok) {
			localEdits = localAnnotations.filter((a) => a.id !== id);
		}
	}
</script>

<svelte:head>
	<title>{data.section.sectionNumber}: {data.section.heading} - Regulations Browser</title>
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

	{#if data.session}
		<div class="mb-4 flex items-center gap-2">
			<BookmarkButton sectionId={data.section.id} isBookmarked={data.isBookmarked} />
			<button
				onclick={() => (annotationPanelOpen = true)}
				class="text-sm text-medium-gray transition-colors hover:text-ink"
			>
				Notes ({localAnnotations.length})
			</button>
		</div>
	{/if}

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

{#if data.session}
	<AnnotationPanel
		open={annotationPanelOpen}
		sectionId={data.section.id}
		annotations={localAnnotations}
		onClose={() => (annotationPanelOpen = false)}
		onSave={handleAnnotationSave}
		onDelete={handleAnnotationDelete}
	/>
{/if}
