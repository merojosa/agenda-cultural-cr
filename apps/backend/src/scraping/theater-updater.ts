import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DB_IDS, activityTable, automaticLocationTable, backendIdValues } from 'db-schema';
import {
	type ActivityEntity,
	type ScrapingBackendLocations,
	ScrapingError,
	type ScrapingResult,
} from './scraping-types';
import { eq, notInArray } from 'drizzle-orm';
import { type ImageUploader } from '#services/image-uploader';
import { logger } from '#services/logger';

export class TheaterUpdater {
	constructor(
		private db: PostgresJsDatabase,
		private scrapingBackendLocations: ScrapingBackendLocations,
		private imageUploader: ImageUploader
	) {
		this.db = db;
		this.scrapingBackendLocations = scrapingBackendLocations;
	}

	private async scrapData(): Promise<PromiseSettledResult<ScrapingResult>[]> {
		// Get available automatic locations to scrap from the database
		const automaticLocations = await this.db
			.select({ backendId: automaticLocationTable.backendId })
			.from(automaticLocationTable);

		const scrapingResultPromises = automaticLocations.reduce(
			(arrayPromises, currentAutomaticLocation) => {
				if (currentAutomaticLocation.backendId !== null) {
					arrayPromises.push(
						this.scrapingBackendLocations[currentAutomaticLocation.backendId].getData()
					);
				}
				return arrayPromises;
			},
			[] as Promise<ScrapingResult>[]
		);

		const scrapingResults = await Promise.allSettled(scrapingResultPromises);

		return scrapingResults;
	}

	private gatherResults(scrapingResults: PromiseSettledResult<ScrapingResult>[]) {
		const scrapingFailures = [] as unknown[];
		const scrapingSuccess = [] as ActivityEntity[];
		const imagesUrlsCollector = new Set<string>(); // Original url images from the scraped websites
		const failedScrapingBackendLocationsIds = new Set<
			(typeof backendIdValues)[keyof typeof backendIdValues]
		>();

		for (const scrapingResult of scrapingResults) {
			if (scrapingResult.status === 'fulfilled') {
				scrapingSuccess.push(...scrapingResult.value.activityEntities);
				scrapingResult.value.imageUrlsCollector.forEach((urlCollector) =>
					imagesUrlsCollector.add(urlCollector)
				);
			} else {
				scrapingFailures.push(scrapingResult.reason);
				if (scrapingResult.reason instanceof ScrapingError) {
					failedScrapingBackendLocationsIds.add(scrapingResult.reason.backendId);
				}
			}
		}

		return {
			scrapingFailures,
			scrapingSuccess,
			imagesUrlsCollector,
			failedScrapingBackendLocationsIds,
		} as const;
	}

	private deleteTheaterDataBasedOnFailures(
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

	private updateDb(scrapingSuccess: ActivityEntity[], s3UrlsCollector: Map<string, string>) {
		return scrapingSuccess.map((value) =>
			this.db.insert(activityTable).values({
				title: value.title,
				activityUrl: value.source,
				description: value.description,
				datetime: value.datetime.toJSDate(),
				activityTypeId: DB_IDS.activityType.teatro,
				locationId: DB_IDS.location[value.backendId],
				imageUrl: s3UrlsCollector.get(value.imageUrl || ''),
			})
		);
	}

	public async update() {
		const scrapingResults = await this.scrapData();
		const {
			scrapingSuccess,
			scrapingFailures,
			failedScrapingBackendLocationsIds,
			imagesUrlsCollector,
		} = this.gatherResults(scrapingResults);

		// Remove only the activity rows that succeeded the scraping
		// but if there wasn't any success, don't do anything (I dont want an empty calendar)
		if (scrapingSuccess.length) {
			await this.deleteTheaterDataBasedOnFailures(this.db, failedScrapingBackendLocationsIds);
		}

		// Upload to S3
		const s3UrlsCollector = await this.imageUploader.uploadImages(imagesUrlsCollector);

		const dbUpdateResults = await Promise.allSettled(
			this.updateDb(scrapingSuccess, s3UrlsCollector)
		);
		const dbUpdateResultsFailures = [] as unknown[];
		dbUpdateResults.forEach((value) => {
			if (value.status === 'rejected') {
				dbUpdateResultsFailures.push(value.reason);
			}
		});

		if (scrapingFailures.length) {
			logger.error('Scraping errors', scrapingFailures.join(' | '));
		}

		if (dbUpdateResultsFailures.length) {
			logger.error('DB updates errors', dbUpdateResultsFailures.join(' | '));
		}

		logger.info('Done updating theater data!!!!');
	}
}
