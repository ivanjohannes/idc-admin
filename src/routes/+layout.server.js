import { action } from '$lib/server/idc';

export async function load({ fetch }) {
	const result = await action(
		{
			tasks_definitions: {
				get_namespace_settings: {
					function: 'ws_prep_namespace',
					params: {
						namespace: 'admin_dashboard'
					}
				},
				get_ws_auth_token: {
					function: 'util_jwt',
					params: {
						payload: {
							namespace: 'admin_dashboard'
						}
					}
				}
			}
		},
		fetch
	);

	if (!result?.action_metrics?.is_success) {
		throw new Error('Failed to generate websocket connection');
	}

	const ws_namespace_settings = {
		url: result.tasks_results?.get_namespace_settings.url,
		client_id: result.tasks_results?.get_namespace_settings.client_id,
		auth_token: result.tasks_results?.get_ws_auth_token.token
	}

	return { ws_namespace_settings };
}
