import { Ccecr } from '#scraping/locations/ccecr';
import { Espressivo } from '#scraping/locations/espressivo';
import { TeatroElTriciclo } from '#scraping/locations/teatro-el-triciclo';
import { TeatroNacional } from '#scraping/locations/teatro-nacional';
import type { ScrapingBackendLocations } from '#scraping/scraping-types';
import { Scraper } from '#scraping/scraper';
import { ImageUploader } from '#scraping/services/image-uploader';
import { backendIdValues } from 'db-schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from 'db-schema';

function initDbClient() {
	if (!process.env.DATABASE_URL) {
		throw new Error('No DATABASE_URL');
	}

	const client = postgres(process.env.DATABASE_URL);
	const db = drizzle(client, { logger: process.env.IS_LOCAL !== 'true', schema });

	return db;
}

const db = initDbClient();

const scrapingLocationsMethods: ScrapingBackendLocations = {
	[backendIdValues.teatroNacional]: new TeatroNacional(),
	[backendIdValues.teatroElTriciclo]: new TeatroElTriciclo(),
	[backendIdValues.espressivo]: new Espressivo(),
	[backendIdValues.ccecr]: new Ccecr(),
} as const;

const imageUploader = new ImageUploader();

const scraper = new Scraper(db, scrapingLocationsMethods, imageUploader);

export const scrapACCRData = () => {
	return scraper.execute();
};
