import { Ccecr } from '#scraping/locations/ccecr';
import { Espressivo } from '#scraping/locations/espressivo';
import { TeatroElTriciclo } from '#scraping/locations/teatro-el-triciclo';
import { TeatroNacional } from '#scraping/locations/teatro-nacional';
import type { ScrapingBackendLocations } from '#scraping/scraping-types';
import { TheaterUpdater } from '#scraping/theater-updater';
import { ImageUploader } from '#services/image-uploader';
import { backendIdValues } from 'db-schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

function initDbClient() {
	if (!process.env.DATABASE_URL) {
		throw new Error('No DATABASE_URL');
	}

	const client = postgres(process.env.DATABASE_URL);
	const db = drizzle(client);

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

const theaterUpdater = new TheaterUpdater(db, scrapingLocationsMethods, imageUploader);

export const updateTheaterDataLambda = () => {
	return theaterUpdater.update();
};
