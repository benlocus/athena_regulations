<script lang="ts">
	import '../app.css';
	import AppHeader from '$lib/components/layout/AppHeader.svelte';
	import AppFooter from '$lib/components/layout/AppFooter.svelte';

	let { children, data } = $props();
</script>

<svelte:head>
	<title>Regulations Browser</title>
	<meta name="description" content="Browse cannabis regulations" />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<AppHeader session={data.session} />
	<main class="flex-1">
		{@render children()}
	</main>
	<AppFooter />
</div>
