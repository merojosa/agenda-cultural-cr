import type { APIGatewayEvent, Callback, Context } from 'aws-lambda';
import satori from 'satori';
import { html } from 'satori-html';

export const generateOG = async (event: APIGatewayEvent, _: Context, callback: Callback) => {
	if (event.queryStringParameters && event.queryStringParameters['title']) {
		const title = event.queryStringParameters['title'];
		console.log('BREAKPOINT title', title);
	}

	const markup = html`<div style="color: black;">hello, world</div>`;

	const fontFile = await fetch('https://og-playground.vercel.app/inter-latin-ext-700-normal.woff');
	const fontData = await fontFile.arrayBuffer();
	const svg = await satori(markup, {
		width: 600,
		height: 400,
		fonts: [
			{
				name: 'Noto Sans',
				data: fontData,
				style: 'normal',
			},
		],
	});

	console.log('BREAKPOINT svg', svg);

	const response = {
		statusCode: 200,
		body: JSON.stringify({ message: 'Hello World!' }),
	};

	callback(null, response);
};
