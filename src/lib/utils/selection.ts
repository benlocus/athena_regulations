/**
 * Computes display-text offsets from a DOM text selection within a ContentNode.
 * Offsets correspond to character positions in the node's display text
 * (after {{ref:...}} markers are replaced with their display text).
 */
export type SelectionInfo = {
	nodeId: string;
	selectedText: string;
	startOffset: number;
	endOffset: number;
	rect: DOMRect;
};

/**
 * Walk the DOM tree under `root`, counting text content characters.
 * Returns the character offset of the given DOM node/offset pair.
 */
function computeTextOffset(root: HTMLElement, targetNode: Node, targetOffset: number): number {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	let offset = 0;

	let current = walker.nextNode();
	while (current) {
		if (current === targetNode) {
			return offset + targetOffset;
		}
		offset += (current as Text).length;
		current = walker.nextNode();
	}

	return offset;
}

/**
 * Find the closest ancestor element with an `id` attribute that represents
 * a ContentNode (has the group/scroll-mt-20 pattern).
 */
function findContentNodeEl(node: Node): HTMLElement | null {
	let el: HTMLElement | null = node instanceof HTMLElement ? node : node.parentElement;
	while (el) {
		if (el.id && el.classList.contains('group') && el.classList.contains('scroll-mt-20')) {
			return el;
		}
		el = el.parentElement;
	}
	return null;
}

/**
 * Find the actual text-content element (p, dd) inside a ContentNode div
 * that contains the given DOM node. This is the element whose text content
 * maps to the node's parsed segments.
 */
function findTextContainer(nodeEl: HTMLElement, textNode: Node): HTMLElement | null {
	// Walk up from the text node to find the nearest p/dd/dt that is a
	// direct (non-nested-ContentNode) text container inside nodeEl.
	let el: HTMLElement | null = textNode instanceof HTMLElement ? textNode : textNode.parentElement;
	while (el && el !== nodeEl) {
		// If we hit a nested ContentNode div (a child node's wrapper), bail
		if (el !== nodeEl && el.id && el.classList.contains('group') && el.classList.contains('scroll-mt-20')) {
			return null;
		}
		if (el.tagName === 'P' || el.tagName === 'DD') {
			return el;
		}
		el = el.parentElement;
	}
	return null;
}

/**
 * Given a container element (the regulation-content wrapper), extract
 * selection info including the ContentNode id and display-text offsets.
 */
export function getSelectionInfo(containerEl: HTMLElement): SelectionInfo | null {
	const selection = window.getSelection();
	if (!selection || selection.isCollapsed || !selection.rangeCount) return null;

	const range = selection.getRangeAt(0);

	// Ensure selection is within our container
	if (!containerEl.contains(range.startContainer) || !containerEl.contains(range.endContainer)) {
		return null;
	}

	const selectedText = selection.toString().trim();
	if (!selectedText) return null;

	// Find the ContentNode elements for start and end
	const startNodeEl = findContentNodeEl(range.startContainer);
	const endNodeEl = findContentNodeEl(range.endContainer);

	if (!startNodeEl || !endNodeEl) return null;

	// Only support selection within a single ContentNode for now
	if (startNodeEl.id !== endNodeEl.id) return null;

	const nodeId = startNodeEl.id;

	// Find the text container (p/dd) to compute offsets relative to
	// the rendered content segments, not the entire node wrapper.
	const startTextContainer = findTextContainer(startNodeEl, range.startContainer);
	const endTextContainer = findTextContainer(startNodeEl, range.endContainer);

	if (!startTextContainer || !endTextContainer) return null;

	// Both must be the same text container
	if (startTextContainer !== endTextContainer) return null;

	const startOffset = computeTextOffset(startTextContainer, range.startContainer, range.startOffset);
	const endOffset = computeTextOffset(startTextContainer, range.endContainer, range.endOffset);

	if (startOffset === endOffset) return null;

	return {
		nodeId,
		selectedText,
		startOffset: Math.min(startOffset, endOffset),
		endOffset: Math.max(startOffset, endOffset),
		rect: range.getBoundingClientRect()
	};
}
