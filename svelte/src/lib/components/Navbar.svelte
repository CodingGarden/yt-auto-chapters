<script lang="ts">
	import Link from '$lib/components/NavbarLink.svelte';
	import Brand from '$lib/components/BrandLogo.svelte';
	import MobileMenu from '$lib/components/NavbarMobileMenu.svelte';
	import MobileMenuToggle from '$lib/components/NavbarMobileMenuToggle.svelte';

	const SITE_LINKS = [
		{ href: '/', text: 'About' },
		{ href: '/chapterize', text: 'Chapterize' }
	];
</script>

<nav class="border-b border-gray-200 bg-white">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 justify-between">
			<div class="flex">
				<div class="flex flex-shrink-0 items-center">
					<Brand />
				</div>
				<div class="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
					{#each SITE_LINKS as link}
						<Link href={link.href}>{link.text}</Link>
					{/each}
				</div>
			</div>
			<div class="-mr-2 flex items-center sm:hidden">
				<MobileMenuToggle />
			</div>
		</div>
	</div>

	<!-- Mobile menu, show/hide based on menu state. -->
	<MobileMenu links={SITE_LINKS} />
</nav>
