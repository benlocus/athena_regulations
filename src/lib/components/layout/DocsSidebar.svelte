<script lang="ts">
	import { page } from '$app/stores';
	import { untrack } from 'svelte';
	import { slide } from 'svelte/transition';

	type NavTitle = {
		id: string;
		titleNumber: string;
		title: string;
		slug: string;
		sectionCount: number;
	};

	type NavCode = {
		id: string;
		codeNumber: string;
		title: string;
		jurisdiction: string;
		slug: string;
		titles: NavTitle[];
	};

	let {
		navigation,
		open = $bindable(false)
	}: {
		navigation: NavCode[];
		open?: boolean;
	} = $props();

	let filterQuery = $state('');
	let expandedCodes = $state<Set<string>>(new Set());

	// Auto-expand based on current URL
	$effect(() => {
		const pathname = $page.url.pathname;
		const codes = navigation;

		const toExpand: string[] = [];
		for (const code of codes) {
			if (pathname.startsWith(`/regulations/${code.slug}`)) {
				toExpand.push(code.id);
			}
			for (const title of code.titles) {
				if (pathname.startsWith(`/regulations/${title.slug}`)) {
					toExpand.push(code.id);
				}
			}
		}

		if (toExpand.length > 0) {
			untrack(() => {
				for (const id of toExpand) {
					expandedCodes.add(id);
				}
				expandedCodes = new Set(expandedCodes);
			});
		}
	});

	// Auto-expand all when filtering
	$effect(() => {
		if (filterQuery.trim()) {
			untrack(() => {
				const allIds = navigation.map((c) => c.id);
				expandedCodes = new Set(allIds);
			});
		}
	});

	function toggleCode(codeId: string) {
		if (expandedCodes.has(codeId)) {
			expandedCodes.delete(codeId);
		} else {
			expandedCodes.add(codeId);
		}
		expandedCodes = new Set(expandedCodes);
	}

	function closeSidebar() {
		open = false;
	}

	function isTitleActive(titleSlug: string): boolean {
		return $page.url.pathname.startsWith(`/regulations/${titleSlug}`);
	}

	function isCodeActive(code: NavCode): boolean {
		return (
			$page.url.pathname === `/regulations/${code.slug}` ||
			code.titles.some((t) => isTitleActive(t.slug))
		);
	}

	// Filtered navigation
	let filteredNavigation = $derived.by(() => {
		const q = filterQuery.trim().toLowerCase();
		if (!q) return navigation;
		return navigation
			.map((code) => ({
				...code,
				titles: code.titles.filter(
					(t) =>
						t.title.toLowerCase().includes(q) ||
						t.titleNumber.toLowerCase().includes(q) ||
						code.codeNumber.toLowerCase().includes(q) ||
						code.jurisdiction.toLowerCase().includes(q)
				)
			}))
			.filter(
				(code) =>
					code.titles.length > 0 ||
					code.codeNumber.toLowerCase().includes(q) ||
					code.jurisdiction.toLowerCase().includes(q)
			);
	});

	let totalTitles = $derived(navigation.reduce((sum, c) => sum + c.titles.length, 0));
</script>

<!-- Mobile overlay -->
{#if open}
	<div
		class="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[1px] lg:hidden"
		role="button"
		tabindex="-1"
		onclick={closeSidebar}
		onkeydown={(e) => e.key === 'Escape' && closeSidebar()}
	></div>
{/if}

<aside
	class="fixed top-12 left-0 z-40 h-[calc(100vh-3rem)] w-64 shrink-0 overflow-hidden border-r border-border bg-background transition-transform duration-200 ease-in-out lg:sticky lg:translate-x-0 {open
		? 'translate-x-0 shadow-xl'
		: '-translate-x-full'}"
>
	<div class="flex h-full flex-col">
		<!-- Filter input -->
		<div class="border-b border-border px-3 py-2.5">
			<div class="relative">
				<svg
					class="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/60"
					viewBox="0 0 16 16"
					fill="none"
				>
					<circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.2" />
					<path d="M10.5 10.5l2.5 2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
				</svg>
				<input
					type="text"
					bind:value={filterQuery}
					placeholder="Filter titles…"
					class="h-6 w-full rounded-sm border border-border bg-muted pl-6 pr-2 font-mono text-[0.6875rem] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none focus:ring-0"
				/>
				{#if filterQuery}
					<button
						onclick={() => (filterQuery = '')}
						aria-label="Clear filter"
						class="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
					>
						<svg class="h-3 w-3" viewBox="0 0 16 16" fill="none">
							<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
						</svg>
					</button>
				{/if}
			</div>
		</div>

		<!-- Scrollable nav -->
		<nav class="flex-1 overflow-y-auto p-3">
			<!-- Top links -->
			<div class="mb-2 space-y-0.5">
				<a
					href="/"
					onclick={closeSidebar}
					class="flex items-center gap-2 rounded-sm px-2 py-1.5 text-xs font-medium transition-colors
						{$page.url.pathname === '/'
						? 'bg-destructive/8 text-destructive'
						: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
				>
					<svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
						<path
							d="M2 8l6-6 6 6M4 7v6h3v-3h2v3h3V7"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					Home
				</a>

				<a
					href="/regulations"
					onclick={closeSidebar}
					class="flex items-center gap-2 rounded-sm px-2 py-1.5 text-xs font-medium transition-colors
						{$page.url.pathname === '/regulations'
						? 'bg-destructive/8 text-destructive'
						: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
				>
					<svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
						<rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" stroke-width="1.5" />
						<path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" stroke-width="1" stroke-linecap="round" />
					</svg>
					All Regulations
					<span class="ml-auto font-mono text-[0.5rem] text-muted-foreground/60">{totalTitles}</span>
				</a>
			</div>

			<div class="mb-2 border-t border-border"></div>

			<!-- Section header -->
			<div class="mb-1.5 px-2">
				<h2 class="font-mono text-[0.5rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
					{filterQuery ? 'Results' : 'Codes'}
				</h2>
			</div>

			<!-- Code tree -->
			{#if filteredNavigation.length === 0}
				<div class="px-2 py-4 text-center">
					<p class="font-mono text-[0.625rem] text-muted-foreground/60">No titles match "{filterQuery}"</p>
				</div>
			{:else}
				<div class="space-y-px">
					{#each filteredNavigation as code (code.id)}
						{@const codeActive = isCodeActive(code)}
						{@const expanded = expandedCodes.has(code.id)}
						<div>
							<!-- Code toggle button -->
							<button
								onclick={() => toggleCode(code.id)}
								class="group flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs transition-colors
									{codeActive
									? 'font-semibold text-destructive'
									: 'font-medium text-foreground hover:bg-muted'}"
							>
								<svg
									class="h-2.5 w-2.5 shrink-0 text-muted-foreground transition-transform duration-150 {expanded
										? 'rotate-90'
										: ''}"
									viewBox="0 0 16 16"
									fill="none"
								>
									<path
										d="M6 3l5 5-5 5"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
								<span class="truncate font-mono text-[0.6875rem]">{code.codeNumber}</span>
								<span class="ml-auto shrink-0 font-mono text-[0.5rem] text-muted-foreground/50">
									{code.titles.length}
								</span>
							</button>

							<!-- Expanded title list -->
							{#if expanded}
								<div transition:slide={{ duration: 150 }} class="overflow-hidden">
									<!-- Jurisdiction badge -->
									<div class="mb-1 ml-6 mt-0.5">
										<span class="font-mono text-[0.5rem] uppercase tracking-[0.12em] text-muted-foreground/60">
											{code.jurisdiction}
										</span>
									</div>

									<!-- Titles list -->
									<div class="ml-4 border-l border-border">
										{#each code.titles as title (title.id)}
											{@const active = isTitleActive(title.slug)}
											<a
												href="/regulations/{title.slug}"
												onclick={closeSidebar}
												class="group flex items-baseline gap-1.5 py-1 pl-3 pr-2 transition-colors
													{active
													? '-ml-px border-l-2 border-destructive bg-destructive/5 font-medium text-destructive'
													: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
											>
												<span
													class="shrink-0 font-mono text-[0.5625rem] {active
														? 'text-destructive/60'
														: 'text-muted-foreground/50 group-hover:text-muted-foreground'}"
												>
													{title.titleNumber}
												</span>
												<span class="min-w-0 text-[0.6875rem] leading-snug">{title.title}</span>
												{#if title.sectionCount > 0}
													<span class="ml-auto shrink-0 font-mono text-[0.5rem] text-muted-foreground/40 group-hover:text-muted-foreground/60">
														{title.sectionCount}
													</span>
												{/if}
											</a>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</nav>
	</div>
</aside>
