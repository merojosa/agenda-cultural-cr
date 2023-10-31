import type { APIGatewayEvent, Callback, Context } from 'aws-lambda';
import satori from 'satori';
import { html } from 'satori-html';
import sharp from 'sharp';
import fs from 'node:fs/promises';
export const generateOG = async (event: APIGatewayEvent, _: Context, callback: Callback) => {
	if (event.queryStringParameters && event.queryStringParameters['title']) {
		const title = event.queryStringParameters['title'];
		console.log('BREAKPOINT title', title);
	}

	const content = (await fs.readFile('templates/basic.html')).toString('utf-8');

	const markup = html(content);

	const fontFile = await fetch('https://og-playground.vercel.app/inter-latin-ext-700-normal.woff');
	const fontData = await fontFile.arrayBuffer();
	const svgString = await satori(markup, {
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

	const imageBuffer = await sharp(Buffer.from(svgString)).toFormat('png').toBuffer();

	const response = {
		statusCode: 200,
		headers: {
			'Content-Type': 'image/png',
		},
		isBase64Encoded: true,
		body: imageBuffer.toString('base64'),
	};

	callback(null, response);
};
