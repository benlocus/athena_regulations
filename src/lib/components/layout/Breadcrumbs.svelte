<script lang="ts">
	type Crumb = {
		label: string;
		href?: string;
	};

	let { items }: { items: Crumb[] } = $props();
</script>

<nav aria-label="Breadcrumb" class="mb-6">
	<ol class="flex flex-wrap items-center gap-1.5 text-sm text-medium-gray">
		{#each items as crumb, i}
			{#if i > 0}
				<li aria-hidden="true" class="text-border-gray">/</li>
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
