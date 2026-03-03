<script lang="ts">
	import { formatCitation } from '$lib/utils/citation-formatter';
	import { goto } from '$app/navigation';
	import { getSelectionInfo, type SelectionInfo } from '$lib/utils/selection';

	let {
		contentEl,
		codeNumber,
		sectionNumber,
		isAuthenticated = false,
		onHighlightSave,
		onOpenNotes,
		onDismissPopover
	}: {
		contentEl: HTMLElement | null;
		codeNumber: string;
		sectionNumber: string;
		isAuthenticated?: boolean;
		onHighlightSave: (data: {
			nodeId: string;
			highlightText: string;
			startOffset: number;
			endOffset: number;
			content: string;
			color: string;
		}) => void;
		onOpenNotes: () => void;
		onDismissPopover: () => void;
	} = $props();

	function requireAuth(): boolean {
		if (!isAuthenticated) {
			close();
			goto('/login');
			return false;
		}
		return true;
	}

	let visible = $state(false);
	let menuX = $state(0);
	let menuY = $state(0);
	let localSelection = $state<SelectionInfo | null>(null);
	let rawSelectedText = $state<string | null>(null);

	// Detect pointer: fine (mouse, not touch)
	let isFinePointer = $state(false);
	$effect(() => {
		isFinePointer = window.matchMedia('(pointer: fine)').matches;
	});

	// Attach contextmenu listener directly to contentEl for reliable preventDefault
	$effect(() => {
		if (!contentEl) return;
		const el = contentEl;
		el.addEventListener('contextmenu', handleContextMenu);
		return () => el.removeEventListener('contextmenu', handleContextMenu);
	});

	// Color submenu state
	let showColorSubmenu = $state(false);
	const colors = [
		{ value: 'yellow', label: 'Yellow', class: 'bg-[#fef9c3]' },
		{ value: 'blue', label: 'Blue', class: 'bg-[#dbeafe]' },
		{ value: 'green', label: 'Green', class: 'bg-[#dcfce7]' },
		{ value: 'pink', label: 'Pink', class: 'bg-[#fce7f3]' }
	];

	function handleContextMenu(e: MouseEvent) {
		if (!isFinePointer || !contentEl) return;
		if (!contentEl.contains(e.target as Node)) return;

		// Check for ANY text selection in content — cheap DOM check
		const selection = window.getSelection();
		if (!selection || selection.isCollapsed || !selection.rangeCount) return;
		const text = selection.toString().trim();
		if (!text) return;
		const range = selection.getRangeAt(0);
		if (!contentEl.contains(range.startContainer)) return;

		// PREVENT NATIVE MENU — we know there's selected text in our content
		e.preventDefault();

		// Try to get precise offset info BEFORE clearing selection
		const info = getSelectionInfo(contentEl);
		localSelection = info;
		rawSelectedText = text;

		// Position at cursor, clamping to viewport
		menuX = Math.min(e.clientX, window.innerWidth - 200);
		menuY = Math.min(e.clientY, window.innerHeight - 300);
		showColorSubmenu = false;
		visible = true;
	}

	function close() {
		visible = false;
		showColorSubmenu = false;
		localSelection = null;
		rawSelectedText = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	// --- Actions ---

	function handleHighlight(color: string) {
		if (!localSelection || !requireAuth()) return;
		onHighlightSave({
			nodeId: localSelection.nodeId,
			highlightText: localSelection.selectedText,
			startOffset: localSelection.startOffset,
			endOffset: localSelection.endOffset,
			content: 'Highlight',
			color
		});
		close();
		window.getSelection()?.removeAllRanges();
	}

	function handleAddNote() {
		if (!requireAuth()) return;
		onDismissPopover();
		onOpenNotes();
		close();
	}

	function handleCopyCitation() {
		if (localSelection) {
			const citation = formatCitation(codeNumber, sectionNumber, localSelection.nodeId);
			navigator.clipboard.writeText(citation);
		} else {
			navigator.clipboard.writeText(`${codeNumber} ${sectionNumber}`);
		}
		close();
		window.getSelection()?.removeAllRanges();
	}

	function handleSearch() {
		const text = localSelection?.selectedText ?? rawSelectedText;
		if (!text) return;
		const q = encodeURIComponent(text.slice(0, 200));
		close();
		window.getSelection()?.removeAllRanges();
		goto(`/search?q=${q}`);
	}

	function handleCopyText() {
		const text = localSelection?.selectedText ?? rawSelectedText;
		if (!text) return;
		navigator.clipboard.writeText(text);
		close();
		window.getSelection()?.removeAllRanges();
	}
</script>

<svelte:window onkeydown={visible ? handleKeydown : undefined} />

{#if visible && rawSelectedText}
	<!-- Backdrop -->
	<button
		type="button"
		class="fixed inset-0 z-[60]"
		onclick={close}
		aria-label="Close context menu"
	></button>

	<!-- Menu -->
	<div
		class="fixed z-[60] min-w-[200px] border border-border bg-background py-1 shadow-lg"
		style="top: {menuY}px; left: {menuX}px;"
		role="menu"
	>
		{#if localSelection}
			<!-- Highlight (with color submenu) — needs precise offsets -->
			<div class="relative">
				<button
					type="button"
					role="menuitem"
					class="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
					onclick={() => isAuthenticated ? (showColorSubmenu = !showColorSubmenu) : requireAuth()}
				>
					<svg class="h-3.5 w-3.5 shrink-0 text-muted-foreground" viewBox="0 0 16 16" fill="none">
						<path d="M3 12h10M5.5 2l-3 8h1.5l.75-2h4.5l.75 2h1.5l-3-8h-3zm-.5 4.5L6.5 3h.5l1.5 3.5h-4z" fill="currentColor"/>
					</svg>
					<span>Highlight</span>
					{#if !isAuthenticated}<span class="ml-auto text-[0.625rem] text-muted-foreground/50">Sign in</span>{/if}
					<svg class="ml-auto h-3 w-3 text-muted-foreground" viewBox="0 0 16 16" fill="none">
						<path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</button>
				{#if showColorSubmenu}
					<div class="absolute left-full top-0 ml-1 border border-border bg-background py-2 px-3 shadow-lg">
						<div class="flex gap-2">
							{#each colors as c}
								<button
									type="button"
									onclick={() => handleHighlight(c.value)}
									aria-label="Highlight {c.label}"
									class="h-5 w-5 rounded-full border-2 border-transparent transition-transform hover:scale-110 hover:border-foreground/30 {c.class}"
								></button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Add Note -->
			<button
				type="button"
				role="menuitem"
				class="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
				onclick={handleAddNote}
			>
				<svg class="h-3.5 w-3.5 shrink-0 text-muted-foreground" viewBox="0 0 16 16" fill="none">
					<path d="M3 2h7l3 3v9H3V2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
					<path d="M5 8h6M5 11h4" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
				</svg>
				<span>Add Note</span>
				{#if !isAuthenticated}<span class="ml-auto text-[0.625rem] text-muted-foreground/50">Sign in</span>{/if}
			</button>

			<div class="my-1 border-t border-border"></div>
		{/if}

		<!-- Copy Citation — always available -->
		<button
			type="button"
			role="menuitem"
			class="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
			onclick={handleCopyCitation}
		>
			<svg class="h-3.5 w-3.5 shrink-0 text-muted-foreground" viewBox="0 0 16 16" fill="none">
				<path d="M4 4H2v10h8v-2" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
				<rect x="6" y="2" width="8" height="10" rx="0.5" stroke="currentColor" stroke-width="1.5"/>
			</svg>
			<span>Copy Citation</span>
		</button>

		<!-- Search — always available -->
		<button
			type="button"
			role="menuitem"
			class="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
			onclick={handleSearch}
		>
			<svg class="h-3.5 w-3.5 shrink-0 text-muted-foreground" viewBox="0 0 16 16" fill="none">
				<circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/>
				<path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
			</svg>
			<span>Search</span>
		</button>

		<!-- Copy Text — always available -->
		<button
			type="button"
			role="menuitem"
			class="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
			onclick={handleCopyText}
		>
			<svg class="h-3.5 w-3.5 shrink-0 text-muted-foreground" viewBox="0 0 16 16" fill="none">
				<rect x="5" y="2" width="8" height="10" rx="0.5" stroke="currentColor" stroke-width="1.5"/>
				<path d="M3 4v10h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<span>Copy Text</span>
		</button>
	</div>
{/if}
