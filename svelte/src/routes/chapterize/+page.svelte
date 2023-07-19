<script lang="ts">
	import { onMount } from 'svelte';
	import Onboarding from './Onboarding.svelte';
	import Chapterize from './Chapterize.svelte';
	import ResetKey from './ResetKey.svelte';

	let onboardingComplete: boolean = false;
	let apiKey: string | null = null;

	onMount(() => {
		// Check if API key is saved in local storage
		apiKey = localStorage.getItem('apiKey');
		if (!apiKey) onboardingComplete = false;
		else onboardingComplete = true;
	});

	/**
	 * Saves the API key to local storage
	 * @param key
	 */
	const saveApiKey = (key: string) => {
		if (!key) throw new Error('No API key provided');
		// Validate that key is a valid OpenAI API key
		const regex = new RegExp('sk-[a-zA-Z0-9]{24}');
		if (!regex.test(key)) throw new Error('Invalid API key provided');
		// Save key to local storage
		localStorage.setItem('apiKey', key);
		apiKey = key ?? null;
		onboardingComplete = true;
	};

	/**
	 * Removes the API key from local storage
	 */
	const removeApiKey = () => {
		localStorage.removeItem('apiKey');
		apiKey = null;
		onboardingComplete = false;
	};
</script>

<div class="p-10">
	{#if !onboardingComplete}
		<Onboarding {saveApiKey} />
	{:else}
		<Chapterize bind:apiKey />
		<ResetKey {removeApiKey} />
	{/if}
</div>
