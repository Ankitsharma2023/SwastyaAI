import { writable } from 'svelte/store';

export const loginStore = writable({
	userName: null,
	photoURL: null
});
export const userStore = writable(null);
export const selectedChats = writable([]);
export const allChats = writable({});
export const patients = writable({});
export const patients_data = writable({});
export const queue = writable([]);
export const nurses = writable([]);
export const trnscpt = writable([]);
export const notification = writable([]);
export const allTasks = writable({});
