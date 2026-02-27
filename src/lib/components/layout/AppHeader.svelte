<script lang="ts">
	import SearchBar from '$lib/components/search/SearchBar.svelte';
	import { authClient } from '$lib/auth/client';
	import { invalidateAll, goto } from '$app/navigation';

	let { titleSlug = '', session = null }: { titleSlug?: string; session?: { id: string; name: string; email: string } | null } = $props();

	async function signOut() {
		await authClient.signOut();
		await invalidateAll();
		goto('/');
	}
</script>

<!-- Thin red accent line at very top -->
<div class="h-[2px] bg-red"></div>
<header class="sticky top-0 z-50 border-b border-border-gray bg-white">
	<div class="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
		<a href="/" class="flex shrink-0 items-center gap-2.5 group">
			<svg class="h-8 w-8 text-red" viewBox="0 0 32 32" fill="none">
				<rect x="4" y="2" width="24" height="28" stroke="currentColor" stroke-width="2" />
				<path d="M10 8h12M10 13h12M10 18h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				<circle cx="24" cy="24" r="6" fill="currentColor" />
				<path d="M22 24l1.5 1.5L26 22.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			<span class="text-lg font-semibold tracking-tight text-ink group-hover:text-red transition-colors">Regulations</span>
		</a>

		<nav class="hidden items-center gap-6 md:flex">
			<a href="/regulations" class="text-sm font-medium text-dark-gray transition-colors hover:text-red">
				Browse
			</a>
		</nav>

		<div class="ml-auto w-full max-w-md">
			<SearchBar />
		</div>

		<div class="mx-2 hidden h-6 w-px bg-border-gray md:block"></div>
		{#if session}
			<div class="flex shrink-0 items-center gap-3">
				<span class="hidden text-sm text-medium-gray md:block">{session.name}</span>
				<a href="/bookmarks" class="text-sm font-medium text-dark-gray transition-colors hover:text-red">
					Bookmarks
				</a>
				<a href="/annotations" class="text-sm font-medium text-dark-gray transition-colors hover:text-red">
					Annotations
				</a>
				<button onclick={signOut} class="text-sm font-medium text-medium-gray transition-colors hover:text-red">
					Sign Out
				</button>
			</div>
		{:else}
			<div class="flex shrink-0 items-center gap-3">
				<a href="/login" class="text-sm font-medium text-dark-gray transition-colors hover:text-red">
					Sign In
				</a>
				<a href="/register" class="rounded-md bg-red px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red/90">
					Register
				</a>
			</div>
		{/if}
	</div>
</header>
