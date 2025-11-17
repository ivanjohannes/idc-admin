import { action, task } from '$lib/server/idc';
import { fail } from '@sveltejs/kit';

export async function load({ fetch }) {
	const result = await task(
		{
			function: 'mongodb_aggregation',
			params: {
				collection_name: 'environments',
				pipeline: [
					{
						$lookup: {
							from: 'clients',
							localField: 'idc_id',
							foreignField: 'settings.environment_idc_id',
							as: 'clients'
						}
					},
					{
						$project: {
							_id: 0,
							idc_id: 1,
							settings: 1,
							createdAt: 1,
							updatedAt: 1,
							num_clients: { $size: '$clients' }
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
		throw new Error('Failed to fetch environments');
	}

	const environments = result.tasks_results?.task?.data || [];

	return { environments };
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
					create_environment: {
						function: 'mongodb_create_doc',
						if_error_message: 'Failed to create new environment',
						params: {
							collection_name: 'environments',
							payload: {
								settings: {
									name: values.name
								}
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
