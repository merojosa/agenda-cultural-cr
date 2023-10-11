import { activityTable } from 'db-schema';
import { db } from '$lib/server/db';
import { between } from 'drizzle-orm';
import { DateTime } from 'luxon';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({
		'cache-control': 'max-age=3600',
	});

	const today = DateTime.local().startOf('day');
	const activities = await db
		.select({
			id: activityTable.id,
			title: activityTable.title,
			description: activityTable.description,
			datetime: activityTable.datetime,
			imageUrl: activityTable.imageUrl,
		})
		.from(activityTable)
		.where(
			between(
				activityTable.datetime,
				today.toJSDate(),
				today.plus({ weeks: 2 }).endOf('day').toJSDate()
			)
		)
		.orderBy(activityTable.datetime);

	return { activities };
};
