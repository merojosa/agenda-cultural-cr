import { DateTime } from 'luxon';

export type ActivityEntity = {
	title: string;
	description: string;
	datetime: DateTime;
	source: string;
};
