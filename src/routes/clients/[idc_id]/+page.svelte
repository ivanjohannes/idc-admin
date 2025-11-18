<script>
	import { browser } from '$app/environment';
	import { getContext } from 'svelte';

	let { data, form } = $props();

	let client = $state(data?.client);

	let api_key = $state('');

	const socket = getContext('socket')();

	if (browser) {
		const token = data.ws_page_settings.auth_token;

		socket.emit('join_rooms', { token });

		socket.on('client_update', (payload) => {
			client.settings = payload.document.settings;
		});
	}
</script>

<form action="?/update" method="POST">
	<div class="space-y-2 space-x-2 p-4">
		<div class="">
			<label for="name">Client Name</label> <br />
			<input
				type="text"
				name="name"
				placeholder="Client Name"
				value={form?.values?.name ?? client?.settings?.name}
			/>
		</div>
		<div class="">
			<label for="client_id">Client ID</label> <br />
			<input
				type="text"
				name="client_id"
				placeholder="Client ID"
				value={form?.values?.client_id ?? client?.settings?.client_id}
			/>
		</div>
		<div class="">
			<label for="environment_idc_id">Environment</label> <br />
			<select name="environment_idc_id" id="environment_idc_id">
				{#await data.environments}
					<option>Loading environments...</option>
				{:then environments}
					{#each environments as environment (environment.idc_id)}
						<option
							value={environment.idc_id}
							selected={form?.values?.environment_idc_id === environment.idc_id ||
								(!form?.values?.environment_idc_id &&
									client?.settings?.environment_idc_id === environment.idc_id)}
						>
							{environment.name}
						</option>
					{/each}
				{:catch error}
					<option>Error loading environments</option>
				{/await}
			</select>
		</div>
		<div class="">
			<label for="api_key">API Key</label> <br />
			<input type="text" name="api_key" placeholder="API Key" bind:value={api_key} />
			<button
				class="rounded border border-amber-600 bg-amber-600 p-2 text-white"
				type="button"
				onclick={() => (api_key = crypto.randomUUID())}
			>
				Generate New Key
			</button>
			{#if api_key}
				<p class="text-green-600">
					The key will not be saved until you update the client. Please copy before saving.
				</p>
			{/if}
		</div>
		<button type="submit" class="rounded border border-amber-600 bg-amber-600 p-2 text-white">
			Update Client
		</button>
		{#if form?.error_message}
			<div class="text-red-600">{form.error_message}</div>
		{/if}
	</div>
</form>
