import { action } from '$lib/server/idc';
import { fail } from '@sveltejs/kit';

export async function load({ fetch, params }) {
	const result = await action(
		{
			tasks_definitions: {
				task: {
					function: 'mongodb_aggregation',
					params: {
						collection_name: 'environments',
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
				}
			}
		},
		fetch
	);

	if (!result?.action_metrics?.is_success) {
		throw new Error('Failed to fetch environment');
	}

	const environment = result.tasks_results?.task?.data[0] || null;

	return { environment };
}

export const actions = {
	update: async (event) => {
		const formData = await event.request.formData();

		let name = formData.get('name');
		let idc_core_url = formData.get('idc_core_url');

		const values = {
			name,
			idc_core_url
		};

		if (!name || typeof name !== 'string') {
			return fail(400, { values, error_message: 'Name is required' });
		}

		if (!idc_core_url || typeof idc_core_url !== 'string') {
			return fail(400, { values, error_message: 'IDC Core URL is required' });
		}

		// trim, lowercase, no whitespace
		values.idc_core_url = idc_core_url.trim().toLowerCase().replace(/\s+/g, '');

		const result = await action(
			{
				tasks_definitions: {
					update_environment: {
						function: 'mongodb_update_doc',
						if_error_message: 'Failed to update environment',
						params: {
							idc_id: event.params.idc_id,
							update: {
								$set: {
									'settings.name': values.name,
									'settings.idc_core_url': values.idc_core_url
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
