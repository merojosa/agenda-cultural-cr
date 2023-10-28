import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import InterSemiBold from '$lib/Inter-SemiBold.ttf';
import type { RequestHandler } from '@sveltejs/kit';
import { html as toReactNode } from 'satori-html';
import Card from '$lib/components/og-card.svelte';

const height = 630;
const width = 1200;

export const GET: RequestHandler = async ({ url }) => {
	const title = url.searchParams.get('title') ?? undefined;

	const result = (
		Card as unknown as Record<
			string,
			(...args: unknown[]) => Record<string, Record<string, unknown>>
		>
	).render({ title });

	const element = toReactNode(`${result.html}<style>${result.css.code}</style>`);

	const svg = await satori(element, {
		fonts: [
			{
				name: 'Inter SemiBold',
				data: Buffer.from(InterSemiBold),
				style: 'normal',
			},
		],
		height,
		width,
	});

	const resvg = new Resvg(svg, {
		fitTo: {
			mode: 'width',
			value: width,
		},
	});

	const image = resvg.render();

	return new Response(image.asPng(), {
		headers: {
			'content-type': 'image/png',
		},
	});
};
