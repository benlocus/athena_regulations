<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Cannabis Regulations Browser</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
	<!-- Hero section -->
	<div class="mb-14 text-center">
		<h1 class="inline-block border-b-2 border-red pb-2.5 font-authority text-4xl font-bold text-ink lg:text-5xl">
			Cannabis Regulations Browser
		</h1>
		<p class="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-medium-gray">
			Browse and search cannabis regulations across multiple jurisdictions.
		</p>
	</div>

	<!-- Jurisdiction groups -->
	{#each data.jurisdictions as jurisdiction}
		<div class="mb-10">
			<h2 class="mb-4 font-authority text-2xl font-semibold text-ink">{jurisdiction.name}</h2>
			<div class="space-y-4">
				{#each jurisdiction.titles as title}
					<a
						href="/regulations/{title.slug}"
						class="group block border border-border-gray bg-white p-6 transition-all hover:border-red/30"
					>
						<div class="flex items-start justify-between gap-4">
							<div class="min-w-0">
								<p class="font-precision text-sm text-red/50 group-hover:text-red/70 transition-colors">
									{title.codeNumber} {title.titleNumber}
								</p>
								<h3 class="mt-1 font-authority text-xl font-semibold text-ink group-hover:text-red transition-colors">
									{title.title}
								</h3>
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
	{/each}

	{#if data.jurisdictions.length === 0}
		<div class="border border-border-gray bg-white py-16 text-center">
			<p class="text-medium-gray">No regulations available yet.</p>
		</div>
	{/if}
</div>
