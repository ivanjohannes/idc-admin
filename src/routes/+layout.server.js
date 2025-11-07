import { task } from '$lib/server/idc';

export async function load({ fetch }) {
	const result = await task(
		{
			function: 'ws_approve_connection',
			params: {
				namespace: "testing"
			}
		},
		fetch
	);

	if (!result?.action_metrics?.is_success) {
		throw new Error('Failed to generate websocket connection');
	}

	
	const websocket_connection_info = result.tasks_results?.task;

	return { websocket_connection_info };
}
