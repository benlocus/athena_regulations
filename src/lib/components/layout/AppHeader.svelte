<script lang="ts">
	import SearchBar from '$lib/components/search/SearchBar.svelte';
	import { authClient } from '$lib/auth/client';
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/stores';

	let {
		titleSlug = '',
		session = null,
		onToggleSidebar
	}: {
		titleSlug?: string;
		session?: { id: string; name: string; email: string } | null;
		onToggleSidebar?: () => void;
	} = $props();

	async function signOut() {
		await authClient.signOut();
		await invalidateAll();
		goto('/');
	}

	let isOnAuthPage = $derived(
		$page.url.pathname === '/login' || $page.url.pathname === '/register'
	);
</script>

<header class="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
	<div class="mx-auto flex h-12 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
		<!-- Mobile sidebar toggle -->
		{#if onToggleSidebar && !isOnAuthPage}
			<button
				onclick={onToggleSidebar}
				class="mr-1 rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
				aria-label="Toggle sidebar"
			>
				<svg class="h-4 w-4" viewBox="0 0 16 16" fill="none">
					<path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			</button>
		{/if}

		<!-- Logo -->
		<a href="/" class="group flex shrink-0 items-center gap-2">
			<div class="relative">
				<svg class="h-5 w-5 text-foreground transition-colors group-hover:text-destructive" viewBox="0 0 32 32" fill="none">
					<rect x="4" y="2" width="24" height="28" stroke="currentColor" stroke-width="2" />
					<path d="M10 8h12M10 13h12M10 18h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					<circle cx="24" cy="24" r="6" fill="currentColor" />
					<path d="M22 24l1.5 1.5L26 22.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</div>
			<span class="text-sm font-semibold tracking-tight text-foreground transition-colors group-hover:text-destructive">
				Regulations
			</span>
		</a>

		<!-- Nav links -->
		<nav class="hidden items-center gap-1 md:flex">
			<div class="mx-1 h-4 w-px bg-border"></div>
			<a
				href="/regulations"
				class="rounded-sm px-2 py-1 text-xs font-medium transition-colors
					{$page.url.pathname.startsWith('/regulations')
					? 'text-foreground'
					: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
			>
				Browse
			</a>
		</nav>

		<!-- Search bar -->
		<div class="ml-auto min-w-0 flex-1 max-w-sm lg:max-w-md">
			<SearchBar />
		</div>

		<!-- Divider -->
		<div class="hidden h-4 w-px shrink-0 bg-border md:block"></div>

		<!-- User section -->
		{#if session}
			<div class="flex shrink-0 items-center gap-3">
				<span class="hidden max-w-[120px] truncate text-xs text-muted-foreground md:block" title={session.name}>
					{session.name}
				</span>
				<a
					href="/bookmarks"
					class="hidden text-xs font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
				>
					Bookmarks
				</a>
				<a
					href="/annotations"
					class="hidden text-xs font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
				>
					Annotations
				</a>
				<button
					onclick={signOut}
					class="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					Sign Out
				</button>
			</div>
		{:else}
			<div class="flex shrink-0 items-center gap-2">
				<a
					href="/login"
					class="hidden text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
				>
					Sign In
				</a>
				<a
					href="/register"
					class="rounded-sm bg-destructive px-2.5 py-1 text-xs font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
				>
					Register
				</a>
			</div>
		{/if}
	</div>
</header>
