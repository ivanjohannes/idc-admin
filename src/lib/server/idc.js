import config from './config';

console.log(config)

/**
 * @description Sends an action definition to the IDC API.
 * @param {*} action_definition
 * @param {*} fetch
 */
export async function action(action_definition, fetch) {
	const response = await fetch(config.idc.url + '/action', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${config.idc.api_key}`
		},
		body: JSON.stringify({ action_definition })
	});
	return await response.json();
}

/**
 * @description Sends task wrapped in an action definition to the IDC API.
 * @param {*} task_definition
 * @param {*} fetch
 */
export async function task(task_definition, fetch) {
	const response = await fetch(config.idc.url + '/task', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${config.idc.api_key}`
		},
		body: JSON.stringify({ task_definition })
	});

	return await response.json();
}
