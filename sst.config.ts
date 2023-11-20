import type { SSTConfig } from 'sst';
import { SvelteKitSite } from 'sst/constructs';

export default {
	config() {
		return {
			name: 'agenda-cultural-cr',
			region: 'us-east-1',
		};
	},
	stacks(app) {
		app.stack(function site({ stack }) {
			const site = new SvelteKitSite(stack, 'site', { path: 'apps/web' });
			stack.addOutputs({
				url: site.url,
			});
		});
	},
} satisfies SSTConfig;
