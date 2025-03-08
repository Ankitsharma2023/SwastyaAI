<script>
    import { userStore } from "../../stores/loginstore";
  import { getApps, initializeApp } from 'firebase/app';
	import { firebaseConfig } from '$lib/firebase_config';
	import { doc, setDoc, getFirestore, getDoc } from 'firebase/firestore';
	import { browser } from "$app/environment";
	let tasks = [];
	let selectedDate =null;
	let selectedMonth = new Date().getMonth();
	let selectedYear = new Date().getFullYear();
	let user = null;
    let fApp=null;
	userStore.subscribe((u) => {
		user = u;
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

		const docRef2 = doc(db, 'tasks', user.uid);

		getDoc(docRef2)
			.then((docSnap) => {
				if (docSnap.exists()) {
					tasks = docSnap.data().t || [];
				}
			})
			.catch((err) => {});
	}
        
	});
    
	
	function getCurrentDate() {
		const today = new Date();
		return today.toISOString().split('T')[0];
	}
    console.log(selectedDate);
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
	function getDaysInMonth(month, year) {
		return new Date(year, month + 1, 0).getDate();
	}

	function getFirstDayOfMonth(month, year) {
		return new Date(year, month, 1).getDay();
	}
</script>

<main class="min-h-screen bg-gray-100 p-8">
	<div class="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-6">
		<h2 class="text-2xl font-semibold text-center md:mt-6 mb-4">Calendar View</h2>
		<div class="grid grid-cols-7 gap-2 text-center">
			{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
				<div class="font-semibold">{day}</div>
			{/each}
			{#each Array(getFirstDayOfMonth(selectedMonth, selectedYear)).fill('') as _}
				<div></div>
			{/each}
			{#each Array(getDaysInMonth(selectedMonth, selectedYear)) as _, index}
				<button
					class="p-2 md:p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200 text-center"
					on:click={() => {
						selectedDate = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${(index + 1).toString().padStart(2, '0')}`;
					}}
				>
					{index + 1}
					{#if tasks && hasTasksForDate(`${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${(index + 1).toString().padStart(2, '0')}`)}
						<div class="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-green-500 rounded-full mx-auto mt-1"></div>
					{/if}
				</button>
			{/each}
		</div>
		{#if selectedDate}
            {#each getTasksForDate(selectedDate) as task}
          <li class="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow">
            <span>{task.text} - <strong>{task.date}</strong></span>
          </li>
        {/each}
		{/if}
	</div>
</main>
