<script lang="ts">
	import { cn } from '$lib/utils/cn';

	let { data } = $props();

	const colorMap: Record<string, string> = {
		yellow: 'bg-highlight-yellow',
		blue: 'bg-highlight-blue',
		green: 'bg-highlight-green',
		pink: 'bg-highlight-pink'
	};

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Annotations | Regulations</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8">
	<div class="mb-6">
		<h1 class="inline-block border-b-2 border-red pb-1.5 font-authority text-2xl font-bold text-ink">Your Annotations</h1>
		<p class="mt-1 text-sm text-medium-gray">Notes and highlights across all regulations</p>
	</div>

	{#if data.annotations.length === 0}
		<div class="border border-border-gray bg-white py-12 text-center">
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
					d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
				/>
			</svg>
			<p class="text-medium-gray">No annotations yet</p>
			<p class="mt-1 text-sm text-medium-gray">
				Add notes and highlights while reading regulations
			</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each data.annotations as annotation (annotation.id)}
				<a
					href="/regulations/{annotation.titleSlug}/{annotation.sectionSlug}"
					class="block border-b border-border-gray transition-colors hover:bg-light-gray"
				>
					<div class="p-4">
						<div class="mb-2 flex items-start justify-between gap-3">
							<div class="min-w-0 flex-1">
								<p class="text-sm font-medium text-ink">
									{annotation.sectionNumber}
									{annotation.sectionHeading}
								</p>
								<p class="text-xs text-medium-gray">{annotation.titleName}</p>
							</div>
							<div class="flex items-center gap-2">
								<span
									class={cn(
										'h-3 w-3',
										colorMap[annotation.color] ?? colorMap.yellow
									)}
								></span>
								<span class="shrink-0 text-xs text-medium-gray">
									{formatDate(annotation.updatedAt)}
								</span>
							</div>
						</div>

						{#if annotation.highlightText}
							<p class="mb-1.5 text-xs italic text-medium-gray">
								"{annotation.highlightText}"
							</p>
						{/if}

						<p class="line-clamp-2 text-sm text-dark-gray">{annotation.content}</p>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
