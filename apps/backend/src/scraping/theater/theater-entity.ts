import { DateTime } from 'luxon';

export type TheaterEntity = {
	title: string;
	description?: string;
	datetime: DateTime;
	source?: string;
};
