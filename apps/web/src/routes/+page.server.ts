import { eventTable } from 'db-schema';
import { db } from '$lib/server/db';
import { between } from 'drizzle-orm';
import { DateTime } from 'luxon';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({
		'cache-control': 'max-age=3600',
	});

	const today = DateTime.local().startOf('day');
	const events = await db
		.select({
			id: eventTable.id,
			title: eventTable.title,
			description: eventTable.description,
			date: eventTable.date,
			time: eventTable.time,
			imageUrl: eventTable.imageUrl,
		})
		.from(eventTable)
		.where(
			between(eventTable.date, today.toJSDate(), today.plus({ weeks: 2 }).endOf('day').toJSDate())
		)
		.orderBy(eventTable.date, eventTable.time);

	return { events };
};
