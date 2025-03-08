<script>
	import { onDestroy, onMount } from 'svelte';
	import robot from '$lib/images/robot.svg';

	import { getApps, initializeApp } from 'firebase/app';
	import { firebaseConfig } from '$lib/firebase_config';
	import { doc, setDoc, getFirestore, getDoc } from 'firebase/firestore';
	import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
	import { MegaMenu, SpeedDial, SpeedDialButton } from 'flowbite-svelte';
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
	let menu = [
		{
			name: 'Hand Offs',
			svg: `<svg width="22" height="23" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.791 1.75H1.25V20.75L5.25 18.25H19.25V8.785" stroke="#706D6D" stroke-width="1.5"/>
<path d="M20.25 4.14L12.735 11.656H9.84497V8.766L17.36 1.25L20.25 4.14Z" stroke="#706D6D" stroke-width="1.5"/>
</svg>
`,
			desc: 'Search and discover nursing hand overs'
		},
		{
			name: 'Healthcare Search',
			svg: `<svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.699219 19.1562H20.1992M2.19922 1.15625V19.1562M12.6992 1.15625V19.1562M18.6992 5.65625V19.1562M5.19922 4.90625H5.94922M5.19922 7.90625H5.94922M5.19922 10.9062H5.94922M8.94922 4.90625H9.69922M8.94922 7.90625H9.69922M8.94922 10.9062H9.69922M5.19922 19.1562V15.7812C5.19922 15.1602 5.70322 14.6562 6.32422 14.6562H8.57422C9.19522 14.6562 9.69922 15.1602 9.69922 15.7812V19.1562M1.44922 1.15625H13.4492M12.6992 5.65625H19.4492M15.6992 9.40625H15.7072V9.41425H15.6992V9.40625ZM15.6992 12.4062H15.7072V12.4143H15.6992V12.4062ZM15.6992 15.4062H15.7072V15.4142H15.6992V15.4062Z" stroke="#706D6D" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
			desc: 'Harmonize Healthcare Data'
		},
		{
			name: 'Video Search',
			svg: `<svg width="25" height="26" viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.01172 16.1571V9.6426C8.01172 8.89011 8.89587 8.41447 9.61532 8.77991L16.0279 12.0371C16.7681 12.4131 16.7681 13.3865 16.0279 13.7625L9.61532 17.0197C8.89587 17.3852 8.01172 16.9095 8.01172 16.1571Z" stroke="#706D6D" stroke-width="1.71" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.7353 0.900391C18.3502 0.900391 23.7125 6.27298 23.7125 12.9004C23.7125 19.5279 18.3502 24.9004 11.7353 24.9004C7.17696 24.9004 3.21337 22.3492 1.18945 18.5941" stroke="#706D6D" stroke-width="1.71" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
			desc: 'Discover and Watch Videos',
			oncl: () => {
				tab = 'search';
			}
		},
		{
			name: 'Academic',
			svg: `<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.0449 23.748H3.54492C2.94818 23.748 2.37589 23.5109 1.95393 23.089C1.53197 22.667 1.29492 22.0947 1.29492 21.498" stroke="#706D6D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M19.2949 8.74805V1.99805C19.2949 1.79914 19.2159 1.60837 19.0752 1.46772C18.9346 1.32706 18.7438 1.24805 18.5449 1.24805H4.29492C3.49927 1.24805 2.73621 1.56412 2.1736 2.12673C1.61099 2.68934 1.29492 3.4524 1.29492 4.24805V21.498C1.29492 20.9013 1.53197 20.329 1.95393 19.907C2.37589 19.4851 2.94818 19.248 3.54492 19.248H7.29492" stroke="#706D6D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.54492 16.248C9.54492 16.9374 9.68072 17.6201 9.94452 18.2571C10.2084 18.894 10.5951 19.4728 11.0826 19.9603C11.5701 20.4478 12.1489 20.8345 12.7858 21.0984C13.4228 21.3622 14.1055 21.498 14.7949 21.498C15.4843 21.498 16.167 21.3622 16.804 21.0984C17.4409 20.8345 18.0197 20.4478 18.5072 19.9603C18.9947 19.4728 19.3814 18.894 19.6453 18.2571C19.9091 17.6201 20.0449 16.9374 20.0449 16.248C20.0449 15.5586 19.9091 14.8759 19.6453 14.2389C19.3814 13.602 18.9947 13.0232 18.5072 12.5357C18.0197 12.0482 17.4409 11.6615 16.804 11.3976C16.167 11.1338 15.4843 10.998 14.7949 10.998C14.1055 10.998 13.4228 11.1338 12.7858 11.3976C12.1489 11.6615 11.5701 12.0482 11.0826 12.5357C10.5951 13.0232 10.2084 13.602 9.94452 14.2389C9.68072 14.8759 9.54492 15.5586 9.54492 16.248Z" stroke="#706D6D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M22.2958 23.7489L18.5078 19.9609" stroke="#706D6D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
			desc: 'Search for Nursing Learning '
		}
	];
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
	let tab = '';
	let topic = '';
	let videos = [];

	async function searchYoutubeVideos() {
		if (!topic) return;
		try {
			const response = await fetch(`/search?query=${encodeURIComponent(topic)}`);
			if (response.ok) {
				videos = (await response.json()).body;
			} else {
				console.error('Error fetching videos:', await response.json());
			}
		} catch (error) {
			console.error('Error fetching YouTube videos:', error);
		}
	}
</script>

<div
	class="bg-white dark:bg-dark dark:text-white text-black flex w-full justify-center items-center mb-24"
>
	{#if tab == 'search'}
		<div class="flex flex-col w-full h-[90vh] justify-start items-center gap-2">
			<div class="flex flex-row gap-5">
				<button
					on:click={() => {
						tab = '';
					}}
					><svg
						width="25"
						height="25"
						viewBox="0 0 25 25"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle
							cx="12.7695"
							cy="12.4414"
							r="11.5811"
							transform="rotate(-89.944 12.7695 12.4414)"
							fill="#004E86"
							stroke="white"
							stroke-width="0.837838"
						/>
						<path
							d="M18.9989 12.8348C19.4617 12.8352 19.8371 12.4605 19.8376 11.9978C19.838 11.535 19.4633 11.1596 19.0006 11.1591L18.9989 12.8348ZM6.01549 11.3918C5.68797 11.7187 5.68745 12.2492 6.01433 12.5767L11.3411 17.9139C11.668 18.2414 12.1984 18.2419 12.526 17.915C12.8535 17.5882 12.854 17.0577 12.5271 16.7302L7.79223 11.986L12.5364 7.2511C12.8639 6.92423 12.8644 6.39374 12.5375 6.06622C12.2107 5.73871 11.6802 5.73819 11.3527 6.06507L6.01549 11.3918ZM19.0006 11.1591L6.60817 11.147L6.60653 12.8227L18.9989 12.8348L19.0006 11.1591Z"
							fill="white"
						/>
					</svg>
				</button>
				<input type="text" bind:value={topic} placeholder="Enter medical topic" />
				<button on:click={searchYoutubeVideos}>Search</button>
			</div>
			<div class="flex flex-col justify-center w-full items-center gap-5">
				{#if videos.length > 0}
					{#each videos as { title, url, description, videoId }}
						<div class="flex flex-col justify-center items-center">
							<strong>{title}</strong><a href={url} target="_blank">{url}</a>
							<p>Brief: {description.slice(0, 500)}...</p>
							<iframe
								title=""
								width="560"
								height="315"
								src={`https://www.youtube.com/embed/${videoId}`}
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
							></iframe>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{:else}
		<div class="flex flex-col w-full h-[90vh] justify-center items-center">
			{#if messages.length > 0}
				<!--Chats-->
				<div class="flex flex-col w-full overflow-y-auto h-full gap-4">
					{#each messages as message}
						<div class="mb-2">
							{#if message.text}
								<div
									class=" flex flex-row w-full items-center {message.isUser
										? 'text-right justify-end mr-4 mt-6'
										: 'text-left justify-start ml-4'}"
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
											class="p-3 rounded-3xl bg-[#CDE6EA] text-black text-sm text-wrap break-words overflow-hidden font-semibold font-sans">{message.text}</pre>
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
										? 'text-right justify-end mr-4'
										: 'text-left justify-start ml-4'}"
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
			<div class="flex flex-col text-black justify-center items-center w-[85%] md:w-1/2">
				<div class="flex flex-row w-full justify-center">
					<div class="flex w-full justify-center">
						<div class="relative w-full md:w-3/4">
							<button class="absolute top-[0.90rem] left-4">
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
								class="w-full pl-12 pt-3 border border-gray-300 rounded-xl h-3/4 resize-none bg-[#DEEDF3] outline-none"
								rows="6"
								placeholder="Ask me anything..."
								bind:value={inputValue}
							/>

							<button class="absolute top-[0.90rem] right-4" on:click={sendMessage}>
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

							<div class="absolute bottom-[2.90rem] left-4">
								<button class="flex flex-row items-center">
									<svg
										width="18"
										height="13"
										viewBox="0 0 18 13"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M1.25 0.878906H16.3406M3.94475 6.04148H13.6458M7.17845 11.204H10.4121"
											stroke="#49454F"
											stroke-width="1.74981"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
									&nbsp;Focus
								</button>
							</div>
							<MegaMenu
								ulClass="grid grid-flow-row gap-y-4 md:gap-x-8 auto-col-max auto-row-max"
								class="bg-[#DEEDF3] place-items-center ml-52 -mr-36"
								items={menu}
								let:item
							>
								<button class="flex flex-col text-[#706D6D]" on:click={item.oncl}>
									<p class="flex flex-row text-lg font-semibold">
										{@html item.svg}&nbsp{item.name}
									</p>
									<p class="text-start">{item.desc}</p>
								</button>
							</MegaMenu>
							<SpeedDial defaultClass="absolute bottom-[2.90rem] left-[120px]" trigger="click">
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
	{/if}
</div>
