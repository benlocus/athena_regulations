<script lang="ts">
	let { data } = $props();

	let totalTitles = $derived(data.codes.reduce((sum, c) => sum + c.titleCount, 0));
	let jurisdictionCount = $derived(data.codes.length);
</script>

<svelte:head>
	<title>Cannabis Regulations Browser</title>
	<meta name="description" content="Browse and search cannabis regulations across multiple jurisdictions." />
</svelte:head>

<!-- Hero -->
<div class="relative border-b border-border bg-muted/40 overflow-hidden">
	<!-- Subtle grid pattern -->
	<div class="pointer-events-none absolute inset-0" style="background-image: radial-gradient(circle, oklch(0.2178 0 0 / 0.04) 1px, transparent 1px); background-size: 24px 24px;"></div>
	<div class="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
		<div class="relative">
			<p class="mb-3 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
				Tenax Regulatory Intelligence
			</p>
			<h1 class="font-serif text-4xl font-bold leading-tight text-foreground lg:text-5xl">
				Cannabis Regulations Browser
			</h1>
			<div class="mt-3 h-0.5 w-16 bg-destructive"></div>
			<p class="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
				Navigate complex cannabis regulations across jurisdictions. Search, bookmark, and annotate
				the official regulatory text used by compliance teams.
			</p>

			<div class="mt-8 flex flex-wrap items-center gap-3">
				<a
					href="/regulations"
					class="inline-flex items-center gap-2 bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground transition-all hover:bg-destructive/90 rounded-sm"
				>
					<svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
						<rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/>
						<path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
					</svg>
					Browse All Regulations
				</a>
				<span class="font-mono text-[0.625rem] text-muted-foreground">
					{totalTitles} titles across {jurisdictionCount} {jurisdictionCount === 1 ? 'jurisdiction' : 'jurisdictions'}
				</span>
			</div>
		</div>
	</div>
</div>

<!-- Jurisdiction cards -->
<div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
	<div class="mb-6 flex items-center justify-between">
		<h2 class="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
			Jurisdictions
		</h2>
		<a href="/regulations" class="group flex items-center gap-1 font-mono text-[0.625rem] text-muted-foreground transition-colors hover:text-foreground">
			View all
			<svg class="h-3 w-3 transition-transform group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none">
				<path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</a>
	</div>

	{#if data.codes.length === 0}
		<div class="border border-border bg-background py-16 text-center rounded-sm">
			<svg class="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" viewBox="0 0 24 24" fill="none">
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
					class="group relative flex flex-col overflow-hidden border border-border bg-background transition-all duration-200 hover:border-destructive/50 hover:shadow-sm rounded-sm"
				>
					<!-- Top accent bar -->
					<div class="h-0.5 w-full bg-border transition-all duration-200 group-hover:bg-destructive/60"></div>

					<div class="flex flex-1 flex-col p-5">
						<div class="mb-4 flex items-start justify-between gap-2">
							<div class="flex items-center gap-2">
								<span class="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.5rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground transition-colors group-hover:border-destructive/30 group-hover:text-destructive/70">
									{code.jurisdiction}
								</span>
							</div>
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
								<svg class="h-3 w-3 text-muted-foreground/60" viewBox="0 0 16 16" fill="none">
									<rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" stroke-width="1.2"/>
									<path d="M5 5h6M5 8h6M5 11h3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
								</svg>
								<span class="font-mono text-[0.625rem] text-muted-foreground">
									{code.titleCount === 1 ? '1 title' : `${code.titleCount} titles`}
								</span>
							</div>
							<span class="font-mono text-[0.5625rem] text-muted-foreground/50 transition-colors group-hover:text-destructive/60">
								Browse →
							</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}

	<!-- Info strip -->
	<div class="mt-10 border border-border rounded-sm bg-muted/30 px-5 py-4">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-start gap-3">
				<svg class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2"/>
					<path d="M8 7v4M8 5.5v.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
				</svg>
				<p class="text-xs text-muted-foreground leading-relaxed">
					This browser provides unofficial reference copies of cannabis regulations for informational
					purposes. Always consult official government sources for authoritative regulatory text.
				</p>
			</div>
			<a
				href="/regulations"
				class="shrink-0 font-mono text-[0.625rem] font-semibold uppercase tracking-wider text-destructive transition-colors hover:text-foreground"
			>
				Start Browsing
			</a>
		</div>
	</div>
</div>
