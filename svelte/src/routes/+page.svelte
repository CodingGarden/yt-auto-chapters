<script>
	import Icon from '@iconify/svelte';
</script>

<div class="text-center p-8">
	<h1 class="text-4xl font-bold mb-4 mt-10">Chapterize</h1>
	<p class="text-lg mb-6 max-w-2xl mx-auto">
		Chapterize is a tool that extracts the transcript for a video on YouTube, then uses AI to parse
		through and generate chapters with timestamps. The idea is to help creators quickly create
		chapters for long videos using AI.
	</p>

	<h2 class="text-2xl font-bold mt-12">Tech Stack</h2>
	<div class="flex justify-center space-x-6 mb-6">
		<div>
			<div class="h-6 w-6">
				<Icon icon="logos/typescript-icon" />
			</div>
			<p>TypeScript</p>
		</div>
		<div>
			<div class="h-6 w-6">
				<Icon icon="logos/svelte-icon" />
			</div>
			<p>SvelteKit</p>
		</div>
		<div>
			<div class="h-6 w-6">
				<Icon icon="logos/openai" />
			</div>
			<p>OpenAI API</p>
		</div>
		<div>
			<div class="h-6 w-6">
				<Icon icon="logos/tailwindcss-icon" />
			</div>
			<p>TailwindCSS</p>
		</div>
	</div>

	<a
		href="/chapterize"
		class="inline-block px-6 py-3 text-white bg-indigo-600 rounded hover:bg-indigo-700"
		>Get Started</a
	>
</div>
