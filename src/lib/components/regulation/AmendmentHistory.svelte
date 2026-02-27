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
	<section class="mt-10 border-t border-border-gray pt-6">
		<h2 class="mb-4 font-precision text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-medium-gray">
			Amendment History
		</h2>
		<div class="relative space-y-4 border-l-2 border-rule-gray pl-6">
			{#each amendments as amendment}
				<div class="relative">
					<div
						class="absolute -left-[7px] top-1.5 h-3 w-3 border-2 border-rule-gray bg-white"
					></div>
					<div>
						<div class="flex items-center gap-2">
							<span
								class="font-precision text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-medium-gray"
							>
								{amendment.amendmentType}
							</span>
							{#if amendment.effectiveDate}
								<span class="font-precision text-xs text-medium-gray">
									{new Date(amendment.effectiveDate).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}
								</span>
							{/if}
						</div>
						{#if amendment.massRegister}
							<p class="mt-1 font-precision text-xs text-medium-gray">
								Mass. Register #{amendment.massRegister}
							</p>
						{/if}
						{#if amendment.description}
							<p class="mt-1 text-sm text-dark-gray">{amendment.description}</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>
{/if}
