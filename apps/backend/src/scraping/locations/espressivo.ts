import { ScrapingError, type BackendLocation, type ScrapingResult } from '#scraping/scraping-types';
import { logger } from '#scraping/services/logger';
import { backendIdValues } from 'db-schema';
import type { Logger } from 'pino';
import { z } from 'zod';

const eventsListSchema = z.object({
	swEvent: z.array(
		z.object({
			['ID']: z
				.string()
				.transform((id) => `https://boleteria.espressivo.cr/eventperformances.asp?evt=${id}`),
			['Description']: z.string(),
			['Img_1']: z.string().transform((img) => `https://boleteria.espressivo.cr/uplimage/${img}`),
			['Event']: z.string(),
		}),
	),
});

export class Espressivo implements BackendLocation {
	private logger: Logger;

	constructor() {
		this.logger = logger.child({ id: Espressivo.name });
	}

	private async getCurrentEvents() {
		const eventsFetch = await fetch(
			'https://boleteria.espressivo.cr/include/widgets/events/EventList.asp?category=&page=1',
		);
		const events = await eventsFetch.json();

		return eventsListSchema.parseAsync(events);
	}

	private scrapEspressivoEvent(url: string) {
		console.log('BREAKPOINT', url);
	}

	public async getData(): Promise<ScrapingResult> {
		try {
			var eventsList = await this.getCurrentEvents();
		} catch (error) {
			throw new ScrapingError(backendIdValues.espressivo, String(error));
		}

		eventsList.swEvent.map((event) => this.scrapEspressivoEvent(event.ID));

		return { eventEntities: [], imageUrlsCollector: new Set() };
	}
}
