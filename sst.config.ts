import type { SSTConfig } from 'sst';
import { WebStack } from './stacks/web';

export default {
	config() {
		return {
			name: 'agenda-cultural-cr',
			region: 'us-east-1',
		};
	},
	stacks(app) {
		app.stack(WebStack);
	},
} satisfies SSTConfig;
