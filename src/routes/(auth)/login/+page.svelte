<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Sign In | Regulations</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-muted/40 px-4">
	<!-- Subtle grid background -->
	<div class="pointer-events-none fixed inset-0" style="background-image: radial-gradient(circle, oklch(0.2178 0 0 / 0.03) 1px, transparent 1px); background-size: 24px 24px;"></div>

	<div class="relative w-full max-w-sm">
		<!-- Header above card -->
		<div class="mb-6 text-center">
			<a href="/" class="inline-flex items-center gap-2 group">
				<svg class="h-5 w-5 text-foreground transition-colors group-hover:text-destructive" viewBox="0 0 32 32" fill="none">
					<rect x="4" y="2" width="24" height="28" stroke="currentColor" stroke-width="2" />
					<path d="M10 8h12M10 13h12M10 18h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					<circle cx="24" cy="24" r="6" fill="currentColor" />
					<path d="M22 24l1.5 1.5L26 22.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				<span class="text-sm font-semibold text-foreground group-hover:text-destructive transition-colors">
					Regulations
				</span>
			</a>
		</div>

		<!-- Card -->
		<div class="overflow-hidden border border-border bg-background rounded-sm shadow-sm">
			<!-- Top accent -->
			<div class="h-0.5 w-full bg-destructive"></div>

			<div class="p-8">
				<div class="mb-6">
					<h1 class="font-serif text-2xl font-bold text-foreground">Sign In</h1>
					<p class="mt-1 text-xs text-muted-foreground">Access your bookmarks and annotations</p>
				</div>

				{#if form?.error}
					<div class="mb-5 flex items-start gap-2.5 rounded-sm border border-destructive/20 bg-destructive/5 px-3 py-2.5">
						<svg class="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" viewBox="0 0 16 16" fill="none">
							<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2"/>
							<path d="M8 5v4M8 10.5v.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
						</svg>
						<p class="text-xs text-destructive">{form.error}</p>
					</div>
				{/if}

				<form
					method="POST"
					use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							loading = false;
							await update();
						};
					}}
					class="space-y-4"
				>
					<div>
						<label for="email" class="mb-1 block text-xs font-medium text-foreground">Email</label>
						<input
							id="email"
							name="email"
							type="email"
							required
							autocomplete="email"
							value={form?.email ?? ''}
							class="h-7 w-full rounded-sm border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-foreground focus:outline-none focus:ring-0"
							placeholder="you@example.com"
						/>
					</div>

					<div>
						<div class="mb-1 flex items-center justify-between">
							<label for="password" class="text-xs font-medium text-foreground">Password</label>
						</div>
						<input
							id="password"
							name="password"
							type="password"
							required
							autocomplete="current-password"
							class="h-7 w-full rounded-sm border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-foreground focus:outline-none focus:ring-0"
							placeholder="Your password"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						class="mt-2 w-full rounded-sm bg-destructive py-2 text-xs font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
					>
						{loading ? 'Signing in…' : 'Sign In'}
					</button>
				</form>

				<p class="mt-6 text-center text-xs text-muted-foreground">
					Don't have an account?
					<a href="/register" class="font-semibold text-destructive hover:text-foreground transition-colors">
						Create one
					</a>
				</p>
			</div>
		</div>

		<p class="mt-4 text-center font-mono text-[0.5625rem] text-muted-foreground/50">
			For informational purposes only
		</p>
	</div>
</div>
