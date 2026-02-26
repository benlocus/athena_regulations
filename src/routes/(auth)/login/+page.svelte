<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Sign In | Regulations</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-background px-4">
	<div class="w-full max-w-md">
		<div class="rounded-lg border border-border bg-surface p-8 shadow-sm">
			<div class="mb-6 text-center">
				<h1 class="font-serif text-2xl font-bold text-primary">Sign In</h1>
				<p class="mt-1 text-sm text-text-muted">Access your bookmarks and annotations</p>
			</div>

			{#if form?.error}
				<div class="mb-4 rounded-md bg-highlight-pink px-4 py-3 text-sm text-red-800">
					{form.error}
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
					<label for="email" class="mb-1 block text-sm font-medium text-text">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						autocomplete="email"
						value={form?.email ?? ''}
						class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
						placeholder="you@example.com"
					/>
				</div>

				<div>
					<label for="password" class="mb-1 block text-sm font-medium text-text"
						>Password</label
					>
					<input
						id="password"
						name="password"
						type="password"
						required
						autocomplete="current-password"
						class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
						placeholder="Your password"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-light disabled:opacity-50"
				>
					{loading ? 'Signing in...' : 'Sign In'}
				</button>
			</form>

			<p class="mt-6 text-center text-sm text-text-muted">
				Don't have an account?
				<a href="/register" class="font-medium text-accent hover:text-accent-dark">
					Create one
				</a>
			</p>
		</div>
	</div>
</div>
