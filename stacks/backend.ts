import { Config, Cron, Function, type StackContext } from 'sst/constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export function BackendStack({ stack }: StackContext) {
	const DATABASE_URL = new Config.Secret(stack, 'DATABASE_URL');
	const ACCR_AWS_REGION = new Config.Secret(stack, 'ACCR_AWS_REGION');
	const ACCR_AWS_ASSETS_BUCKET = new Config.Secret(stack, 'ACCR_AWS_ASSETS_BUCKET');
	const ACCR_AWS_ACCESS_KEY_ID = new Config.Secret(stack, 'ACCR_AWS_ACCESS_KEY_ID');
	const ACCR_AWS_SECRET_ACCESS_KEY = new Config.Secret(stack, 'ACCR_AWS_SECRET_ACCESS_KEY');
	const ACCR_AWS_ASSETS_URL = new Config.Secret(stack, 'ACCR_AWS_ASSETS_URL');

	const sharpLayer = lambda.LayerVersion.fromLayerVersionArn(
		stack,
		'sharp-layer',
		'arn:aws:lambda:us-east-1:637732166235:layer:sharp-v0_32_5:4'
	);

	const generateOgFunction = new Function(stack, 'generate-og', {
		handler: 'apps/backend/src/og/index.generateOG',
		runtime: 'nodejs18.x',
		copyFiles: [{ from: 'apps/backend/templates/basic.html', to: 'templates/basic.html' }],
		url: true,
		nodejs: {
			install: ['sharp'],
		},
		functionName: `${stack.stage}-accr-generate-og`,
		layers: [sharpLayer],
	});

	new Cron(stack, 'scrap-data', {
		job: {
			function: {
				handler: 'apps/backend/src/scraping/index.scrapData',
				runtime: 'nodejs18.x',
				nodejs: {
					install: ['sharp', '@sparticuz/chromium'],
				},
				timeout: '300 seconds',
				functionName: `${stack.stage}-accr-scrap-data`,
				layers: [
					sharpLayer,
					lambda.LayerVersion.fromLayerVersionArn(
						stack,
						'chromium',
						'arn:aws:lambda:us-east-1:637732166235:layer:chromium-v115:2'
					),
				],
				bind: [
					DATABASE_URL,
					ACCR_AWS_REGION,
					ACCR_AWS_ASSETS_BUCKET,
					ACCR_AWS_ACCESS_KEY_ID,
					ACCR_AWS_SECRET_ACCESS_KEY,
					ACCR_AWS_ASSETS_URL,
				],
			},
		},
		schedule: 'cron(0 0 ? * WED *)',
	});

	stack.addOutputs({ generateOG: generateOgFunction.url });
}
