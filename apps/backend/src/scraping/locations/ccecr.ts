import {
	ScrapingError,
	type BackendLocation,
	type ScrapingResult,
	type EventEntity,
} from '#scraping/scraping-types';
import { logger } from '#scraping/services/logger';
import { htmlToPlainText, launchNewBrowser, spanishMonths } from '#scraping/utils/scraping-utils';
import { backendIdValues } from 'db-schema';
import { DateTime } from 'luxon';
import type { Logger } from 'pino';
import type { Page } from 'puppeteer-core';
import { z } from 'zod';

const initialDataSchema = z.object({
	title: z.string(),
	url: z.string(),
	imageUrl: z.string().optional(),
});

export class Ccecr implements BackendLocation {
	private logger: Logger;

	constructor() {
		this.logger = logger.child({ id: Ccecr.name });
	}

	private processCcecrDate(dateText: string | undefined | null) {
		if (!dateText) {
			this.logger.warn({ dateText }, 'Date excluded');
			return [];
		}

		const months = Object.keys(spanishMonths) as (keyof typeof spanishMonths)[];

		let lastMonthIndex = 0;
		let lastYearIndex = 0;

		const dates = [] as {
			year: number;
			month: number;
			day: number;
			hours: number;
			minutes: number;
		}[];

		for (const month of months) {
			const indexMonthSearch = dateText.search(month);
			// No month found?
			if (indexMonthSearch === -1) {
				continue;
			}

			const concatenatedDate = dateText.substring(lastMonthIndex, indexMonthSearch);
			// Search for numbers that may represent days
			const daysNumbers = concatenatedDate.match(/\d+/g);

			if (!daysNumbers) {
				continue;
			}

			// Convert every number in the text into a dayValue
			const daysValues = new Set<number>(daysNumbers.map(Number));

			// We need to consider the case of intervals (for example, 25 al 29)
			const splittedMonth = dateText.split(' ');
			const alWordIndex = splittedMonth.indexOf('al');
			if (alWordIndex !== -1) {
				let startIntervalIndex = alWordIndex - 1;
				let endIntervalIndex = alWordIndex + 1;

				// Continue the loop until there is no element left or we find two intervals with valid numbers
				while (
					(splittedMonth[startIntervalIndex] !== undefined ||
						splittedMonth[endIntervalIndex] !== undefined) &&
					(!Number.isFinite(Number(splittedMonth[startIntervalIndex])) ||
						!Number.isFinite(Number(splittedMonth[endIntervalIndex])))
				) {
					if (!Number.isFinite(Number(splittedMonth[startIntervalIndex]))) {
						--startIntervalIndex;
					}

					if (!Number.isFinite(Number(splittedMonth[endIntervalIndex]))) {
						++endIntervalIndex;
					}
				}

				let startInterval = Number(splittedMonth[startIntervalIndex]);
				const endInterval = Number(splittedMonth[endIntervalIndex]);

				// If they are valid number, add the inverval to daysValues
				if (Number.isFinite(startInterval) && Number.isFinite(endInterval)) {
					while (endInterval > startInterval) {
						daysValues.add(startInterval);
						++startInterval;
					}
				} else {
					this.logger.warn({ dateText, startInterval, endInterval }, 'Interval numbers excluded');
				}
			}

			let yearValue = new Date().getFullYear();

			const yearsNumbers = dateText.match(/\b\d{4}\b/g);
			if (yearsNumbers?.[lastYearIndex]) {
				yearValue = Number(yearsNumbers[lastYearIndex]);

				// If there is more than one year, iterate through every year possible
				if (Number.isFinite(Number(yearsNumbers[lastYearIndex + 1]))) {
					++lastYearIndex;
				}
			}

			const monthValue = spanishMonths[month];

			daysValues.forEach((dayValue) => {
				dates.push({
					year: yearValue,
					month: monthValue,
					day: dayValue,
					hours: -1,
					minutes: -1,
				});
			});

			// Technically, every month is the separation between dates, so lets update the lastMonthIndex to avoid duplicate dates
			lastMonthIndex = indexMonthSearch;
		}

		return dates;
	}

	private processCcecrTime(
		time: string | undefined | null,
		dates: {
			year: number;
			month: number;
			day: number;
			hours: number;
			minutes: number;
		}[],
	) {
		if (!dates.length || !time) {
			return dates;
		}

		const words = time.split(' ');

		if (words[0]?.endsWith('pm') || words[0]?.endsWith('am') || words[0]?.endsWith('md')) {
			const formatted = DateTime.fromFormat(
				words[0].toLocaleLowerCase().replace('md', 'pm'),
				'h:mma',
			);

			if (!formatted.isValid) {
				return dates;
			}

			return dates.map((date) => ({
				...date,
				hours: formatted.hour,
				minutes: formatted.minute,
			}));
		}

		return dates;
	}

	private processDateTimeTexts(dateText: string, timeText: string) {
		const dates = this.processCcecrDate(dateText);
		const datesWithPossibleTimes = this.processCcecrTime(timeText, dates);
		return datesWithPossibleTimes;
	}

	private async scrapDetails(
		page: Page,
		initialData: {
			title: string | undefined;
			url: string | undefined;
			imageUrl: string | null;
		}[],
	) {
		const events = [] as EventEntity[];
		const imageUrlsCollector = new Set<string>();

		for (const data of initialData) {
			const parsedData = initialDataSchema.safeParse(data);

			if (!parsedData.success) {
				this.logger.warn({ error: parsedData.error, data }, 'Events excluded');
				continue;
			}

			await page.goto(parsedData.data.url);
			await page.waitForSelector('h1');
			const content = await page.evaluate(() => {
				const descriptionsHtmls = Array.from(document.querySelectorAll('div.texto p'), (element) =>
					element.textContent ? element.innerHTML : '',
				);

				const possiblesDateTime = document.querySelectorAll('div.ficha_fila');

				let dateText = '';
				let timeText = '';
				for (const possibleDateTime of Array.from(possiblesDateTime)) {
					if (possibleDateTime.textContent?.includes('Fecha')) {
						const pElements = possibleDateTime.querySelectorAll('p');

						for (let i = 0; i < pElements.length; ++i) {
							if (pElements[i]?.textContent?.trim() === 'Fecha') {
								dateText = pElements[i + 1]?.textContent ?? '';
							} else if (pElements[i]?.textContent?.trim() === 'Horario') {
								const timeElement = pElements[i + 1];
								timeText = timeElement?.textContent ?? '';
							}
						}
					}
				}

				return {
					descriptionHtml: descriptionsHtmls.join('\n'),
					dateText,
					timeText,
				};
			});

			const description = htmlToPlainText(content.descriptionHtml.trim()).trim();
			const dates = this.processDateTimeTexts(content.dateText, content.timeText);

			if (parsedData.data.imageUrl) {
				var imageUrl: string | undefined = parsedData.data.imageUrl.startsWith('http')
					? parsedData.data.imageUrl
					: `https://${parsedData.data.imageUrl}`;
			}

			dates.forEach((dateEntry) => {
				const date = DateTime.fromObject({
					year: dateEntry.year,
					month: dateEntry.month,
					day: dateEntry.day,
				});
				const time =
					dateEntry.hours === -1 || dateEntry.minutes === -1
						? null
						: DateTime.fromObject({ hour: dateEntry.hours, minute: dateEntry.minutes });

				if ((date.isValid && time === null) || (date.isValid && time !== null && time.isValid)) {
					events.push({
						backendId: backendIdValues.ccecr,
						date,
						time,
						description: description,
						source: parsedData.data.url,
						title: parsedData.data.title,
						imageUrl,
					});
				} else {
					this.logger.warn(
						{ date, time, url: parsedData.data.url },
						'Event excluded due to invalid date or time',
					);
				}
			});

			if (imageUrl) {
				imageUrlsCollector.add(imageUrl);
			}
		}

		return { events, imageUrlsCollector } as const;
	}

	private async scrapCcecrData(page: Page): Promise<ScrapingResult> {
		const initialData = await page.evaluate(() =>
			Array.from(document.querySelectorAll('div.post'), (element) => {
				const url = element.querySelector('a')?.href;
				const styleAttribute = element.querySelector('a > .post_img')?.getAttribute('style');
				const imageUrlMatch = styleAttribute?.match(/url\((.*?)\)/);

				const title = element.querySelector('div.post_info > a')?.innerHTML;

				return { title, url, imageUrl: imageUrlMatch?.[1] ?? null };
			}),
		);
		const details = await this.scrapDetails(page, initialData);

		return { eventEntities: details.events, imageUrlsCollector: details.imageUrlsCollector };
	}

	public async getData(): Promise<ScrapingResult> {
		try {
			var browser = await launchNewBrowser();
		} catch (error) {
			throw new ScrapingError(backendIdValues.ccecr, String(error));
		}

		try {
			const page = await browser.newPage();
			await page.setViewport({ width: 1920, height: 1080 });

			const startMonth = DateTime.local().startOf('month');
			await page.goto(
				`https://ccecr.org/tipo/actividades/?fecha-inicio=${startMonth.toFormat(
					'yyyy-LL-dd',
				)}&fecha-fin=${startMonth.plus({ months: 2 }).toFormat('yyyy-LL-dd')}`,
			);
			await page.waitForSelector('h1', { timeout: 10_000 });

			const scrapedData = await this.scrapCcecrData(page);

			return scrapedData;
		} catch (error) {
			throw new ScrapingError(backendIdValues.ccecr, String(error));
		} finally {
			browser.close();
		}
	}
}
