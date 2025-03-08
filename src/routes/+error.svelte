<main class="flex h-full w-full flex-col items-center justify-center">
	<h1 class="text-9xl font-extrabold tracking-widest text-black">404</h1>
	<div class="absolute rotate-12 rounded bg-[#FF6A3D] px-2 text-sm">Page Not Found</div>
	<button class="mt-5">
		<a
			href="/"
			class="group relative inline-block text-sm font-medium text-[#FF6A3D] focus:ring focus:outline-none active:text-orange-500"
		>
			<span
				class="absolute inset-0 translate-x-0.5 translate-y-0.5 bg-[#FF6A3D] transition-transform group-hover:translate-x-0 group-hover:translate-y-0"
			></span>

			<span class="relative block border border-current bg-[#1A2238] px-8 py-3 text-white">
				<router-link to="/">Go Home</router-link>
			</span>
		</a>
	</button>
</main>
