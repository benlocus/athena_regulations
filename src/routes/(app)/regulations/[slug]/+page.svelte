<script lang="ts">
	import Breadcrumbs from '$lib/components/layout/Breadcrumbs.svelte';
	import SectionToc from '$lib/components/regulation/SectionToc.svelte';

	let { data } = $props();
</script>

<svelte:head>
	{#if data.kind === 'title'}
		<title>{data.title.codeNumber} {data.title.titleNumber}: {data.title.title} - Regulations</title>
	{:else}
		<title>{data.code.codeNumber}: {data.code.title} - Regulations</title>
	{/if}
</svelte:head>

{#if data.kind === 'title'}
	<div class="mx-auto max-w-4xl px-4 py-8">
		<Breadcrumbs
			items={[
				{ label: 'Home', href: '/' },
				{ label: 'Regulations', href: '/regulations' },
				{ label: `${data.title.titleNumber}` }
			]}
		/>

		<div class="mb-8">
			<p class="font-mono text-xs text-muted-foreground">
				{data.title.codeNumber} {data.title.titleNumber}
			</p>
			<h1 class="mt-1 inline-block border-b-2 border-destructive pb-1.5 font-serif text-3xl font-bold text-foreground">
				{data.title.title}
			</h1>
			{#if data.title.description}
				<p class="mt-3 text-muted-foreground">{data.title.description}</p>
			{/if}
		</div>

		<SectionToc sections={data.sections} titleSlug={data.title.slug} />
	</div>
{:else}
	<div class="mx-auto max-w-4xl px-4 py-8">
		<Breadcrumbs
			items={[
				{ label: 'Home', href: '/' },
				{ label: 'Regulations', href: '/regulations' },
				{ label: data.code.codeNumber }
			]}
		/>

		<div class="mb-8">
			<p class="font-mono text-xs uppercase tracking-wider text-muted-foreground">{data.code.jurisdiction}</p>
			<h1 class="mt-1 inline-block border-b-2 border-destructive pb-1.5 font-serif text-3xl font-bold text-foreground">
				{data.code.title}
			</h1>
			<p class="mt-3 text-muted-foreground">{data.code.codeNumber} &mdash; {data.codeTitles.length} titles</p>
		</div>

		<div class="overflow-hidden border border-border bg-background">
			<div class="border-b border-border bg-muted px-5 py-3">
				<h2 class="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
					Titles
				</h2>
			</div>
			<ul class="divide-y divide-border">
				{#each data.codeTitles as title}
					<li class="even:bg-muted/30">
						<a
							href="/regulations/{title.slug}"
							class="group flex items-baseline gap-3 px-5 py-3 transition-colors hover:bg-muted"
						>
							<span class="shrink-0 font-mono text-sm text-muted-foreground group-hover:text-destructive transition-colors">
								{title.titleNumber}
							</span>
							<span class="text-sm font-medium text-foreground group-hover:text-foreground transition-colors">
								{title.title}
							</span>
							<span class="ml-auto shrink-0 font-mono text-xs text-muted-foreground">
								{title.sectionCount} sections
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}
