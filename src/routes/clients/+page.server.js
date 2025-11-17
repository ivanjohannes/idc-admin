import { action, task } from '$lib/server/idc';
import { fail } from '@sveltejs/kit';

export async function load({ fetch }) {
	const result = await task(
		{
			function: 'mongodb_aggregation',
			params: {
				collection_name: 'clients',
				pipeline: [
					{
						$project: {
							_id: 0,
							idc_id: 1,
							settings: 1,
							createdAt: 1,
							updatedAt: 1
						}
					},
					{
						$sort: {
							updatedAt: -1
						}
					}
				]
			}
		},
		fetch
	);

	if (!result?.action_metrics?.is_success) {
		throw new Error('Failed to fetch clients');
	}

	const clients = result.tasks_results?.task?.data || [];

	return { clients };
}

export const actions = {
	create: async (event) => {
		const formData = await event.request.formData();

		let name = formData.get('name');

		const values = {
			name
		};

		if (!name || typeof name !== 'string') {
			return fail(400, { values, error_message: 'Name is required' });
		}

		const result = await action(
			{
				tasks_definitions: {
					create_api_key_hash: {
						function: 'util_string_to_hash',
						params: {
							unhashed_string: values.name + '-' + Date.now().toString()
						},
						if_error_message: 'Failed to generate API key hash',
						is_secret_task_definition: true
					},
					create_client: {
						function: 'mongodb_create_doc',
						if_error_message: 'Failed to create new client',
						params: {
							collection_name: 'clients',
							payload: {
								settings: {
									name: values.name
								},
								api_key_hash: '{{tasks_results.create_api_key_hash.hashed_string}}'
							}
						}
					},
					emit_client_event: {
						function: 'ws_emit_event',
						params: {
							namespace: 'admin_dashboard',
							room: 'clients',
							event: 'new_client',
							payload: {
								document: '[[jsonata]]tasks_results.create_client.document'
							}
						}
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
