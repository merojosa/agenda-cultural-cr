import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { getTeatroNacionalData } from './teatro-nacional';

export async function updateTheaterData() {
	const browser = await puppeteer.launch({
		headless: chromium.headless,
		ignoreHTTPSErrors: true,
		args: [...chromium.args, '--hide-scrollbars', '--disable-web-security', '--use-gl=swiftshader'],
		...(process.env.IS_LOCAL === 'true'
			? { channel: 'chrome' }
			: { executablePath: await chromium.executablePath() }),
	});
	const page = await browser.newPage();
	await page.setViewport({ width: 1920, height: 1080 });

	await getTeatroNacionalData(page);

	await browser.close();
}
