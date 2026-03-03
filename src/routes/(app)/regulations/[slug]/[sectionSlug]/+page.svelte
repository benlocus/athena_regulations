<script lang="ts">
	import Breadcrumbs from '$lib/components/layout/Breadcrumbs.svelte';
	import SectionDetail from '$lib/components/regulation/SectionDetail.svelte';
	import AmendmentHistory from '$lib/components/regulation/AmendmentHistory.svelte';
	import SectionNav from '$lib/components/regulation/SectionNav.svelte';
	import BookmarkButton from '$lib/components/user/BookmarkButton.svelte';
	import AnnotationPanel from '$lib/components/user/AnnotationPanel.svelte';
	import MarginComments from '$lib/components/user/MarginComments.svelte';
	import SelectionContextMenu from '$lib/components/user/SelectionContextMenu.svelte';
	import type { Annotation } from '$lib/types';

	let { data } = $props();

	let annotationPanelOpen = $state(false);
	let serverAnnotations = $derived(data.annotations ?? []);
	let localEdits = $state<typeof serverAnnotations | null>(null);
	let localAnnotations = $derived(localEdits ?? serverAnnotations);

	let contentEl = $state<HTMLElement | null>(null);

	// Active annotation (clicked highlight or margin comment)
	let activeAnnotationId = $state<string | null>(null);

	// Highlight position measurement for margin comments
	let highlightPositions = $state<Map<string, number>>(new Map());
	let gridEl = $state<HTMLElement | null>(null);

	$effect(() => {
		localAnnotations; // dependency
		requestAnimationFrame(() => {
			if (!contentEl || !gridEl) return;
			const gridRect = gridEl.getBoundingClientRect();
			const positions = new Map<string, number>();
			const marks = contentEl.querySelectorAll('mark[data-annotation-id]');
			for (const mark of marks) {
				const id = mark.getAttribute('data-annotation-id');
				if (id && !positions.has(id)) {
					positions.set(id, mark.getBoundingClientRect().top - gridRect.top);
				}
			}
			highlightPositions = positions;
		});
	});

	// Reset local edits when server data changes (navigation)
	$effect(() => {
		serverAnnotations;
		localEdits = null;
		activeAnnotationId = null;
	});

	async function handleHighlightSave(saveData: {
		nodeId: string;
		highlightText: string;
		startOffset: number;
		endOffset: number;
		content: string;
		color: string;
	}) {
		const res = await fetch('/api/v1/annotations', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				sectionId: data.section.id,
				nodeId: saveData.nodeId,
				highlightText: saveData.highlightText,
				startOffset: saveData.startOffset,
				endOffset: saveData.endOffset,
				content: saveData.content || 'Highlight',
				color: saveData.color
			})
		});
		if (res.ok) {
			const { data: created } = await res.json();
			localEdits = [...localAnnotations, created];
		}
		window.getSelection()?.removeAllRanges();
	}

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
			if (activeAnnotationId === id) activeAnnotationId = null;
		}
	}

	// Click highlight in content -> scroll margin comment into view
	function handleHighlightClick(annotationId: string) {
		activeAnnotationId = annotationId;

		// On mobile, open the annotation panel instead
		if (window.innerWidth < 1024) {
			annotationPanelOpen = true;
			return;
		}

		const marginEl = document.getElementById(`margin-comment-${annotationId}`);
		if (marginEl) {
			marginEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}

	// Click margin comment -> scroll to highlighted text in content
	function handleMarginClickHighlight(annotationId: string) {
		activeAnnotationId = annotationId;
		const ann = localAnnotations.find((a) => a.id === annotationId);
		if (ann?.nodeId) {
			const nodeEl = document.getElementById(ann.nodeId);
			if (nodeEl) {
				nodeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	}

	function handleMarginEdit(annotation: Annotation) {
		annotationPanelOpen = true;
		activeAnnotationId = annotation.id;
	}
</script>

<svelte:head>
	<title>{data.section.sectionNumber}: {data.section.heading} - Regulations Browser</title>
</svelte:head>

<div class="mx-auto max-w-5xl">
	<Breadcrumbs
		items={[
			{ label: 'Home', href: '/' },
			{ label: 'Regulations', href: '/regulations' },
			{ label: data.title.titleNumber, href: `/regulations/${data.title.slug}` },
			{ label: data.section.sectionNumber }
		]}
	/>

	<div class="mb-5 flex items-center gap-3 border-b border-border pb-4">
		{#if data.session}
			<BookmarkButton sectionId={data.section.id} isBookmarked={data.isBookmarked} />
			<button
				onclick={() => (annotationPanelOpen = true)}
				class="flex items-center gap-1.5 font-mono text-[0.6875rem] text-muted-foreground transition-colors hover:text-foreground"
			>
				<svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
					<path d="M3 4h10M3 7h7M3 10h5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
				</svg>
				Notes{#if localAnnotations.length > 0}&nbsp;({localAnnotations.length}){/if}
			</button>
		{:else}
			<a href="/login" class="flex items-center gap-1.5 font-mono text-[0.6875rem] text-muted-foreground transition-colors hover:text-destructive">
				<svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
					<path d="M8 2a4 4 0 100 8 4 4 0 000-8zM2 14c0-2.2 2.7-4 6-4s6 1.8 6 4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
				</svg>
				Sign in to bookmark &amp; annotate
			</a>
		{/if}
	</div>

	<!-- Grid: content + margin comments on large screens -->
	<div bind:this={gridEl} class="lg:grid lg:grid-cols-[minmax(0,65ch)_220px] lg:gap-8">
		<!-- Content column -->
		<div bind:this={contentEl}>
			<SectionDetail
				sectionNumber={data.section.sectionNumber}
				heading={data.section.heading}
				contentTree={data.section.contentTree}
				titleSlug={data.title.slug}
				refMap={data.refMap}
				isRepealed={data.section.isRepealed}
				annotations={localAnnotations}
				onHighlightClick={handleHighlightClick}
			/>

			<AmendmentHistory amendments={data.amendments} />

			<SectionNav
				prev={data.adjacent.prev}
				next={data.adjacent.next}
				titleSlug={data.title.slug}
			/>
		</div>

		<!-- Margin comments column (desktop only) -->
		{#if data.session}
			<aside class="hidden lg:block relative">
				<MarginComments
					annotations={localAnnotations}
					currentUserId={data.session?.id}
					{activeAnnotationId}
					{highlightPositions}
					onClickHighlight={handleMarginClickHighlight}
					onEdit={handleMarginEdit}
					onDelete={handleAnnotationDelete}
				/>
			</aside>
		{/if}
	</div>
</div>

<!-- Context menu (right-click on selection) — always available, auth-required actions redirect to login -->
<SelectionContextMenu
	{contentEl}
	codeNumber={data.title.codeNumber}
	sectionNumber={data.section.sectionNumber}
	isAuthenticated={!!data.session}
	onHighlightSave={handleHighlightSave}
	onOpenNotes={() => { annotationPanelOpen = true; }}
	onDismissPopover={() => { window.getSelection()?.removeAllRanges(); }}
/>

{#if data.session}
	<AnnotationPanel
		open={annotationPanelOpen}
		sectionId={data.section.id}
		annotations={localAnnotations}
		currentUserId={data.session?.id}
		editingId={activeAnnotationId}
		onClose={() => { annotationPanelOpen = false; activeAnnotationId = null; }}
		onSave={handleAnnotationSave}
		onDelete={handleAnnotationDelete}
	/>
{/if}
