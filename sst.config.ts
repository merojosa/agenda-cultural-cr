import type { SSTConfig } from 'sst';
import { AccrStack } from './stacks/accr-stack';

export default {
	config() {
		return {
			name: 'agenda-cultural-cr',
			region: 'us-east-1',
		};
	},
	stacks(app) {
		app.stack(AccrStack, { stackName: `${app.stage}-accr-stack` });
	},
} satisfies SSTConfig;
