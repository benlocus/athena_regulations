<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		sectionId: string;
		nodeId?: string | null;
		isBookmarked?: boolean;
		class?: string;
		onToggle?: (bookmarked: boolean) => void;
	};

	let { sectionId, nodeId = null, isBookmarked = false, class: className, onToggle }: Props = $props();

	let bookmarked = $state(isBookmarked);
	let loading = $state(false);

	async function toggle() {
		if (loading) return;
		loading = true;
		const wasBookmarked = bookmarked;

		try {
			if (bookmarked) {
				const res = await fetch('/api/v1/bookmarks', {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ sectionId, nodeId })
				});
				if (res.ok) {
					bookmarked = false;
					onToggle?.(false);
				}
			} else {
				const res = await fetch('/api/v1/bookmarks', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ sectionId, nodeId })
				});
				if (res.ok) {
					bookmarked = true;
					onToggle?.(true);
				}
			}
		} catch {
			bookmarked = wasBookmarked;
		} finally {
			loading = false;
		}
	}
</script>

<button
	type="button"
	onclick={toggle}
	disabled={loading}
	title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
	class={cn(
		'inline-flex items-center justify-center p-1.5 transition-colors',
		bookmarked
			? 'text-red hover:text-red'
			: 'text-medium-gray hover:text-red',
		loading && 'opacity-50',
		className
	)}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill={bookmarked ? 'currentColor' : 'none'}
		stroke="currentColor"
		stroke-width="2"
		class="h-5 w-5"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0z"
		/>
	</svg>
</button>
