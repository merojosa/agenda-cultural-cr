import { SvelteKitSite, type StackContext } from 'sst/constructs';

export function WebStack({ app }: StackContext) {
	app.stack(function site({ stack }) {
		const site = new SvelteKitSite(stack, 'site', { path: 'apps/web' });
		stack.addOutputs({
			url: site.url,
		});
	});
}
