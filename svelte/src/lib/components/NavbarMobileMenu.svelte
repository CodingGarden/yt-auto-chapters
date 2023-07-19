<script lang="ts">
	import MobileLink from '$lib/components/NavbarMobileMenuLink.svelte';
	export let links: { href: string; text: string }[];
</script>

<div class="hidden sm:hidden" id="mobile-menu">
	<div class="space-y-1 pb-3 pt-2">
		{#each links as link}
			<MobileLink href={link.href}>{link.text}</MobileLink>
		{/each}
	</div>
</div>
