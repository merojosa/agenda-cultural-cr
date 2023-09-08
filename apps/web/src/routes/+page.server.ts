import { activityTable } from 'db-schema';
import { db } from '$lib/server/db';

export async function load() {
	const activities = await db
		.select({
			title: activityTable.title,
			description: activityTable.description,
			datetime: activityTable.datetime,
			imageUrl: activityTable.imageUrl,
			activityUrl: activityTable.activityUrl,
		})
		.from(activityTable);
	return { activities };
}
