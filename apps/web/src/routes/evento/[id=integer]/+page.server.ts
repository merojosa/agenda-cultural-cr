import { eventTable, locationTable } from 'db-schema';
import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	setHeaders({
		'cache-control': 'max-age=3600',
	});

	try {
		var eventQuery = await db
			.select({
				id: eventTable.id,
				title: eventTable.title,
				description: eventTable.description,
				date: eventTable.date,
				time: eventTable.time,
				imageUrl: eventTable.imageUrl,
				eventUrl: eventTable.eventUrl,
				locationName: locationTable.name,
				gpsLocationUrl: locationTable.gpsLocationUrl,
			})
			.from(eventTable)
			.innerJoin(locationTable, eq(eventTable.locationId, locationTable.id))
			.where(eq(eventTable.id, Number(params.id)));
	} catch (err) {
		console.error(err);
		throw error(404, {
			message: 'Event not found',
		});
	}

	if (!eventQuery.length) {
		throw error(404, {
			message: 'Event not found',
		});
	}

	return {
		event: eventQuery[0],
	};
};
