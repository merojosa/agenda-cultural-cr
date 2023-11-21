import { Function, type StackContext } from 'sst/constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export function BackendStack({ stack }: StackContext) {
	const generateOgFunction = new Function(stack, 'generate-og', {
		handler: 'apps/backend/src/og/index.generateOG',
		runtime: 'nodejs18.x',
		copyFiles: [{ from: 'apps/backend/templates/basic.html', to: 'templates/basic.html' }],
		url: true,
		nodejs: {
			install: ['sharp'],
		},
		layers: [
			lambda.LayerVersion.fromLayerVersionArn(
				stack,
				'sharp-layer',
				'arn:aws:lambda:us-east-1:637732166235:layer:sharp-v0_32_5:4'
			),
		],
	});

	stack.addOutputs({ generateOG: generateOgFunction.url });
}
