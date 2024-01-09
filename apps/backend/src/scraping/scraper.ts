import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DB_IDS, eventTable, automaticLocationTable, type backendIdValues } from 'db-schema';
import {
	type EventEntity,
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
		private imageUploader: ImageUploader,
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
						this.scrapingBackendLocations[currentAutomaticLocation.backendId].getData(),
					);
				}
				return arrayPromises;
			},
			[] as Promise<ScrapingResult>[],
		);

		return Promise.allSettled(scrapingResultPromises);
	}

	private gatherResults(scrapingResults: PromiseSettledResult<ScrapingResult>[]) {
		const scrapingFailures = [] as unknown[];
		const scrapingSuccess = [] as EventEntity[];
		const imagesUrlsCollector = new Set<string>(); // Original url images from the scraped websites
		const failedScrapingBackendLocationsIds = new Set<FailedScrapingLocations>();

		for (const scrapingResult of scrapingResults) {
			if (scrapingResult.status === 'fulfilled') {
				scrapingSuccess.push(...scrapingResult.value.eventEntities);
				scrapingResult.value.imageUrlsCollector.forEach((urlCollector) =>
					imagesUrlsCollector.add(urlCollector),
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
		scrapingSuccess: EventEntity[],
		s3UrlsCollector: Map<string, string>,
		failedScrapingBackendLocationsIds: Set<FailedScrapingLocations>,
	) {
		const insertedEvents = await this.db
			.insert(eventTable)
			.values(
				scrapingSuccess.map((event) => ({
					id: sql`default`,
					title: event.title,
					eventUrl: event.source,
					description: event.description,
					date: event.date.toJSDate(),
					time: event.time?.toISOTime(),
					eventTypeId: DB_IDS.eventType.teatro,
					locationId: DB_IDS.location[event.backendId],
					imageUrl: s3UrlsCollector.get(event.imageUrl || ''),
				})),
			)
			.onConflictDoUpdate({
				target: [
					eventTable.title,
					eventTable.date,
					eventTable.time,
					eventTable.locationId,
					eventTable.eventTypeId,
				],
				set: {
					eventUrl: sql.raw(`EXCLUDED.${eventTable.eventUrl.name}`),
					description: sql.raw(`EXCLUDED.${eventTable.description.name}`),
					imageUrl: sql.raw(`EXCLUDED.${eventTable.imageUrl.name}`),
				},
			})
			.returning({ id: eventTable.id });

		const insertedEventsIds = insertedEvents.map((insertedEvent) => insertedEvent.id);
		const failedScrapingBackendLocationsIdsArray = Array.from(
			failedScrapingBackendLocationsIds,
			(value) => DB_IDS.location[value],
		);

		// 1) Remove the events that were not inserted
		// 2) Do not remove those events that their scraping location failed
		await this.db
			.delete(eventTable)
			.where(
				and(
					notInArray(eventTable.id, insertedEventsIds.length ? insertedEventsIds : [-1]),
					notInArray(
						eventTable.locationId,
						failedScrapingBackendLocationsIdsArray.length
							? failedScrapingBackendLocationsIdsArray
							: [-1],
					),
				),
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
			const urls = await this.db.selectDistinct({ imageUrl: eventTable.imageUrl }).from(eventTable);
			await this.imageUploader.cleanUnusedImagesFromExistingUrls(urls);
		} catch (error) {
			logger.error({ error: String(error) }, 'Error cleaning unused images');
		}

		const dbUpdateResult = await Promise.allSettled([
			this.updateDb(scrapingSuccess, s3UrlsCollector, failedScrapingBackendLocationsIds),
		]);

		if (scrapingFailures.length) {
			logger.error({ errors: scrapingFailures.join(', ') }, 'Scraping errors');
		}

		if (dbUpdateResult[0].status === 'rejected') {
			logger.error({ error: dbUpdateResult[0].reason }, 'DB updates error');
		}

		logger.info('Done updating theater data!!!!');
	}
}
