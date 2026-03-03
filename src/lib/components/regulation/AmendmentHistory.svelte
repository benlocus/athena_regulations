<script lang="ts">
	type AmendmentItem = {
		id: string;
		amendmentType: string;
		effectiveDate: string | null;
		massRegister: string | null;
		description: string | null;
		sortOrder: number;
	};

	let { amendments }: { amendments: AmendmentItem[] } = $props();
</script>

{#if amendments.length > 0}
	<section class="mt-12 border-t border-border pt-8">
		<h2 class="mb-5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
			Amendment History
		</h2>
		<div class="relative pl-5">
			<!-- Timeline line -->
			<div class="absolute left-0 top-1.5 bottom-0 w-px bg-border"></div>

			<div class="space-y-5">
				{#each amendments as amendment}
					<div class="relative">
						<!-- Timeline dot -->
						<div class="absolute -left-5 top-1 h-2.5 w-2.5 -translate-x-[5px] rounded-full border-2 border-border bg-background"></div>

						<div>
							<div class="flex flex-wrap items-center gap-x-3 gap-y-0.5">
								<span class="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-foreground">
									{amendment.amendmentType}
								</span>
								{#if amendment.effectiveDate}
									<span class="font-mono text-[0.6875rem] text-muted-foreground">
										{new Date(amendment.effectiveDate).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'short',
											day: 'numeric'
										})}
									</span>
								{/if}
								{#if amendment.massRegister}
									<span class="font-mono text-[0.6875rem] text-muted-foreground">
										Mass. Reg. #{amendment.massRegister}
									</span>
								{/if}
							</div>
							{#if amendment.description}
								<p class="mt-1 text-sm leading-relaxed text-muted-foreground">{amendment.description}</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}
