<script lang="ts">
	// We create a reactive variable that tracks whether the menu is open or not
	let isOpen = false;

	// Function to toggle the menu open or closed
	function toggleMenu() {
		isOpen = !isOpen;
	}
</script>

<button
	on:click={toggleMenu}
	type="button"
	class="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
	aria-controls="mobile-menu"
	aria-expanded={isOpen}
>
	<span class="sr-only">Open main menu</span>
	<!-- Menu open: "hidden", Menu closed: "block" -->
	<svg
		class={isOpen ? 'hidden' : 'block h-6 w-6'}
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		aria-hidden="true"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
		/>
	</svg>
	<!-- Menu open: "block", Menu closed: "hidden" -->
	<svg
		class={isOpen ? 'block h-6 w-6' : 'hidden'}
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		aria-hidden="true"
	>
		<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
	</svg>
</button>
