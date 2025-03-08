<script>
	import Recorder from '$lib/components/Recorder/Recorder.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { getApps, initializeApp } from 'firebase/app';
	import { firebaseConfig } from '$lib/firebase_config';

	import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
	import { patients_data, trnscpt, userStore } from '../../stores/loginstore';
	import { Checkbox } from 'flowbite-svelte';
	let support = true;
	let transcriptionContent = ``;
	let recognition = null;
	let fApp = null;
	let nav_tab = 'recording';
	let show_sub = false;
	let user = null;
	let edit_mode = false;
	let show_content = false;
	let show_summary = false;
	let show_edited = false;
	let inputValue = '';
	let contentEditable = false;
	let active_tab = 'record';
	let menu = [
		{
			name: 'Recording Copilot',
			svg: `<svg width="24" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_63_1191)">
<g filter="url(#filter0_d_63_1191)">
<path d="M15.4157 22.1291H12.0382C11.9582 22.1285 11.879 22.145 11.8059 22.1774C11.7328 22.2098 11.6675 22.2574 11.6142 22.3171C11.5609 22.3767 11.521 22.4471 11.497 22.5234C11.4731 22.5997 11.4657 22.6802 11.4753 22.7596L11.9819 26.7675C12.0151 27.0421 12.1482 27.2949 12.3558 27.4776C12.5635 27.6604 12.8311 27.7603 13.1077 27.7583H14.3687C14.6452 27.7603 14.9129 27.6604 15.1205 27.4776C15.3282 27.2949 15.4613 27.0421 15.4945 26.7675L15.9786 22.7596C15.9882 22.6802 15.9808 22.5997 15.9568 22.5234C15.9328 22.4471 15.8929 22.3767 15.8396 22.3171C15.7864 22.2574 15.721 22.2098 15.6479 22.1774C15.5748 22.145 15.4956 22.1285 15.4157 22.1291Z" fill="#004E86"/>
<path d="M18.5117 10.3079C18.5863 10.3079 18.6579 10.2782 18.7107 10.2254C18.7635 10.1726 18.7931 10.1011 18.7931 10.0264V3.55286C18.7929 3.09012 18.6502 2.63867 18.3843 2.25995C18.1184 1.88123 17.7422 1.59363 17.307 1.4363C16.16 1.0088 14.9505 0.772981 13.7269 0.738281C12.5033 0.772981 11.2938 1.0088 10.1467 1.4363C9.71156 1.59363 9.33543 1.88123 9.06952 2.25995C8.80361 2.63867 8.66084 3.09012 8.66064 3.55286V10.0264C8.66064 10.1011 8.6903 10.1726 8.74308 10.2254C8.79587 10.2782 8.86746 10.3079 8.9421 10.3079H18.5117Z" fill="#004E86"/>
<path d="M15.1342 11.9966C15.0595 11.9966 14.9879 12.0263 14.9352 12.0791C14.8824 12.1319 14.8527 12.2035 14.8527 12.2781V15.3741C14.8527 15.6727 14.7341 15.9591 14.523 16.1702C14.3118 16.3814 14.0255 16.5 13.7269 16.5C13.4283 16.5 13.1419 16.3814 12.9308 16.1702C12.7197 15.9591 12.6011 15.6727 12.6011 15.3741V12.2781C12.6011 12.2035 12.5714 12.1319 12.5186 12.0791C12.4658 12.0263 12.3943 11.9966 12.3196 11.9966H8.9421C8.86746 11.9966 8.79587 12.0263 8.74308 12.0791C8.6903 12.1319 8.66064 12.2035 8.66064 12.2781V16.5C8.66115 16.9908 8.82782 17.467 9.13349 17.851L10.6871 19.7874C10.8479 19.9917 11.0532 20.1567 11.2873 20.2699C11.5213 20.383 11.7781 20.4413 12.0381 20.4404H15.4156C15.6756 20.4413 15.9324 20.383 16.1665 20.2699C16.4006 20.1567 16.6059 19.9917 16.7666 19.7874L18.3203 17.851C18.626 17.467 18.7926 16.9908 18.7931 16.5V12.2781C18.7931 12.2035 18.7635 12.1319 18.7107 12.0791C18.6579 12.0263 18.5863 11.9966 18.5117 11.9966H15.1342Z" fill="#004E86"/>
</g>
</g>
<defs>
<filter id="filter0_d_63_1191" x="4.66064" y="0.738281" width="18.1326" height="35.02" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_63_1191"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_63_1191" result="shape"/>
</filter>
<clipPath id="clip0_63_1191">
<rect width="27.02" height="27.02" fill="white" transform="translate(0.216797 0.738281)"/>
</clipPath>
</defs>
</svg>
`,
			tab: 'recording'
		},
		{
			name: 'Recording History',
			svg: `<svg width="24" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M22.2525 3.42787H7.8969C6.0314 3.42787 4.51911 4.94016 4.51911 6.80566V24.5391C4.51911 25.0054 4.89718 25.3835 5.36356 25.3835H20.5636C21.03 25.3835 21.4081 25.0054 21.4081 24.5391C21.4081 24.0727 21.03 23.6946 20.5636 23.6946H6.20801C6.20801 22.7619 6.96415 22.0057 7.8969 22.0057H22.2525C22.7189 22.0057 23.0969 21.6276 23.0969 21.1613V4.27232C23.0969 3.80594 22.7189 3.42787 22.2525 3.42787ZM21.4081 20.3168H7.8969C7.30383 20.316 6.72112 20.4722 6.20801 20.7697V6.80566C6.20801 5.87291 6.96415 5.11677 7.8969 5.11677H21.4081V20.3168Z" fill="#004E86"/>
</svg>



`,
			tab: 'history'
		}
	];
	let keys = [
		'Name',
		'Age',
		'Gender',
		'History of Present Illness',
		'Social History',
		'Family History',
		'Allergies',
		'Medications',
		'Immunizations',
		'Review of Systems',
		'Physical Exam',
		'Results',
		'Procedure',
		'Assessment and Plan'
	];
	let selectedTranscript = null;
	let edited_text = '';
	function getAllTranscription(uid) {
		let fApp;
		if (!getApps().length) {
			fApp = initializeApp(firebaseConfig, {
				experimentalForceLongPolling: true,
				useFetchStreams: false
			});
		} else {
			fApp = getApps()[0];
		}
		const db = getFirestore(fApp);
		const docRef = doc(db, 'transcription', uid);

		getDoc(docRef)
			.then((docSnap) => {
				if (docSnap.exists()) {
					let t = docSnap.data().q || {};
					trnscpt.set(t);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}
	const unsub_user = userStore.subscribe((u) => {
		if (!user && u) {
			getAllTranscription(u.uid);
		}
		user = u;
	});
	onMount(() => {
		if (browser) {
			let q = [];
			if (user) {
				getAllTranscription(user.uid);
			}
			try {
				let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
				recognition = new SpeechRecognition();
				recognition.continuous = true;
				recognition.onresult = function (event) {
					let current = event.resultIndex;
					let transcript = event.results[current][0].transcript;
					transcriptionContent += transcript;
				};

				recognition.onerror = function (event) {
					if (event.error == 'no-speech') {
					}
				};
			} catch (e) {
				support = false;
			}
		}
	});
	onDestroy(() => {
		unsub_user();
	});
	async function saveTranscription(k, content, index = null) {
		if (!content) {
			return;
		}
		const response = await fetch('/recording/query/', {
			method: 'POST',
			body: JSON.stringify({ values: content })
		});
		let { report } = await response.json();
		try {
			const p = JSON.parse(report);
			patients_data.update((m) => {
				m[p.Name] = p;
				return m;
			});
			trnscpt.update((trns) => {
				if (index) {
					trns[index][k].content = content;
					trns[index][k].summary = p;
				} else {
					trns = [...trns, { [k]: { content: content, summary: p } }];
				}
				updateTrnscrptDB(trns);
				return trns;
			});
		} catch (e) {
			console.log(e);
		}
	}
	async function updateSummary(index, k, content) {
		trnscpt.update((trns) => {
			trns[index][k].content = content;
			updateTrnscrptDB(trns);
			return trns;
		});
		const response = await fetch('/recording/query/', {
			method: 'POST',
			body: JSON.stringify({ values: content })
		});
		let { report } = await response.json();
		try {
			const p = JSON.parse(report);
			patients_data.update((m) => {
				m[p.Name] = p;
				return m;
			});
			trnscpt.update((trns) => {
				trns = [...trns, { [k]: { content: content, summary: p } }];
				updateTrnscrptDB(trns);
				return trns;
			});
		} catch (e) {
			console.log(e);
		}
	}
	function updateTrnscrptDB(q) {
		let fApp;
		if (!getApps().length) {
			fApp = initializeApp(firebaseConfig, {
				experimentalForceLongPolling: true,
				useFetchStreams: false
			});
		} else {
			fApp = getApps()[0];
		}
		const db = getFirestore(fApp);
		if (user) {
			setDoc(doc(db, 'transcription', user.uid), { q });
		}
	}
	function deleteTranscription(index) {
		if (browser) {
			trnscpt.update((trns) => {
				trns.splice(index, 1);
				updateTrnscrptDB(trns);
				return trns;
			});
		}
	}
	function recorderHandler(event) {
		let type = event.detail.actionType;
		if (type === 'SAVE') {
			saveHandler();
		}
		if (!support) {
			return;
		}
		if (type === 'PLAY') {
			startHandler();
		} else if (type === 'PAUSE') {
			pauseHandler();
		} else if (type === 'RESET') {
			resetHandler();
		} else {
		}
	}
	function startHandler() {
		if (transcriptionContent.length) {
			transcriptionContent += ' ';
		}
		recognition.start();
	}
	function pauseHandler() {
		recognition.stop();
	}
	function resetHandler() {
		if (browser) {
			transcriptionContent = '';
		}
	}
	function saveHandler() {
		if (browser) {
			if (support) {
				recognition.stop();
			}
			if (!transcriptionContent.length) {
				('Could not save empty transcription. Please add a message to your transcription.');
			} else {
				const dateTime = new Date().toLocaleString();
				let k = 'transcription-' + dateTime;
				saveTranscription(k, transcriptionContent);
				transcriptionContent = '';
			}
		}
	}
	async function editTranscription(content) {
		if (!inputValue) {
			return;
		}
		const response = await fetch('/recording/edit/', {
			method: 'POST',
			body: JSON.stringify({ data: content, prompt: inputValue })
		});
		let { report } = await response.json();
		try {
			edited_text = JSON.parse(report).edited_text;
		} catch (e) {
			console.log(e);
		}
	}
</script>

<main class="flex md:ml-4 justify-center items-start gap-10 pt-0">
	<button
		class=" absolute top-16 left-4 md:hidden"
		on:click={() => {
			show_sub = !show_sub;
		}}
	>
		{#if show_sub}
			<svg
				width="25"
				height="25"
				viewBox="0 0 25 25"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle
					cx="12.7617"
					cy="12.4375"
					r="11.5811"
					transform="rotate(-89.944 12.7617 12.4375)"
					fill="#004E86"
					stroke="white"
					stroke-width="0.837838"
				/>
				<path
					d="M18.9911 12.831C19.4538 12.8315 19.8293 12.4567 19.8298 11.994C19.8302 11.5313 19.4555 11.1558 18.9928 11.1553L18.9911 12.831ZM6.00767 11.388C5.68016 11.7149 5.67964 12.2454 6.00652 12.5729L11.3333 17.9101C11.6601 18.2376 12.1906 18.2381 12.5182 17.9112C12.8457 17.5844 12.8462 17.0539 12.5193 16.7264L7.78442 11.9822L12.5286 7.24732C12.8561 6.92044 12.8566 6.38996 12.5297 6.06244C12.2029 5.73492 11.6724 5.73441 11.3448 6.06128L6.00767 11.388ZM18.9928 11.1553L6.60035 11.1432L6.59872 12.8189L18.9911 12.831L18.9928 11.1553Z"
					fill="white"
				/>
			</svg>
		{:else}
			<svg
				width="27"
				height="27"
				viewBox="0 0 27 27"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle
					cx="13.2034"
					cy="13.1757"
					r="12.4189"
					transform="rotate(90.3352 13.2034 13.1757)"
					fill="#004E86"
					stroke="white"
					stroke-width="0.837838"
				/>
				<path
					d="M6.97609 12.752C6.51338 12.7493 6.13607 13.1222 6.13337 13.5849C6.13066 14.0477 6.50357 14.425 6.96629 14.4277L6.97609 12.752ZM19.9524 14.2582C20.2815 13.933 20.2846 13.4025 19.9593 13.0734L14.6586 7.71031C14.3333 7.3812 13.8028 7.3781 13.4737 7.70337C13.1446 8.02865 13.1415 8.55913 13.4668 8.88824L18.1785 13.6554L13.4114 18.3671C13.0823 18.6924 13.0792 19.2229 13.4044 19.552C13.7297 19.8811 14.2602 19.8842 14.5893 19.5589L19.9524 14.2582ZM6.96629 14.4277L19.3585 14.5002L19.3683 12.8245L6.97609 12.752L6.96629 14.4277Z"
					fill="white"
				/>
			</svg>
		{/if}
	</button>
	<div
		class="w-[30%] z-50 {!show_sub
			? 'hidden'
			: ''} md:hidden top-24 left-4 absolute bg-[#CDE6EA] p-2 rounded-lg shadow-md text-[#004E86]"
	>
		<div class="text-xl mb-4 font-bold text-center w-full flex flex-row">Recording Overview</div>
		<div class="w-full border-[2px] border-[#ffffff]"></div>

		<ul class="space-y-2 flex">
			{#each menu as item}
				<button
					class="w-full text-left p-2 rounded-lg cursor-pointer flex flex-row items-center justify-start"
					on:click={() => {
						nav_tab = item.tab;
					}}
				>
					{@html item.svg}&nbsp{item.name}
				</button>
			{/each}
		</ul>
	</div>
	<div
		class="w-[25%] hidden md:flex flex-col mt-0 bg-[#CDE6EA] p-4 rounded-lg shadow-md text-[#004E86]"
	>
		<div class="text-xl mb-4 font-bold ml-10">Recording Overview</div>

		<div class="w-full border-[2px] border-[#ffffff] mb-2 -mt-3"></div>
		<ul class="flex flex-col justify-start items-start space-y-2">
			{#each menu as item}
				<button
					class="w-full p-2 rounded-lg cursor-pointer flex flex-row items-start justify-start hover:bg-slate-100"
					on:click={() => {
						nav_tab = item.tab;
					}}
				>
					{@html item.svg}&nbsp {item.name}
				</button>
			{/each}
		</ul>
	</div>
	<div class="w-full md:w-[80%] flex flex-col justify-center items-center gap-y-5">
		{#if nav_tab === 'recording'}
			<h1 class=" text-2xl md:text-4xl font-[600] text-[#AAAAAA]">Recording Copilot</h1>
			<div
				class=" w-[90%] md:w-[40%] flex flex-row border-[1px] border-[#004E86] justify-around rounded-2xl text-[#AAAAAA]"
			>
				<button
					class="rounded-2xl p-1 w-1/2 h-full {active_tab === 'record'
						? 'border-[1px] border-[#004E86] bg-[#DEEDF3] text-[#004E86]'
						: 'text-[#004E86]'}"
					on:click={() => {
						active_tab = 'record';
					}}>Recorder</button
				>
				<button
					class="rounded-2xl p-1 w-1/2 h-full {active_tab === 'meet'
						? 'border-[1px] border-[#004E86] bg-[#DEEDF3] text-[#004E86]'
						: 'text-[#004E86]'}"
					on:click={() => {
						active_tab = 'meet';
					}}
				>
					Join Meeting</button
				>
			</div>
			{#if active_tab === 'record'}
				{#if !support}
					<h2 class="p-2 px-4 text-sm font-[600] text-red-600">
						Your browser does not support SpeechRecognition. Please use another browser.
					</h2>
				{/if}
				<Recorder on:recorderHandler={recorderHandler} />
				{#if transcriptionContent}
					<div class="w-full bg-[#ffffff] text-xl px-2 font-[600] flex flex-row justify-start">
						{transcriptionContent}
					</div>
				{/if}
			{:else}
				<div class="border-[1px] w-[95%] md:w-[80%] border-[#004E86B8] bg-[#F0FDFF] rounded-[15px]">
					<div
						class="border-b-[1px] p-2 md:p-4 md:px-8 flex flex-row w-full justify-between border-[#004E86B8]"
					>
						<div class="font-[600] text-[#706D6D] flex flex-row gap-2 items-center">
							<svg
								width="33"
								height="33"
								viewBox="0 0 33 33"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<g clip-path="url(#clip0_63_4761)">
									<path
										d="M9.23706 4.24109V7.24109M23.2371 4.24109V7.24109M4.23706 25.2411V10.2411C4.23706 9.44544 4.55313 8.68238 5.11574 8.11977C5.67835 7.55716 6.44141 7.24109 7.23706 7.24109H25.2371C26.0327 7.24109 26.7958 7.55716 27.3584 8.11977C27.921 8.68238 28.2371 9.44544 28.2371 10.2411V25.2411M4.23706 25.2411C4.23706 26.0367 4.55313 26.7998 5.11574 27.3624C5.67835 27.925 6.44141 28.2411 7.23706 28.2411H25.2371C26.0327 28.2411 26.7958 27.925 27.3584 27.3624C27.921 26.7998 28.2371 26.0367 28.2371 25.2411M4.23706 25.2411V15.2411C4.23706 14.4454 4.55313 13.6824 5.11574 13.1198C5.67835 12.5572 6.44141 12.2411 7.23706 12.2411H25.2371C26.0327 12.2411 26.7958 12.5572 27.3584 13.1198C27.921 13.6824 28.2371 14.4454 28.2371 15.2411V25.2411M16.2371 17.2411H16.2477V17.2518H16.2371V17.2411ZM16.2371 20.2411H16.2477V20.2518H16.2371V20.2411ZM16.2371 23.2411H16.2477V23.2518H16.2371V23.2411ZM13.2371 20.2411H13.2477V20.2518H13.2371V20.2411ZM13.2371 23.2411H13.2477V23.2518H13.2371V23.2411ZM10.2371 20.2411H10.2477V20.2518H10.2371V20.2411ZM10.2371 23.2411H10.2477V23.2518H10.2371V23.2411ZM19.2371 17.2411H19.2477V17.2518H19.2371V17.2411ZM19.2371 20.2411H19.2477V20.2518H19.2371V20.2411ZM19.2371 23.2411H19.2477V23.2518H19.2371V23.2411ZM22.2371 17.2411H22.2477V17.2518H22.2371V17.2411ZM22.2371 20.2411H22.2477V20.2518H22.2371V20.2411Z"
										stroke="#706D6D"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<path
										d="M9.23657 4.24048V7.24048M23.2366 4.24048V7.24048M4.23657 25.2405V10.2405C4.23657 9.44483 4.55264 8.68177 5.11525 8.11916C5.67786 7.55655 6.44092 7.24048 7.23657 7.24048H25.2366C26.0322 7.24048 26.7953 7.55655 27.3579 8.11916C27.9205 8.68177 28.2366 9.44483 28.2366 10.2405V25.2405M4.23657 25.2405C4.23657 26.0361 4.55264 26.7992 5.11525 27.3618C5.67786 27.9244 6.44092 28.2405 7.23657 28.2405H25.2366C26.0322 28.2405 26.7953 27.9244 27.3579 27.3618C27.9205 26.7992 28.2366 26.0361 28.2366 25.2405M4.23657 25.2405V15.2405C4.23657 14.4448 4.55264 13.6818 5.11525 13.1192C5.67786 12.5565 6.44092 12.2405 7.23657 12.2405H25.2366C26.0322 12.2405 26.7953 12.5565 27.3579 13.1192C27.9205 13.6818 28.2366 14.4448 28.2366 15.2405V25.2405M16.2366 17.2405H16.2472V17.2511H16.2366V17.2405ZM16.2366 20.2405H16.2472V20.2511H16.2366V20.2405ZM16.2366 23.2405H16.2472V23.2511H16.2366V23.2405ZM13.2366 20.2405H13.2472V20.2511H13.2366V20.2405ZM13.2366 23.2405H13.2472V23.2511H13.2366V23.2405ZM10.2366 20.2405H10.2472V20.2511H10.2366V20.2405ZM10.2366 23.2405H10.2472V23.2511H10.2366V23.2405ZM19.2366 17.2405H19.2472V17.2511H19.2366V17.2405ZM19.2366 20.2405H19.2472V20.2511H19.2366V20.2405ZM19.2366 23.2405H19.2472V23.2511H19.2366V23.2405ZM22.2366 17.2405H22.2472V17.2511H22.2366V17.2405ZM22.2366 20.2405H22.2472V20.2511H22.2366V20.2405Z"
										stroke="#706D6D"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</g>
								<defs>
									<clipPath id="clip0_63_4761">
										<rect
											width="32"
											height="32"
											fill="white"
											transform="translate(0.236328 0.240356)"
										/>
									</clipPath>
								</defs>
							</svg>

							Calendar Meetings
						</div>
						<div class="flex flex-row justify-around items-center gap-2">
							<div class="text-[#706D6D] text-sm gap-2 flex flex-row">
								<svg
									width="27"
									height="16"
									viewBox="0 0 27 16"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M1.0293 11.0734L4.87815 14.4256C5.40761 14.8867 6.21366 14.8181 6.65759 14.2742L16.878 1.75061"
										stroke="#706D6D"
										stroke-width="1.98108"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<path
										d="M9.18164 10.4907L13.0305 13.8429C13.5599 14.3041 14.366 14.2355 14.8099 13.6915L25.0303 1.16797"
										stroke="#706D6D"
										stroke-width="1.98108"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>

								Connected
							</div>
							<button
								class="px-4 py-2 bg-[#F0FDFF] border-[1px] border-[#004E86B8] text-[#004E86] flex flex-row rounded-xl shadow-lg"
							>
								<svg
									width="27"
									height="27"
									viewBox="0 0 27 27"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M4.45337 25.8652V21.2511H9.06771"
										stroke="#004E86"
										stroke-width="1.9982"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<path
										d="M25.4759 11.6656C26.624 17.771 22.8878 23.8237 16.7875 25.4583C12.1186 26.7093 7.35476 25.0265 4.45337 21.54"
										stroke="#004E86"
										stroke-width="1.9982"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<path
										d="M1.88931 16.0747C0.741186 9.96928 4.47755 3.91648 10.5778 2.282C15.2463 1.0311 20.0098 2.71356 22.9113 6.19954"
										stroke="#004E86"
										stroke-width="1.9982"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<path
										d="M22.9099 1.87476V6.48893H18.2957"
										stroke="#004E86"
										stroke-width="1.9982"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<path
										d="M8.26849 14.4895C7.61558 14.3759 7.61558 13.4387 8.26849 13.3251C10.6339 12.9136 12.5152 11.112 13.0286 8.76672L13.068 8.58695C13.2092 7.94169 14.128 7.93767 14.2749 8.58166L14.3227 8.79117C14.8551 11.1254 16.7369 12.9117 19.0957 13.3221C19.7519 13.4363 19.7519 14.3783 19.0957 14.4924C16.7369 14.9028 14.8551 16.6892 14.3227 19.0234L14.2749 19.2329C14.128 19.8769 13.2092 19.8728 13.068 19.2276L13.0286 19.0479C12.5152 16.7026 10.6339 14.901 8.26849 14.4895Z"
										stroke="#004E86"
										stroke-width="1.9982"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>

								&nbsp; Sync
							</button>
						</div>
					</div>
					<div class="flex flex-col p-2 w-full justify-center items-center gap-4">
						<div class="text-[#706D6D]">
							Choose which meetings AI Nursing Meetbot will automatically join.
						</div>
						<input
							class="p-3 rounded-2xl w-[85%] border-[1px] border-[#004E86B8]"
							placeholder="Join all calendar events with web a web-conf link"
						/>
						<div class="flex flex-row w-[85%] justify-evenly items-center">
							<div class="flex flex-col gap-3 text-[#004E86B8] font-[600] items-center">
								Zoom<Checkbox color="blue" />
							</div>
							<div class="flex flex-col gap-3 text-[#004E86B8] font-[600] items-center">
								Google Meet<Checkbox color="blue" />
							</div>
							<div class="flex flex-col gap-3 text-[#004E86B8] font-[600] items-center">
								Microsoft Teams<Checkbox color="blue" />
							</div>
							<div class="flex flex-col gap-3 text-[#004E86B8] font-[600] items-center">
								Custom Add<Checkbox color="blue" />
							</div>
						</div>
					</div>
				</div>
				<div class="border-[1px] w-[95%] md:w-[80%] border-[#004E86B8] bg-[#F0FDFF] rounded-[15px]">
					<div class="flex flex-col p-2 w-full justify-center items-center gap-4">
						<div class="text-[#706D6D] flex flex-row items-center w-full justify-start px-4 p-2">
							<svg
								width="35"
								height="45"
								viewBox="0 0 35 45"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M29.1165 1.27189C29.1165 0.812328 28.897 0.406259 28.5749 0.269948C28.2528 0.133638 27.9032 0.298817 27.7121 0.677512L19.2431 17.4639C19.0812 17.785 19.0631 18.2019 19.1962 18.5468C19.3293 18.8916 19.5917 19.1075 19.8776 19.1075H24.497V28.5499C24.497 29.0094 24.7165 29.4155 25.0385 29.5518C25.3606 29.688 25.7103 29.5229 25.9014 29.1441L34.3703 12.3578C34.5323 12.0367 34.5505 11.6198 34.4173 11.275C34.2842 10.9302 34.0218 10.7143 33.7359 10.7143H29.1165V1.27189Z"
									fill="#706D6D"
								/>
								<path
									d="M2.50586 18.5876L14.952 18.2782"
									stroke="#706D6D"
									stroke-opacity="0.51"
									stroke-width="4.66675"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M6.35498 5.16016L18.8012 4.85068"
									stroke="#706D6D"
									stroke-opacity="0.51"
									stroke-width="4.66675"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M6.99805 32.0149L19.4442 31.7054"
									stroke="#706D6D"
									stroke-opacity="0.51"
									stroke-width="4.66675"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
							&nbsp Add to live adhoc meeting.
						</div>
						<div class="flex flex-row w-[85%] justify-evenly items-center">
							<input
								class="p-3 rounded-2xl w-[85%] border-[1px] border-[#004E86B8]"
								placeholder="Join all calendar events with web a web-conf link"
							/>
							<button
								class="px-8 py-2 bg-[#004E86B8] border-[1px] border-[#004E86B8] text-white font-semibold flex flex-row rounded-xl shadow-lg"
							>
								Join
							</button>
						</div>
					</div>
				</div>
			{/if}
		{:else}
			<h1 class="text-4xl font-[600] text-[#AAAAAA]">Recording History</h1>
			{#if !selectedTranscript}
				<div class="w-full p-2 bg-[#F0FDFF]">
					{#each $trnscpt as tr, index}
						{#each Object.entries(tr) as [k, v]}
							<button
								class="w-full bg-[#ffffff] flex flex-row justify-between p-4 my-2"
								on:click={() => {
									selectedTranscript = [index, k];
								}}
							>
								<div class="text-xl w-1/2 font-[600] flex flex-row justify-start">{k}</div>
							</button>
						{/each}
					{/each}
				</div>
			{:else}
				<div class="flex flex-col md:flex-row w-full bg-[#F0FDFF] items-start gap-4 h-full">
					<div class="flex flex-col items-start justify-center w-2/3 bg-[#F0FDFF] gap-4 p-4">
						<div class="flex flex-row p-2 justify-between gap-5">
							<button
								on:click={() => {
									selectedTranscript = null;
								}}
							>
								<svg
									width="25"
									height="25"
									viewBox="0 0 25 25"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<circle
										cx="12.7617"
										cy="12.4375"
										r="11.5811"
										transform="rotate(-89.944 12.7617 12.4375)"
										fill="#004E86"
										stroke="white"
										stroke-width="0.837838"
									/>
									<path
										d="M18.9911 12.831C19.4538 12.8315 19.8293 12.4567 19.8298 11.994C19.8302 11.5313 19.4555 11.1558 18.9928 11.1553L18.9911 12.831ZM6.00767 11.388C5.68016 11.7149 5.67964 12.2454 6.00652 12.5729L11.3333 17.9101C11.6601 18.2376 12.1906 18.2381 12.5182 17.9112C12.8457 17.5844 12.8462 17.0539 12.5193 16.7264L7.78442 11.9822L12.5286 7.24732C12.8561 6.92044 12.8566 6.38996 12.5297 6.06244C12.2029 5.73492 11.6724 5.73441 11.3448 6.06128L6.00767 11.388ZM18.9928 11.1553L6.60035 11.1432L6.59872 12.8189L18.9911 12.831L18.9928 11.1553Z"
										fill="white"
									/>
								</svg></button
							>
							<div class="flex flex-row w-full justify-center font-[600] text-2xl text-[#3D4D5C]">
								{selectedTranscript[1]}
							</div>
						</div>
						<div class="w-1/2 text-sm text-[#706D6D] flex flex-row justify-between">
							{selectedTranscript[1].split('-')[1]}<span class="flex flex-row items-center"
								>Add Tags &nbsp<svg
									width="17"
									height="17"
									viewBox="0 0 17 17"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M9.80887 1.64676C9.80887 1.01558 9.29719 0.503906 8.66602 0.503906C8.03484 0.503906 7.52316 1.01558 7.52316 1.64676V7.36105H1.80887C1.17769 7.36105 0.666016 7.87273 0.666016 8.50391C0.666016 9.13508 1.17769 9.64676 1.80887 9.64676H7.52316V15.361C7.52316 15.9923 8.03484 16.5039 8.66602 16.5039C9.29719 16.5039 9.80887 15.9923 9.80887 15.361V9.64676H15.5232C16.1544 9.64676 16.666 9.13508 16.666 8.50391C16.666 7.87273 16.1544 7.36105 15.5232 7.36105H9.80887V1.64676Z"
										fill="#706D6D"
									/>
								</svg>
							</span>
						</div>

						<div class="flex flex-row w-full justify-between">
							<div class="flex flex-row justify-start gap-5 w-1/3">
								<button
									on:click={() => {
										contentEditable = !contentEditable;
									}}
								>
									<svg
										width="23"
										height="23"
										viewBox="0 0 33 33"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<g clip-path="url(#clip0_63_3912)">
											<path
												d="M20.6141 6.057C20.5521 5.99258 20.4775 5.94159 20.3949 5.90719C20.3123 5.87279 20.2236 5.85571 20.1341 5.857C19.9602 5.85596 19.7927 5.92295 19.6675 6.04367L5.10748 20.6037C5.04499 20.6656 4.9954 20.7394 4.96155 20.8206C4.9277 20.9019 4.91028 20.989 4.91028 21.077C4.91028 21.165 4.9277 21.2521 4.96155 21.3334C4.9954 21.4146 5.04499 21.4884 5.10748 21.5503L11.6941 28.137C11.8213 28.2646 11.994 28.3366 12.1741 28.337C12.2613 28.3365 12.3476 28.3185 12.4277 28.2842C12.5078 28.2498 12.5803 28.1998 12.6408 28.137L27.1875 13.5903C27.3105 13.4635 27.3793 13.2937 27.3793 13.117C27.3793 12.9403 27.3105 12.7705 27.1875 12.6437L20.6141 6.057Z"
												fill="#004E86"
											/>
											<path
												d="M3.76237 23.1229C3.67663 23.043 3.57169 22.9867 3.45773 22.9593C3.34378 22.9319 3.22468 22.9344 3.11199 22.9666C2.9993 22.9988 2.89684 23.0596 2.81456 23.143C2.73228 23.2265 2.67296 23.3298 2.64237 23.4429L0.629038 31.8029C0.602357 31.9146 0.605563 32.0313 0.638333 32.1413C0.671103 32.2513 0.73228 32.3508 0.815705 32.4296C0.896058 32.5109 0.995598 32.5706 1.10513 32.6032C1.21466 32.6358 1.33065 32.6403 1.44237 32.6163L9.85571 30.6029C9.97037 30.5757 10.0755 30.5179 10.16 30.4358C10.2445 30.3536 10.3052 30.2501 10.3357 30.1363C10.3667 30.0227 10.3682 29.9032 10.3402 29.7889C10.3122 29.6746 10.2556 29.5693 10.1757 29.4829L3.76237 23.1229Z"
												fill="#004E86"
											/>
											<path
												d="M31.4557 4.6163L28.6291 1.78964C28.0003 1.16917 27.1524 0.821289 26.2691 0.821289C25.3857 0.821289 24.5378 1.16917 23.9091 1.78964L22.0291 3.68297C21.9653 3.74282 21.9144 3.81511 21.8797 3.89538C21.845 3.97564 21.827 4.06218 21.827 4.14964C21.827 4.2371 21.845 4.32363 21.8797 4.4039C21.9144 4.48416 21.9653 4.55645 22.0291 4.6163L28.6291 11.283C28.6889 11.3467 28.7612 11.3976 28.8415 11.4323C28.9217 11.4671 29.0083 11.485 29.0957 11.485C29.1832 11.485 29.2697 11.4671 29.35 11.4323C29.4302 11.3976 29.5025 11.3467 29.5624 11.283L31.4557 9.32297C32.0786 8.69815 32.4283 7.85189 32.4283 6.96964C32.4283 6.08739 32.0786 5.24112 31.4557 4.6163Z"
												fill="#004E86"
											/>
										</g>
										<defs>
											<clipPath id="clip0_63_3912">
												<rect
													width="32"
													height="32"
													fill="white"
													transform="translate(0.523438 0.722656)"
												/>
											</clipPath>
										</defs>
									</svg>
								</button>
								<button on:click={() => {}}>
									<svg
										width="31"
										height="31"
										viewBox="0 0 31 31"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M6.17438 20.0038C8.81232 20.0038 10.9508 17.8653 10.9508 15.2274C10.9508 12.5894 8.81232 10.4509 6.17438 10.4509C3.53643 10.4509 1.39795 12.5894 1.39795 15.2274C1.39795 17.8653 3.53643 20.0038 6.17438 20.0038Z"
											stroke="#004E86"
											stroke-width="2.28"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
										<path
											d="M24.2191 29.0306C26.8569 29.0306 28.9955 26.8921 28.9955 24.2542C28.9955 21.6164 26.8569 19.4778 24.2191 19.4778C21.5812 19.4778 19.4426 21.6164 19.4426 24.2542C19.4426 26.8921 21.5812 29.0306 24.2191 29.0306Z"
											stroke="#004E86"
											stroke-width="2.28"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
										<path
											d="M24.2191 10.983C26.8569 10.983 28.9955 8.84455 28.9955 6.2066C28.9955 3.56866 26.8569 1.43018 24.2191 1.43018C21.5812 1.43018 19.4426 3.56866 19.4426 6.2066C19.4426 8.84455 21.5812 10.983 24.2191 10.983Z"
											stroke="#004E86"
											stroke-width="2.28"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
										<path
											d="M10.4426 13.1085L19.953 8.33203"
											stroke="#004E86"
											stroke-width="2.28"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
										<path
											d="M10.4426 17.3528L19.953 22.1292"
											stroke="#004E86"
											stroke-width="2.28"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
								</button>
								<button on:click={() => {}}>
									<svg
										width="27"
										height="28"
										viewBox="0 0 27 28"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M10.282 20.047L19.6153 14.047L10.282 8.04696V20.047ZM13.6153 27.3803C11.7709 27.3803 10.0375 27.0301 8.41532 26.3296C6.7931 25.6292 5.38198 24.6794 4.18198 23.4803C2.98198 22.2812 2.03221 20.8701 1.33265 19.247C0.633095 17.6238 0.282873 15.8905 0.281984 14.047C0.281095 12.2034 0.631318 10.4701 1.33265 8.84696C2.03398 7.22385 2.98376 5.81273 4.18198 4.61362C5.38021 3.41451 6.79132 2.46473 8.41532 1.76429C10.0393 1.06385 11.7726 0.713623 13.6153 0.713623C15.458 0.713623 17.1913 1.06385 18.8153 1.76429C20.4393 2.46473 21.8504 3.41451 23.0487 4.61362C24.2469 5.81273 25.1971 7.22385 25.8993 8.84696C26.6015 10.4701 26.9513 12.2034 26.9487 14.047C26.946 15.8905 26.5958 17.6238 25.898 19.247C25.2002 20.8701 24.2504 22.2812 23.0487 23.4803C21.8469 24.6794 20.4358 25.6296 18.8153 26.331C17.1949 27.0323 15.4615 27.3821 13.6153 27.3803ZM13.6153 24.7136C16.5931 24.7136 19.1153 23.6803 21.182 21.6136C23.2486 19.547 24.282 17.0247 24.282 14.047C24.282 11.0692 23.2486 8.54696 21.182 6.48029C19.1153 4.41362 16.5931 3.38029 13.6153 3.38029C10.6375 3.38029 8.11532 4.41362 6.04865 6.48029C3.98198 8.54696 2.94865 11.0692 2.94865 14.047C2.94865 17.0247 3.98198 19.547 6.04865 21.6136C8.11532 23.6803 10.6375 24.7136 13.6153 24.7136Z"
											fill="#004E86"
										/>
									</svg>
								</button>
							</div>
							<div class="flex flex-row justify-end w-1/3">
								<button
									on:click={() => {
										deleteTranscription(selectedTranscript[0]);
										selectedTranscript = null;
									}}
								>
									<svg
										width="25"
										height="25"
										viewBox="0 0 25 25"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<g clip-path="url(#clip0_63_2616)">
											<path
												d="M1.229 5.59082H23.229"
												stroke="#004E86"
												stroke-width="1.5"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
											<path
												d="M14.4785 1.58887H9.97852C9.5807 1.58887 9.19916 1.74691 8.91786 2.02821C8.63656 2.30951 8.47852 2.69105 8.47852 3.08887V5.58887H15.9785V3.08887C15.9785 2.69105 15.8205 2.30951 15.5392 2.02821C15.2579 1.74691 14.8763 1.58887 14.4785 1.58887Z"
												stroke="#004E86"
												stroke-width="1.5"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
											<path
												d="M9.97852 18.3408V10.8408"
												stroke="#004E86"
												stroke-width="1.5"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
											<path
												d="M14.4785 18.3408V10.8408"
												stroke="#004E86"
												stroke-width="1.5"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
											<path
												d="M19.0885 22.2108C19.0607 22.5866 18.8915 22.9379 18.615 23.194C18.3386 23.45 17.9753 23.5918 17.5985 23.5908H6.85852C6.48169 23.5918 6.11846 23.45 5.84199 23.194C5.56552 22.9379 5.39634 22.5866 5.36852 22.2108L3.97852 5.59082H20.4785L19.0885 22.2108Z"
												stroke="#004E86"
												stroke-width="1.5"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</g>
										<defs>
											<clipPath id="clip0_63_2616">
												<rect
													width="24"
													height="24"
													fill="white"
													transform="translate(0.228516 0.589844)"
												/>
											</clipPath>
										</defs>
									</svg>
								</button>
							</div>
						</div>
						<div class="flex flex-row gap-5">
							<button
								class="px-4 py-2 bg-[#004E86] text-white flex flex-row rounded-xl shadow-lg"
								on:click={() => {
									saveTranscription(selectedTranscript[1], edited_text, selectedTranscript[0]);
								}}
							>
								<svg
									width="25"
									height="25"
									viewBox="0 0 25 25"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M23.1586 17.458C22.8335 17.458 22.5216 17.586 22.2908 17.8141C22.06 18.0422 21.929 18.3519 21.9263 18.6758V20.5378C21.9263 20.9569 21.7592 21.3588 21.4618 21.6551C21.1644 21.9515 20.7611 22.1179 20.3405 22.1179H4.42126C4.00067 22.1179 3.5973 21.9515 3.29989 21.6551C3.00249 21.3588 2.83541 20.9569 2.83541 20.5378V18.6758C2.80759 18.3707 2.66626 18.0869 2.43918 17.8802C2.21209 17.6736 1.91567 17.559 1.60813 17.559C1.30059 17.559 1.00417 17.6736 0.777087 17.8802C0.550004 18.0869 0.408674 18.3707 0.380859 18.6758V20.5378C0.380859 21.6055 0.806544 22.6295 1.56427 23.3845C2.32199 24.1395 3.34968 24.5637 4.42126 24.5637H20.3405C21.412 24.5637 22.4397 24.1395 23.1975 23.3845C23.9552 22.6295 24.3809 21.6055 24.3809 20.5378V18.6758C24.3809 18.5159 24.3492 18.3575 24.2878 18.2098C24.2264 18.062 24.1364 17.9278 24.0229 17.8147C23.9094 17.7016 23.7746 17.6119 23.6264 17.5507C23.4781 17.4895 23.3191 17.458 23.1586 17.458Z"
										fill="white"
									/>
									<path
										d="M12.3493 19.4489C12.869 19.4507 13.3682 19.2467 13.7369 18.8818C14.1057 18.5168 14.3138 18.0209 14.3156 17.5031L14.3467 8.38452C14.347 8.31779 14.3738 8.25388 14.4213 8.20686C14.4688 8.15983 14.5331 8.13354 14.6001 8.13376L17.287 8.14288C17.4686 8.13112 17.6436 8.0707 17.7936 7.96799C17.9436 7.86529 18.0629 7.72413 18.139 7.55942C18.2151 7.39471 18.2451 7.21257 18.2259 7.03226C18.2067 6.85195 18.139 6.68015 18.0298 6.53504L13.1501 0.902377C13.0559 0.8015 12.942 0.720953 12.8154 0.665719C12.6887 0.610488 12.552 0.581745 12.4138 0.581277C12.2755 0.580808 12.1387 0.608622 12.0116 0.662994C11.8846 0.717367 11.7702 0.797139 11.6753 0.897376L6.75718 6.49681C6.64707 6.64118 6.57815 6.81251 6.55771 6.99269C6.53726 7.17286 6.56605 7.3552 6.64102 7.52042C6.71599 7.68564 6.83437 7.82761 6.98364 7.93133C7.13292 8.03505 7.30753 8.09666 7.48905 8.10965L10.1759 8.11876C10.2429 8.11899 10.307 8.14571 10.3542 8.19306C10.4014 8.24041 10.4278 8.3045 10.4276 8.37123L10.3964 17.4898C10.3946 18.0076 10.5994 18.5049 10.9656 18.8724C11.3319 19.2398 11.8296 19.4472 12.3493 19.4489Z"
										fill="white"
									/>
								</svg>
								&nbsp; Sync to EHR
							</button>
							<button
								class="px-4 py-2 bg-[white] text-[#004E86] flex flex-row rounded-xl shadow-lg"
								on:click={() => {
									edit_mode = !edit_mode;
								}}
							>
								<svg
									width="27"
									height="26"
									viewBox="0 0 27 26"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M9.8943 12.2839L8.76367 16.8097L13.2883 15.678L20.0764 8.88988L16.6823 5.49585L9.8943 12.2839Z"
										stroke="#004E86"
										stroke-width="1.59995"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<path
										d="M24.037 4.9292L25.1676 6.05983C25.3163 6.20841 25.4343 6.38484 25.5147 6.57903C25.5952 6.77321 25.6366 6.98134 25.6366 7.19153C25.6366 7.40173 25.5952 7.60986 25.5147 7.80404C25.4343 7.99822 25.3163 8.17465 25.1676 8.32323L21.636 11.8538"
										stroke="#004E86"
										stroke-width="1.59995"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<path
										d="M20.0762 8.88871L24.0366 4.92937C24.3365 4.62933 24.505 4.22245 24.505 3.79821C24.505 3.37395 24.3365 2.96707 24.0366 2.66704L22.9049 1.53534C22.6048 1.23539 22.198 1.06689 21.7737 1.06689C21.3495 1.06689 20.9426 1.23539 20.6425 1.53534L16.6821 5.49362"
										stroke="#004E86"
										stroke-width="1.59995"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<path
										d="M20.8361 15.4664V23.4662C20.8361 23.8905 20.6676 24.2975 20.3675 24.5975C20.0675 24.8976 19.6605 25.0661 19.2362 25.0661H3.23667C2.81234 25.0661 2.40538 24.8976 2.10533 24.5975C1.80528 24.2975 1.63672 23.8905 1.63672 23.4662V7.46665C1.63672 7.04232 1.80528 6.63536 2.10533 6.33531C2.40538 6.03527 2.81234 5.8667 3.23667 5.8667H11.2364"
										stroke="#004E86"
										stroke-width="1.59995"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>

								&nbsp; AI Customize
							</button>
							<button
								class="px-4 py-2 bg-[white] text-black flex flex-row rounded-xl shadow-lg"
								on:click={() => {
									contentEditable = !contentEditable;
								}}
							>
								<svg
									width="26"
									height="26"
									viewBox="0 0 26 26"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M9.3943 12.2839L8.26367 16.8097L12.7883 15.678L19.5764 8.88988L16.1823 5.49585L9.3943 12.2839Z"
										stroke="#3D4D5C"
										stroke-width="1.59995"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<path
										d="M23.537 4.9292L24.6676 6.05983C24.8163 6.20841 24.9343 6.38484 25.0147 6.57903C25.0952 6.77321 25.1366 6.98134 25.1366 7.19153C25.1366 7.40173 25.0952 7.60986 25.0147 7.80404C24.9343 7.99822 24.8163 8.17465 24.6676 8.32323L21.136 11.8538"
										stroke="#3D4D5C"
										stroke-width="1.59995"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<path
										d="M19.5762 8.88871L23.5366 4.92937C23.8365 4.62933 24.005 4.22245 24.005 3.79821C24.005 3.37395 23.8365 2.96707 23.5366 2.66704L22.4049 1.53534C22.1048 1.23539 21.698 1.06689 21.2737 1.06689C20.8495 1.06689 20.4426 1.23539 20.1425 1.53534L16.1821 5.49362"
										stroke="#3D4D5C"
										stroke-width="1.59995"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<path
										d="M20.3361 15.4664V23.4662C20.3361 23.8905 20.1676 24.2975 19.8675 24.5975C19.5675 24.8976 19.1605 25.0661 18.7362 25.0661H2.73667C2.31234 25.0661 1.90538 24.8976 1.60533 24.5975C1.30528 24.2975 1.13672 23.8905 1.13672 23.4662V7.46665C1.13672 7.04232 1.30528 6.63536 1.60533 6.33531C1.90538 6.03527 2.31234 5.8667 2.73667 5.8667H10.7364"
										stroke="#3D4D5C"
										stroke-width="1.59995"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
								&nbsp;
								{#if contentEditable}
									Cancel Edit
								{:else}
									Edit
								{/if}
							</button>
						</div>
						{#if edit_mode}
							<div class="bg-white w-full p-4 rounded-xl shadow-lg">
								<div class="text-[#706D6D]">Edit your Transcription</div>
								<div class="w-full border-2 border-[#004E86] rounded-[25px] flex flex-row">
									<input class="w-[75%] p-4 border-0 inputBox" bind:value={inputValue} />
									<button
										class="w-[25%] apply"
										on:click={() => {
											editTranscription(
												$trnscpt[selectedTranscript[0]][selectedTranscript[1]].content
											);
										}}>Apply</button
									>
								</div>
							</div>
						{/if}
						<button
							class="w-full bg-[#ffffff] flex flex-row justify-between p-4"
							on:click={() => {
								show_summary = !show_summary;
							}}
						>
							<div class="text-xl w-full font-[600] flex flex-row justify-between items-center">
								Summary
								<div class="">
									{#if !show_summary}
										<svg
											width="23"
											height="17"
											viewBox="0 0 27 17"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M26.7271 3.71104L23.6895 0.766113L13.8013 10.3319L3.91307 0.766113L0.875519 3.71104L13.8013 16.2426L26.7271 3.71104Z"
												fill="#706D6D"
											/>
										</svg>
									{:else}
										<svg
											width="23"
											height="17"
											viewBox="0 0 27 17"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M26.604 13.2113L23.5664 16.1562L13.6782 6.59047L3.79003 16.1562L0.752474 13.2113L13.6782 0.679738L26.604 13.2113Z"
												fill="#706D6D"
											/>
										</svg>
									{/if}
								</div>
							</div>
						</button>
						{#if show_summary}
							<div class="w-full flex flex-col justify-center gap-2">
								{#each keys as K}
									{#if $trnscpt[selectedTranscript[0]][selectedTranscript[1]].summary[K] !== ''}
										<div class="w-full text-wrap">
											{#if contentEditable}
												<div class="font-mono">
													<span class="text-lg font-bold text-[#867b00]">{K}:</span>
													<span
														contenteditable="true"
														bind:innerText={$trnscpt[selectedTranscript[0]][selectedTranscript[1]]
															.summary[K]}
													></span>
												</div>
											{:else}
												<div class="font-mono">
													<span class="text-lg font-bold text-[#867b00]">{K}:</span>
													{$trnscpt[selectedTranscript[0]][selectedTranscript[1]].summary[K]}
												</div>
											{/if}
										</div>
									{/if}
								{/each}
								{#if contentEditable}
									<button
										on:click={() => {
											updateTrnscrptDB($trnscpt);
										}}>Save</button
									>
								{/if}
							</div>
						{/if}
						<button
							class="w-full bg-[#ffffff] flex flex-row justify-between p-4"
							on:click={() => {
								show_content = !show_content;
							}}
						>
							<div class="text-xl w-full font-[600] flex flex-row justify-between items-center">
								Original Transcription
								<div class="">
									{#if !show_content}
										<svg
											width="23"
											height="17"
											viewBox="0 0 27 17"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M26.7271 3.71104L23.6895 0.766113L13.8013 10.3319L3.91307 0.766113L0.875519 3.71104L13.8013 16.2426L26.7271 3.71104Z"
												fill="#706D6D"
											/>
										</svg>
									{:else}
										<svg
											width="23"
											height="17"
											viewBox="0 0 27 17"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M26.604 13.2113L23.5664 16.1562L13.6782 6.59047L3.79003 16.1562L0.752474 13.2113L13.6782 0.679738L26.604 13.2113Z"
												fill="#706D6D"
											/>
										</svg>
									{/if}
								</div>
							</div>
						</button>
						{#if show_content}
							<div class="w-full flex flex-row justify-center">
								<pre class="w-full text-wrap">{$trnscpt[selectedTranscript[0]][
										selectedTranscript[1]
									].content}</pre>
							</div>
						{/if}

						{#if edited_text}
							<button
								class="w-full bg-[#ffffff] flex flex-row justify-between p-4"
								on:click={() => {
									show_edited = !show_edited;
								}}
							>
								<div class="text-xl w-full font-[600] flex flex-row justify-between items-center">
									Edited Transcription
									<div class="">
										{#if !show_edited}
											<svg
												width="23"
												height="17"
												viewBox="0 0 27 17"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M26.7271 3.71104L23.6895 0.766113L13.8013 10.3319L3.91307 0.766113L0.875519 3.71104L13.8013 16.2426L26.7271 3.71104Z"
													fill="#706D6D"
												/>
											</svg>
										{:else}
											<svg
												width="23"
												height="17"
												viewBox="0 0 27 17"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M26.604 13.2113L23.5664 16.1562L13.6782 6.59047L3.79003 16.1562L0.752474 13.2113L13.6782 0.679738L26.604 13.2113Z"
													fill="#706D6D"
												/>
											</svg>
										{/if}
									</div>
								</div>
							</button>
							{#if show_edited}
								<div class="w-full flex flex-row justify-center">
									<pre class="text-wrap">{edited_text}</pre>
								</div>
							{/if}
						{/if}
					</div>
					<div class="flex flex-col items-start justify-center w-1/3 gap-3 h-full p-4">
						<h1 class="text-[#004E86] text-xl font-semibold">Generate More</h1>
						<div class="flex flex-col text-[#004E86] gap-2">
							<div class="flex flex-row gap-2 items-center">
								<svg
									width="17"
									height="17"
									viewBox="0 0 17 17"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M9.67215 1.18973C9.67215 0.558549 9.16047 0.046875 8.5293 0.046875C7.89812 0.046875 7.38644 0.558549 7.38644 1.18973V6.90402H1.67215C1.04097 6.90402 0.529297 7.4157 0.529297 8.04688C0.529297 8.67805 1.04097 9.18973 1.67215 9.18973H7.38644V14.904C7.38644 15.5352 7.89812 16.0469 8.5293 16.0469C9.16047 16.0469 9.67215 15.5352 9.67215 14.904V9.18973H15.3864C16.0176 9.18973 16.5293 8.67805 16.5293 8.04688C16.5293 7.4157 16.0176 6.90402 15.3864 6.90402H9.67215V1.18973Z"
										fill="#004E86"
									/>
								</svg>
								Visit Summary
							</div>
							<div class="flex flex-row gap-2 items-center">
								<svg
									width="17"
									height="17"
									viewBox="0 0 17 17"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M9.67215 1.18973C9.67215 0.558549 9.16047 0.046875 8.5293 0.046875C7.89812 0.046875 7.38644 0.558549 7.38644 1.18973V6.90402H1.67215C1.04097 6.90402 0.529297 7.4157 0.529297 8.04688C0.529297 8.67805 1.04097 9.18973 1.67215 9.18973H7.38644V14.904C7.38644 15.5352 7.89812 16.0469 8.5293 16.0469C9.16047 16.0469 9.67215 15.5352 9.67215 14.904V9.18973H15.3864C16.0176 9.18973 16.5293 8.67805 16.5293 8.04688C16.5293 7.4157 16.0176 6.90402 15.3864 6.90402H9.67215V1.18973Z"
										fill="#004E86"
									/>
								</svg>
								Action Items
							</div>
							<div class="flex flex-row gap-2 items-center">
								<svg
									width="17"
									height="17"
									viewBox="0 0 17 17"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M9.67215 1.18973C9.67215 0.558549 9.16047 0.046875 8.5293 0.046875C7.89812 0.046875 7.38644 0.558549 7.38644 1.18973V6.90402H1.67215C1.04097 6.90402 0.529297 7.4157 0.529297 8.04688C0.529297 8.67805 1.04097 9.18973 1.67215 9.18973H7.38644V14.904C7.38644 15.5352 7.89812 16.0469 8.5293 16.0469C9.16047 16.0469 9.67215 15.5352 9.67215 14.904V9.18973H15.3864C16.0176 9.18973 16.5293 8.67805 16.5293 8.04688C16.5293 7.4157 16.0176 6.90402 15.3864 6.90402H9.67215V1.18973Z"
										fill="#004E86"
									/>
								</svg>
								SOAP Notes
							</div>
							<div class="flex flex-row gap-2 items-center">
								<svg
									width="17"
									height="17"
									viewBox="0 0 17 17"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M9.67215 1.18973C9.67215 0.558549 9.16047 0.046875 8.5293 0.046875C7.89812 0.046875 7.38644 0.558549 7.38644 1.18973V6.90402H1.67215C1.04097 6.90402 0.529297 7.4157 0.529297 8.04688C0.529297 8.67805 1.04097 9.18973 1.67215 9.18973H7.38644V14.904C7.38644 15.5352 7.89812 16.0469 8.5293 16.0469C9.16047 16.0469 9.67215 15.5352 9.67215 14.904V9.18973H15.3864C16.0176 9.18973 16.5293 8.67805 16.5293 8.04688C16.5293 7.4157 16.0176 6.90402 15.3864 6.90402H9.67215V1.18973Z"
										fill="#004E86"
									/>
								</svg>
								Treatment Plan
							</div>
							<div class="flex flex-row gap-2 items-center">
								<svg
									width="17"
									height="17"
									viewBox="0 0 17 17"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M9.67215 1.18973C9.67215 0.558549 9.16047 0.046875 8.5293 0.046875C7.89812 0.046875 7.38644 0.558549 7.38644 1.18973V6.90402H1.67215C1.04097 6.90402 0.529297 7.4157 0.529297 8.04688C0.529297 8.67805 1.04097 9.18973 1.67215 9.18973H7.38644V14.904C7.38644 15.5352 7.89812 16.0469 8.5293 16.0469C9.16047 16.0469 9.67215 15.5352 9.67215 14.904V9.18973H15.3864C16.0176 9.18973 16.5293 8.67805 16.5293 8.04688C16.5293 7.4157 16.0176 6.90402 15.3864 6.90402H9.67215V1.18973Z"
										fill="#004E86"
									/>
								</svg>
								Medical Coding
							</div>
							<div class="flex flex-row gap-2 items-center">
								<svg
									width="17"
									height="17"
									viewBox="0 0 17 17"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M9.67215 1.18973C9.67215 0.558549 9.16047 0.046875 8.5293 0.046875C7.89812 0.046875 7.38644 0.558549 7.38644 1.18973V6.90402H1.67215C1.04097 6.90402 0.529297 7.4157 0.529297 8.04688C0.529297 8.67805 1.04097 9.18973 1.67215 9.18973H7.38644V14.904C7.38644 15.5352 7.89812 16.0469 8.5293 16.0469C9.16047 16.0469 9.67215 15.5352 9.67215 14.904V9.18973H15.3864C16.0176 9.18973 16.5293 8.67805 16.5293 8.04688C16.5293 7.4157 16.0176 6.90402 15.3864 6.90402H9.67215V1.18973Z"
										fill="#004E86"
									/>
								</svg>
								H&P Session
							</div>
							<div class="flex flex-row gap-2 items-center">
								<svg
									width="17"
									height="17"
									viewBox="0 0 17 17"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M9.67215 1.18973C9.67215 0.558549 9.16047 0.046875 8.5293 0.046875C7.89812 0.046875 7.38644 0.558549 7.38644 1.18973V6.90402H1.67215C1.04097 6.90402 0.529297 7.4157 0.529297 8.04688C0.529297 8.67805 1.04097 9.18973 1.67215 9.18973H7.38644V14.904C7.38644 15.5352 7.89812 16.0469 8.5293 16.0469C9.16047 16.0469 9.67215 15.5352 9.67215 14.904V9.18973H15.3864C16.0176 9.18973 16.5293 8.67805 16.5293 8.04688C16.5293 7.4157 16.0176 6.90402 15.3864 6.90402H9.67215V1.18973Z"
										fill="#004E86"
									/>
								</svg>
								Process Reflection
							</div>
							<div class="flex flex-row gap-2 items-center">
								<svg
									width="17"
									height="17"
									viewBox="0 0 17 17"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M9.67215 1.18973C9.67215 0.558549 9.16047 0.046875 8.5293 0.046875C7.89812 0.046875 7.38644 0.558549 7.38644 1.18973V6.90402H1.67215C1.04097 6.90402 0.529297 7.4157 0.529297 8.04688C0.529297 8.67805 1.04097 9.18973 1.67215 9.18973H7.38644V14.904C7.38644 15.5352 7.89812 16.0469 8.5293 16.0469C9.16047 16.0469 9.67215 15.5352 9.67215 14.904V9.18973H15.3864C16.0176 9.18973 16.5293 8.67805 16.5293 8.04688C16.5293 7.4157 16.0176 6.90402 15.3864 6.90402H9.67215V1.18973Z"
										fill="#004E86"
									/>
								</svg>
								Discharge Summary
							</div>
							<div class="flex flex-row gap-2 items-center">
								<svg
									width="17"
									height="17"
									viewBox="0 0 17 17"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M9.67215 1.18973C9.67215 0.558549 9.16047 0.046875 8.5293 0.046875C7.89812 0.046875 7.38644 0.558549 7.38644 1.18973V6.90402H1.67215C1.04097 6.90402 0.529297 7.4157 0.529297 8.04688C0.529297 8.67805 1.04097 9.18973 1.67215 9.18973H7.38644V14.904C7.38644 15.5352 7.89812 16.0469 8.5293 16.0469C9.16047 16.0469 9.67215 15.5352 9.67215 14.904V9.18973H15.3864C16.0176 9.18973 16.5293 8.67805 16.5293 8.04688C16.5293 7.4157 16.0176 6.90402 15.3864 6.90402H9.67215V1.18973Z"
										fill="#004E86"
									/>
								</svg>
								Pre-Op Notes
							</div>
							<div class="flex flex-row gap-2 items-center">
								<svg
									width="17"
									height="17"
									viewBox="0 0 17 17"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M9.67215 1.18973C9.67215 0.558549 9.16047 0.046875 8.5293 0.046875C7.89812 0.046875 7.38644 0.558549 7.38644 1.18973V6.90402H1.67215C1.04097 6.90402 0.529297 7.4157 0.529297 8.04688C0.529297 8.67805 1.04097 9.18973 1.67215 9.18973H7.38644V14.904C7.38644 15.5352 7.89812 16.0469 8.5293 16.0469C9.16047 16.0469 9.67215 15.5352 9.67215 14.904V9.18973H15.3864C16.0176 9.18973 16.5293 8.67805 16.5293 8.04688C16.5293 7.4157 16.0176 6.90402 15.3864 6.90402H9.67215V1.18973Z"
										fill="#004E86"
									/>
								</svg>
								Nursing Hand Overs
							</div>
							<div class="flex flex-row gap-2 items-center">
								<svg
									width="17"
									height="17"
									viewBox="0 0 17 17"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M9.67215 1.18973C9.67215 0.558549 9.16047 0.046875 8.5293 0.046875C7.89812 0.046875 7.38644 0.558549 7.38644 1.18973V6.90402H1.67215C1.04097 6.90402 0.529297 7.4157 0.529297 8.04688C0.529297 8.67805 1.04097 9.18973 1.67215 9.18973H7.38644V14.904C7.38644 15.5352 7.89812 16.0469 8.5293 16.0469C9.16047 16.0469 9.67215 15.5352 9.67215 14.904V9.18973H15.3864C16.0176 9.18973 16.5293 8.67805 16.5293 8.04688C16.5293 7.4157 16.0176 6.90402 15.3864 6.90402H9.67215V1.18973Z"
										fill="#004E86"
									/>
								</svg>
								Add Custom Templates
							</div>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</main>

<style>
	.inputBox {
		border-radius: 25px 0px 0px 25px;
	}
	.apply {
		padding: 0px 15.6344px;

		font-family: 'Inter';
		font-style: normal;
		font-weight: 500;
		font-size: 25.0054px;
		line-height: 21px;
		text-align: center;

		color: #ffffff;

		background: #004e86;
		border-radius: 0px 25.0054px 25.0054px 0px;
	}
</style>
