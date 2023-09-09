import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { compile } from 'html-to-text';

export const spanishMonths: Record<string, number> = {
	enero: 1,
	febrero: 2,
	marzo: 3,
	abril: 4,
	mayo: 5,
	junio: 6,
	julio: 7,
	agosto: 8,
	septiembre: 9,
	octubre: 10,
	noviembre: 11,
	diciembre: 12,
} as const;

const compiledConvert = compile({ preserveNewlines: true, wordwrap: null });

export function htmlToPlainText(html: string): string {
	return compiledConvert(html);
}

export async function launchNewBrowser() {
	const browser = await puppeteer.launch({
		headless: chromium.headless,
		ignoreHTTPSErrors: true,
		args: [...chromium.args, '--hide-scrollbars', '--disable-web-security', '--use-gl=swiftshader'],
		...(process.env.IS_LOCAL === 'true'
			? { channel: 'chrome' }
			: { executablePath: await chromium.executablePath() }),
	});

	return browser;
}
