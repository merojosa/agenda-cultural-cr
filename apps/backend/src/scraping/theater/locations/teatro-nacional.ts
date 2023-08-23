import { ElementHandle, Page } from 'puppeteer-core';
import { DateTime } from 'luxon';
import { escapeXpathString, spanishMonths } from '#utils/util.scraping';
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
							title: titleElement?.textContent?.trim() || '',
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
	page: Page,
	titlePlay: string,
	datetimePlay: DateTime
): Promise<{ description: string; source: string } | null> {
	// xPath selectors explanation: https://devhints.io/xpath
	const xPathElementsHandle = await page.$x(
		`//ul[@id="calendar"]/li[text()[contains(., ${escapeXpathString(
			datetimePlay.day.toString()
		)})]]/article/em[text()[contains(., ${escapeXpathString(
			datetimePlay.toFormat('h:mm a')
		)})]]/following-sibling::h3[text()[contains(., ${escapeXpathString(titlePlay)})]]`
	);

	if (!xPathElementsHandle.length) {
		return null;
	}

	const elementHandle = xPathElementsHandle[0] as ElementHandle | undefined;
	if (!elementHandle) {
		return null;
	}

	await elementHandle.hover();

	const tooltipSelector = '.tooltipster-base.tooltipster-default:not(:empty)';
	try {
		await page.waitForSelector(tooltipSelector, { timeout: 1000 });
	} catch (error) {
		if (error instanceof Error && error.name === 'TimeoutError') {
			console.error('Timeout error on getDescriptionAndSource', error);
			return null;
		}
		console.error('Unknown error', error);
		return null;
	}

	await page.click(`${tooltipSelector} a.more`);
	await page.waitForSelector('h2', { timeout: 10000 });

	const descriptionParagraphs = await page.evaluate(() => {
		const pElements = document.querySelectorAll('section > .generalWrap > .calCol2 > hr ~ p');

		return Array.from(pElements)
			.map((pElement) => pElement.textContent || '')
			.join('\n');
	});
	const source = page.url();
	await page.goBack();
	await page.waitForSelector('h2', { timeout: 10000 });

	return { description: descriptionParagraphs, source };
}

export async function getTeatroNacionalData(page: Page): Promise<ActivityEntity[]> {
	try {
		await page.goto('https://www.teatronacional.go.cr/Calendario');
		await page.waitForSelector('h2', { timeout: 10000 });

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
				const descriptionAndSourceResult = await getDescriptionAndSource(
					page,
					play.title,
					datetime
				);
				if (descriptionAndSourceResult) {
					awaitedSeed.push({
						backendId: backendIdValues.teatroNacional,
						title: play.title,
						datetime,
						description: descriptionAndSourceResult.description,
						source: descriptionAndSourceResult.source,
					});
				}
			}

			return awaitedSeed;
		}, Promise.resolve([] as ActivityEntity[]));

		const teatroNacionalPlaysDb = await teatroNacionalPlaysDbPromise;
		return teatroNacionalPlaysDb;
	} catch (error) {
		throw new ScrapingError(backendIdValues.teatroNacional, String(error));
	}
}
