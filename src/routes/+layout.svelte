<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';
	import { io } from 'socket.io-client';

	let { children, data } = $props();

	if (browser) {
		const websocket_connection_info = data.websocket_connection_info;

		console.log(websocket_connection_info)

		if (websocket_connection_info) {
			// Connect to gateway
			const socket = io(websocket_connection_info.url, {
				query: {
					token: websocket_connection_info.token
				}
			});

			// // connect directly to core
			// const socket = io('http://localhost:3001');

			socket.on('connect', () => {
				console.log('Connected to gateway:', socket.id);
				socket.emit('message', 'Hello from the client!');
			});

			socket.on('reply', (msg) => {
				console.log('Received reply:', msg);
			});
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex space-x-2 p-4">
	<a href="/environments" class="text-amber-600"> Environments </a>
	<a href="/clients" class="text-amber-600"> Clients </a>
</div>

{@render children?.()}
