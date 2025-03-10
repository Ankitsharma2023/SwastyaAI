<script>
	import '../app.css';
	import Header from './Header.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { firebaseConfig } from '$lib/firebase_config';
	import { getApps, initializeApp } from 'firebase/app';
	import {
		getAuth,
		signInWithPopup,
		GoogleAuthProvider,
		createUserWithEmailAndPassword,
		updateProfile,
		signInWithEmailAndPassword,
		RecaptchaVerifier,
		signInWithPhoneNumber
	} from 'firebase/auth';
	import { setPersistence, browserSessionPersistence } from 'firebase/auth';
	import { Modal, Toast } from 'flowbite-svelte';
	import { CloseCircleSolid } from 'flowbite-svelte-icons';
	import { userStore } from '../stores/loginstore';

	let name = '';
	let phone = '';
	let otp = '';
	let showOtp = false;
	let email = '';
	let password = '';
	let user = null;
	let fApp = null;
	let termsAccepted = false;
	let signUp = true;
	let phoneSignUp = false;
	let err = null;
	let darkMode = false;
	let showNameBox = false;
	let recaptchaVerifier = null;
	let openForm = false;

	onMount(() => {
		if (!getApps().length) {
			fApp = initializeApp(firebaseConfig, {
				experimentalForceLongPolling: true,
				useFetchStreams: false
			});
		} else {
			fApp = getApps()[0];
		}
		const auth = getAuth(fApp);
		setPersistence(auth, browserSessionPersistence).then(() => {
			const unsubscribe = auth.onAuthStateChanged((currentUser) => {
				openForm = currentUser == null;
				userStore.set(currentUser);
			});

			return () => {
				unsubscribe();
			};
		});
	});
	const unsubscribe = userStore.subscribe((value) => {
		user = value;
	});
	onDestroy(() => {
		unsubscribe();
	});
	const googleSignIn = async () => {
		if (!termsAccepted) return;

		const provider = new GoogleAuthProvider();
		const auth = getAuth();

		try {
			const result = await signInWithPopup(auth, provider);
			user = result.user;
		} catch (error) {
			err = error;
		}
	};

	const handleSignup = async () => {
		if (!termsAccepted) return;

		const auth = getAuth();

		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			user = userCredential.user;

			await updateProfile(auth.currentUser, {
				displayName: name,
				photoURL: 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'
			});
		} catch (error) {
			err = error;
		}
	};

	const handleSignIn = async () => {
		if (!termsAccepted) return;

		const auth = getAuth();

		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			user = userCredential.user;
		} catch (error) {
			err = error;
		}
	};

	const setupRecaptchaVerifier = () => {
		try {
			const auth = getAuth(fApp);
			recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha', {
				callback: async () => {
					try {
						const defaultCode = '91';
						const phoneNumber = `+${defaultCode}${phone}`;
						const confirmationResult = await signInWithPhoneNumber(
							auth,
							phoneNumber,
							recaptchaVerifier
						);
						window.confirmationResult = confirmationResult;
						recaptchaVerifier.clear();
						showOtp = true;
						err = null;
					} catch (error) {
						err = error;
					}
				}
			});
			recaptchaVerifier.render();
		} catch (error) {
			console.error('Error initializing RecaptchaVerifier:', error);
			err = error;
		}
	};

	const handlePhoneSignIn = async () => {
		if (!termsAccepted) return;
		if (phone === '' || phone.length <= 4) return;

		try {
			setupRecaptchaVerifier();
		} catch (error) {
			err = error;
			showOtp = false;
		}
	};

	const setName = async () => {
		if (name === '') return;
		const auth = getAuth(fApp);

		try {
			await updateProfile(auth.currentUser, {
				displayName: name,
				photoURL: 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'
			});
			showNameBox = false;
		} catch (error) {
			err = error;
		}
	};

	const handleOtpVerification = async () => {
		try {
			const confirmationResult = window.confirmationResult;
			const credential = await confirmationResult.confirm(otp);
			user = credential.user;
			if (user.displayName === null) {
				showNameBox = true;
			}
			err = null;
		} catch (error) {
			err = error;
		}
	};
</script>

<Header />
<slot />

<Modal
	bind:open={openForm}
	dismissable={false}
	size="xs"
	autoclose={false}
	class="flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-[#004E86] bg-[#F4FCFF] px-4 text-center lg:px-12"
>
	{#if err}
		<Toast color="red">
			<svelte:fragment slot="icon">
				<CloseCircleSolid class="h-5 w-5" />
				<span class="sr-only">{err.code}</span>
			</svelte:fragment>
			{err.message}
		</Toast>
	{/if}

	<div class="text-2xl font-bold">SwastyaAI</div>

	<div class="w-full border-[1px] border-[#93B6CF]"></div>
	{#if signUp && !phoneSignUp}
		<p class="font-semibold">Create your account!</p>
		<form class="flex w-full flex-col justify-center gap-2" on:submit|preventDefault={handleSignup}>
			<input
				type="text"
				placeholder="Name"
				bind:value={name}
				class="rounded-lg text-[14px]"
				required
			/>
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
				disabled={!termsAccepted}>Signup with Email</button
			>
		</form>
	{:else if !signUp && !phoneSignUp}
		<p class="mb-6 font-semibold">SignIn to your account!</p>
		<form class="flex w-full flex-col justify-center gap-2" on:submit|preventDefault={handleSignIn}>
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
	{:else if showNameBox}
		<p class="mb-6 font-semibold">Complete Signing In!</p>
		<form class="flex w-full flex-col justify-center gap-2" on:submit|preventDefault={setName}>
			<input
				type="text"
				id="name"
				placeholder="Enter Name"
				bind:value={name}
				class="rounded-lg text-[14px]"
				required
			/>
			<button
				type="submit"
				id="sendOtp"
				class="w-full rounded-lg bg-[#294254] p-2 text-center text-white disabled:bg-[#111d25]"
				>Continue</button
			>
		</form>
	{:else}
		<p class="mb-6 font-semibold">SignIn to your account!</p>
		<form
			class="flex w-full flex-col justify-center gap-2"
			on:submit|preventDefault={handlePhoneSignIn}
		>
			<input
				type="text"
				id="phone"
				placeholder="Enter Phone Number"
				bind:value={phone}
				class="rounded-lg text-[14px]"
				required
			/>
			<div id="recaptcha"></div>
			{#if showOtp}
				<input
					type="text"
					placeholder="Enter OTP"
					bind:value={otp}
					class="rounded-lg text-[14px]"
					required
				/>
				<button
					type="button"
					on:click={handleOtpVerification}
					class="w-full rounded-lg bg-[#294254] p-2 text-center text-white disabled:opacity-50"
					disabled={!termsAccepted}>Verify OTP</button
				>
			{:else}
				<div class="flex items-start pt-1 pb-1">
					<input type="checkbox" id="terms" bind:checked={termsAccepted} required />

					<label for="terms" class="ml-2 text-left text-xs"
						>I acknowledge that this is a learning model and information provided is for educational
						purpose only.</label
					>
				</div>
				<button
					type="submit"
					id="sendOtp"
					class="w-full rounded-lg bg-[#294254] p-2 text-center text-white disabled:opacity-50"
					disabled={!termsAccepted}>Send OTP</button
				>
			{/if}
		</form>
	{/if}
	<div class="link">
		<p class="-mt-2 mb-2 font-medium">
			SignUp Using <button
				class="text-blue-600"
				on:click={() => {
					phoneSignUp = !phoneSignUp;
				}}>Phone ?</button
			>
		</p>
	</div>
	<p class="-pt-2 font-bold">Or</p>
	<button
		on:click={googleSignIn}
		class="text-md flex w-full flex-row items-center justify-center gap-2 rounded-lg bg-black px-6 py-2 text-center align-middle font-sans font-bold text-white shadow-md shadow-gray-900/10 transition-all select-none hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
		disabled={!termsAccepted}
	>
		<img
			class="h-6 w-6"
			src="https://www.svgrepo.com/show/475656/google-color.svg"
			loading="lazy"
			alt="google logo"
		/>
		<span>Sign in with Google</span>
	</button>
	<div class="link">
		<p class="-mt-2 mb-2 font-medium">
			Already have an account? <button
				class="text-blue-600"
				on:click={() => {
					signUp = !signUp;
					phoneSignUp = false;
				}}>Log In</button
			>
		</p>
	</div>
</Modal>
