<script>
	import { browser } from '$app/environment';
	import { Input, Label, Modal, Select, SpeedDial, SpeedDialButton, Toast } from 'flowbite-svelte';
	import { onDestroy, onMount } from 'svelte';
	import {
		nurses,
		patients_data,
		queue,
		trnscpt,
		userStore,
		allTasks
	} from '../../stores/loginstore';
	import { CloseCircleSolid } from 'flowbite-svelte-icons';
	import { getApps, initializeApp } from 'firebase/app';
	import { firebaseConfig } from '$lib/firebase_config';
	import { doc, setDoc, getFirestore, getDoc } from 'firebase/firestore';
	import Graph from '../../lib/components/Graph.svelte';
	import robot from '$lib/images/robot.svg';

	let ehr = {};
	let tasks = {};
	let activePatient = null;
	let formModal = false;
	let searchName = '';
	let show_sub = false;
	let patients_assigned = '';
	let nav_tab = 'queue';
	let selectedPatient = null;
	let inputValue = '';
	let menu = [
		{
			name: 'Queue',
			svg: `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
					<g clip-path="url(#clip0_4_4134)">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M21.3516 11.4766V12.9766C21.3516 13.3908 21.0158 13.7266 20.6016 13.7266H4.10156C3.68735 13.7266 3.35156 13.3908 3.35156 12.9766V11.4766C3.35156 11.0623 3.68735 10.7266 4.10156 10.7266H20.6016C21.0158 10.7266 21.3516 11.0623 21.3516 11.4766ZM20.6016 16.7266H4.10156C3.68735 16.7266 3.35156 17.0623 3.35156 17.4766V18.9766C3.35156 19.3908 3.68735 19.7266 4.10156 19.7266H20.6016C21.0158 19.7266 21.3516 19.3908 21.3516 18.9766V17.4766C21.3516 17.0623 21.0158 16.7266 20.6016 16.7266ZM20.6016 4.72656H4.10156C3.68735 4.72656 3.35156 5.06235 3.35156 5.47656V6.97656C3.35156 7.39078 3.68735 7.72656 4.10156 7.72656H20.6016C21.0158 7.72656 21.3516 7.39078 21.3516 6.97656V5.47656C21.3516 5.06235 21.0158 4.72656 20.6016 4.72656Z" fill="#004E86"/>
					</g>
					<defs>
					<clipPath id="clip0_4_4134">
					<rect width="24" height="24" fill="white" transform="translate(0.351562 0.226562)"/>
					</clipPath>
					</defs>
					</svg>`,
			tab: 'queue'
		},
		{
			name: 'Patients',
			svg: `<svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.7793 5.06185C16.7793 5.51216 16.868 5.95806 17.0403 6.37409C17.2126 6.79012 17.4651 7.16813 17.7835 7.48655C18.1018 7.80497 18.4798 8.05755 18.8958 8.22987C19.3117 8.4022 19.7576 8.49089 20.2078 8.49089C20.658 8.49089 21.1039 8.4022 21.5198 8.22987C21.9358 8.05755 22.3137 7.80497 22.6321 7.48655C22.9505 7.16813 23.203 6.79012 23.3753 6.37409C23.5476 5.95806 23.6363 5.51216 23.6363 5.06185C23.6363 4.15241 23.2751 3.28023 22.6321 2.63716C21.9891 1.99409 21.1171 1.63281 20.2078 1.63281C19.2985 1.63281 18.4264 1.99409 17.7835 2.63716C17.1405 3.28023 16.7793 4.15241 16.7793 5.06185Z" stroke="#004E86" stroke-width="2.04575" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M25.3525 17.0645V15.35C25.3525 12.5092 23.0501 10.2063 20.2097 10.2063C18.2729 10.2063 16.5861 11.2771 15.709 12.8591" stroke="#004E86" stroke-width="2.04575" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3.06641 5.06185C3.06641 5.97129 3.42762 6.84348 4.07059 7.48655C4.71356 8.12962 5.58561 8.49089 6.49491 8.49089C7.4042 8.49089 8.27625 8.12962 8.91922 7.48655C9.56219 6.84348 9.92341 5.97129 9.92341 5.06185C9.92341 4.15241 9.56219 3.28023 8.91922 2.63716C8.27625 1.99409 7.4042 1.63281 6.49491 1.63281C5.58561 1.63281 4.71356 1.99409 4.07059 2.63716C3.42762 3.28023 3.06641 4.15241 3.06641 5.06185Z" stroke="#004E86" stroke-width="2.04575" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M1.35156 17.0645V15.35C1.35156 12.5092 3.6541 10.2063 6.49442 10.2063C8.43124 10.2063 10.118 11.2771 10.9951 12.8591" stroke="#004E86" stroke-width="2.04575" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.92383 15.3463C9.92383 16.2557 10.285 17.1279 10.928 17.771C11.571 18.414 12.443 18.7753 13.3523 18.7753C14.2616 18.7753 15.1337 18.414 15.7766 17.771C16.4196 17.1279 16.7808 16.2557 16.7808 15.3463C16.7808 14.4368 16.4196 13.5646 15.7766 12.9216C15.1337 12.2785 14.2616 11.9172 13.3523 11.9172C12.443 11.9172 11.571 12.2785 10.928 12.9216C10.285 13.5646 9.92383 14.4368 9.92383 15.3463Z" stroke="#004E86" stroke-width="2.04575" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18.4966 25.6328C18.4966 22.792 16.1941 20.4893 13.3538 20.4893C10.5135 20.4893 8.21094 22.792 8.21094 25.6328" stroke="#004E86" stroke-width="2.04575" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
			tab: 'patients'
		},
		{
			name: 'Handover',
			svg: `<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_4_4321)">
<path d="M6.74023 12.5156V2.76562C6.74023 2.36781 6.89827 1.98627 7.17957 1.70496C7.46087 1.42366 7.84241 1.26562 8.24023 1.26562H18.8692C19.2667 1.26571 19.648 1.42361 19.9292 1.70463L22.8012 4.57662C23.0822 4.85782 23.2401 5.23907 23.2402 5.63662V19.2656" stroke="#004E86" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M0.740234 14.7656H3.74023C4.13805 14.7656 4.51959 14.9236 4.80089 15.2049C5.08219 15.4862 5.24023 15.8678 5.24023 16.2656V22.2656C5.24023 22.6634 5.08219 23.045 4.80089 23.3263C4.51959 23.6076 4.13805 23.7656 3.74023 23.7656H0.740234" stroke="#004E86" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20.2402 22.2656C20.2402 21.47 19.9241 20.7069 19.3615 20.1443C18.7989 19.5817 18.0358 19.2656 17.2402 19.2656H13.4902C13.4902 18.47 13.1741 17.7069 12.6115 17.1443C12.0489 16.5817 11.2858 16.2656 10.4902 16.2656H5.24023V22.2656H20.2402Z" stroke="#004E86" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10.4902 19.2656H13.4902" stroke="#004E86" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2.61523 20.7656C2.40812 20.7656 2.24023 20.5977 2.24023 20.3906C2.24023 20.1835 2.40812 20.0156 2.61523 20.0156" stroke="#004E86" stroke-width="1.5"/>
<path d="M2.61523 20.7656C2.82234 20.7656 2.99023 20.5977 2.99023 20.3906C2.99023 20.1835 2.82234 20.0156 2.61523 20.0156" stroke="#004E86" stroke-width="1.5"/>
</g>
<defs>
<clipPath id="clip0_4_4321">
<rect width="24" height="24" fill="white" transform="translate(-0.00976562 0.515625)"/>
</clipPath>
</defs>
</svg>
`,
			tab: 'handover'
		},
		{
			name: 'Nursing Team',
			svg: `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_4_4130)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M11.6289 14.8226C13.6928 13.4486 14.6136 10.8852 13.8959 8.51199C13.1781 6.13872 10.9911 4.5153 8.51172 4.5153C6.0323 4.5153 3.84529 6.13872 3.12755 8.51199C2.40982 10.8852 3.33065 13.4486 5.39453 14.8226C3.57624 15.4927 2.02338 16.7329 0.967656 18.3579C0.81665 18.5823 0.798203 18.8707 0.919379 19.1125C1.04055 19.3544 1.28258 19.5122 1.55275 19.5256C1.82292 19.5391 2.07938 19.4059 2.22391 19.1773C3.60748 17.0493 5.97349 15.7655 8.51172 15.7655C11.05 15.7655 13.416 17.0493 14.7995 19.1773C15.0284 19.5175 15.4881 19.6108 15.8315 19.3868C16.175 19.1628 16.2748 18.7045 16.0558 18.3579C15.0001 16.7329 13.4472 15.4927 11.6289 14.8226ZM4.38672 10.1426C4.38672 7.8644 6.23354 6.01758 8.51172 6.01758C10.7899 6.01758 12.6367 7.8644 12.6367 10.1426C12.6367 12.4208 10.7899 14.2676 8.51172 14.2676C6.23462 14.265 4.3893 12.4197 4.38672 10.1426ZM24.0873 19.3957C23.7404 19.6219 23.2758 19.5241 23.0495 19.1773C21.6675 17.0479 19.3003 15.7642 16.7617 15.7676C16.3475 15.7676 16.0117 15.4318 16.0117 15.0176C16.0117 14.6034 16.3475 14.2676 16.7617 14.2676C18.423 14.266 19.9213 13.268 20.5628 11.7356C21.2044 10.2031 20.864 8.43537 19.6994 7.25069C18.5347 6.06601 16.773 5.69563 15.2298 6.31102C14.9794 6.41929 14.6899 6.38299 14.4739 6.21622C14.2579 6.04946 14.1495 5.77854 14.1909 5.50883C14.2323 5.23911 14.4169 5.01316 14.673 4.91883C17.3476 3.85215 20.3959 4.97758 21.7357 7.52641C23.0755 10.0752 22.2741 13.2243 19.8789 14.8226C21.6972 15.4927 23.2501 16.7329 24.3058 18.3579C24.532 18.7048 24.4342 19.1694 24.0873 19.3957Z" fill="#004E86"/>
</g>
<defs>
<clipPath id="clip0_4_4130">
<rect width="24" height="24" fill="white" transform="translate(0.636719 0.0175781)"/>
</clipPath>
</defs>
</svg>
`,
			tab: 'nursing'
		}
	];
	let gender = [
		{ value: 'Male', name: 'Male' },
		{ value: 'Female', name: 'Female' },
		{ value: 'Other', name: 'Other' }
	];
	let urgency = [
		{ value: 'High', name: 'High' },
		{ value: 'Medium', name: 'Medium' },
		{ value: 'Low', name: 'Low' }
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
	let selected = 'Male';
	let selectUrgency = 'Low';
	let name = '';
	let room = '';
	let age = '';
	let vitals = '';
	let messages = [];
	let user = null;
	let interval = null;
	let t = { color: 'red', msg: null };
	const unsub_pat = trnscpt.subscribe((value) => {
		value.forEach((keys) => {
			Object.entries(keys).forEach((trns) => {
				ehr[trns[1].summary.Name] = trns[1].summary;
			});
		});
	});
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
	async function getAllTasks() {
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
		const docRef = doc(db, 'handover_task', 'ikRVHr4mDsM9rcjs7yyq');
		await getDoc(docRef)
			.then((docSnap) => {
				if (docSnap.exists()) {
					let n = docSnap.data().n || {};
					allTasks.set(n);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}
	async function fetchVitals(q) {
		let vi = '---';
		for (let index = 0; index < q.length; index++) {
			const element = q[index];
			const response = await fetch(
				`/patients/api/vitals?name=${encodeURIComponent(element.name)}&id=${index + 1}`
			);
			if (response.ok) {
				const data = await response.json();
				vi = `${data.bloodPressure} HR ${data.heartRate}`;
				q[index]['vitals'] = vi;
			} else {
				q[index]['vitals'] = '---';
			}
		}
		if (q.length > 0) {
			queue.set(q);
		}
	}
	onMount(() => {
		if (browser) {
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
			interval = setInterval(() => {
				fetchVitals(q);
			}, 5000);
			if (user) {
				getAllTranscription(user.uid);
			}
			let n = {};
			const docRef3 = doc(db, 'queue', 'n');
			getDoc(docRef3)
				.then((docSnap) => {
					if (docSnap.exists()) {
						n = docSnap.data().n || [];
						nurses.set(n);
					}
				})
				.catch((err) => {
					console.log(err);
				});
		}
	});
	onDestroy(() => {
		unsub_pat();
		unsub_user();
		if (interval !== null) {
			clearInterval(interval);
		}
	});
	async function query(index) {
		await getAllTasks();

		try {
			const data = {
				messages: messages,
				tasks: $allTasks,
				patient: ehr,
				queue: $queue
			};
			const response = await fetch('/patients/api/query', {
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
			messages = [...messages, { text: '...', isUser: false, timeStamp: new Date().toString() }];
			await query(messages.length - 1);
		}
	}
	function updatePateintsDB(q) {
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
		setDoc(doc(db, 'queue', 'q'), { q });
	}
	function updateNursingDB(n) {
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
		setDoc(doc(db, 'queue', 'n'), { n });
	}
	function addPatient() {
		if (!name || !room || !age || !vitals || !selected || !selectUrgency) {
			t.msg = 'Cannot have empty fields';
			return;
		}

		if (isNaN(age) || age <= 0) {
			t.msg = 'Invalid Age';
			return;
		}

		const newPatient = {
			name,
			room,
			age: parseInt(age),
			gender: selected,
			vitals,
			urgency: selectUrgency
		};

		queue.update((patients) => {
			let q = [...patients, newPatient];
			updatePateintsDB(q);
			return q;
		});

		name = '';
		room = '';
		age = '';
		vitals = '';
		selected = '';
		selectUrgency = '';
		formModal = false;
	}
	function addNurse() {
		if (!name || !room || !patients_assigned) {
			t.msg = 'Cannot have empty fields';
			return;
		}

		const newNurse = {
			name,
			room,
			age: parseInt(age),
			patients_assigned: patients_assigned
		};

		nurses.update((nurse) => {
			let q = [...nurse, newNurse];
			updateNursingDB(q);
			return q;
		});

		name = '';
		room = '';
		patients_assigned - '';
		formModal = false;
	}
	function removePatient(index) {
		queue.update((patients) => {
			let q = patients.filter((_, i) => i !== index);
			updatePateintsDB(q);
			return q;
		});
	}
	function removeNurse(index) {
		nurses.update((patients) => {
			let q = patients.filter((_, i) => i !== index);
			updateNursingDB(q);
			return q;
		});
	}
	function show_graph(p) {
		selectedPatient = p;
	}
	function renderValue(value) {
		if (typeof value === 'object' && value !== null) {
			let text = `<ul class="ml-4 list-none">`;
			for (const [k, v] of Object.entries(value)) {
				text += `<li class="text-gray-700">
							<strong>${k.toUpperCase()}:</strong> ${renderValue(v)}
						</li>`;
			}
			return text + `</ul>`;
		} else {
			return `<span class="font-medium">${value}</span>`;
		}
	}
</script>

<div class="flex md:ml-4 justify-center items-start pt-0 w-full">
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
		class="w-[45%] z-50 {!show_sub
			? 'hidden'
			: ''} md:hidden top-24 left-4 absolute bg-[#CDE6EA] p-4 rounded-lg shadow-md text-[#004E86]"
	>
		<ul class="space-y-2">
			{#if nav_tab === 'patients'}
				{#each Object.entries(ehr) as [name, data]}
					<li>
						<button
							class="w-full text-left p-2 rounded-lg cursor-pointer flex flex-row"
							on:click={() => (activePatient = activePatient === name ? null : name)}
						>
							{name}
						</button>
					</li>
				{/each}
				<button class="relative bottom-0 right-0" on:click={() => (nav_tab = 'menu')}>
					<svg
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
			{:else}
				{#each menu as item}
					<button
						class="w-full text-left p-2 rounded-lg cursor-pointer flex flex-row"
						on:click={() => {
							nav_tab = item.tab;
						}}
					>
						{@html item.svg}&nbsp {item.name}
					</button>
				{/each}
			{/if}
		</ul>
	</div>
	<div
		class="w-[25%] hidden md:flex flex-col mt-0 bg-[#CDE6EA] p-4 rounded-lg shadow-md text-[#004E86]"
	>
		<div class="text-xl mb-4 font-bold ml-10">AI Nursing Engine</div>

		<div class="mb-4 ml-12 font-[600] text-[14.91px] flex flex-row gap-2">
			<svg
				width="25"
				height="25"
				viewBox="0 0 35 35"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M21.918 5.82217C21.918 6.4226 22.0362 7.01715 22.266 7.57187C22.4957 8.12659 22.8324 8.63062 23.2569 9.05519C23.6814 9.47975 24.1854 9.81654 24.74 10.0463C25.2946 10.2761 25.8891 10.3943 26.4894 10.3943C27.0898 10.3943 27.6842 10.2761 28.2389 10.0463C28.7935 9.81654 29.2975 9.47975 29.722 9.05519C30.1465 8.63062 30.4832 8.12659 30.7129 7.57187C30.9427 7.01715 31.0609 6.4226 31.0609 5.82217C31.0609 4.60956 30.5793 3.44661 29.722 2.58916C28.8646 1.73171 27.7019 1.25 26.4894 1.25C25.277 1.25 24.1142 1.73171 23.2569 2.58916C22.3996 3.44661 21.918 4.60956 21.918 5.82217Z"
					stroke="#004E86"
					stroke-width="2.04575"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M33.3486 21.8262V19.5401C33.3486 15.7523 30.2786 12.6816 26.4914 12.6816C23.9089 12.6816 21.6598 14.1095 20.4902 16.2188"
					stroke="#004E86"
					stroke-width="2.04575"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M3.63501 5.82217C3.63501 7.03479 4.11665 8.19774 4.97396 9.05519C5.83128 9.91264 6.99405 10.3943 8.20648 10.3943C9.41891 10.3943 10.5817 9.91264 11.439 9.05519C12.2963 8.19774 12.778 7.03479 12.778 5.82217C12.778 4.60956 12.2963 3.44661 11.439 2.58916C10.5817 1.73171 9.41891 1.25 8.20648 1.25C6.99405 1.25 5.83128 1.73171 4.97396 2.58916C4.11665 3.44661 3.63501 4.60956 3.63501 5.82217Z"
					stroke="#004E86"
					stroke-width="2.04575"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M1.34766 21.8262V19.5401C1.34766 15.7523 4.4178 12.6816 8.20501 12.6816C10.7875 12.6816 13.0366 14.1095 14.2061 16.2188"
					stroke="#004E86"
					stroke-width="2.04575"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M12.7773 19.5351C12.7773 20.7477 13.259 21.9106 14.1163 22.7681C14.9736 23.6255 16.1364 24.1072 17.3488 24.1072C18.5612 24.1072 19.724 23.6255 20.5813 22.7681C21.4386 21.9106 21.9203 20.7477 21.9203 19.5351C21.9203 18.3224 21.4386 17.1595 20.5813 16.302C19.724 15.4446 18.5612 14.9629 17.3488 14.9629C16.1364 14.9629 14.9736 15.4446 14.1163 16.302C13.259 17.1595 12.7773 18.3224 12.7773 19.5351Z"
					stroke="#004E86"
					stroke-width="2.04575"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M24.2088 33.2501C24.2088 29.4623 21.1387 26.3918 17.3515 26.3918C13.5643 26.3918 10.4941 29.4623 10.4941 33.2501"
					stroke="#004E86"
					stroke-width="2.04575"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			Patients Overview
		</div>
		<div class="w-full border-[2px] border-[#ffffff] mb-2 -mt-3"></div>
		<ul class="space-y-2">
			{#if nav_tab === 'patients'}
				{#each Object.entries(ehr) as [name, data]}
					<li>
						<button
							class="w-full text-left p-2 rounded-lg cursor-pointer flex flex-row"
							on:click={() => (activePatient = activePatient === name ? null : name)}
						>
							{name}
						</button>
					</li>
				{/each}
				<button class="relative bottom-0 right-0" on:click={() => (nav_tab = 'menu')}>
					<svg
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
			{:else}
				{#each menu as item}
					<button
						class="w-full text-left p-2 rounded-lg cursor-pointer flex flex-row"
						on:click={() => {
							nav_tab = item.tab;
						}}
					>
						{@html item.svg}&nbsp {item.name}
					</button>
				{/each}
			{/if}
		</ul>
	</div>

	<div class="w-full md:w-[85%] p-6 flex flex-col justify-center items-center gap-y-2">
		{#if nav_tab === 'patients' || nav_tab === 'menu'}
			{#if activePatient}
				<div class="bg-gray-100 p-6 rounded-lg shadow-md">
					<h2 class="text-2xl font-bold text-blue-600 mb-4">{activePatient}</h2>
					<div class="text-start">
						{#each keys as key}
							{#if ehr[activePatient][key] !== ''}
								<div class="mb-2">
									<p class="text-lg">
										<strong>{key}:</strong>
										{@html renderValue(ehr[activePatient][key])}
									</p>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{:else}
				<p class="text-lg text-gray-500">Select a patient to view their details.</p>
			{/if}
		{:else if nav_tab === 'queue'}
			{#if selectedPatient}
				<Graph bind:q={selectedPatient} />
			{:else}
				<h1 class="text-4xl font-[600] text-[#AAAAAA]">Patient Queue</h1>
				<div class="relative w-full md:w-3/4 h-[48px]">
					<input
						class="bg-[#CDE6EA] w-full h-full shadow-xl rounded-lg text-[#004E86] pl-12"
						bind:value={searchName}
						placeholder="Search for a patient"
					/>
					<div class="absolute top-[25%] left-4">
						<svg
							width="25"
							height="25"
							viewBox="0 0 25 25"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g clip-path="url(#clip0_4_4141)">
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M21.7709 20.5866L17.0768 15.8934C19.9031 12.5002 19.5607 7.48412 16.2994 4.50654C13.0381 1.52895 8.01158 1.64319 4.8889 4.76586C1.76623 7.88853 1.652 12.915 4.62958 16.1763C7.60717 19.4376 12.6233 19.7801 16.0165 16.9538L20.7096 21.6478C21.0027 21.9409 21.4778 21.9409 21.7709 21.6478C22.0639 21.3548 22.0639 20.8796 21.7709 20.5866ZM3.99023 10.6172C3.99023 6.88927 7.01231 3.86719 10.7402 3.86719C14.4682 3.86719 17.4902 6.88927 17.4902 10.6172C17.4902 14.3451 14.4682 17.3672 10.7402 17.3672C7.01403 17.3631 3.99437 14.3434 3.99023 10.6172Z"
									fill="#004E86"
								/>
							</g>
							<defs>
								<clipPath id="clip0_4_4141">
									<rect
										width="24"
										height="24"
										fill="white"
										transform="translate(0.240234 0.117188)"
									/>
								</clipPath>
							</defs>
						</svg>
					</div>
				</div>
				<div class=" flex flex-row justify-end w-full">
					<button
						class="rounded-2xl mr-32 mt-4 text-[#004E86] font-bold bg-[#CDE6EA] max-w-fit p-2 px-4 shadow-lg border-2 border-[#004E86]"
						on:click={() => (formModal = true)}>Add Patient</button
					>
					<Modal bind:open={formModal} size="xs" autoclose={false} class="w-full">
						{#if t.msg}
							<Toast color={t.color}>
								<svelte:fragment slot="icon">
									<CloseCircleSolid class="w-5 h-5" />
								</svelte:fragment>
								{t.msg}
							</Toast>
						{/if}
						<form class="flex flex-col space-y-6" action="#">
							<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Add Patient</h3>

							<Label class="space-y-2">
								<span>Name</span>
								<Input type="text" bind:value={name} required />
							</Label>

							<Label class="space-y-2">
								<span>Room</span>
								<Input type="text" bind:value={room} required />
							</Label>

							<Label class="space-y-2">
								<span>Age</span>
								<Input type="number" bind:value={age} required />
							</Label>

							<Label class="space-y-2">
								<span>Gender</span>
								<Select class="mt-2" items={gender} bind:value={selected} />
							</Label>

							<Label class="space-y-2">
								<span>Vitals</span>
								<Input type="text" bind:value={vitals} required />
							</Label>

							<Label class="space-y-2">
								<span>Urgency</span>
								<Select class="mt-2" items={urgency} bind:value={selectUrgency} />
							</Label>

							<button
								type="button"
								class="w-full py-2 rounded-xl bg-[#CDE6EA] text-[#004E86] hover:bg-[#ceeaef]"
								on:click={addPatient}
							>
								Add
							</button>
						</form>
					</Modal>
				</div>
				<div class="overflow-x-auto w-full md:w-3/4">
					<table class="min-w-full table-auto text-left border-2">
						<thead class="bg-[#CDE6EA]">
							<tr>
								<th class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white">Name</th>
								<th class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white">Room</th>
								<th class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white">Age</th>
								<th class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white">Gender</th
								>
								<th class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white">Vitals</th
								>
								<th class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white"
									>Urgency</th
								>
								<th class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white"
									>Actions</th
								>
							</tr>
						</thead>
						<tbody>
							{#if searchName.length > 0}
								{#each $queue as patient, index}
									{#if patient.name.startsWith(searchName)}
										<tr class="border-b hover:bg-gray-50">
											<td class="p-2 md:p-4 text-sm text-gray-700 dark:text-white"
												>{patient.name}</td
											>
											<td class="p-2 md:p-4 text-sm text-[#994D4D] dark:text-white"
												>{patient.room}</td
											>
											<td class="p-2 md:p-4 text-sm text-[#994D4D] dark:text-white"
												>{patient.age}</td
											>
											<td class="p-2 md:p-4 text-sm text-[#994D4D] dark:text-white"
												>{patient.gender}</td
											>
											<td class="p-2 md:p-4 text-sm text-black dark:text-white"
												><p class="bg-[#DEEDF3] rounded-xl text-center py-2 md:">
													{patient.vitals}
												</p></td
											>
											<td class="p-2 md:p-4 text-sm text-[#994D4D] dark:text-white"
												>{patient.urgency}</td
											>
											<td class="p-2 md:p-4 text-sm text-[#994D4D] dark:text-white">
												<SpeedDial defaultClass="text-[#994D4D] font-[700]" trigger="click">
													<button slot="button" class="flex flex-row"> View </button>
													<SpeedDialButton
														name="Remove"
														on:click={() => {
															removePatient(index);
														}}
													>
														<CloseCircleSolid />
													</SpeedDialButton>
												</SpeedDial>
											</td>
										</tr>
									{/if}
								{/each}
							{:else}
								{#each $queue as patient, index}
									<tr class="border-b hover:bg-gray-50">
										<td class="px-4 py-4 text-sm text-gray-700 dark:text-white">{patient.name}</td>
										<td class="px-4 py-4 text-sm text-[#994D4D] dark:text-white">{patient.room}</td>
										<td class="px-4 py-4 text-sm text-[#994D4D] dark:text-white">{patient.age}</td>
										<td class="px-4 py-4 text-sm text-[#994D4D] dark:text-white"
											>{patient.gender}</td
										>
										<td
											class="px-4 py-4 text-sm text-black dark:text-white cursor-pointer"
											on:click={() => {
												patient.id = index;
												show_graph(patient);
											}}
											><p class="bg-[#DEEDF3] rounded-xl text-center py-2">{patient.vitals}</p></td
										>
										<td class="px-4 py-4 text-sm text-[#994D4D] dark:text-white"
											>{patient.urgency}</td
										>
										<td class="px-4 py-4 text-sm text-[#994D4D] dark:text-white">
											<SpeedDial defaultClass="text-[#994D4D] font-[700]" trigger="click">
												<button slot="button" class="flex flex-row"> View </button>
												<SpeedDialButton
													name="Remove"
													on:click={() => {
														removePatient(index);
													}}
												>
													<CloseCircleSolid />
												</SpeedDialButton>
											</SpeedDial>
										</td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			{/if}
		{:else if nav_tab === 'nursing'}
			<h1 class="text-4xl font-[600] text-[#AAAAAA]">Nursing Team</h1>
			<div class="relative w-full md:w-3/4 h-[48px]">
				<input
					class="bg-[#CDE6EA] w-full h-full shadow-xl rounded-lg text-[#004E86] pl-12"
					bind:value={searchName}
					placeholder="Search for a patient"
				/>
				<div class="absolute top-[25%] left-4">
					<svg
						width="25"
						height="25"
						viewBox="0 0 25 25"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<g clip-path="url(#clip0_4_4141)">
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M21.7709 20.5866L17.0768 15.8934C19.9031 12.5002 19.5607 7.48412 16.2994 4.50654C13.0381 1.52895 8.01158 1.64319 4.8889 4.76586C1.76623 7.88853 1.652 12.915 4.62958 16.1763C7.60717 19.4376 12.6233 19.7801 16.0165 16.9538L20.7096 21.6478C21.0027 21.9409 21.4778 21.9409 21.7709 21.6478C22.0639 21.3548 22.0639 20.8796 21.7709 20.5866ZM3.99023 10.6172C3.99023 6.88927 7.01231 3.86719 10.7402 3.86719C14.4682 3.86719 17.4902 6.88927 17.4902 10.6172C17.4902 14.3451 14.4682 17.3672 10.7402 17.3672C7.01403 17.3631 3.99437 14.3434 3.99023 10.6172Z"
								fill="#004E86"
							/>
						</g>
						<defs>
							<clipPath id="clip0_4_4141">
								<rect
									width="24"
									height="24"
									fill="white"
									transform="translate(0.240234 0.117188)"
								/>
							</clipPath>
						</defs>
					</svg>
				</div>
			</div>
			<div class=" flex flex-row justify-end w-full">
				<button
					class="rounded-2xl mr-32 mt-4 text-[#004E86] font-bold bg-[#CDE6EA] max-w-fit p-2 px-4 shadow-lg border-2 border-[#004E86]"
					on:click={() => (formModal = true)}>Add Nurse</button
				>
				<Modal bind:open={formModal} size="xs" autoclose={false} class="w-full">
					{#if t.msg}
						<Toast color={t.color}>
							<svelte:fragment slot="icon">
								<CloseCircleSolid class="w-5 h-5" />
							</svelte:fragment>
							{t.msg}
						</Toast>
					{/if}
					<form class="flex flex-col space-y-6" action="#">
						<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Add Nurse</h3>

						<Label class="space-y-2">
							<span>Name</span>
							<Input type="text" bind:value={name} required />
						</Label>

						<Label class="space-y-2">
							<span>Room</span>
							<Input type="text" bind:value={room} required />
						</Label>

						<Label class="space-y-2">
							<span>Patient Assigned</span>
							<Input type="text" bind:value={patients_assigned} required />
						</Label>

						<button
							type="button"
							class="w-full py-2 rounded-xl bg-[#CDE6EA] text-[#004E86] hover:bg-[#ceeaef]"
							on:click={addNurse}
						>
							Add
						</button>
					</form>
				</Modal>
			</div>
			<div class="overflow-x-auto w-full md:w-3/4">
				<table class="min-w-full table-auto text-left border-2">
					<thead class="bg-[#CDE6EA]">
						<tr>
							<th class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white">Name</th>
							<th class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white">Room</th>
							<th class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white"
								>Patients Assigned</th
							>
							<th class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#if searchName.length > 0}
							{#each $nurses as patient, index}
								{#if patient.name.startsWith(searchName)}
									<tr class="border-b hover:bg-gray-50">
										<td class="p-2 md:p-4 text-sm text-gray-700 dark:text-white">{patient.name}</td>
										<td class="p-2 md:p-4 text-sm text-[#994D4D] dark:text-white">{patient.room}</td
										>
										<td class="p-2 md:p-4 text-sm text-[#994D4D] dark:text-white"
											>{patient.patients_assigned}</td
										>
										<td class="p-2 md:p-4 text-sm text-[#994D4D] dark:text-white">
											<SpeedDial defaultClass="text-[#994D4D] font-[700]" trigger="click">
												<button slot="button" class="flex flex-row"> View </button>
												<SpeedDialButton
													name="Remove"
													on:click={() => {
														removeNurse(index);
													}}
												>
													<CloseCircleSolid />
												</SpeedDialButton>
											</SpeedDial>
										</td>
									</tr>
								{/if}
							{/each}
						{:else}
							{#each $nurses as patient, index}
								<tr class="border-b hover:bg-gray-50">
									<td class="px-4 py-4 text-sm text-gray-700 dark:text-white">{patient.name}</td>
									<td class="px-4 py-4 text-sm text-[#994D4D] dark:text-white">{patient.room}</td>
									<td class="px-4 py-4 text-sm text-[#994D4D] dark:text-white"
										>{patient.patients_assigned}</td
									>

									<td class="px-4 py-4 text-sm text-[#994D4D] dark:text-white">
										<SpeedDial defaultClass="text-[#994D4D] font-[700]" trigger="click">
											<button slot="button" class="flex flex-row"> View </button>
											<SpeedDialButton
												name="Remove"
												on:click={() => {
													removePatient(index);
												}}
											>
												<CloseCircleSolid />
											</SpeedDialButton>
										</SpeedDial>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		{:else if nav_tab === 'handover'}
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
												class="h-6 w-6 rounded-full {!message.isUser
													? 'text-right '
													: 'text-left '}"
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
				{/if}
				<!-- Input -->
				<div class="flex flex-col justify-center items-center w-[85%] md:w-1/2">
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
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
