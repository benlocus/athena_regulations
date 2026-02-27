<script lang="ts">
	import { page } from '$app/stores';

	type SidebarSection = {
		sectionNumber: string;
		heading: string;
		slug: string;
		isRepealed: boolean;
	};

	let {
		sections,
		titleSlug,
		open = $bindable(false)
	}: {
		sections: SidebarSection[];
		titleSlug: string;
		open?: boolean;
	} = $props();

	function closeSidebar() {
		open = false;
	}
</script>

<!-- Mobile overlay -->
{#if open}
	<div
		class="fixed inset-0 z-40 bg-ink/40 lg:hidden"
		role="button"
		tabindex="-1"
		onclick={closeSidebar}
		onkeydown={(e) => e.key === 'Escape' && closeSidebar()}
	></div>
{/if}

<aside
	class="fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-72 shrink-0 overflow-y-auto border-r border-border-gray bg-white transition-transform lg:sticky lg:translate-x-0 {open ? 'translate-x-0' : '-translate-x-full'}"
>
	<nav class="p-4">
		<h2 class="mb-3 font-precision text-[0.625rem] uppercase tracking-[0.2em] text-medium-gray">Sections</h2>
		<ul class="space-y-0.5">
			{#each sections as section}
				{@const href = `/regulations/${titleSlug}/${section.slug}`}
				{@const isActive = $page.url.pathname === href}
				<li>
					<a
						{href}
						onclick={closeSidebar}
						class="block px-3 py-2 text-sm transition-colors {isActive
							? 'border-l-2 border-red pl-3 font-medium text-ink bg-red/[0.03]'
							: 'pl-3 text-medium-gray hover:bg-light-gray hover:text-dark-gray hover:border-l-2 hover:border-red/20'} {section.isRepealed ? 'line-through opacity-60' : ''}"
					>
						<span class="font-precision text-xs {isActive ? 'text-red/60' : 'text-medium-gray'}">{section.sectionNumber}</span>
						<span class="ml-1.5">{section.heading}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</aside>
