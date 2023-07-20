<script lang="ts">
	import DOMPurify from 'dompurify';
	import LoadingSpinner from './LoadingSpinner.svelte';

	// Props
	export let apiKey: string | null = null;

	// Data
	let videoUrl: string | null = null;
	let videoId: string | null = null;
	let working = false;
	let chapters = '';

	/**
	 * Sanitizes the URL to prevent XSS attacks
	 */
	const sanitizeUrl = (url: string) => DOMPurify.sanitize(url);

	/**
	 * Extracts the video ID from the URL
	 */
	const extractVideoId = (url: string) => {
		const match = url.match(/watch\?v=(.+)/);
		return match ? match[1] : null;
	};

	/**
	 * Sends the video ID to the API to be chapterized
	 */
	const chapterize = async () => {
		working = true;
		// Ensure we have a video URL before proceeding
		if (!videoUrl) throw new Error('Error chapterizing video. No video URL was provided.');
		// Sanitize video URL and extract video ID
		videoUrl = sanitizeUrl(videoUrl.trim());
		videoId = extractVideoId(videoUrl);
		if (!videoId) throw new Error('Error chapterizing video. YouTube URL may be invalid.');

		const response = await fetch('/api/chapterize', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({ videoId })
		});

		chapters = await response.json();
		working = false;
	};
</script>

<div class="text-center">
	<h2 class="text-2xl font-bold mb-4">Chapterize</h2>
	<form on:submit|preventDefault={chapterize}>
		<input
			id="YouTubeURL"
			name="YouTubeURL"
			type="search"
			class="w-full px-4 py-2 border rounded mb-4 text-center"
			placeholder="Enter a YouTube video URL"
			bind:value={videoUrl}
			disabled={working}
		/>
		<button
			class="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-100"
			type="submit"
			disabled={working}>Chapterize</button
		>
	</form>
</div>

<!-- Chapters Output -->
<div class="mx-auto max-w-xl my-8">
	{#each chapters as chapter}
		<p class="text-gray-500">{chapter}</p>
	{/each}
</div>
