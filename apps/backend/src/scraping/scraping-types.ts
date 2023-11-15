import type { backendIdValues } from 'db-schema';
import type { DateTime } from 'luxon';

export type ScrapingResult = {
	eventEntities: EventEntity[];
	imageUrlsCollector: Set<string>;
};

export interface BackendLocation {
	getData(): Promise<ScrapingResult>;
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
