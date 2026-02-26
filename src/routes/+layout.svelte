<script lang="ts">
	import '../app.css';
	import AppHeader from '$lib/components/layout/AppHeader.svelte';
	import AppFooter from '$lib/components/layout/AppFooter.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>MA Regulations Browser</title>
	<meta name="description" content="Browse Massachusetts Code of Regulations" />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<AppHeader />
	<main class="flex-1">
		{@render children()}
	</main>
	<AppFooter />
</div>
