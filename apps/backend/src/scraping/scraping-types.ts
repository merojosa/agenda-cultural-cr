import type { backendIdValues } from 'db-schema';
import type { DateTime } from 'luxon';
import type { Logger } from 'pino';
import { logger } from './services/logger';
import pRetry from 'p-retry';

export type ScrapingResult = {
	eventEntities: EventEntity[];
	imageUrlsCollector: Set<string>;
};

export abstract class BackendLocation {
	protected logger: Logger;

	constructor(id: keyof typeof backendIdValues) {
		this.logger = logger.child({ id });
	}

	protected abstract getData(): Promise<ScrapingResult>;

	public async scrapData() {
		const results = await pRetry(this.getData, { retries: 4 });
		this.logger.info({
			eventEntitiesLength: results.eventEntities.length,
			imageCollectorSize: results.imageUrlsCollector.size,
		});
		return results;
	}
}

export type ScrapingBackendLocations = Record<
	(typeof backendIdValues)[keyof typeof backendIdValues],
	BackendLocation
>;

export type EventEntity = {
	backendId: (typeof backendIdValues)[keyof typeof backendIdValues];
	title: string;
	description: string;
	date: DateTime;
	time: DateTime | null;
	source: string;
	imageUrl?: string;
};

export class ScrapingError extends Error {
	backendId: (typeof backendIdValues)[keyof typeof backendIdValues];

	constructor(backendId: (typeof backendIdValues)[keyof typeof backendIdValues], message: string) {
		super(message);
		this.name = 'ScrapingError'; // Set the error name to your custom error name.
		this.backendId = backendId;
		// Ensure the prototype chain is correctly set for instanceof checks.
		Object.setPrototypeOf(this, ScrapingError.prototype);
	}
}
