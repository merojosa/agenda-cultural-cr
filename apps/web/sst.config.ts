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
		app.stack(function site({ stack }) {
			const site = new SvelteKitSite(stack, 'site');
			stack.addOutputs({
				url: site.url,
			});
		});
	},
} satisfies SSTConfig;
