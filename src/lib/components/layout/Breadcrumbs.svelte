<script lang="ts">
	type Crumb = {
		label: string;
		href?: string;
	};

	let { items }: { items: Crumb[] } = $props();
</script>

<nav aria-label="Breadcrumb" class="sticky top-12 z-20 mb-8 border-b border-border bg-background/95 backdrop-blur-sm px-0 py-2.5">
	<ol class="flex flex-wrap items-center gap-0 text-xs text-muted-foreground">
		{#each items as crumb, i}
			{#if i > 0}
				<li aria-hidden="true" class="mx-1.5 text-border select-none">/</li>
			{/if}
			<li>
				{#if crumb.href && i < items.length - 1}
					<a href={crumb.href} class="hover:text-foreground transition-colors duration-100">
						{crumb.label}
					</a>
				{:else}
					<span class="text-foreground font-medium">{crumb.label}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
