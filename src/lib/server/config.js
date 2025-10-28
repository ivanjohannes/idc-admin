import { env as privateEnv } from '$env/dynamic/private';

export default {
	idc: {
		url: privateEnv.IDC_API_URL,
		api_key: privateEnv.IDC_API_KEY
	}
};
