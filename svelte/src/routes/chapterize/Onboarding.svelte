<script lang="ts">
	export let saveApiKey: (key: string) => void;

	let apiKey = '';
</script>

<div class="text-center">
	<h2 class="text-2xl font-bold mb-4">Let's Get Started</h2>
	<p class="mb-4">
		To begin, we need you to save your OpenAI API key. Chapterize does not save your key on our
		machines. Instead, it is stored locally in your browser. <br />You can obtain this key from your
		<a
			href="https://platform.openai.com/signup"
			target="_blank"
			rel="noopener noreferrer"
			class="text-indigo-600 underline">OpenAI Dashboard</a
		>.
	</p>
	<p class="mb-4">
		Your key is safely stored on your computer. We only use the key to make requests to OpenAI on
		your behalf, using your tokens.
	</p>
	<p class="mb-4">
		Please note that making requests and uses tokens may cost money after a certain point. For
		information on pricing, see
		<a
			href="https://openai.com/pricing"
			target="_blank"
			rel="noopener noreferrer"
			class="text-indigo-600 underline">OpenAI Pricing</a
		>.
	</p>
	<form on:submit|preventDefault={(e) => saveApiKey(apiKey)}>
		<input
			type="password"
			class="w-full px-4 py-2 border rounded mb-4 text-center"
			placeholder="Enter your OpenAI API key"
			autocomplete="off"
			bind:value={apiKey}
		/>
		<button class="px-4 py-2 bg-indigo-600 text-white rounded" type="submit">Submit</button>
	</form>
</div>
