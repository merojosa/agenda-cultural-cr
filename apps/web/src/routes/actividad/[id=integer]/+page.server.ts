import { activityTable } from 'db-schema';
import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	try {
		var activityQuery = await db
			.select({
				id: activityTable.id,
				title: activityTable.title,
				description: activityTable.description,
				datetime: activityTable.datetime,
				imageUrl: activityTable.imageUrl,
			})
			.from(activityTable)
			.where(eq(activityTable.id, Number(params.id)));
	} catch (err) {
		console.error(err);
		throw error(404, {
			message: 'Activity not found',
		});
	}

	if (!activityQuery.length) {
		throw error(404, {
			message: 'Activity not found',
		});
	}

	return {
		activity: activityQuery[0],
	};
};
