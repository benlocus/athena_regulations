<script lang="ts">
	import Breadcrumbs from '$lib/components/layout/Breadcrumbs.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>All Regulations - MA Regulations Browser</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
	<Breadcrumbs
		items={[
			{ label: 'Home', href: '/' },
			{ label: 'Regulations' }
		]}
	/>

	<h1 class="mb-8 inline-block border-b-2 border-red pb-1.5 font-authority text-3xl font-bold text-ink">All Regulations</h1>

	<div class="space-y-4">
		{#each data.titles as title}
			<a
				href="/regulations/{title.slug}"
				class="group block border border-border-gray bg-white p-6 transition-all hover:border-red/30"
			>
				<div class="flex items-start justify-between gap-4">
					<div class="min-w-0">
						<p class="font-precision text-sm text-red/50 group-hover:text-red/70 transition-colors">
							{title.codeNumber} {title.titleNumber}
						</p>
						<h2 class="mt-1 font-authority text-xl font-semibold text-ink group-hover:text-red transition-colors">
							{title.title}
						</h2>
						{#if title.description}
							<p class="mt-2 text-sm leading-relaxed text-medium-gray">{title.description}</p>
						{/if}
					</div>
					<svg
						class="mt-1 h-5 w-5 shrink-0 text-border-gray transition-all group-hover:translate-x-0.5 group-hover:text-red"
						viewBox="0 0 16 16"
						fill="none"
					>
						<path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</div>
			</a>
		{/each}
	</div>
</div>
