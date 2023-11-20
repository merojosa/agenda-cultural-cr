import { Function, type StackContext } from 'sst/constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export function BackendStack({ stack }: StackContext) {
	const generateOgFunction = new Function(stack, 'generate-og', {
		handler: 'apps/backend/src/og/index.generateOG',
		runtime: 'nodejs18.x',
		copyFiles: [{ from: 'apps/backend/templates/basic.html', to: 'templates/basic.html' }],
		url: true,
		layers: [
			lambda.LayerVersion.fromLayerVersionArn(
				stack,
				'sharp-layer',
				process.env.SHARP_LAYER_ARN ?? ''
			),
		],
	});

	stack.addOutputs({ generateOG: generateOgFunction.url });
}
