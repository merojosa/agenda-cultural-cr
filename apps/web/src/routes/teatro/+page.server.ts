import { activityTable } from 'db-schema';
import { db } from '$lib/server/db';

export async function load() {
	const activities = await db.select().from(activityTable);
	return { activities };
}
