import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DB_IDS, activityTable, automaticLocationTable, type backendIdValues } from 'db-schema';
import {
	type ActivityEntity,
	type ScrapingBackendLocations,
	ScrapingError,
	type ScrapingResult,
} from './scraping-types';
import { eq, notInArray, sql } from 'drizzle-orm';
import type * as schema from 'db-schema';
import { and } from 'drizzle-orm';
import type { ImageUploader } from '#scraping/services/image-uploader';
import { logger } from '#scraping/services/logger';

type FailedScrapingLocations = (typeof backendIdValues)[keyof typeof backendIdValues];

export class Scraper {
	constructor(
		private db: PostgresJsDatabase<typeof schema>,
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
			.from(automaticLocationTable)
			.where(eq(automaticLocationTable.enable, true));

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

		return Promise.allSettled(scrapingResultPromises);
	}

	private gatherResults(scrapingResults: PromiseSettledResult<ScrapingResult>[]) {
		const scrapingFailures = [] as unknown[];
		const scrapingSuccess = [] as ActivityEntity[];
		const imagesUrlsCollector = new Set<string>(); // Original url images from the scraped websites
		const failedScrapingBackendLocationsIds = new Set<FailedScrapingLocations>();

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

	private async updateDb(
		scrapingSuccess: ActivityEntity[],
		s3UrlsCollector: Map<string, string>,
		failedScrapingBackendLocationsIds: Set<FailedScrapingLocations>
	) {
		const insertedActivities = await this.db
			.insert(activityTable)
			.values(
				scrapingSuccess.map((activity) => ({
					id: sql`default`,
					title: activity.title,
					activityUrl: activity.source,
					description: activity.description,
					date: activity.date.toJSDate(),
					time: activity.time?.toISOTime(),
					activityTypeId: DB_IDS.activityType.teatro,
					locationId: DB_IDS.location[activity.backendId],
					imageUrl: s3UrlsCollector.get(activity.imageUrl || ''),
				}))
			)
			.onConflictDoUpdate({
				target: [
					activityTable.title,
					activityTable.date,
					activityTable.time,
					activityTable.locationId,
					activityTable.activityTypeId,
				],
				set: {
					activityUrl: sql.raw(`EXCLUDED.${activityTable.activityUrl.name}`),
					description: sql.raw(`EXCLUDED.${activityTable.description.name}`),
					imageUrl: sql.raw(`EXCLUDED.${activityTable.imageUrl.name}`),
				},
			})
			.returning({ id: activityTable.id });

		const insertedActivitiesIds = insertedActivities.map((insertedActivity) => insertedActivity.id);
		const failedScrapingBackendLocationsIdsArray = Array.from(
			failedScrapingBackendLocationsIds,
			(value) => DB_IDS.location[value]
		);

		// 1) Remove the activities that were not inserted
		// 2) Do not remove those activities that their scraping location failed
		await this.db
			.delete(activityTable)
			.where(
				and(
					notInArray(activityTable.id, insertedActivitiesIds.length ? insertedActivitiesIds : [-1]),
					notInArray(
						activityTable.locationId,
						failedScrapingBackendLocationsIdsArray.length
							? failedScrapingBackendLocationsIdsArray
							: [-1]
					)
				)
			);
	}

	public async execute() {
		const scrapingResults = await this.scrapData();
		const {
			scrapingSuccess,
			scrapingFailures,
			failedScrapingBackendLocationsIds,
			imagesUrlsCollector,
		} = this.gatherResults(scrapingResults);

		let s3UrlsCollector = new Map<string, string>();
		try {
			// Upload to S3
			s3UrlsCollector = await this.imageUploader.uploadImages(imagesUrlsCollector);
		} catch (error) {
			logger.error({ error: String(error) }, 'Upload images error');
		}

		try {
			const urls = await this.db
				.selectDistinct({ imageUrl: activityTable.imageUrl })
				.from(activityTable);
			await this.imageUploader.cleanUnusedImagesFromExistingUrls(urls);
		} catch (error) {
			logger.error({ error: String(error) }, 'Error cleaning unused images');
		}

		const dbUpdateResult = await Promise.allSettled([
			this.updateDb(scrapingSuccess, s3UrlsCollector, failedScrapingBackendLocationsIds),
		]);

		if (scrapingFailures.length) {
			logger.error({ errors: scrapingFailures.join(',') }, 'Scraping errors');
		}

		if (dbUpdateResult[0].status === 'rejected') {
			logger.error({ error: dbUpdateResult[0].reason }, 'DB updates error');
		}

		logger.info('Done updating theater data!!!!');
	}
}
