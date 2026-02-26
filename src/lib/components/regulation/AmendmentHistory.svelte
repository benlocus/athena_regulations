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
	<section class="mt-8 rounded-lg border border-border bg-surface p-5">
		<h2 class="mb-4 text-sm font-semibold tracking-wide text-text-muted uppercase">
			Amendment History
		</h2>
		<div class="relative space-y-4 border-l-2 border-border pl-6">
			{#each amendments as amendment}
				<div class="relative">
					<div
						class="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 {amendment.amendmentType === 'adopted'
							? 'border-accent bg-accent/20'
							: 'border-primary bg-primary/20'}"
					></div>
					<div>
						<div class="flex items-center gap-2">
							<span
								class="inline-block rounded px-1.5 py-0.5 text-xs font-medium capitalize {amendment.amendmentType === 'adopted'
									? 'bg-accent/10 text-accent-dark'
									: 'bg-primary/10 text-primary'}"
							>
								{amendment.amendmentType}
							</span>
							{#if amendment.effectiveDate}
								<span class="text-xs text-text-muted">
									{new Date(amendment.effectiveDate).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}
								</span>
							{/if}
						</div>
						{#if amendment.massRegister}
							<p class="mt-1 text-xs text-text-muted">
								Mass. Register #{amendment.massRegister}
							</p>
						{/if}
						{#if amendment.description}
							<p class="mt-1 text-sm text-text">{amendment.description}</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>
{/if}
