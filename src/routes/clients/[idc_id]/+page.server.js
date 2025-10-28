import { action, task } from '$lib/server/idc';
import { fail } from '@sveltejs/kit';

export async function load({ fetch, params }) {
	const result = await task(
		{
			function: 'aggregation',
			params: {
				collection_name: 'clients',
				pipeline: [
					{
						$match: {
							idc_id: params.idc_id
						}
					},
					{
						$project: {
							_id: 0,
							idc_id: 1,
							settings: 1,
							createdAt: 1,
							updatedAt: 1
						}
					}
				]
			}
		},
		fetch
	);

	if (!result?.action_metrics?.is_success) {
		throw new Error('Failed to fetch client');
	}

	const client = result.tasks_results?.task?.data[0] || null;

	async function loadEnvironments() {
		const result = await task(
			{
				function: 'aggregation',
				params: {
					collection_name: 'environments',
					pipeline: [
						{
							$project: {
								_id: 0,
								idc_id: 1,
								name: '$settings.name'
							}
						}
					]
				}
			},
			fetch
		);

		if (!result?.action_metrics?.is_success) {
			throw new Error('Failed to fetch environments');
		}

		const environments = result.tasks_results?.task?.data || [];

		return environments;
	}

	return { client, environments: loadEnvironments() };
}

export const actions = {
	update: async (event) => {
		const formData = await event.request.formData();

		let name = formData.get('name');
		let client_id = formData.get('client_id');
		let environment_idc_id = formData.get('environment_idc_id');
		let api_key = formData.get('api_key');

		const values = {
			name,
			client_id,
			environment_idc_id
		};

		if (!name || typeof name !== 'string') {
			return fail(400, { values, error_message: 'Name is required' });
		}

		if (!client_id || typeof client_id !== 'string') {
			return fail(400, { values, error_message: 'Client ID is required' });
		}

		if (!environment_idc_id || typeof environment_idc_id !== 'string') {
			return fail(400, { values, error_message: 'Environment is required' });
		}

		// trim, lowercase, no whitespace
		values.client_id = client_id.trim().toLowerCase().replace(/\s+/g, '');

		const result = await action(
			{
				tasks_definitions: {
					duplicate_client_id_lookup: {
						function: 'aggregation',
						if_error_message: 'Failed to validate client ID',
						params: {
							collection_name: 'clients',
							pipeline: [
								{
									$match: {
										'settings.client_id': values.client_id,
										idc_id: { $ne: event.params.idc_id }
									}
								},
								{
									$limit: 1
								}
							]
						}
					},
					duplicate_error: {
						function: 'error',
						conditions: [
							{
								expression: '[[jsonata]]$count(tasks_results.duplicate_client_id_lookup.data) > 0'
							}
						],
						if_error_message: 'Client ID already in use'
					},
					update_client: {
						function: 'update_document',
						if_error_message: 'Failed to update client',
						params: {
							idc_id: event.params.idc_id,
							update: [
								{
									$set: {
										'settings.name': values.name,
										'settings.client_id': values.client_id,
										'settings.environment_idc_id': values.environment_idc_id
									}
								}
							]
						}
					},
					generate_api_key_hash: {
						function: 'string_to_hash',
						params: {
							unhashed_string: api_key
						},
						conditions: [
							{
								expression: api_key
							}
						],
						is_secret_task_definition: true,
						is_secret_task_results: true
					},
					update_api_key: {
						function: 'update_document',
						if_error_message: 'Failed to update API key',
						params: {
							idc_id: event.params.idc_id,
							update: [
								{
									$set: {
										api_key_hash: '[[jsonata]]tasks_results.generate_api_key_hash.hashed_string'
									}
								}
							]
						},
						conditions: [
							{
								expression: api_key
							}
						],
						is_secret_task_definition: true,
						is_secret_task_results: true
					}
				}
			},
			event.fetch
		);

		if (!result?.action_metrics?.is_success) {
			return fail(500, {
				values,
				error_message: result.action_metrics.error_message || 'Something went wrong'
			});
		}

		return {
			result
		};
	}
};
