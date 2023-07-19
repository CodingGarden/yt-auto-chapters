<script lang="ts">
	import DOMPurify from 'dompurify';

	// Props
	export let apiKey: string | null = null;

	// Data
	let videoUrl: string | null = null;
	let videoId: string | null = null;

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

		// Handle response...
		const data = await response.json();
		console.log(data);
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
		/>
		<button class="px-4 py-2 bg-indigo-600 text-white rounded" type="submit">Chapterize</button>
	</form>
</div>
