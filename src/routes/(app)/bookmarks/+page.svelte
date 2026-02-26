<script lang="ts">
	import BookmarkList from '$lib/components/user/BookmarkList.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Bookmarks | Regulations</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8">
	<div class="mb-6">
		<h1 class="font-serif text-2xl font-bold text-primary">Your Bookmarks</h1>
		<p class="mt-1 text-sm text-text-muted">
			Saved regulation sections for quick reference
		</p>
	</div>

	<div class="overflow-hidden rounded-lg border border-border bg-surface">
		<BookmarkList bookmarks={data.bookmarks} />
	</div>
</div>
