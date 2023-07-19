<script lang="ts">
	export let removeApiKey: () => void;
</script>

<button class="px-4 py-2 bg-red-500 text-white rounded" on:click={removeApiKey}>
	Reset API Key
</button>
