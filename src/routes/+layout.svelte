<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';
	import { io } from 'socket.io-client';

	let { children, data } = $props();

	let socket;

	if (browser) {
		const websocket_connection_info = data.websocket_connection_info;

		console.log(websocket_connection_info);

		// Connect with connection info
		socket = io(websocket_connection_info.url, {
			query: {
				token: websocket_connection_info.token
			}
		});

		socket.on('connect', () => {
			console.log('Connected to gateway:', socket.id);
		});

		socket.on('pingpong', (msg) => {
			console.log('Received from server:', msg);
			if (msg === 'ping') {
				socket.emit('pingpong', 'pong');
			}
		});
		socket.emit('pingpong', 'ping');
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
