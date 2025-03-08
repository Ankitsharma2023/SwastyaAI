<script>
	import { onMount } from 'svelte';
	import { queue, notification } from '../../stores/loginstore';
	import { browser } from '$app/environment';
	import { firebaseConfig } from '$lib/firebase_config';
	import { getApps, initializeApp } from 'firebase/app';
	import { doc, getDoc, getFirestore } from 'firebase/firestore';

	let selectedRoom = null;
	let index = null;
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
					console.error('Error fetching queue:', err);
				});
		}
	});

	function handleRoomSelect(room) {
		selectedRoom = room;
	}

	function handleCallClick() {
		if (selectedRoom) {
			notification.update((val) => {
				val = [...val, `Patient is calling in room ${selectedRoom.room}`];
				index = val.length;
				return val;
			});
			selectedRoom = null;
		}
	}

	function handleCancelClick() {
        if(selectedRoom){
            let k=`Patient is calling in room ${selectedRoom.room}`;
            notification.update((val) => {
                let q=[];
                for (let i = 0; i < val.length; i++) {
                    let element=val[i];
                    if (element===k) {
                        continue;
                    }
                    q.push(element);
                }
                return q;
            });
            selectedRoom=null;
        }
	}
</script>

<div class="p-4">
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each $queue as room}
			<button
				class="p-4 bg-gray-200 rounded-lg shadow-md cursor-pointer hover:bg-blue-100 transition"
				class:selected={selectedRoom === room}
				on:click={() => handleRoomSelect(room)}
			>
				<div class="font-semibold text-lg">{room.room}</div>
			</button>
		{/each}
	</div>

	{#if selectedRoom}
		<div class="mt-4 space-x-2">
			<button
				class="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none"
				on:click={handleCallClick}
			>
				Call
			</button>
			<button
				class="px-4 py-2 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 focus:outline-none"
				on:click={handleCancelClick}
			>
				Cancel
			</button>
		</div>
	{/if}
</div>
