import type { SSTConfig } from 'sst';
import { WebStack } from './stacks/web';
import { BackendStack } from './stacks/backend';

export default {
	config() {
		return {
			name: 'agenda-cultural-cr',
			region: 'us-east-1',
		};
	},
	stacks(app) {
		app.stack(WebStack, { stackName: `${app.stage}-accr-web` });
		app.stack(BackendStack, { stackName: `${app.stage}-accr-backend` });
	},
} satisfies SSTConfig;
