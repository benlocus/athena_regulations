<script lang="ts">
	import BookmarkList from '$lib/components/user/BookmarkList.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Bookmarks | Regulations</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8">
	<div class="mb-6">
		<h1 class="inline-block border-b-2 border-destructive pb-1.5 font-serif text-2xl font-bold text-foreground">Your Bookmarks</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Saved regulation sections for quick reference
		</p>
	</div>

	<div class="overflow-hidden border border-border bg-background">
		<BookmarkList bookmarks={data.bookmarks} />
	</div>
</div>
