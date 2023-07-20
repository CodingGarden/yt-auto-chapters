<script lang="ts">
	import { page } from '$app/stores';

	export let href: string;

	// We subscribe to the page store and get the current path
	let currentPath: string | null, active: boolean, ariaCurrent: 'page' | undefined, classes: string;
	page.subscribe(($page) => {
		currentPath = $page.route.id;
	});

	// We create reactive statements that update whenever href or currentPath change
	$: active = href === currentPath;
	$: ariaCurrent = active ? 'page' : undefined;
	$: classes = active
		? 'border-indigo-500 text-gray-900 inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
		: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium';
</script>

<a {href} class={classes} aria-current={ariaCurrent}>
	<slot />
</a>
