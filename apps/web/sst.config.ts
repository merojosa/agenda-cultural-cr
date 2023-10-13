import type { SSTConfig } from 'sst';
import { SvelteKitSite } from 'sst/constructs';

export default {
	config() {
		return {
			name: 'web',
			region: 'us-east-1',
		};
	},
	stacks(app) {
		app.stack(function web({ stack }) {
			const site = new SvelteKitSite(stack, 'web');
			stack.addOutputs({
				url: site.url,
			});
		});
	},
} satisfies SSTConfig;
