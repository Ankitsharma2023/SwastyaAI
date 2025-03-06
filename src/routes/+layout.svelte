<script>
	import '../app.css';
	import Header from './Header.svelte';
	import { Modal } from 'flowbite-svelte';
	let openForm = false;
	let email = '';
	let password = '';
	let name = '';
	let termsAccepted = false;
</script>

<Header />
<slot />

<Modal
	bind:open={openForm}
	dismissable={false}
	size="xs"
	autoclose={false}
	class="loginForm flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-[#004E86] bg-[#F4FCFF] px-4 text-center lg:px-12"
>
	<div class="text-2xl font-bold">SwastyaAI</div>

	<div class="w-full border-[1px] border-[#93B6CF]"></div>

	<p class="mb-6 font-semibold">SignIn to your account!</p>
	<form class="flex w-full flex-col justify-center gap-2">
		<input
			type="email"
			placeholder="Email"
			bind:value={email}
			class="rounded-lg text-[14px]"
			required
		/>
		<input
			type="password"
			placeholder="Password"
			bind:value={password}
			class="rounded-lg text-[14px]"
			required
		/>
		<div class="flex items-start pt-1 pb-1">
			<input type="checkbox" id="terms" bind:checked={termsAccepted} required />
			<label for="terms" class="ml-2 text-left text-xs"
				>I acknowledge that this is a learning model and information provided is for educational
				purpose only.</label
			>
		</div>
		<button
			type="submit"
			class="w-full rounded-lg bg-[#294254] p-2 text-center text-white disabled:opacity-50"
			disabled={!termsAccepted}>SignIn with Email</button
		>
	</form>
</Modal>
