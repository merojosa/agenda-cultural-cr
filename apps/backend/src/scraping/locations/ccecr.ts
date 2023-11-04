import { ScrapingError, type BackendLocation, type ScrapingResult } from '#scraping/scraping-types';
import { logger } from '#scraping/services/logger';
import { launchNewBrowser } from '#scraping/utils/scraping-utils';
import { backendIdValues } from 'db-schema';
import { DateTime } from 'luxon';
import type { Logger } from 'pino';
import type { Page } from 'puppeteer-core';

export class Ccecr implements BackendLocation {
	private logger: Logger;

	constructor() {
		this.logger = logger.child({ id: Ccecr.name });
	}

	private async scrapCcecrData(page: Page): Promise<ScrapingResult> {
		await page.evaluate(() =>
			Array.from(document.querySelectorAll('div.post'), (element) => {
				const url = element.querySelector('a')?.href;
				const styleAttribute = element.querySelector('a > .post_img')?.getAttribute('style');
				const imageUrlMatch = styleAttribute?.match(
					/[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/gi
				);

				const title = element.querySelector('div.post_info > a')?.innerHTML;

				return { title, url, imageUrl: imageUrlMatch?.[0] ?? null };
			})
		);

		return { activityEntities: [], imageUrlsCollector: new Set() };
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

			const today = DateTime.local();
			await page.goto(
				`https://ccecr.org/tipo/actividades/?fecha-inicio=${today.toFormat(
					'yyyy-LL-dd'
				)}&fecha-fin=${today.plus({ months: 2 }).toFormat('yyyy-LL-dd')}`
			);
			await page.waitForSelector('h1', { timeout: 10000 });

			const scrapedData = await this.scrapCcecrData(page);

			return scrapedData;
		} catch (error) {
			throw new ScrapingError(backendIdValues.teatroNacional, String(error));
		} finally {
			browser.close();
		}
	}
}
