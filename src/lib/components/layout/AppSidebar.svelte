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
		class="fixed inset-0 z-40 bg-foreground/30 lg:hidden"
		role="button"
		tabindex="-1"
		onclick={closeSidebar}
		onkeydown={(e) => e.key === 'Escape' && closeSidebar()}
	></div>
{/if}

<aside
	class="fixed top-12 left-0 z-40 h-[calc(100vh-3rem)] w-60 shrink-0 overflow-y-auto border-r border-border bg-sidebar transition-transform lg:sticky lg:translate-x-0 {open ? 'translate-x-0' : '-translate-x-full'}"
>
	<nav class="py-3">
		<div class="px-4 pb-2">
			<h2 class="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground">Sections</h2>
		</div>
		<ul>
			{#each sections as section}
				{@const href = `/regulations/${titleSlug}/${section.slug}`}
				{@const isActive = $page.url.pathname === href}
				<li>
					<a
						{href}
						onclick={closeSidebar}
						class="group flex items-baseline gap-2 px-4 py-1.5 text-xs transition-colors duration-100 {isActive
							? 'bg-destructive/[0.05] border-l-2 border-destructive pl-[14px] text-foreground'
							: 'border-l-2 border-transparent pl-[14px] text-muted-foreground hover:text-foreground hover:bg-muted/60'} {section.isRepealed ? 'opacity-50' : ''}"
					>
						<span class="shrink-0 font-mono text-[0.6rem] tabular-nums {isActive ? 'text-destructive' : 'text-muted-foreground/60 group-hover:text-muted-foreground'} transition-colors">{section.sectionNumber}</span>
						<span class="leading-snug {section.isRepealed ? 'line-through' : ''} {isActive ? 'font-medium' : ''}">{section.heading}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</aside>
