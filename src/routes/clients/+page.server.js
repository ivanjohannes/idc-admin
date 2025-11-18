import { action } from '$lib/server/idc';
import { fail } from '@sveltejs/kit';

export async function load({ fetch }) {
	const result = await action(
		{
			tasks_definitions: {
				get_clients: {
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
				get_ws_auth_token: {
					function: 'util_jwt',
					params: {
						payload: {
							namespace: 'admin_dashboard',
							rooms: ['clients']
						}
					}
				}
			}
		},
		fetch
	);

	const _result = {};

	if (result?.action_metrics?.is_success) {
		_result.clients = result.tasks_results?.get_clients?.data || [];

		_result.ws_page_settings = {
			auth_token: result.tasks_results?.get_ws_auth_token.token
		};
	}

	return _result;
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
						if_error_message: 'Failed to generate API key hash'
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
