import { Browser, ElementHandle, Page } from 'puppeteer-core';
import { DateTime } from 'luxon';
import { spanishMonths } from '#utils/util.scraping';
import { ActivityEntity, ScrapingError } from '#scraping/scraping-types';
import { backendIdValues } from 'db-schema';

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

function getCurrentYear(page: Page) {
	return page.evaluate(() => {
		const currentYearElement = document.querySelector('#anio .dd-selected-text');
		const currentYearValue = currentYearElement?.textContent
			? Number(currentYearElement.textContent)
			: DateTime.local().year;

		return currentYearValue;
	});
}

function getCurrentMonth(page: Page) {
	return page.evaluate((spanishMonths) => {
		const currentMonthElement = document.querySelector('#calMonths > .current > span');
		const monthText = currentMonthElement?.textContent?.toLocaleLowerCase();
		const currentMonthValue = spanishMonths[monthText || ''] || DateTime.local().month;

		return currentMonthValue;
	}, spanishMonths);
}

async function getTeatroNacionalBasicData(page: Page, year: number, month: number) {
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

async function getDescriptionAndSource(
	browser: Browser,
	rootPage: Page,
	titlePlay: string | undefined,
	datetimePlay: DateTime
): Promise<{ description: string; source: string } | null> {
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
		console.error('No element handle', titlePlay, datetimePlay.toString());
		return null;
	}

	await h3Result.hover();

	try {
		await rootPage.waitForSelector(tooltipSelector, { timeout: 10_000 });
	} catch (error) {
		if (error instanceof Error && error.name === 'TimeoutError') {
			console.error('Timeout error on getDescriptionAndSource', error);
			return null;
		}
		console.error('Unknown error', error);
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
		console.error('No newUrl on getDescriptionAndSource');
		return null;
	}

	const newPage = await browser.newPage();
	await newPage.setViewport({ width: 1920, height: 1080 });
	await newPage.goto(newUrl);
	await newPage.waitForSelector('h2', { timeout: 10_000 });

	const descriptionParagraphs = await newPage.evaluate(() => {
		const pElements = document.querySelectorAll('section > .generalWrap > .calCol2 > hr ~ p');

		return Array.from(pElements)
			.map((pElement) => pElement.textContent || '')
			.join('\n');
	});
	const source = newPage.url();
	await newPage.close();

	return { description: descriptionParagraphs, source } as const;
}

async function scrapTeatroNacionalData(browser: Browser, page: Page) {
	const currentYear = await getCurrentYear(page);
	const currentMonth = await getCurrentMonth(page);
	const teatroNacionalDays = await getTeatroNacionalBasicData(page, currentYear, currentMonth);

	if (!teatroNacionalDays.length) {
		throw new Error('No days length');
	}

	const teatroNacionalPlaysDbPromise = teatroNacionalDays.reduce(async (seed, curr) => {
		const awaitedSeed = await seed;

		for (const play of curr.plays) {
			const datetime = DateTime.fromObject({
				year: curr.year,
				month: curr.month,
				day: curr.day,
				hour: play.hours,
				minute: play.minutes,
			});

			// Here's the problem
			const descriptionAndSourceResult = await getDescriptionAndSource(
				browser,
				page,
				play.title,
				datetime
			);

			if (descriptionAndSourceResult && play.title) {
				awaitedSeed.push({
					backendId: backendIdValues.teatroNacional,
					title: play.title.trim(),
					datetime,
					description: descriptionAndSourceResult.description,
					source: descriptionAndSourceResult.source,
				});
			}
		}

		return awaitedSeed;
	}, Promise.resolve([] as ActivityEntity[]));

	return teatroNacionalPlaysDbPromise;
}

export async function getTeatroNacionalData(browser: Browser): Promise<ActivityEntity[]> {
	try {
		const page = await browser.newPage();
		await page.setViewport({ width: 1920, height: 1080 });

		await page.goto('https://www.teatronacional.go.cr/Calendario');
		await page.waitForSelector('h2', { timeout: 10000 });
		const currentMonthData = await scrapTeatroNacionalData(browser, page);

		await page.click('.current + li');
		await page.waitForSelector('h2', { timeout: 10000 });
		const nextMonthData = await scrapTeatroNacionalData(browser, page);

		return currentMonthData.concat(nextMonthData);
	} catch (error) {
		throw new ScrapingError(backendIdValues.teatroNacional, String(error));
	}
}
