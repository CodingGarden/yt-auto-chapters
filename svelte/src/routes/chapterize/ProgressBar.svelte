<script>
	export let progress = 0;

	let progressColor = '';

	$: {
		if (progress <= 0) {
			progressColor = 'bg-gray-300';
		} else if (progress >= 100) {
			progressColor = 'bg-green-500';
		} else {
			progressColor = 'bg-blue-500';
		}
	}
</script>

<div class="h-4 w-full bg-gray-300 my-6 animate-pulse">
	<div
		class={`h-full text-center transition-all duration-200 ease-in-out ${progressColor}`}
		style={`width: ${progress}%;`}
	/>
	{progress}%
</div>
