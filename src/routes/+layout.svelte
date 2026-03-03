<script lang="ts">
	import '../app.css';
	import AppHeader from '$lib/components/layout/AppHeader.svelte';
	import AppFooter from '$lib/components/layout/AppFooter.svelte';
	import DocsSidebar from '$lib/components/layout/DocsSidebar.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { page } from '$app/stores';

	let { children, data } = $props();
	let sidebarOpen = $state(false);

	let isAuthPage = $derived(
		$page.url.pathname === '/login' || $page.url.pathname === '/register'
	);
</script>

<svelte:head>
	<title>Regulations Browser</title>
	<meta name="description" content="Browse cannabis regulations" />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<AppHeader session={data.session} onToggleSidebar={isAuthPage ? undefined : () => (sidebarOpen = !sidebarOpen)} />
	<div class="flex flex-1">
		{#if !isAuthPage}
			<DocsSidebar navigation={data.navigation} bind:open={sidebarOpen} />
		{/if}
		<main class="min-w-0 flex-1">
			<Tooltip.Provider>
				{@render children()}
			</Tooltip.Provider>
		</main>
	</div>
	{#if !isAuthPage}
		<AppFooter />
	{/if}
</div>
<Toaster />
