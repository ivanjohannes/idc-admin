<script>
	import { onMount } from 'svelte';

	let { data, form } = $props();

	const environment = data?.environment || [];

	$inspect(form);
</script>

<form action="?/update" method="POST">
	<div class="space-x-2 space-y-2 p-4">
		<div class="">
			<label for="name">Environment Name</label> <br />
			<input
				type="text"
				name="name"
				placeholder="Environment Name"
				value={form?.values?.name ?? environment?.settings?.name}
			/>
		</div>
		<div class="">
			<label for="idc_core_url">IDC Core URL</label> <br />
			<input
				type="text"
				name="idc_core_url"
				placeholder="IDC Core URL"
				value={form?.values?.idc_core_url ?? environment?.settings?.idc_core_url}
			/>
		</div>
		<button type="submit" class="rounded border border-amber-600 bg-amber-600 p-2 text-white">
			Update Environment
		</button>
		{#if form?.error_message}
			<div class="text-red-600">{form.error_message}</div>
		{/if}
	</div>
</form>
