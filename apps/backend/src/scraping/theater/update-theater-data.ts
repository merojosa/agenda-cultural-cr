import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { automaticLocationTable } from 'db-schema';
import { scrapingLocationsMethods } from './locations';
import { ActivityEntity } from '#scraping/scraping-types';

async function initBrowser() {
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

	return { browser, page } as const;
}

function initDbClient() {
	if (!process.env.DATABASE_URL) {
		throw new Error('No DATABASE_URL');
	}

	const client = postgres(process.env.DATABASE_URL);
	const db = drizzle(client);

	return db;
}

export async function updateTheaterData() {
	const { browser, page } = await initBrowser();
	const db = initDbClient();

	const automaticLocations = await db
		.select({ backendId: automaticLocationTable.backendId })
		.from(automaticLocationTable);
	const scrapingResultPromises = automaticLocations.reduce(
		(arrayPromises, currentAutomaticLocation) => {
			if (currentAutomaticLocation.backendId !== null) {
				arrayPromises.push(scrapingLocationsMethods[currentAutomaticLocation.backendId](page));
			}
			return arrayPromises;
		},
		[] as Promise<ActivityEntity[]>[]
	);
	const scrapingResults = await Promise.allSettled(scrapingResultPromises);
	await browser.close();

	const scrapingFailures = [] as unknown[];
	const scrapingSuccess = [] as ActivityEntity[];
	scrapingResults.forEach((scrapingResult) => {
		if (scrapingResult.status === 'fulfilled') {
			scrapingSuccess.push(...scrapingResult.value);
		} else {
			scrapingFailures.push(scrapingResult.reason);
		}
	});
}
