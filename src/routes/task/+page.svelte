<script>
	import { userStore } from '../../stores/loginstore';
	import { getApps, initializeApp } from 'firebase/app';
	import { firebaseConfig } from '$lib/firebase_config';
	import { doc, setDoc, getFirestore, getDoc } from 'firebase/firestore';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import Notes from '../../lib/components/Notes.svelte';
	let newTask = '';
	let newNote = '';
	let tasks = [];
	let notes = [];
	let currentTab = 'tasks';
	let selectedDate = getCurrentDate();
	let user = null;
	let fApp = null;

	userStore.subscribe((u) => {
		user = u;
		if (user && browser) {
			if (!getApps().length) {
				fApp = initializeApp(firebaseConfig, {
					experimentalForceLongPolling: true,
					useFetchStreams: false
				});
			} else {
				fApp = getApps()[0];
			}
			const db = getFirestore(fApp);

			const docRef2 = doc(db, 'tasks', user.uid);
			const docRef = doc(db, 'notes', user.uid);
			getDoc(docRef2)
				.then((docSnap) => {
					if (docSnap.exists()) {
						tasks = docSnap.data().t || [];
					}
				})
				.catch((err) => {});
			getDoc(docRef)
				.then((docSnap) => {
					if (docSnap.exists()) {
						notes = docSnap.data().n || [];
					}
				})
				.catch((err) => {});
		}
	});

	function getCurrentDate() {
		const today = new Date();
		return today.toISOString().split('T')[0];
	}
	function updateTasksDB(t) {
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
			const docRef2 = doc(db, 'tasks', user.uid);
			const docRef = doc(db, 'handover_task', 'ikRVHr4mDsM9rcjs7yyq');

			setDoc(docRef2, { t });
			// let n = { [user.displayName]: t };

			getDoc(docRef)
				.then((docSnap) => {
					if (docSnap.exists()) {
						let n = docSnap.data().n || {};
						n[user.displayName] = t;
						setDoc(docRef, { n });
					}
				})
				.catch((err) => {});
		}
	}
	function updateNotesDB(n) {
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
			setDoc(doc(db, 'notes', user.uid), { n });
		}
	}

	function addTask() {
		if (newTask.trim() !== '' && selectedDate) {
			tasks = [...tasks, { text: newTask, id: Date.now(), date: selectedDate }];
			updateTasksDB(tasks);

			newTask = '';
		}
	}

	function addNote() {
		if (newNote.trim() !== '') {
			notes = [...notes, { text: newNote, id: Date.now() }];
			updateNotesDB(notes);
			newNote = '';
		}
	}

	function removeTask(id) {
		tasks = tasks.filter((task) => task.id !== id);
		updateTasksDB(tasks);
	}

	function removeNote(id) {
		notes = notes.filter((note) => note.id !== id);
		updateNotesDB(notes);
	}

	function switchTab(tab) {
		currentTab = tab;
	}

	function getTasksForDate(date) {
		return tasks.filter((task) => task.date === date);
	}

	function hasTasksForDate(date) {
		for (let index = 0; index < tasks.length; index++) {
			const element = tasks[index];
			if (element.date === date) {
				return true;
			}
		}
	}
</script>

<main class="min-h-screen bg-gray-100 p-8">
	<div class="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-6">
		<h1 class="text-3xl font-semibold text-center mb-6">Tasks & Notes</h1>

		<div class="flex justify-center mb-6">
			<button
				on:click={() => switchTab('tasks')}
				class="px-4 py-2 bg-blue-500 text-white rounded-l-lg hover:bg-blue-600 focus:outline-none"
				class:bg-blue-700={currentTab === 'tasks'}
			>
				Tasks
			</button>
			<button
				on:click={() => switchTab('notes')}
				class="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none"
				class:bg-blue-700={currentTab === 'notes'}
			>
				Notes
			</button>
		</div>

		<div class="flex flex-col md:flex-row mb-4">
			{#if currentTab === 'tasks'}
				<input
					type="text"
					bind:value={newTask}
					placeholder="Add a new task"
					class="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
				/>
				<input
					type="date"
					bind:value={selectedDate}
					class="p-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
					min={getCurrentDate()}
				/>
				<button
					on:click={addTask}
					class="px-4 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
				>
					Add
				</button>
			{:else}
				<!-- <input
					type="text"
					bind:value={newNote}
					placeholder="Add a new note"
					class="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
				/> -->
				<Notes />
			{/if}
		</div>

		<ul class="space-y-3">
			{#if currentTab === 'tasks'}
				{#each tasks as task (task.id)}
					<li class="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow">
						<span>{task.text} - <strong>{task.date}</strong></span>
						<button on:click={() => removeTask(task.id)} class="text-red-500 hover:text-red-700">
							Remove
						</button>
					</li>
				{/each}
			{:else}
				{#each notes as note (note.id)}
					<li class="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow">
						<span>{note.text}</span>
						<button on:click={() => removeNote(note.id)} class="text-red-500 hover:text-red-700">
							Remove
						</button>
					</li>
				{/each}
			{/if}
		</ul>
	</div>
</main>

<style>
	main {
		font-family: 'Inter', sans-serif;
	}
</style>
