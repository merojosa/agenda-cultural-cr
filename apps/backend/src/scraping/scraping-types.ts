import { backendIdValues } from 'db-schema';
import { DateTime } from 'luxon';

export type ActivityEntity = {
	title: string;
	description: string;
	datetime: DateTime;
	source: string;
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
