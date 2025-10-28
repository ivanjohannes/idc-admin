<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex space-x-2 p-4">
	<a href="/environments" class="text-amber-600"> Environments </a>
	<a href="/clients" class="text-amber-600"> Clients </a>
</div>

{@render children?.()}
