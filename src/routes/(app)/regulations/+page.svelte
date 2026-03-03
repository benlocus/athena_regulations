<script lang="ts">
	import Breadcrumbs from '$lib/components/layout/Breadcrumbs.svelte';

	let { data } = $props();

	let totalTitles = $derived(data.codes.reduce((sum, c) => sum + c.titleCount, 0));
</script>

<svelte:head>
	<title>All Regulations - Regulations Browser</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
	<Breadcrumbs
		items={[
			{ label: 'Home', href: '/' },
			{ label: 'Regulations' }
		]}
	/>

	<div class="mb-8">
		<h1 class="font-serif text-3xl font-bold text-foreground">All Regulations</h1>
		<div class="mt-2 h-0.5 w-12 bg-destructive"></div>
		{#if data.codes.length > 0}
			<p class="mt-3 text-xs text-muted-foreground">
				{data.codes.length} {data.codes.length === 1 ? 'jurisdiction' : 'jurisdictions'} &middot;
				{totalTitles} total titles
			</p>
		{/if}
	</div>

	{#if data.codes.length === 0}
		<div class="rounded-sm border border-border bg-background py-16 text-center">
			<svg class="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" viewBox="0 0 24 24" fill="none">
				<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/>
				<path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
			</svg>
			<p class="text-sm text-muted-foreground">No regulations available yet.</p>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.codes as code}
				<a
					href="/regulations/{code.slug}"
					class="group relative flex flex-col overflow-hidden rounded-sm border border-border bg-background transition-all duration-200 hover:border-destructive/50 hover:shadow-sm"
				>
					<!-- Top accent bar -->
					<div class="h-0.5 w-full bg-border transition-all duration-200 group-hover:bg-destructive/60"></div>

					<div class="flex flex-1 flex-col p-5">
						<div class="mb-4 flex items-start justify-between gap-2">
							<span class="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.5rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground transition-colors group-hover:border-destructive/30 group-hover:text-destructive/70">
								{code.jurisdiction}
							</span>
							<svg
								class="h-3.5 w-3.5 shrink-0 text-border transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-destructive"
								viewBox="0 0 16 16"
								fill="none"
							>
								<path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						</div>

						<div class="mb-auto">
							<p class="font-mono text-sm font-semibold text-muted-foreground transition-colors group-hover:text-destructive">
								{code.codeNumber}
							</p>
							<h2 class="mt-1 font-serif text-lg font-semibold leading-snug text-foreground">
								{code.title}
							</h2>
						</div>

						<div class="mt-5 flex items-center justify-between border-t border-border pt-4">
							<div class="flex items-center gap-1.5">
								<svg class="h-3 w-3 text-muted-foreground/50" viewBox="0 0 16 16" fill="none">
									<rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" stroke-width="1.2"/>
									<path d="M5 5h6M5 8h6M5 11h3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
								</svg>
								<span class="font-mono text-[0.625rem] text-muted-foreground">
									{code.titleCount} {code.titleCount === 1 ? 'title' : 'titles'}
								</span>
							</div>
							<span class="font-mono text-[0.5625rem] text-muted-foreground/40 transition-colors group-hover:text-destructive/60">
								Browse →
							</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
