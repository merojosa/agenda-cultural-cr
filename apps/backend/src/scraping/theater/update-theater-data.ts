import puppeteer, { Page } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import postgres from 'postgres';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DB_IDS, activityTable, automaticLocationTable, backendIdValues } from 'db-schema';
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

function scrapData(
	automaticLocations: {
		backendId: (typeof backendIdValues)[keyof typeof backendIdValues] | null;
	}[],
	page: Page
) {
	const scrapingResultPromises = automaticLocations.reduce(
		(arrayPromises, currentAutomaticLocation) => {
			if (currentAutomaticLocation.backendId !== null) {
				arrayPromises.push(scrapingLocationsMethods[currentAutomaticLocation.backendId](page));
			}
			return arrayPromises;
		},
		[] as Promise<ActivityEntity[]>[]
	);

	return scrapingResultPromises;
}

// TODO: Deal with possible conflicts (same data in the scraping and in the db)
function updateDb(db: PostgresJsDatabase, scrapingSuccess: ActivityEntity[]) {
	return scrapingSuccess.map((value) =>
		db.insert(activityTable).values({
			title: value.title,
			activityUrl: value.source,
			description: value.description,
			datetime: value.datetime.toJSDate(),
			activityTypeId: DB_IDS.activityType.teatro,
			locationId: DB_IDS.location.teatroNacional,
		})
	);
}

export async function updateTheaterData() {
	const { browser, page } = await initBrowser();
	const db = initDbClient();

	const automaticLocations = await db
		.select({ backendId: automaticLocationTable.backendId })
		.from(automaticLocationTable);

	const scrapingResults = await Promise.allSettled(scrapData(automaticLocations, page));
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

	const dbUpdateResults = await Promise.allSettled(updateDb(db, scrapingSuccess));
	const dbUpdateResultsFailures = [] as unknown[];
	dbUpdateResults.forEach((value) => {
		if (value.status === 'rejected') {
			dbUpdateResultsFailures.push(value.reason);
		}
	});

	if (scrapingFailures.length) {
		console.error(scrapingFailures.join(' | '));
	}

	if (dbUpdateResultsFailures.length) {
		console.error(dbUpdateResultsFailures.join(' | '));
	}
}
