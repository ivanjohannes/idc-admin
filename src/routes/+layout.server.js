import { task } from '$lib/server/idc';

export async function load() {
	const result = await task(
		{
			function: 'generate_websocket_connection',
			params: {}
		},
		fetch
	);

	if (!result?.action_metrics?.is_success) {
		throw new Error('Failed to generate websocket connection');
	}

    const websocket_connection_info = result.tasks_results?.task;

	return { websocket_connection_info };
}
