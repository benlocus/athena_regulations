<script lang="ts">
	import Breadcrumbs from '$lib/components/layout/Breadcrumbs.svelte';
	import SectionDetail from '$lib/components/regulation/SectionDetail.svelte';
	import AmendmentHistory from '$lib/components/regulation/AmendmentHistory.svelte';
	import SectionNav from '$lib/components/regulation/SectionNav.svelte';
	import BookmarkButton from '$lib/components/user/BookmarkButton.svelte';
	import AnnotationPanel from '$lib/components/user/AnnotationPanel.svelte';
	import HighlightPopover from '$lib/components/user/HighlightPopover.svelte';
	import MarginComments from '$lib/components/user/MarginComments.svelte';
	import { getSelectionInfo, type SelectionInfo } from '$lib/utils/selection';
	import type { Annotation } from '$lib/types';

	let { data } = $props();

	let annotationPanelOpen = $state(false);
	let serverAnnotations = $derived(data.annotations ?? []);
	let localEdits = $state<typeof serverAnnotations | null>(null);
	let localAnnotations = $derived(localEdits ?? serverAnnotations);

	// Selection / popover state
	let selectionInfo = $state<SelectionInfo | null>(null);
	let popoverPosition = $state<{ top: number; left: number } | null>(null);
	let contentEl = $state<HTMLElement | null>(null);

	// Active annotation (clicked highlight or margin comment)
	let activeAnnotationId = $state<string | null>(null);

	// Reset local edits when server data changes (navigation)
	$effect(() => {
		serverAnnotations;
		localEdits = null;
		selectionInfo = null;
		popoverPosition = null;
		activeAnnotationId = null;
	});

	function handlePointerUp() {
		if (!contentEl || !data.session) return;

		// Small delay to let the selection finalize
		requestAnimationFrame(() => {
			const info = getSelectionInfo(contentEl!);
			if (info) {
				selectionInfo = info;
				// Position popover below the selection
				const scrollY = window.scrollY;
				popoverPosition = {
					top: info.rect.bottom + scrollY + 8,
					left: Math.max(16, Math.min(info.rect.left, window.innerWidth - 304))
				};
			}
		});
	}

	function cancelPopover() {
		selectionInfo = null;
		popoverPosition = null;
		window.getSelection()?.removeAllRanges();
	}

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
		cancelPopover();
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

	<!-- Grid: content + margin comments on large screens -->
	<div class="lg:grid lg:grid-cols-[minmax(0,65ch)_240px] lg:gap-6">
		<!-- Content column -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div bind:this={contentEl} onpointerup={handlePointerUp}>
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
			<aside class="hidden lg:block">
				<div class="sticky top-24">
					<MarginComments
						annotations={localAnnotations}
						currentUserId={data.session?.user?.id}
						{activeAnnotationId}
						onClickHighlight={handleMarginClickHighlight}
						onEdit={handleMarginEdit}
						onDelete={handleAnnotationDelete}
					/>
				</div>
			</aside>
		{/if}
	</div>
</div>

<!-- Highlight popover -->
{#if selectionInfo && popoverPosition && data.session}
	<HighlightPopover
		position={popoverPosition}
		selectedText={selectionInfo.selectedText}
		nodeId={selectionInfo.nodeId}
		startOffset={selectionInfo.startOffset}
		endOffset={selectionInfo.endOffset}
		onSave={handleHighlightSave}
		onCancel={cancelPopover}
	/>
{/if}

{#if data.session}
	<AnnotationPanel
		open={annotationPanelOpen}
		sectionId={data.section.id}
		annotations={localAnnotations}
		currentUserId={data.session?.user?.id}
		editingId={activeAnnotationId}
		onClose={() => { annotationPanelOpen = false; activeAnnotationId = null; }}
		onSave={handleAnnotationSave}
		onDelete={handleAnnotationDelete}
	/>
{/if}
