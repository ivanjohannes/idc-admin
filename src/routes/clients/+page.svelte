<script>
	import { browser } from '$app/environment';
	import { getContext } from 'svelte';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let clients = $state(data?.clients || []);

	const socket = getContext('socket')();

	if (browser) {
		const token = data.websocket_connection_info.token;

		socket.emit('join_rooms', { token });

		socket.on('new_client', (payload) => {
			console.log('New client received via websocket:', payload);
			clients.unshift(payload.document);
		});
	}
</script>

<form action="?/create" method="POST" use:enhance>
	<div class="space-y-2 space-x-2 p-4">
		<div class="">
			<label for="name">Client Name</label> <br />
			<input type="text" name="name" placeholder="Client Name" value={form?.values?.name} />
		</div>
		<button type="submit" class="rounded border border-amber-600 bg-amber-600 p-2 text-white">
			Create Client
		</button>
		{#if form?.error_message}
			<div class="text-red-600">{form.error_message}</div>
		{/if}
	</div>
</form>

<div class="space-y-2 p-4">
	{#each clients as client (client.idc_id)}
		<div class="client-card rounded border border-slate-200 p-2">
			<a href="/clients/{client.idc_id}">
				<p>Client Name: {client.settings?.name}</p>
				<p>Updated At: {new Date(client.updatedAt).toLocaleString()}</p>
				<p>Created At: {new Date(client.createdAt).toLocaleString()}</p>
			</a>
		</div>
	{/each}
</div>
