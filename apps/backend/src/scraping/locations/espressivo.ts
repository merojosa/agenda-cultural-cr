import {
	ScrapingError,
	type BackendLocation,
	type ScrapingResult,
	type ActivityEntity,
} from '#scraping/scraping-types';
import { logger } from '#services/logger';
import { htmlToPlainText, launchNewBrowser, spanishMonths } from '#utils/scraping-utils';
import { backendIdValues } from 'db-schema';
import { DateTime } from 'luxon';
import type { Logger } from 'pino';
import type { Page } from 'puppeteer-core';
import { z } from 'zod';

const PRIVATE_EVENT_MESSAGE = 'Private event';

const espressivoData = z.object({
	title: z.string().transform((anchor) => {
		const titleFromAnchor = htmlToPlainText(anchor);
		const title = titleFromAnchor.split('\n')[0];
		return (title ?? titleFromAnchor).trim();
	}),
	permalink: z.string(),
	imageSrc: z.string(),
	// The private events have an empty excerpt, so with min(1) we make sure that the event is public
	excerpt: z
		.string()
		.min(1, PRIVATE_EVENT_MESSAGE)
		.transform((htmlText) => htmlToPlainText(htmlText).trim()),
	startTime: z.string().transform((espressivoDate) => {
		const [month, ...rest] = espressivoDate.split(' ');

		if (!month || !rest) {
			throw new Error(`Date error: ${espressivoDate}`);
		}

		const restText = rest.join(' ').trim();
		const restLuxon = DateTime.fromFormat(restText, 'd @ h:mm a');

		const luxonDate = restLuxon.set({ month: spanishMonths[month] });

		if (!luxonDate.isValid) {
			throw new Error(`Date error, luxon. Month: ${month}, restText: ${restText}`);
		}

		return luxonDate;
	}),
});

export class Espressivo implements BackendLocation {
	private logger: Logger;

	constructor() {
		this.logger = logger.child({ id: Espressivo.name });
	}

	private async scrapEspressivoData(page: Page): Promise<ScrapingResult> {
		const jsonStringData = await page.evaluate(() =>
			Array.from(
				document.querySelectorAll(
					'table.tribe-events-calendar > tbody > tr > td > div[data-tribejson]'
				),
				(element) => element.getAttribute('data-tribejson')
			)
		);

		const activityEntities = [] as ActivityEntity[];
		const imageUrlsCollector = new Set<string>();

		for (const jsonString of jsonStringData) {
			try {
				if (!jsonString) {
					continue;
				}

				const parsedJsonFromString = JSON.parse(jsonString);
				const parsedEvent = espressivoData.parse(parsedJsonFromString);

				const lowerdCaseTitle = parsedEvent.title.toLowerCase();
				// Remove private activities
				if (
					!lowerdCaseTitle.includes('función privada') &&
					!lowerdCaseTitle.includes('evento privado')
				) {
					activityEntities.push({
						backendId: backendIdValues.espressivo,
						title: parsedEvent.title,
						datetime: parsedEvent.startTime,
						description: parsedEvent.excerpt,
						source: parsedEvent.permalink,
						imageUrl: parsedEvent.imageSrc,
					});
					imageUrlsCollector.add(parsedEvent.imageSrc);
				}
			} catch (err) {
				const error = err as Record<string, unknown>;

				if (Array.isArray(error.issues)) {
					const differentErrorOtherThanPrivateEvent = error.issues.find(
						(issue) => issue.message !== PRIVATE_EVENT_MESSAGE
					);

					// If there is an error that is not the private event one, print it.
					if (differentErrorOtherThanPrivateEvent) {
						this.logger.error('Error parsing event', err);
						console.error(err);
					}
				}
			}
		}

		return { activityEntities, imageUrlsCollector };
	}

	public async getData(): Promise<ScrapingResult> {
		try {
			var browser = await launchNewBrowser();
		} catch (error) {
			throw new ScrapingError(backendIdValues.espressivo, String(error));
		}

		try {
			const page = await browser.newPage();
			await page.setViewport({ width: 1920, height: 1080 });

			const today = DateTime.local();
			await page.goto(`https://espressivo.cr/calendario/${today.toFormat('y-LL')}`);
			await page.waitForSelector('h1', { timeout: 10000 });

			const currentMonthData = await this.scrapEspressivoData(page);

			await page.goto(
				`https://espressivo.cr/calendario/${today.plus({ months: 1 }).toFormat('y-LL')}`
			);
			await page.waitForSelector('h1', { timeout: 10000 });

			const nextMonthData = await this.scrapEspressivoData(page);

			const mergedEntities = currentMonthData.activityEntities.concat(
				nextMonthData.activityEntities
			);
			const mergedCollector = new Set([
				...currentMonthData.imageUrlsCollector,
				...nextMonthData.imageUrlsCollector,
			]);
			return { activityEntities: mergedEntities, imageUrlsCollector: mergedCollector };
		} catch (error) {
			throw new ScrapingError(backendIdValues.teatroNacional, String(error));
		} finally {
			browser.close();
		}
	}
}
