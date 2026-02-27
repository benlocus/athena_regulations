<script lang="ts">
	type BookmarkItem = {
		id: string;
		sectionId: string;
		nodeId: string | null;
		label: string | null;
		createdAt: string;
		sectionNumber: string;
		sectionHeading: string;
		sectionSlug: string;
		titleSlug: string;
		titleName: string;
	};

	type Props = {
		bookmarks: BookmarkItem[];
	};

	let { bookmarks }: Props = $props();

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

{#if bookmarks.length === 0}
	<div class="py-12 text-center">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			class="mx-auto mb-3 h-12 w-12 text-medium-gray"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0z"
			/>
		</svg>
		<p class="text-medium-gray">No bookmarks yet</p>
		<p class="mt-1 text-sm text-medium-gray">
			Bookmark regulation sections for quick access
		</p>
	</div>
{:else}
	<ul class="divide-y divide-border-gray">
		{#each bookmarks as bookmark (bookmark.id)}
			<li>
				<a
					href="/regulations/{bookmark.titleSlug}/{bookmark.sectionSlug}"
					class="block px-4 py-3 transition-colors hover:bg-light-gray"
				>
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0 flex-1">
							<p class="font-medium text-ink">
								{bookmark.sectionNumber}
								{bookmark.sectionHeading}
							</p>
							<p class="mt-0.5 text-sm text-medium-gray">
								{bookmark.titleName}
							</p>
							{#if bookmark.label}
								<p class="mt-1 text-sm text-medium-gray">{bookmark.label}</p>
							{/if}
						</div>
						<span class="shrink-0 text-xs text-medium-gray">
							{formatDate(bookmark.createdAt)}
						</span>
					</div>
				</a>
			</li>
		{/each}
	</ul>
{/if}
