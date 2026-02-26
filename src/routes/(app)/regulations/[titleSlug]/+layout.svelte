<script lang="ts">
	import AppSidebar from '$lib/components/layout/AppSidebar.svelte';

	let { data, children } = $props();
	let sidebarOpen = $state(false);
</script>

<div class="relative flex">
	<AppSidebar
		sections={data.sections}
		titleSlug={data.title.slug}
		bind:open={sidebarOpen}
	/>

	<div class="min-w-0 flex-1">
		<!-- Mobile sidebar toggle -->
		<div class="sticky top-16 z-30 border-b border-border bg-background px-4 py-2 lg:hidden">
			<button
				onclick={() => (sidebarOpen = true)}
				class="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text"
			>
				<svg class="h-4 w-4" viewBox="0 0 16 16" fill="none">
					<path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
				Sections
			</button>
		</div>

		<div class="px-4 py-8 sm:px-6 lg:px-10">
			{@render children()}
		</div>
	</div>
</div>
