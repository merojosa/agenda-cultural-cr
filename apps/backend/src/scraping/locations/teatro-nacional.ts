import { type Browser, ElementHandle, type Page } from 'puppeteer-core';
import { DateTime } from 'luxon';
import { htmlToPlainText, launchNewBrowser, spanishMonths } from '#scraping/utils/scraping-utils';
import { type BackendLocation, ScrapingError, type ScrapingResult } from '#scraping/scraping-types';
import { backendIdValues } from 'db-schema';
import type { Logger } from 'pino';
import { logger } from '#scraping/services/logger';

type TeatroNacionalDay = {
	day: number;
	month: number;
	year: number;
	plays: BasicPlay[];
};

type BasicPlay = {
	title: string;
	hours?: number;
	minutes?: number;
};

export class TeatroNacional implements BackendLocation {
	private logger: Logger;

	constructor() {
		this.logger = logger.child({ id: TeatroNacional.name });
	}

	private getCurrentYear(page: Page) {
		return page.evaluate(() => {
			const currentYearElement = document.querySelector('#anio .dd-selected-text');
			const currentYearValue = currentYearElement?.textContent
				? Number(currentYearElement.textContent)
				: DateTime.local().year;

			return currentYearValue;
		});
	}

	private getCurrentMonth(page: Page) {
		return page.evaluate((spanishMonths) => {
			const currentMonthElement = document.querySelector('#calMonths > .current > span');
			const monthText = currentMonthElement?.textContent?.toLocaleLowerCase();
			const currentMonthValue =
				spanishMonths[monthText as keyof typeof spanishMonths] ?? DateTime.local().month;

			return currentMonthValue;
		}, spanishMonths);
	}

	private async getTeatroNacionalBasicData(page: Page, year: number, month: number) {
		const teatroNacionalDays = await page.evaluate(
			async (year, month) => {
				const calendarDiv = document.getElementById('calendar');
				if (!calendarDiv) {
					return [];
				}

				const playDays = [] as TeatroNacionalDay[];
				const daysLiElements = calendarDiv.querySelectorAll('li');
				daysLiElements.forEach((dayElement) => {
					const playsArticles = dayElement.querySelectorAll('article');
					const plays = [] as BasicPlay[];
					playsArticles.forEach(async (articlePlayElement) => {
						if (articlePlayElement.textContent) {
							// HOURS AND MINUTES
							const timeElement = articlePlayElement.querySelector('em');
							const [time, period] = (timeElement?.textContent?.trim() || '').split(' ');
							const [hoursStr, minutesStr] = (time || '').split(':');

							// Convert the hours and minutes to numbers
							let hours = Number(hoursStr);
							const minutes = Number(minutesStr);

							// Convert to 24-hour format if necessary
							if (period === 'PM' && hours !== 12) {
								hours = hours + 12;
							} else if (period === 'AM' && hours === 12) {
								hours = 0;
							}

							// TITLE
							const titleElement = articlePlayElement.querySelector('h3');

							plays.push({
								title: titleElement?.textContent || '',
								hours,
								minutes,
							});
						}
					});

					if (plays.length) {
						const dayMatch = dayElement.innerText.match(/\d+/);
						const currentDayValue = dayMatch?.length ? Number(dayMatch[0]) : NaN;

						playDays.push({
							day: currentDayValue,
							month: month,
							year: year,
							plays: plays,
						});
					}
				});

				return playDays;
			},
			year,
			month
		);

		return teatroNacionalDays;
	}

	private async getDescriptionSourceImgUrl(
		browser: Browser,
		rootPage: Page,
		titlePlay: string | undefined,
		datetimePlay: DateTime
	): Promise<{ description: string; source: string; imgUrl?: string } | null> {
		await rootPage.hover('h2'); // Move mouse to somewhere else
		const tooltipSelector = '.tooltipster-base.tooltipster-default:not(:empty)';
		await rootPage.waitForSelector(tooltipSelector, { hidden: true, timeout: 10_000 }); // Wait for tooltip to disappear

		const h3Result = await rootPage.evaluateHandle(
			(timeParam, titlePlayParam) => {
				const articleElements = Array.from(document.querySelectorAll('#calendar > li > article'));

				const articleFounded = articleElements.find((element) => {
					const timeSearch = element.querySelector('em')?.textContent;
					const titleSearch = element.querySelector('h3')?.textContent;
					return timeParam === timeSearch && titlePlayParam === titleSearch;
				});

				if (articleFounded) {
					return articleFounded.querySelector('h3');
				}

				return null;
			},
			datetimePlay.toFormat('h:mm a'),
			titlePlay
		);

		if (!(h3Result instanceof ElementHandle)) {
			this.logger.error({ titlePlay, datetimePlay: datetimePlay.toString() }, 'No element handle');
			return null;
		}

		await h3Result.hover();

		try {
			await rootPage.waitForSelector(tooltipSelector, { timeout: 10_000 });
		} catch (error) {
			if (error instanceof Error && error.name === 'TimeoutError') {
				this.logger.error({ error: String(error) }, 'Timeout error on getDescriptionAndSource');
				return null;
			}
			this.logger.error({ error: String(error) }, 'Unknown error');
			return null;
		}

		const newUrl = await rootPage.evaluate((tooltipSelectorParam) => {
			const element = document.querySelector(`${tooltipSelectorParam} a.more`);
			const href = element?.getAttribute('href');

			if (href) {
				return `${document.location.protocol}//${document.location.hostname}${href}`;
			}
			return null;
		}, tooltipSelector);

		if (!newUrl) {
			this.logger.error('No newUrl on getDescriptionAndSource');
			return null;
		}

		const newPage = await browser.newPage();
		await newPage.setViewport({ width: 1920, height: 1080 });
		await newPage.goto(newUrl);
		await newPage.waitForSelector('h2', { timeout: 10_000 });

		const descriptionParagraphsHtml = await newPage.evaluate(() => {
			const pElements = document.querySelectorAll('section > .generalWrap > .calCol2 > hr ~ p');

			return Array.from(pElements)
				.map((pElement) => pElement.outerHTML || '')
				.join('\n');
		});
		const source = newPage.url();

		try {
			var imgUrlElement = await newPage.$eval(
				'section > .generalWrap > div > a > img',
				(element?: Element) => element?.getAttribute('src')
			);
		} catch {
			var imgUrlElement: string | null | undefined = undefined;
		}

		await newPage.close();

		const description = htmlToPlainText(descriptionParagraphsHtml);

		return { description, source, imgUrl: imgUrlElement || undefined } as const;
	}

	private async scrapTeatroNacionalData(browser: Browser, page: Page) {
		const currentYear = await this.getCurrentYear(page);
		const currentMonth = await this.getCurrentMonth(page);
		const teatroNacionalDays = await this.getTeatroNacionalBasicData(
			page,
			currentYear,
			currentMonth
		);

		if (!teatroNacionalDays.length) {
			throw new Error('No days length');
		}

		const teatroNacionalPlaysDbPromise = teatroNacionalDays.reduce(async (seed, curr) => {
			const awaitedSeed = await seed;

			for (const play of curr.plays) {
				const date = DateTime.fromObject({
					year: curr.year,
					month: curr.month,
					day: curr.day,
				});

				const time =
					play.hours !== undefined && play.minutes !== undefined
						? DateTime.fromObject({ hour: play.hours, minute: play.minutes })
						: null;

				if (!time?.isValid && !date.isValid) {
					this.logger.warn({ date, time, url: play.title }, 'Activity excluded');
					continue;
				}

				// Here's the problem
				const descriptionSourceImgUrl = await this.getDescriptionSourceImgUrl(
					browser,
					page,
					play.title,
					date
				);

				if (descriptionSourceImgUrl && play.title) {
					awaitedSeed.activityEntities.push({
						backendId: backendIdValues.teatroNacional,
						title: play.title.trim(),
						date,
						time,
						description: descriptionSourceImgUrl.description,
						source: descriptionSourceImgUrl.source,
						imageUrl: descriptionSourceImgUrl.imgUrl,
					});
					if (descriptionSourceImgUrl.imgUrl) {
						awaitedSeed.imageUrlsCollector.add(descriptionSourceImgUrl.imgUrl);
					}
				}
			}

			return awaitedSeed;
		}, Promise.resolve({ imageUrlsCollector: new Set(), activityEntities: [] } as ScrapingResult));

		return teatroNacionalPlaysDbPromise;
	}

	public async getData(): Promise<ScrapingResult> {
		try {
			var browser = await launchNewBrowser();
		} catch (error) {
			throw new ScrapingError(backendIdValues.teatroNacional, String(error));
		}

		try {
			const page = await browser.newPage();
			await page.setViewport({ width: 1920, height: 1080 });

			await page.goto('https://www.teatronacional.go.cr/Calendario');
			await page.waitForSelector('h2', { timeout: 10000 });
			const currentMonthData = await this.scrapTeatroNacionalData(browser, page);

			await page.click('.current + li');
			await page.waitForSelector('h2', { timeout: 10000 });
			const nextMonthData = await this.scrapTeatroNacionalData(browser, page);

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
