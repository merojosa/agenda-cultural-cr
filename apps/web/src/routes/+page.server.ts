import { activityTable } from 'db-schema';
import { db } from '$lib/server/db';
import { between } from 'drizzle-orm';
import { DateTime } from 'luxon';

export async function load() {
	const today = DateTime.local().startOf('day');
	const activities = await db
		.select({
			title: activityTable.title,
			description: activityTable.description,
			datetime: activityTable.datetime,
			imageUrl: activityTable.imageUrl,
			activityUrl: activityTable.activityUrl,
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
}
