<script>
	let { data, form } = $props();

	const environments = data?.environments || [];

	$inspect(environments)
</script>

<form action="?/create" method="POST">
	<div class="space-x-2 space-y-2 p-4">
		<div class="">
			<label for="name">Environment Name</label> <br />
			<input type="text" name="name" placeholder="Environment Name" value={form?.values?.name} />
		</div>
		<button type="submit" class="rounded border border-amber-600 bg-amber-600 p-2 text-white">
			Create Environment
		</button>
		{#if form?.error_message}
			<div class="text-red-600">{form.error_message}</div>
		{/if}
	</div>
</form>

<div class="space-y-2 p-4">
	{#each environments as environment (environment.idc_id)}
		<div class="environment-card rounded border border-slate-200 p-2">
			<a href="/environments/{environment.idc_id}">
				<p>Name: {environment.settings?.name}</p>
				<p>Clients: {environment.num_clients}</p>
				<p>Updated At: {new Date(environment.updatedAt).toLocaleString()}</p>
			</a>
		</div>
	{/each}
</div>
