<script>
	import { getAuth } from 'firebase/auth';
	import { userStore, allChats, selectedChats, notification } from '../stores/loginstore';
	import {
		Dropdown,
		DropdownDivider,
		DropdownItem,
		Drawer,
		CloseButton,
		Sidebar,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper,
		Avatar,
		DarkMode
	} from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';
	import { onDestroy } from 'svelte';
	import google from '$lib/images/google.svg';
	import { goto } from '$app/navigation';
	import { BellOutline } from 'flowbite-svelte-icons';

	let previousChats = {};
	let messages = [];
	let selectedChat = null;
	let hidden2 = true;
	let notifications = [];

	notification.subscribe((val) => {
		notifications = val;
	});
	let spanClass = 'flex-1 ms-3 whitespace-nowrap';
	let transitionParams = {
		x: -320,
		duration: 200,
		easing: sineIn
	};
	const unsub = allChats.subscribe((m) => {
		previousChats = m;
	});
	onDestroy(() => {
		unsub();
	});
	function toggleSidebar() {
		hidden2 = !hidden2;
	}
	function createNewChat() {
		toggleSidebar();
		selectedChat = null;
		messages = [];
		selectedChats.update((m) => {
			return messages;
		});
	}
	function selectChat(chat) {
		if (chat.messages) {
			chat = chat.messages;
		}
		selectedChat = chat;

		selectedChats.set(chat);
	}
	function removeChat(chatId) {
		delete previousChats[chatId];
		previousChats = previousChats;
		selectedChats.set([]);
		allChats.set(previousChats);
	}
	async function signOut() {
		try {
			await getAuth().signOut();
		} catch (error) {
			console.error(error.message);
		}
	}
</script>

<Drawer
	transitionType="fly"
	{transitionParams}
	bind:hidden={hidden2}
	id="sidebar2"
	width="w-52"
	class=" bg-[#CDE6EA]"
	divClass="overflow-y-auto z-50 p-0 bg-white dark:bg-gray-800"
>
	<Sidebar asideClass="w-52">
		<SidebarWrapper
			divClass="overflow-y-auto overflow-x-hidden py-4 px-2 rounded dark:bg-gray-800 flex flex-col w-full"
		>
			<SidebarGroup>
				<div class="flex w-full flex-row items-center justify-start">
					<SidebarItem
						class="-mb-2 ml-0 h-8 w-40 font-medium text-[#004E86]"
						label="Home"
						{spanClass}
						on:click={() => {
							toggleSidebar();
						}}
						href="/"
					>
						<svelte:fragment slot="icon">
							<svg
								width="25"
								height="24"
								viewBox="0 0 25 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M4.36719 9.9375V21C4.36719 21.1989 4.44621 21.3897 4.58686 21.5303C4.72751 21.671 4.91828 21.75 5.11719 21.75H9.61719V15.375C9.61719 15.0766 9.73571 14.7905 9.94669 14.5795C10.1577 14.3685 10.4438 14.25 10.7422 14.25H14.4922C14.7906 14.25 15.0767 14.3685 15.2877 14.5795C15.4987 14.7905 15.6172 15.0766 15.6172 15.375V21.75H20.1172C20.3161 21.75 20.5069 21.671 20.6475 21.5303C20.7882 21.3897 20.8672 21.1989 20.8672 21V9.9375"
									stroke="#004E86"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M23.1172 11.9992L13.1277 2.43668C12.8933 2.18918 12.3453 2.18637 12.1067 2.43668L2.11719 11.9992M19.3672 8.38981V2.99918H17.1172V6.23356"
									stroke="#004E86"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</svelte:fragment>
					</SidebarItem>
					<button on:click={() => (hidden2 = true)}>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M13.5 18H4M20 12H4M20 6H4"
								stroke="#004E86"
								stroke-width="2"
								stroke-linecap="round"
							/>
						</svg>
					</button>
				</div>
				<SidebarItem
					class="mt-4 ml-0 h-8 w-40 font-medium text-[#004E86]"
					label="Chatbot"
					{spanClass}
					on:click={() => {
						toggleSidebar();
					}}
					href="/"
				>
					<svelte:fragment slot="icon">
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M7.79007 15.2699L8.52007 11.8599C8.62635 11.3861 8.86574 10.9524 9.21007 10.6099L15.8801 3.99993C16.5565 3.3109 17.4748 2.91271 18.4401 2.88993C19.1681 2.8795 19.8701 3.1603 20.3901 3.66993C21.5263 5.01239 21.3796 7.01715 20.0601 8.17993L13.3901 14.8499C13.0476 15.1943 12.6139 15.4337 12.1401 15.5399L8.73007 16.2699H8.54007C8.29078 16.2795 8.05268 16.1661 7.903 15.9665C7.75332 15.7669 7.71111 15.5066 7.79007 15.2699ZM10.2701 11.6799C10.13 11.8157 10.0326 11.9895 9.99007 12.1799L9.50007 14.5099L11.8301 14.0099C12.0205 13.9674 12.1943 13.87 12.3301 13.7299L19.0001 7.05993C19.7308 6.47495 19.8758 5.42041 19.3301 4.65993C19.0911 4.43164 18.7704 4.3091 18.4401 4.31993C17.8706 4.34279 17.3326 4.58673 16.9401 4.99993L10.2701 11.6799Z"
								fill="#004E86"
							/>
							<path
								d="M19.9101 10.9299C19.4981 10.9353 19.1655 11.268 19.1601 11.6799V17.3699C19.1735 18.1742 18.8633 18.9502 18.2993 19.5236C17.7352 20.0971 16.9645 20.42 16.1601 20.4199H6.63008C4.96745 20.3873 3.63519 19.0329 3.63008 17.3699V7.87993C3.65738 6.21502 5.01494 4.87971 6.68008 4.87993H12.3701C12.7843 4.87993 13.1201 4.54414 13.1201 4.12993C13.1201 3.71572 12.7843 3.37993 12.3701 3.37993H6.63008C4.13658 3.37978 2.10748 5.38658 2.08008 7.87993V17.3699C2.08008 19.8828 4.11718 21.9199 6.63008 21.9199H16.1201C18.6291 21.9144 20.6601 19.8789 20.6601 17.3699V11.6799C20.6547 11.268 20.322 10.9353 19.9101 10.9299Z"
								fill="#004E86"
							/>
						</svg>
					</svelte:fragment>
				</SidebarItem>
				<SidebarItem
					class="ml-0 h-8 w-40 font-medium text-[#004E86]"
					label="Recording"
					{spanClass}
					on:click={() => {
						toggleSidebar();
					}}
					href="/recording"
				>
					<svelte:fragment slot="icon">
						<svg
							width="24"
							height="30"
							viewBox="0 0 26 26"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M13.1181 0.603516C14.2414 0.603516 15.3186 0.964736 16.1129 1.60771C16.9072 2.25069 17.3534 3.12275 17.3534 4.03206V10.8891C17.3534 11.7985 16.9072 12.6705 16.1129 13.3135C15.3186 13.9565 14.2414 14.3177 13.1181 14.3177C11.9948 14.3177 10.9176 13.9565 10.1233 13.3135C9.32903 12.6705 8.88281 11.7985 8.88281 10.8891V4.03206C8.88281 3.12275 9.32903 2.25069 10.1233 1.60771C10.9176 0.964736 11.9948 0.603516 13.1181 0.603516Z"
								stroke="#004E86"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<path
								d="M5.35248 10.8892C5.35248 12.5562 6.17055 14.155 7.62671 15.3338C9.08288 16.5126 11.0579 17.1748 13.1172 17.1748C15.1765 17.1748 17.1515 16.5126 18.6077 15.3338C20.0638 14.155 20.8819 12.5562 20.8819 10.8892H25.1172C25.1172 13.4655 23.8529 15.9364 21.6025 17.7581C19.352 19.5799 16.2998 20.6034 13.1172 20.6034C9.93459 20.6034 6.88234 19.5799 4.63191 17.7581C2.38147 15.9364 1.11719 13.4655 1.11719 10.8892H5.35248Z"
								stroke="#004E86"
								stroke-linejoin="round"
							/>
							<path
								d="M11 24.6035V20.4526C12.4007 20.6547 13.8346 20.6547 15.2353 20.4526V24.6035H11Z"
								stroke="#004E86"
								stroke-linejoin="round"
							/>
							<path d="M7.62575 15.3345L4.63281 17.7573" stroke="#004E86" stroke-linejoin="round" />
						</svg>
					</svelte:fragment>
				</SidebarItem>
				<SidebarItem
					class="ml-0 h-8 w-40 font-medium text-[#004E86]"
					label="Patients"
					{spanClass}
					on:click={() => {
						toggleSidebar();
					}}
					href="/patients"
				>
					<svelte:fragment slot="icon">
						<svg
							width="27"
							height="27"
							viewBox="0 0 27 27"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M16.5088 5.34457C16.5088 5.79482 16.5975 6.24065 16.7698 6.65663C16.9421 7.0726 17.1946 7.45056 17.513 7.76893C17.8314 8.0873 18.2093 8.33985 18.6253 8.51215C19.0413 8.68445 19.4871 8.77313 19.9373 8.77313C20.3876 8.77313 20.8334 8.68445 21.2494 8.51215C21.6654 8.33985 22.0433 8.0873 22.3617 7.76893C22.6801 7.45056 22.9326 7.0726 23.1049 6.65663C23.2772 6.24065 23.3659 5.79482 23.3659 5.34457C23.3659 4.43526 23.0047 3.5632 22.3617 2.92022C21.7187 2.27724 20.8467 1.91602 19.9373 1.91602C19.028 1.91602 18.156 2.27724 17.513 2.92022C16.87 3.5632 16.5088 4.43526 16.5088 5.34457Z"
								stroke="#004E86"
								stroke-width="2.04575"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<path
								d="M25.0799 17.3451V15.6307C25.0799 12.7904 22.7775 10.4878 19.9371 10.4878C18.0002 10.4878 16.3134 11.5585 15.4363 13.1402"
								stroke="#004E86"
								stroke-width="2.04575"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<path
								d="M2.79517 5.34457C2.79517 6.25388 3.15639 7.12595 3.79937 7.76893C4.44235 8.41191 5.31441 8.77313 6.22372 8.77313C7.13303 8.77313 8.0051 8.41191 8.64808 7.76893C9.29106 7.12595 9.65228 6.25388 9.65228 5.34457C9.65228 4.43526 9.29106 3.5632 8.64808 2.92022C8.0051 2.27724 7.13303 1.91602 6.22372 1.91602C5.31441 1.91602 4.44235 2.27724 3.79937 2.92022C3.15639 3.5632 2.79517 4.43526 2.79517 5.34457Z"
								stroke="#004E86"
								stroke-width="2.04575"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<path
								d="M1.08008 17.3451V15.6307C1.08008 12.7904 3.38266 10.4878 6.22303 10.4878C8.15988 10.4878 9.84665 11.5585 10.7238 13.1402"
								stroke="#004E86"
								stroke-width="2.04575"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<path
								d="M9.65308 15.6268C9.65308 16.5361 10.0143 17.4082 10.6573 18.0512C11.3003 18.6941 12.1723 19.0554 13.0816 19.0554C13.9909 19.0554 14.863 18.6941 15.506 18.0512C16.149 17.4082 16.5102 16.5361 16.5102 15.6268C16.5102 14.7175 16.149 13.8454 15.506 13.2024C14.863 12.5595 13.9909 12.1982 13.0816 12.1982C12.1723 12.1982 11.3003 12.5595 10.6573 13.2024C10.0143 13.8454 9.65308 14.7175 9.65308 15.6268Z"
								stroke="#004E86"
								stroke-width="2.04575"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<path
								d="M18.2263 25.9119C18.2263 23.0715 15.9237 20.769 13.0834 20.769C10.243 20.769 7.94043 23.0715 7.94043 25.9119"
								stroke="#004E86"
								stroke-width="2.04575"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</svelte:fragment>
				</SidebarItem>
				<SidebarItem
					class="ml-0 h-8 w-40 font-medium text-[#004E86]"
					label="Tasks/Notes"
					{spanClass}
					on:click={() => {
						toggleSidebar();
					}}
					href="/task"
				>
					<svelte:fragment slot="icon">
						<svg
							width="25"
							height="25"
							viewBox="0 0 25 25"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M9.8125 12.6211H13.5625M9.8125 15.6211H13.5625M9.8125 18.6211H13.5625M16.5625 19.3711H18.8125C19.4092 19.3711 19.9815 19.134 20.4035 18.7121C20.8254 18.2901 21.0625 17.7178 21.0625 17.1211V6.72909C21.0625 5.59409 20.2175 4.63109 19.0865 4.53709C18.7125 4.50604 18.3381 4.47937 17.9635 4.45709M17.9635 4.45709C18.0291 4.67234 18.0618 4.89606 18.0625 5.12109C18.0625 5.32001 17.9835 5.51077 17.8428 5.65142C17.7022 5.79208 17.5114 5.87109 17.3125 5.87109H12.8125C12.3985 5.87109 12.0625 5.53509 12.0625 5.12109C12.0632 4.88909 12.0965 4.66776 12.1625 4.45709M17.9635 4.45709C17.8216 3.99771 17.5353 3.59586 17.1484 3.31044C16.7615 3.02502 16.2933 2.87105 15.8125 2.87109H14.3125C13.8317 2.87105 13.3635 3.02502 12.9766 3.31044C12.5897 3.59586 12.3044 3.99771 12.1625 4.45709M12.1625 4.45709C11.7872 4.48043 11.4125 4.50709 11.0385 4.53709C9.9075 4.63109 9.0625 5.59409 9.0625 6.72909V8.87109M9.0625 8.87109H5.6875C5.0665 8.87109 4.5625 9.37509 4.5625 9.99609V21.2461C4.5625 21.8671 5.0665 22.3711 5.6875 22.3711H15.4375C16.0585 22.3711 16.5625 21.8671 16.5625 21.2461V9.99609C16.5625 9.37509 16.0585 8.87109 15.4375 8.87109H9.0625ZM7.5625 12.6211H7.5705V12.6291H7.5625V12.6211ZM7.5625 15.6211H7.5705V15.6291H7.5625V15.6211ZM7.5625 18.6211H7.5705V18.6291H7.5625V18.6211Z"
								stroke="#004E86"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</svelte:fragment>
				</SidebarItem>
				<SidebarItem
					class="ml-0 h-8 w-40 font-medium text-[#004E86]"
					label="Calendar"
					{spanClass}
					on:click={() => {
						toggleSidebar();
					}}
					href="/calendar"
				>
					<svelte:fragment slot="icon">
						<svg
							width="25"
							height="25"
							viewBox="0 0 25 25"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g clip-path="url(#clip0_4_1569)">
								<path
									d="M7.5625 3.02734V5.27734M18.0625 3.02734V5.27734M3.8125 18.7773V7.52734C3.8125 6.93061 4.04955 6.35831 4.47151 5.93635C4.89347 5.5144 5.46576 5.27734 6.0625 5.27734H19.5625C20.1592 5.27734 20.7315 5.5144 21.1535 5.93635C21.5754 6.35831 21.8125 6.93061 21.8125 7.52734V18.7773M3.8125 18.7773C3.8125 19.3741 4.04955 19.9464 4.47151 20.3683C4.89347 20.7903 5.46576 21.0273 6.0625 21.0273H19.5625C20.1592 21.0273 20.7315 20.7903 21.1535 20.3683C21.5754 19.9464 21.8125 19.3741 21.8125 18.7773M3.8125 18.7773V11.2773C3.8125 10.6806 4.04955 10.1083 4.47151 9.68635C4.89347 9.2644 5.46576 9.02734 6.0625 9.02734H19.5625C20.1592 9.02734 20.7315 9.2644 21.1535 9.68635C21.5754 10.1083 21.8125 10.6806 21.8125 11.2773V18.7773M12.8125 12.7773H12.8205V12.7853H12.8125V12.7773ZM12.8125 15.0273H12.8205V15.0353H12.8125V15.0273ZM12.8125 17.2773H12.8205V17.2853H12.8125V17.2773ZM10.5625 15.0273H10.5705V15.0353H10.5625V15.0273ZM10.5625 17.2773H10.5705V17.2853H10.5625V17.2773ZM8.3125 15.0273H8.3205V15.0353H8.3125V15.0273ZM8.3125 17.2773H8.3205V17.2853H8.3125V17.2773ZM15.0625 12.7773H15.0705V12.7853H15.0625V12.7773ZM15.0625 15.0273H15.0705V15.0353H15.0625V15.0273ZM15.0625 17.2773H15.0705V17.2853H15.0625V17.2773ZM17.3125 12.7773H17.3205V12.7853H17.3125V12.7773ZM17.3125 15.0273H17.3205V15.0353H17.3125V15.0273Z"
									stroke="#004E86"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M7.5625 3.02734V5.27734M18.0625 3.02734V5.27734M3.8125 18.7773V7.52734C3.8125 6.93061 4.04955 6.35831 4.47151 5.93635C4.89347 5.5144 5.46576 5.27734 6.0625 5.27734H19.5625C20.1592 5.27734 20.7315 5.5144 21.1535 5.93635C21.5754 6.35831 21.8125 6.93061 21.8125 7.52734V18.7773M3.8125 18.7773C3.8125 19.3741 4.04955 19.9464 4.47151 20.3683C4.89347 20.7903 5.46576 21.0273 6.0625 21.0273H19.5625C20.1592 21.0273 20.7315 20.7903 21.1535 20.3683C21.5754 19.9464 21.8125 19.3741 21.8125 18.7773M3.8125 18.7773V11.2773C3.8125 10.6806 4.04955 10.1083 4.47151 9.68635C4.89347 9.2644 5.46576 9.02734 6.0625 9.02734H19.5625C20.1592 9.02734 20.7315 9.2644 21.1535 9.68635C21.5754 10.1083 21.8125 10.6806 21.8125 11.2773V18.7773M12.8125 12.7773H12.8205V12.7853H12.8125V12.7773ZM12.8125 15.0273H12.8205V15.0353H12.8125V15.0273ZM12.8125 17.2773H12.8205V17.2853H12.8125V17.2773ZM10.5625 15.0273H10.5705V15.0353H10.5625V15.0273ZM10.5625 17.2773H10.5705V17.2853H10.5625V17.2773ZM8.3125 15.0273H8.3205V15.0353H8.3125V15.0273ZM8.3125 17.2773H8.3205V17.2853H8.3125V17.2773ZM15.0625 12.7773H15.0705V12.7853H15.0625V12.7773ZM15.0625 15.0273H15.0705V15.0353H15.0625V15.0273ZM15.0625 17.2773H15.0705V17.2853H15.0625V17.2773ZM17.3125 12.7773H17.3205V12.7853H17.3125V12.7773ZM17.3125 15.0273H17.3205V15.0353H17.3125V15.0273Z"
									stroke="#004E86"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</g>
							<defs>
								<clipPath id="clip0_4_1569">
									<rect
										width="24"
										height="24"
										fill="white"
										transform="translate(0.8125 0.0273438)"
									/>
								</clipPath>
							</defs>
						</svg>
					</svelte:fragment>
				</SidebarItem>
			</SidebarGroup>
		</SidebarWrapper>
		<div class="-mt-3 mb-2 ml-2 w-48 border-[1px] border-[#93B6CF]"></div>
		<p class="text-md mb-1 ml-4 font-semibold text-slate-700">History</p>
		<SidebarWrapper
			divClass="overflow-y-auto py-4 px-3 rounded dark:bg-gray-800 flex flex-col gap-1 w-full h-[25vh]"
		>
			{#each Object.entries(previousChats) as [chat, val]}
				<SidebarGroup>
					<div
						class="flex h-8 w-48 items-center justify-between gap-1 truncate rounded-lg bg-white px-6 py-3 text-start align-middle font-sans text-sm font-semibold text-black shadow-md shadow-gray-900/10 transition-all hover:shadow-md hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
					>
						<button
							class="inline-block w-full truncate"
							on:click={() => {
								selectChat(val);
								toggleSidebar();
								goto('/');
							}}>{chat}...</button
						><button class="z-20 -mr-4 text-black" on:click={() => removeChat(chat)}
							><svg
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
									d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
								/>
							</svg>
						</button>
					</div>
				</SidebarGroup>
			{/each}
		</SidebarWrapper>
	</Sidebar>
</Drawer>
<div class="dark:bg-dark flex items-center justify-between bg-white p-4 text-black dark:text-white">
	<div class="flex items-center justify-evenly gap-2">
		<button on:click={() => (hidden2 = false)}>
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M13.5 18H4M20 12H4M20 6H4"
					stroke="#004E86"
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
		</button>
		<h1 class="ml-6 text-2xl font-bold">SwasthAI</h1>
	</div>
	<div class="flex flex-row items-center justify-center gap-2">
		<Avatar
			id="notifications"
			dot={notifications.length > 0 ? { placement: 'top-right', color: 'red' } : {}}
			><BellOutline /></Avatar
		>
		{#if notifications.length > 0}
			<Dropdown triggeredBy="#notifications">
				<div slot="header" class="py-2 text-center font-bold">Notifications</div>
				{#each notifications as n}
					<DropdownItem class="flex space-x-4 rtl:space-x-reverse">
						<div class="w-full ps-3">
							<div class="mb-1.5 text-sm text-black dark:text-gray-400">
								{n}
							</div>
						</div>
					</DropdownItem>
				{/each}
			</Dropdown>
		{/if}
		{#if $userStore}
			<div class="flex flex-row items-center justify-center">
				<button>
					<img
						src={$userStore.photoURL}
						class="h-8 w-8 rounded-full"
						referrerpolicy="no-referrer"
						alt=""
					/>
				</button>

				<Dropdown
					placement="bottom-start"
					containerClass="divide-y z-50 border-2 border-[#004E86] rounded-lg"
				>
					<DropdownItem class="flex flex-row items-center gap-2">
						<Avatar size="xs" src={google}></Avatar>
						{$userStore.email}</DropdownItem
					>
					<DropdownItem class="flex flex-row items-center gap-2">
						<svg
							width="24"
							height="22"
							viewBox="0 0 24 22"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M21.9629 18.549C21.9629 18.549 20.5912 19.8178 20.2551 20.1898C19.7075 20.7401 19.0623 21 18.2166 21C18.1353 21 18.0485 21 17.9672 20.9949C16.357 20.8981 14.8607 20.307 13.7384 19.8025C10.6698 18.4064 7.97531 16.4242 5.73622 13.9121C3.88748 11.8178 2.65137 9.88153 1.83272 7.80255C1.32852 6.53376 1.14419 5.54522 1.22551 4.61274C1.27973 4.01656 1.5237 3.52229 1.97368 3.09936L3.82242 1.36178C4.08808 1.12739 4.37 1 4.6465 1C4.98805 1 5.26455 1.19363 5.43804 1.35669C5.44346 1.36178 5.44888 1.36688 5.4543 1.37197C5.78502 1.66242 6.09946 1.96306 6.43018 2.28408C6.59825 2.44713 6.77173 2.61019 6.94522 2.77834L8.4253 4.16943C8.99998 4.70955 8.99998 5.20892 8.4253 5.74905C8.26808 5.89682 8.11627 6.04458 7.95905 6.18726C7.50364 6.62548 7.86139 6.28924 7.38972 6.68669C7.37887 6.69688 7.36803 6.70198 7.36261 6.71217C6.89636 7.15038 6.9831 7.57841 7.08069 7.86885C7.08611 7.88414 7.09153 7.89943 7.09695 7.91471C7.48188 8.79115 8.02404 9.61662 8.84811 10.6001L8.85353 10.6052C10.3499 12.3376 11.9275 13.688 13.6678 14.7224C13.8901 14.8548 14.1178 14.9618 14.3347 15.0638C14.5299 15.1555 14.7142 15.2421 14.8714 15.3338C14.8931 15.344 14.9148 15.3593 14.9365 15.3695C15.1208 15.4561 15.2943 15.4969 15.4732 15.4969C15.9232 15.4969 16.2051 15.2319 16.2973 15.1453L17.36 14.1465C17.5443 13.9732 17.8371 13.7643 18.1786 13.7643C18.5148 13.7643 18.7913 13.9631 18.9593 14.1363C18.9648 14.1414 18.9648 14.1414 18.9702 14.1465L21.9574 16.9541C22.5158 17.4739 21.9629 18.549 21.9629 18.549Z"
								stroke="#838383"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>

						{$userStore.phoneNumber || 'Not Provided'}</DropdownItem
					>
					<DropdownItem class="flex flex-row items-center gap-2">
						<svg
							width="25"
							height="23"
							viewBox="0 0 25 23"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M19.4335 8.36707C19.6239 8.81187 20.0753 9.10285 20.577 9.10425C21.258 9.10951 21.8071 9.64001 21.807 10.2926V12.3434C21.807 12.9997 21.2519 13.5317 20.567 13.5317C20.0653 13.5331 19.6139 13.8241 19.4235 14.2689C19.233 14.7137 19.341 15.2247 19.697 15.5634C20.1747 16.0325 20.1747 16.781 19.697 17.2501L18.197 18.6876C17.7076 19.1453 16.9265 19.1453 16.437 18.6876C16.2113 18.4584 15.8959 18.3298 15.567 18.333C15.2364 18.3304 14.9185 18.4545 14.6837 18.6776C14.449 18.9008 14.317 19.2045 14.317 19.5213C14.317 20.1776 13.7619 20.7097 13.077 20.7097H10.937C10.2522 20.7097 9.69703 20.1776 9.69703 19.5213C9.69704 19.2045 9.56503 18.9008 9.33031 18.6776C9.0956 18.4545 8.77763 18.3304 8.44703 18.333C8.11814 18.3298 7.80279 18.4584 7.57703 18.6876C7.08758 19.1453 6.30648 19.1453 5.81703 18.6876L4.31703 17.2501C3.8394 16.781 3.8394 16.0325 4.31703 15.5634C4.67308 15.2247 4.78105 14.7137 4.59058 14.2689C4.40011 13.8241 3.94873 13.5331 3.44703 13.5317C3.11816 13.5317 2.80276 13.4065 2.57022 13.1837C2.33767 12.9608 2.20703 12.6586 2.20703 12.3434V10.2926C2.20703 9.63628 2.7622 9.10425 3.44703 9.10425C3.94873 9.10285 4.40011 8.81187 4.59058 8.36707C4.78105 7.92228 4.67308 7.41131 4.31703 7.07258C3.8394 6.60352 3.8394 5.85497 4.31703 5.38591L5.81703 3.94841C6.30648 3.49068 7.08758 3.49068 7.57703 3.94841C7.80279 4.17764 8.11814 4.30617 8.44703 4.303C8.77937 4.30558 9.09888 4.1802 9.33388 3.95498C9.56889 3.72977 9.69972 3.42357 9.69703 3.10508C9.69703 2.44878 10.2522 1.91675 10.937 1.91675H13.087C13.7719 1.91675 14.327 2.44878 14.327 3.10508C14.3243 3.42357 14.4552 3.72977 14.6902 3.95498C14.9252 4.1802 15.2447 4.30558 15.577 4.303C15.9059 4.30617 16.2213 4.17764 16.447 3.94841C16.9365 3.49068 17.7176 3.49068 18.207 3.94841L19.707 5.38591C20.1847 5.85497 20.1847 6.60352 19.707 7.07258C19.351 7.41131 19.243 7.92228 19.4335 8.36707ZM18.007 13.7138C18.3974 12.8017 19.2913 12.1787 20.317 12.1038L20.287 10.5322C19.2724 10.4469 18.3926 9.82559 18.007 8.92216C17.6294 8.01661 17.8023 6.98538 18.457 6.23883L17.307 5.13675C16.8194 5.52814 16.2031 5.74196 15.567 5.7405C14.1499 5.73717 12.9657 4.70584 12.827 3.35425H11.187C11.0529 4.70799 9.86598 5.74164 8.44703 5.7405C7.81093 5.74196 7.19471 5.52814 6.70703 5.13675L5.58703 6.23883C6.23156 6.99108 6.39289 8.02179 6.00703 8.92216C5.6215 9.82559 4.74162 10.4469 3.72703 10.5322V12.1038C4.74162 12.1891 5.6215 12.8104 6.00703 13.7138C6.38467 14.6194 6.21173 15.6506 5.55703 16.3972L6.70703 17.4992C7.19471 17.1079 7.81093 16.894 8.44703 16.8955C9.86418 16.8988 11.0484 17.9302 11.187 19.2817H12.827C12.9521 17.9237 14.1444 16.8852 15.567 16.8955C16.2031 16.894 16.8194 17.1079 17.307 17.4992L18.427 16.3972C17.7825 15.6449 17.6212 14.6142 18.007 13.7138Z"
								fill="#838383"
							/>
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M8.54703 11.318C8.54703 9.48671 10.0961 8.00216 12.007 8.00216C12.9247 8.00216 13.8047 8.35151 14.4536 8.97335C15.1025 9.59519 15.467 10.4386 15.467 11.318C15.467 13.1493 13.9179 14.6338 12.007 14.6338C10.0961 14.6338 8.54703 13.1493 8.54703 11.318ZM10.007 11.318C10.007 12.3765 10.9025 13.2347 12.007 13.2347C13.1116 13.2347 14.007 12.3765 14.007 11.318C14.007 10.2595 13.1116 9.40133 12.007 9.40133C10.9025 9.40133 10.007 10.2595 10.007 11.318Z"
								fill="#838383"
							/>
						</svg>
						Profile Edit</DropdownItem
					>
					<DropdownItem class="flex flex-row items-center gap-2 px-2">
						<DarkMode />

						Dark Mode</DropdownItem
					>

					<DropdownDivider />
					<DropdownItem on:click={signOut} slots="footer" class="flex flex-row items-center gap-2">
						<svg
							width="21"
							height="20"
							viewBox="0 0 21 20"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M12.8541 5.8001V3.7001C12.8541 3.14314 12.631 2.609 12.2338 2.21517C11.8367 1.82135 11.2981 1.6001 10.7364 1.6001H3.32468C2.76304 1.6001 2.22441 1.82135 1.82728 2.21517C1.43014 2.609 1.20703 3.14314 1.20703 3.7001V16.3001C1.20703 16.8571 1.43014 17.3912 1.82728 17.785C2.22441 18.1788 2.76304 18.4001 3.32468 18.4001H10.7364C11.2981 18.4001 11.8367 18.1788 12.2338 17.785C12.631 17.3912 12.8541 16.8571 12.8541 16.3001V14.2001M6.50115 10.0001H19.207M19.207 10.0001L16.0306 6.8501M19.207 10.0001L16.0306 13.1501"
								stroke="#838383"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>

						Sign out</DropdownItem
					>
				</Dropdown>
			</div>
		{/if}
	</div>
</div>
