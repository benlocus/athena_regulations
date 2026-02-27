<script lang="ts">
	type Crumb = {
		label: string;
		href?: string;
	};

	let { items }: { items: Crumb[] } = $props();
</script>

<nav aria-label="Breadcrumb" class="sticky top-16 z-20 mb-6 border-b border-border-gray bg-light-gray/50 px-4 py-2.5 rounded">
	<ol class="flex flex-wrap items-center gap-1.5 text-sm text-medium-gray">
		{#each items as crumb, i}
			{#if i > 0}
				<li aria-hidden="true" class="text-border-gray"><svg class="h-3.5 w-3.5 text-border-gray" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg></li>
			{/if}
			<li>
				{#if crumb.href && i < items.length - 1}
					<a href={crumb.href} class="transition-colors hover:text-red hover:underline">
						{crumb.label}
					</a>
				{:else}
					<span class="font-medium text-dark-gray">{crumb.label}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
