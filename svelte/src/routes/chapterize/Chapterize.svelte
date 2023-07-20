<script lang="ts">
	import DOMPurify from 'dompurify';
	import { Configuration, OpenAIApi } from 'openai';
	import ProgressBar from './ProgressBar.svelte';
	import { writable } from 'svelte/store';
	const progress = writable(0);

	// Props
	export let apiKey: string | null = null;

	// Types
	type Chapter = {
		timestamp: string;
		title: string;
	};
	type ChapterSummary = {
		videoId: string;
		chapters: Chapter[];
	};

	// Ensure we have an API key before initializing our OpenAI client
	if (!apiKey) throw new Error('Error chapterizing video. No API key was provided.');

	// Define API configurations
	const openAIConfig = new Configuration({ apiKey });
	const OpenAI = new OpenAIApi(openAIConfig);

	// Data
	let videoUrl: string | null = null;
	let videoId: string | null = null;
	let working = false;
	let summary: ChapterSummary = {
		videoId: '',
		chapters: []
	};
	let feedback = '';

	// Sanitizes to prevent XSS attacks
	const sanitize = (url: string) => DOMPurify.sanitize(url);

	// Extracts the video ID from the URL
	const extractVideoId = (url: string) => {
		const match = url.match(/watch\?v=(.+)/);
		return match ? match[1] : null;
	};

	const chapterize = async () => {
		working = true;
		// Ensure we have a video URL before proceeding
		if (!videoUrl) throw new Error('Error chapterizing video. No video URL was provided.');
		// Sanitize video URL and extract video ID
		videoUrl = sanitize(videoUrl.trim());
		videoId = extractVideoId(videoUrl);
		if (!videoId) throw new Error('Error chapterizing video. YouTube URL may be invalid.');

		// Get the transcript from YouTube
		feedback = 'Fetching transcript...';
		let transcript: string;
		try {
			const response = await fetch('/api/transcript', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ videoId })
			});
			transcript = await response.json();
			if (!transcript)
				throw new Error('Error chapterizing video. No transcript returned from YouTube.');

			feedback = 'Transcript fetched.';
		} catch (e) {
			feedback = 'Oops. Something went wrong fetching the transcript.';
			progress.set(0);
			console.error(e);
			throw new Error('Error chapterizing video. No transcript returned from YouTube.');
		} finally {
			working = false;
		}
		// Get the chapter summaries
		summary = await getChapterSummaries(transcript);
	};

	// Step 1: Breakdown transcript into chunks
	function breakIntoChunks(transcript: string): string[] {
		const MAX_CHARS_PER_CHUNK = 2500 * 4; // 2500 tokens per chunk, 4 tokens per character
		let chunks: string[] = [];
		let startIndex = 0;

		progress.set(0);
		while (startIndex < transcript.length) {
			progress.set((startIndex / transcript.length) * 100);
			const endIndex = Math.min(startIndex + MAX_CHARS_PER_CHUNK, transcript.length);

			if (endIndex === transcript.length) {
				chunks.push(transcript.substring(startIndex, endIndex));
				break;
			}

			const roughChunk = transcript.substring(startIndex, endIndex);
			// move backwards through the roughChunk, looking for the last newline "\n"
			let lastNewlineIndex = roughChunk.lastIndexOf('\n');
			// if there is no newline, then we need to split the roughChunk at the last space " "
			if (lastNewlineIndex === -1) {
				lastNewlineIndex = roughChunk.lastIndexOf(' ');
			}
			// if there is no space, then we need to split the roughChunk at the last period "."
			if (lastNewlineIndex === -1) {
				lastNewlineIndex = roughChunk.lastIndexOf('.');
			}
			// if there is no period, then we need to split the roughChunk at the last comma ","
			if (lastNewlineIndex === -1) {
				lastNewlineIndex = roughChunk.lastIndexOf(',');
			}

			const chunk = roughChunk.substring(0, lastNewlineIndex);
			chunks.push(chunk);

			startIndex = lastNewlineIndex++;
		}

		return chunks;
	}

	// Step 2: Process chunks to create rough chapters
	async function processChunks(chunks: string[]): Promise<string[]> {
		const roughChapters: string[] = [];

		progress.set(0);
		for (let chunk of chunks) {
			progress.set(((chunks.indexOf(chunk) + 1) / chunks.length) * 100);
			try {
				const { data } = await OpenAI.createChatCompletion({
					model: 'gpt-3.5-turbo',
					messages: [
						{
							role: 'system',
							content:
								"You are creating chapter summaries for YouTube videos about programming. The goal is to divide the video into chapters with timestamps. You should evaluate the video to create chapters of at least 1 minute long, up to a maximum of 20 minutes long. Evaluate each time stamp, line by line, and start a new chapter when the topic has changed significantly, or create a chapter summary if the maximum 20 minute time has been reached. Continue doing this for the entirety of the text provided. Each chapter should have a concise title, no longer than 50 characters. The chapter titles can be keywords, summarized concepts, or titles. A new chapter should be created only when there is a significant change in the topic. DO NOT provide fine-grain results. Only provide large-grain chapter titles. The fewer chapters you're able to produce, the better.\n\nFor videos that are longer than 20 minutes, at least 2 minutes should have elapsed since the start of the previous chapter. For shorter videos, the minimum chapter length should be proportional to the total video length. For instance, a 10-minute video should have chapters that are at least 1 minute long.\n\nThe video transcript you will be provided follows a specific format: each line contains a timestamp, followed by the corresponding text. The timestamps in the transcript will be in either the format '00:00' or '00:00:00', depending on the overall length of the video. Please use the provided timestamps to determine the chapter breaks. The chapter timestamps should not exceed the largest timestamp in the transcript.\n\nYour task is to generate the chapter titles with timestamps. Each line of the output should follow the format '00:00:00 Title' or '00:00 Title', matching the timestamp format in the transcript. Each new user input is a new batch of the same transcript.\n\nPlease note that the presenter is the only person speaking in the video.\n\nStart creating the chapter summary for the transcript below:"
						},
						{
							role: 'user',
							content: chunk
						}
					]
				});
				const responseContent = data.choices[0].message?.content;
				if (!responseContent) {
					throw new Error('Error chapterizing video. No response from OpenAI.');
				}
				const subjects = responseContent.split('\n') || [];
				for (let subject of subjects) {
					roughChapters.push(subject.trim());
				}
			} catch (e) {
				feedback = 'Oops. Something went wrong processing the chunks.';
				progress.set(0);
				throw e;
			}
		}

		return roughChapters;
	}

	// Step 3: Process rough chapters into a final chapter summary
	async function processRoughChapters(roughChapters: string[]): Promise<string[]> {
		// If we have just one chunk worth of chapters, just return it immediately.
		if (roughChapters.length < 50) return roughChapters;

		// Otherwise, we have many chunks worth of chapters, so we need to process them in chunks.
		const chapterChunks: string[][] = [];
		for (let i = 0; i < roughChapters.length; i += 50) {
			chapterChunks.push(roughChapters.slice(i, i + 50));
		}

		const finalChapters: string[] = [];

		progress.set(0);
		for (let i = 0; i < chapterChunks.length; i++) {
			progress.set(((i + 1) / chapterChunks.length) * 100);
			const chunk = chapterChunks[i];
			const chunkChaptersText = chunk.join('\n');
			try {
				const { data } = await OpenAI.createChatCompletion({
					model: 'gpt-3.5-turbo',
					messages: [
						{
							role: 'system',
							content:
								"You are reviewing a list of rough chapter titles for a YouTube video about programming. Your task is to finalize these chapter titles. Please ensure that each title accurately reflects the content of the corresponding chapter. Make sure that the titles are concise, no longer than 50 characters, and clear to the average viewer. If a title is redundant or does not represent significant content, please remove it. The goal is to have 3-5 chapters per 10 minutes of total video length, and each chapter can be between 1 and 20 minutes long. Please return the final list of chapter titles in the same order, separated by newline characters. We want large-grain chapter titles, not fine-grain chapter titles. The fewer chapters you're able to produce, the better."
						},
						{
							role: 'user',
							content: chunkChaptersText
						}
					]
				});
				const responseContent = data.choices[0].message?.content;
				if (!responseContent) {
					throw new Error('Error chapterizing video. No response from OpenAI.');
				}
				const chapters = responseContent.split('\n') || [];
				for (let chapter of chapters) {
					finalChapters.push(chapter.trim());
				}
			} catch (e) {
				feedback = 'Oops. Something went wrong processing the rough chapters.';
				progress.set(0);
				throw e;
			}
		}

		return finalChapters;
	}

	// Step 4: Finalize
	async function finalize(chapters: string[]): Promise<Chapter[]> {
		// Combine all chapters into a single string
		let content = chapters.join('\n');

		// Check if content is too long for a single API request. If so, return as-is.
		if (content.length > 30000) {
			const finalChapters: Chapter[] = [];
			progress.set(0);
			for (const chapter of chapters) {
				progress.set(((chapters.indexOf(chapter) + 1) / chapters.length) * 100);
				const indexOfFirstSpace = chapter.indexOf(' ');
				const [timestamp, title] = [
					chapter.substring(0, indexOfFirstSpace),
					chapter.substring(indexOfFirstSpace + 1)
				];
				finalChapters.push({
					timestamp,
					title
				});
			}
			return finalChapters;
		}

		// Send final API request
		let responseContent;
		try {
			const { data } = await OpenAI.createChatCompletion({
				model: 'gpt-4-0613',
				messages: [
					{
						role: 'system',
						content:
							"You are reviewing a list of rough chapter titles for a YouTube video about programming. Your task is to finalize these chapter titles. Please ensure that each title accurately reflects the content of the corresponding chapter. Make sure that the titles are concise, no longer than 50 characters, and clear to the average viewer. If a title is redundant or does not represent significant content, please remove it. The goal is to have 3-5 chapters per 10 minutes of total video length, and each chapter can be between 1 and 20 minutes long. Please return the final list of chapter titles in the same order, separated by newline characters.\n\nI would like you to join as many topics together as possible. In the end, we should have as few chapters as possible. Only join chapters that are similar. You can also create a new, generalized chapter title if you are merging 2 chapters together. Remember not to exceed 50 characters in length.\n\nThe fewer chapters you're able to produce, the better."
					},
					{
						role: 'user',
						content: content
					}
				]
			});

			responseContent = data.choices[0].message?.content;
			if (!responseContent) {
				throw new Error('Error chapterizing video. No response from OpenAI.');
			}
			responseContent = responseContent.trim();
			feedback = 'Chapters finalized.';
		} catch (e) {
			feedback = 'Oops. Something went wrong finalizing the chapters.';
			progress.set(0);
			throw e;
		}

		// Process response
		if (!responseContent) {
			throw new Error('Error chapterizing video. No response from OpenAI.');
		}
		const finalTitles = responseContent.split('\n') || [];

		// Create final chapters
		const finalChapters: Chapter[] = [];
		for (const chapter of finalTitles) {
			const indexOfFirstSpace = chapter.indexOf(' ');
			const [timestamp, title] = [
				chapter.substring(0, indexOfFirstSpace),
				chapter.substring(indexOfFirstSpace + 1)
			];
			finalChapters.push({
				timestamp,
				title
			});
		}

		return finalChapters;
	}

	// Main function to get chapter summaries
	async function getChapterSummaries(transcript: string): Promise<ChapterSummary> {
		working = true;
		feedback = 'Processing transcript...';
		const chunks = breakIntoChunks(transcript);
		feedback = 'Transcript processed. Processing chapters...';
		progress.set(0);
		const roughChapters = await processChunks(chunks);
		feedback = 'Processing rough chapters...';
		progress.set(0);
		const finalChapters = await processRoughChapters(roughChapters);
		feedback = 'Finalizing chapters...';
		progress.set(0);
		const chapters = await finalize(finalChapters);
		feedback = '';
		working = false;
		return {
			videoId: videoId!,
			chapters
		};
	}

	function getSecondsFromTimestamp(timestamp: string): number {
		const [hours, minutes, seconds] = timestamp.split(':');
		return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
	}
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
		{#if feedback}
			<p class="my-8 text-sm text-blue-500">{feedback}</p>
		{/if}
		{#if working}
			<ProgressBar progress={$progress} />
		{/if}
	</form>
</div>

<!-- Chapters Output -->
{#if summary.chapters.length > 0}
	<h3 class="text-xl font-bold mt-8 mb-4">Chapters</h3>
	{#each summary.chapters as chapter}
		<div class="flex items-center mb-4">
			<a
				href={`https://www.youtube.com/watch?v=${videoId}&t=${getSecondsFromTimestamp(
					chapter.timestamp
				)}s`}
				class="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center"
			>
				{chapter.timestamp}
			</a>
			<div class="ml-4">
				<div class="font-bold">{chapter.title}</div>
			</div>
		</div>
	{/each}
{/if}
