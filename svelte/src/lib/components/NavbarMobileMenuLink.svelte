<script lang="ts">
	import { page } from '$app/stores';

	export let href: string;

	let currentPath: string | null, active: boolean, ariaCurrent: 'page' | undefined, classes: string;
	page.subscribe(($page) => {
		currentPath = $page.route.id;
	});

	// We create reactive statements that update whenever href or currentPath change
	$: active = href === currentPath;
	$: ariaCurrent = active ? 'page' : undefined;
	$: classes = active
		? 'border-indigo-500 bg-indigo-50 text-indigo-700 block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
		: 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 block border-l-4 py-2 pl-3 pr-4 text-base font-medium';
</script>

<a {href} class={classes} aria-current={ariaCurrent}>
	<slot />
</a>
