import puppeteer, { Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import postgres from 'postgres';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, notInArray } from 'drizzle-orm';
import { DB_IDS, activityTable, automaticLocationTable, backendIdValues } from 'db-schema';
import { scrapingLocationsMethods } from './locations';
import { ActivityEntity, ScrapingError, ScrapingResult } from '#scraping/scraping-types';

async function initBrowser() {
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

function initDbClient() {
	if (!process.env.DATABASE_URL) {
		throw new Error('No DATABASE_URL');
	}

	const client = postgres(process.env.DATABASE_URL);
	const db = drizzle(client);

	return db;
}

function deleteTheaterDataBasedOnFailures(
	db: PostgresJsDatabase,
	failedBackendIds: Set<(typeof backendIdValues)[keyof typeof backendIdValues]>
) {
	const backendIdsArray = Array.from(failedBackendIds);
	const dbIdsToExclude = backendIdsArray.map((backendId) => DB_IDS.location[backendId]);

	const where = dbIdsToExclude.length
		? notInArray(activityTable.locationId, dbIdsToExclude)
		: eq(activityTable.activityTypeId, DB_IDS.activityType.teatro);

	return db.delete(activityTable).where(where);
}

function scrapData(
	automaticLocations: {
		backendId: (typeof backendIdValues)[keyof typeof backendIdValues] | null;
	}[],
	browser: Browser
) {
	const scrapingResultPromises = automaticLocations.reduce(
		(arrayPromises, currentAutomaticLocation) => {
			if (currentAutomaticLocation.backendId !== null) {
				arrayPromises.push(scrapingLocationsMethods[currentAutomaticLocation.backendId](browser));
			}
			return arrayPromises;
		},
		[] as Promise<ScrapingResult>[]
	);

	return scrapingResultPromises;
}

function updateDb(db: PostgresJsDatabase, scrapingSuccess: ActivityEntity[]) {
	return scrapingSuccess.map((value) =>
		db.insert(activityTable).values({
			title: value.title,
			activityUrl: value.source,
			description: value.description,
			datetime: value.datetime.toJSDate(),
			activityTypeId: DB_IDS.activityType.teatro,
			locationId: DB_IDS.location[value.backendId],
		})
	);
}

export async function updateTheaterData() {
	const browser = await initBrowser();
	const db = initDbClient();

	const automaticLocations = await db
		.select({ backendId: automaticLocationTable.backendId })
		.from(automaticLocationTable);

	const scrapingResults = await Promise.allSettled(scrapData(automaticLocations, browser));
	await browser.close();

	const scrapingFailures = [] as unknown[];
	const scrapingSuccess = [] as ActivityEntity[];
	const imageUrlCollector = new Set<string>();
	const failedBackendIds = new Set<(typeof backendIdValues)[keyof typeof backendIdValues]>();

	scrapingResults.forEach((scrapingResult) => {
		if (scrapingResult.status === 'fulfilled') {
			scrapingSuccess.push(...scrapingResult.value.activityEntities);
			scrapingResult.value.imageUrlsCollector.forEach((urlCollector) =>
				imageUrlCollector.add(urlCollector)
			);
		} else {
			scrapingFailures.push(scrapingResult.reason);
			if (scrapingResult.reason instanceof ScrapingError) {
				failedBackendIds.add(scrapingResult.reason.backendId);
			}
		}
	});

	console.log('BREAKPOINT', Array.from(imageUrlCollector));

	// Remove only the activity rows that succeeded the scraping
	// but if there wasn't any success, don't do anything (I dont want an empty calendar)
	if (scrapingSuccess.length) {
		await deleteTheaterDataBasedOnFailures(db, failedBackendIds);
	}

	const dbUpdateResults = await Promise.allSettled(updateDb(db, scrapingSuccess));
	const dbUpdateResultsFailures = [] as unknown[];
	dbUpdateResults.forEach((value) => {
		if (value.status === 'rejected') {
			dbUpdateResultsFailures.push(value.reason);
		}
	});

	if (scrapingFailures.length) {
		console.error('Scraping errors', scrapingFailures.join(' | '));
	}

	if (dbUpdateResultsFailures.length) {
		console.error('DB updates errors', dbUpdateResultsFailures.join(' | '));
	}

	console.log('Done updating theater data!!!!');
}
