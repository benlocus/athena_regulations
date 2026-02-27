<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Create Account | Regulations</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-light-gray px-4">
	<div class="w-full max-w-md">
		<div class="border border-border-gray bg-white p-8">
			<div class="mb-6 text-center">
				<h1 class="font-authority text-2xl font-bold text-ink">Create Account</h1>
				<p class="mt-1 text-sm text-medium-gray">
					Sign up to bookmark and annotate regulations
				</p>
			</div>

			{#if form?.error}
				<div class="mb-4 bg-highlight-pink px-4 py-3 text-sm text-red">
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
					<label for="name" class="mb-1 block text-sm font-medium text-dark-gray">Name</label>
					<input
						id="name"
						name="name"
						type="text"
						required
						autocomplete="name"
						value={form?.name ?? ''}
						class="w-full border border-border-gray bg-white px-3 py-2 text-sm text-dark-gray placeholder:text-medium-gray focus:border-dark-gray focus:ring-0 focus:outline-none"
						placeholder="Your full name"
					/>
				</div>

				<div>
					<label for="email" class="mb-1 block text-sm font-medium text-dark-gray">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						autocomplete="email"
						value={form?.email ?? ''}
						class="w-full border border-border-gray bg-white px-3 py-2 text-sm text-dark-gray placeholder:text-medium-gray focus:border-dark-gray focus:ring-0 focus:outline-none"
						placeholder="you@example.com"
					/>
				</div>

				<div>
					<label for="password" class="mb-1 block text-sm font-medium text-dark-gray"
						>Password</label
					>
					<input
						id="password"
						name="password"
						type="password"
						required
						minlength={8}
						autocomplete="new-password"
						class="w-full border border-border-gray bg-white px-3 py-2 text-sm text-dark-gray placeholder:text-medium-gray focus:border-dark-gray focus:ring-0 focus:outline-none"
						placeholder="At least 8 characters"
					/>
				</div>

				<div>
					<label for="confirmPassword" class="mb-1 block text-sm font-medium text-dark-gray"
						>Confirm Password</label
					>
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						required
						minlength={8}
						autocomplete="new-password"
						class="w-full border border-border-gray bg-white px-3 py-2 text-sm text-dark-gray placeholder:text-medium-gray focus:border-dark-gray focus:ring-0 focus:outline-none"
						placeholder="Repeat your password"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full bg-red px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink disabled:opacity-50"
				>
					{loading ? 'Creating account...' : 'Create Account'}
				</button>
			</form>

			<p class="mt-6 text-center text-sm text-medium-gray">
				Already have an account?
				<a href="/login" class="font-medium text-red hover:text-ink"> Sign in </a>
			</p>
		</div>
	</div>
</div>
