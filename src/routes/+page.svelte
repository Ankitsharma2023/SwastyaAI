<script>
	import { onDestroy, onMount } from 'svelte';
	import robot from '$lib/images/robot.svg';

	import { getApps, initializeApp } from 'firebase/app';
	import { firebaseConfig } from '$lib/firebase_config';
	import { doc, setDoc, getFirestore, getDoc } from 'firebase/firestore';
	import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
	import { SpeedDial, SpeedDialButton } from 'flowbite-svelte';
	import { marked } from 'marked';
	import GetLink from '$lib/components/getLink.svelte';
	import { selectedChats, allChats, userStore, queue, patients_data } from '../stores/loginstore';
	import { browser } from '$app/environment';

	let fApp = null;
	let user = null;
	let messages = [];
	let patientsData = {};
	let selectedPatient = null;
	let image_link;
	let inputValue = '';
	let previousChats = {};
	let imageLink = null;
	let formModal = false;
	let liked = null;
	let storage = null;
	const unsubscribe = userStore.subscribe((value) => {
		user = value;
		if (user) {
			if (!getApps().length) {
				fApp = initializeApp(firebaseConfig, {
					experimentalForceLongPolling: true,
					useFetchStreams: false
				});
			} else {
				fApp = getApps()[0];
			}
			const db = getFirestore(fApp);
			const docRef = doc(db, 'chats', user.uid);
			getDoc(docRef)
				.then((docSnap) => {
					if (docSnap.exists()) {
						previousChats = docSnap.data().allChats || {};
						allChats.set(previousChats);
					}
				})
				.catch((err) => {
					previousChats = [];
				});
			let q = [];
			const docRef2 = doc(db, 'queue', 'q');
			getDoc(docRef2)
				.then((docSnap) => {
					if (docSnap.exists()) {
						q = docSnap.data().q || [];
						queue.set(q);
					}
				})
				.catch((err) => {
					previousChats = [];
				});
		}
	});

	const unsub = selectedChats.subscribe((chats) => {
		messages = chats;
	});
	onDestroy(() => {
		unsub();
		unsubscribe();
	});

	onMount(() => {
		if (browser) {
			try {
				patientsData = JSON.parse(localStorage.getItem('patient')) || {};
			} catch (e) {
				console.error('Error parsing patient data from localStorage', e);
				patientsData = {};
			}
		}
		if (!getApps().length) {
			fApp = initializeApp(firebaseConfig, {
				experimentalForceLongPolling: true,
				useFetchStreams: false
			});
		} else {
			fApp = getApps()[0];
		}
		storage = getStorage();
		const db = getFirestore(fApp);
		let t = {};
		const docRef2 = doc(db, 'queue', 't');
		getDoc(docRef2)
			.then((docSnap) => {
				if (docSnap.exists()) {
					t = docSnap.data().t || {};
					patients_data.set(t);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	});
	async function query(index) {
		try {
			const data = {
				messages: messages,
				patient: patientsData[selectedPatient]
			};
			const response = await fetch('/query', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});
			if (!response.ok) {
				throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			messages[index].text = '';
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				const chunk = decoder.decode(value, { stream: true });
				messages[index].text += chunk;
			}
		} catch (error) {
			console.error('Error occurred:', error);
			return 'Internal Server Error';
		}
	}
	async function sendMessage() {
		if (inputValue.trim() !== '') {
			messages = [
				...messages,
				{ text: inputValue, isUser: true, timeStamp: new Date().toString() }
			];
			inputValue = '';
			messages = [
				...messages,
				{ text: '...', isUser: false, timeStamp: new Date().toString(), liked: liked }
			];
			await query(messages.length - 1);
			saveChat(messages);
		}
	}

	function saveChat(messages) {
		if (messages.length > 0) {
			let title = messages[0].text;
			let i = 0;
			while (!title && i < messages.length) {
				i += 1;
				title = messages[i].text;
			}
			allChats.update((m) => {
				m[title] = messages;
				return m;
			});
		}
		const db = getFirestore(fApp);

		setDoc(doc(db, 'chats', user.uid), { allChats: previousChats });
		return previousChats;
	}
	async function handleFileUpload(event) {
		const file = event.target.files[0];
		if (!file) return;
		const fileHash = await generateFileHash(file);
		const storageRef = ref(storage, fileHash);

		try {
			const existingUrl = await checkIfImageExists(storageRef);
			if (existingUrl) {
				messages = [...messages, { image: existingUrl, isUser: true }];
			} else {
				const imageURL = URL.createObjectURL(file);
				const index = messages.length;

				messages = [...messages, { image: imageURL, isUser: true, loading: true }];

				const snapshot = await uploadBytes(storageRef, file);
				const url = await getDownloadURL(snapshot.ref);

				messages[index].image = url;
				messages[index].loading = false;
			}
		} catch (error) {
			console.error('Error uploading or checking image:', error);
		}
	}

	async function generateFileHash(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const buffer = reader.result;
				crypto.subtle
					.digest('SHA-256', buffer)
					.then((hashBuffer) => {
						resolve(hexString(hashBuffer));
					})
					.catch(reject);
			};
			reader.onerror = reject;
			reader.readAsArrayBuffer(file);
		});
	}

	function hexString(buffer) {
		const byteArray = new Uint8Array(buffer);
		return Array.from(byteArray)
			.map((byte) => byte.toString(16).padStart(2, '0'))
			.join('');
	}

	async function checkIfImageExists(storageRef) {
		try {
			const url = await getDownloadURL(storageRef);
			return url;
		} catch (error) {
			if (error.code === 'storage/object-not-found') {
				return null;
			}
			throw error;
		}
	}

	$: if (imageLink) {
		image_link = imageLink;
		messages = [...messages, { image: image_link, isUser: true }];
		imageLink = null;
	}
</script>

<div
	class="dark:bg-dark mb-24 flex w-full items-center justify-center bg-white text-black dark:text-white"
>
	<div class="flex h-[90vh] w-full flex-col items-center justify-center">
		{#if messages.length > 0}
			<!--Chats-->
			<div class="flex h-full w-full flex-col gap-4 overflow-y-auto">
				{#each messages as message, index (index)}
					<div class="mb-2">
						{#if message.text}
							<div
								class=" flex w-full flex-row items-center {message.isUser
									? 'mt-6 mr-4 justify-end text-right'
									: 'ml-4 justify-start text-left'}"
								style="max-width: 98vw;"
							>
								{#if !message.isUser}
									<img
										src={message.isUser ? $userStore.photoURL : robot}
										class="h-6 w-6 rounded-full {!message.isUser ? 'text-right ' : 'text-left '}"
										alt=""
									/>
								{/if}
								<div class="flex flex-col">
									<pre
										class="flex flex-col justify-center overflow-hidden rounded-3xl bg-[#CDE6EA] p-3 font-sans text-sm font-semibold text-wrap break-words text-black">{#if message.isUser}{message.text}{:else}{@html marked(
												message.text
											)}{/if}</pre>
								</div>
								{#if message.isUser}
									<img
										src={message.isUser ? $userStore.photoURL : robot}
										class="h-6 w-6 rounded-full"
										alt=""
									/>
								{/if}
							</div>
						{:else if message.image}
							<div
								class="flex {message.isUser
									? 'mr-4 justify-end text-right'
									: 'ml-4 justify-start text-left'}"
							>
								<img
									src={encodeURI(message.image)}
									class="max-w-xs"
									alt="uploaded_image"
									size="max-w-xs"
									referrerpolicy="no-referrer"
								/>
							</div>
						{/if}
					</div>
				{/each}
			</div>
			<!---->
		{/if}
		<!-- Input -->
		<div class="flex w-[85%] flex-col items-center justify-center text-black md:w-1/2">
			<div class="flex w-full flex-row justify-center">
				<div class="flex w-full justify-center">
					<div class="relative w-full md:w-3/4">
						<button class="absolute top-[0.90rem] left-4" aria-label="Mic">
							<svg
								width="25"
								height="25"
								viewBox="0 0 25 25"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M4.59326 12.056C4.85909 13.8825 5.77364 15.5522 7.16961 16.7597C8.56557 17.9672 10.3496 18.6317 12.1954 18.6317M12.1954 18.6317C14.0411 18.6317 15.8252 17.9672 17.2211 16.7597C18.6171 15.5522 19.5316 13.8825 19.7975 12.056M12.1954 18.6317V22.4788M12.1965 3.27881C11.3235 3.27881 10.4863 3.62558 9.86907 4.24285C9.25181 4.86011 8.90503 5.6973 8.90503 6.57024V10.9588C8.90503 11.8317 9.25181 12.6689 9.86907 13.2862C10.4863 13.9035 11.3235 14.2502 12.1965 14.2502C13.0694 14.2502 13.9066 13.9035 14.5239 13.2862C15.1411 12.6689 15.4879 11.8317 15.4879 10.9588V6.57024C15.4879 5.6973 15.1411 4.86011 14.5239 4.24285C13.9066 3.62558 13.0694 3.27881 12.1965 3.27881Z"
									stroke="#49454F"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>

						<textarea
							class="h-3/4 w-full resize-none rounded-xl border border-gray-300 bg-[#DEEDF3] pt-3 pl-12 outline-none"
							rows="6"
							placeholder="Ask me anything..."
							bind:value={inputValue}
						></textarea>

						<button
							class="absolute top-[0.90rem] right-4"
							on:click={sendMessage}
							aria-label="Send Message"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="size-6"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
								/>
							</svg>
						</button>

						<SpeedDial defaultClass="absolute bottom-[2.90rem] left-4" trigger="click">
							<button slot="button" class="flex flex-row">
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M9.85714 7.92854V13.9285C9.85714 15.112 10.8165 16.0714 12 16.0714C13.1835 16.0714 14.1429 15.112 14.1429 13.9285V7.71425C14.1429 5.46566 12.32 3.64282 10.0714 3.64282C7.82284 3.64282 6 5.46566 6 7.71425V14.3571C6 17.6708 8.68629 20.3571 12 20.3571C15.3137 20.3571 18 17.6708 18 14.3571V7.92854"
										stroke="black"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>&nbsp;Attach
							</button>
							<SpeedDialButton
								name="Upload Link"
								on:click={() => {
									formModal = true;
								}}
							>
								<svg
									width="18"
									height="20"
									viewBox="0 0 18 20"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M2.28 11.06H6.28C7.54098 11.0377 8.58266 12.0391 8.61 13.3V17.3C8.60452 18.5625 7.58246 19.5845 6.32 19.59H2.32C1.05907 19.6067 0.0219162 18.6009 0 17.34V13.34C0 12.0808 1.02079 11.06 2.28 11.06ZM6.28 18.09C6.71631 18.09 7.07 17.7363 7.07 17.3V13.3C7.07002 13.0914 6.98647 12.8915 6.83802 12.7449C6.68957 12.5983 6.4886 12.5173 6.28 12.52H2.28C2.07313 12.52 1.87474 12.6022 1.72846 12.7485C1.58218 12.8947 1.5 13.0931 1.5 13.3V17.3C1.49997 17.7324 1.84761 18.0845 2.28 18.09H6.28Z"
										fill="black"
									/>
									<path
										d="M5.62 14.57C5.3052 14.57 5.05 14.3148 5.05 14C5.05 13.5858 4.71421 13.25 4.3 13.25C3.88579 13.25 3.55 13.5858 3.55 14V14.01C3.55 14.3193 3.29928 14.57 2.99 14.57C2.57579 14.57 2.24 14.9058 2.24 15.32C2.24 15.7342 2.57579 16.07 2.99 16.07C3.3048 16.07 3.56 16.3252 3.56 16.64V16.65C3.56 17.0642 3.89579 17.4 4.31 17.4C4.72421 17.4 5.06 17.0642 5.06 16.65C5.06 16.3297 5.31968 16.07 5.64 16.07C6.05421 16.07 6.39 15.7342 6.39 15.32C6.39 14.9058 6.05421 14.57 5.64 14.57H5.62Z"
										fill="black"
									/>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M10.04 0.22L17.04 7.22C17.1888 7.37153 17.2684 7.57779 17.26 7.79V14.79C17.26 17.4134 15.1334 19.54 12.51 19.54H9.64C9.22579 19.54 8.89 19.2042 8.89 18.79C8.89 18.3758 9.22579 18.04 9.64 18.04H12.51C14.3049 18.04 15.76 16.5849 15.76 14.79V12.54C15.76 10.3309 13.9691 8.54 11.76 8.54H11.51C9.99122 8.54 8.76 7.30878 8.76 5.79V3.78C8.76 2.53736 7.75264 1.53 6.51 1.53C4.71346 1.53551 3.25999 2.99345 3.26 4.79V9.79C3.26 10.2042 2.92421 10.54 2.51 10.54C2.09579 10.54 1.76 10.2042 1.76 9.79V4.79C1.74933 3.52331 2.24506 2.30482 3.13702 1.40535C4.02898 0.505887 5.24326 -4.49127e-05 6.51 2.99042e-09H9.51C9.70885 0.000175055 9.89948 0.0793075 10.04 0.22ZM12.495 4.795C11.6702 3.97023 10.26 4.55436 10.26 5.72077V5.79C10.2655 6.47645 10.8235 7.03002 11.51 7.03H11.5692C12.7356 7.03 13.3198 5.61977 12.495 4.795Z"
										fill="black"
									/>
								</svg>
							</SpeedDialButton>
							<SpeedDialButton name="Uplaod Image">
								<label for="profile">
									<svg
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M8.12 10.08C9.22457 10.08 10.12 9.18457 10.12 8.08C10.12 6.97543 9.22457 6.08 8.12 6.08C7.01543 6.08 6.12 6.97543 6.12 8.08C6.12 9.18457 7.01543 10.08 8.12 10.08Z"
											fill="black"
										/>
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.24 2H10C5.58172 2 2 5.58172 2 10V14.24C2 18.6583 5.58172 22.24 10 22.24H14.24C18.6583 22.24 22.24 18.6583 22.24 14.24V10C22.24 7.87827 21.3971 5.84344 19.8969 4.34315C18.3966 2.84285 16.3617 2 14.24 2ZM10 3.5H14.24C17.4859 3.50507 20.2306 5.90396 20.67 9.12H19.12C14.9468 9.1234 11.0879 11.3382 8.98 14.94C7.66362 13.8943 6.03116 13.3267 4.35 13.33H3.5V10C3.50551 6.41243 6.41243 3.50551 10 3.5ZM4.35 14.83H3.53C3.74723 17.1883 5.22988 19.2418 7.4 20.19C7.47167 18.8552 7.77274 17.5426 8.29 16.31C7.19845 15.3571 5.79895 14.8314 4.35 14.83ZM14.24 20.74H10C9.62404 20.7385 9.24906 20.7017 8.88 20.63C9.00486 15.0613 13.55 10.6095 19.12 10.6H20.74V14.24C20.7345 17.8276 17.8276 20.7345 14.24 20.74Z"
											fill="black"
										/>
									</svg>
									<input
										type="file"
										id="profile"
										accept="image/*"
										class="hidden"
										on:change={handleFileUpload}
									/>
								</label>
							</SpeedDialButton>
						</SpeedDial>
					</div>
				</div>
			</div>
			<GetLink bind:imageLink bind:formModal></GetLink>
		</div>
	</div>
</div>
