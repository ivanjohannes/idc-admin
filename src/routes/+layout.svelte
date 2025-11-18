<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';
	import { io } from 'socket.io-client';
	import { setContext } from 'svelte';

	let { children, data } = $props();

	let socket = $state();

	setContext('socket', () => socket);

	if (browser) {
		// Connect with connection info
		socket = io(data.ws_namespace_settings.url, {
			query: {
				client_id: data.ws_namespace_settings.client_id
			},
			auth: {
				token: data.ws_namespace_settings.auth_token
			}
		});

		socket.on('connect', () => {
			console.log('Socket connected:', socket.id);
		});

		socket.on('pingpong', (msg) => {
			console.log('Message from server:', msg);
			if (msg === 'ping') {
				socket.emit('pingpong', 'pong');
			}
		});
	}
</script>

<button
	class="fixed top-4 right-4 rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
	onclick={() => {
		socket.emit('pingpong', 'ping');
	}}
>
	ping
</button>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex space-x-2 p-4">
	<a href="/environments" class="text-amber-600"> Environments </a>
	<a href="/clients" class="text-amber-600"> Clients </a>
</div>

{@render children?.()}
