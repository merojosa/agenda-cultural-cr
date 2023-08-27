import * as cheerio from 'cheerio';
import { ActivityEntity, ScrapingError } from '#scraping/scraping-types';
import { backendIdValues } from 'db-schema';

const API_URL = 'https://www.teatroeltriciclo.com/boleteria/CarteleraPublica';

function htmlToPlainText(html: string): string {
	// Load the HTML string into a Cheerio object
	const $ = cheerio.load(html);

	// Use Cheerio's text() method to extract plain text
	const plainText = $.text();

	return plainText;
}

export async function getTeatroElTricicloData(): Promise<ActivityEntity[]> {
	const fetchResult = await fetch(API_URL, {
		headers: { Accept: 'application/json, text/plain, */*' },
	});
	if (!fetchResult.ok) {
		throw new ScrapingError(backendIdValues.teatroElTriciclo, 'Fetch not ok');
	}

	const data = await fetchResult.json();

	const plays = data.Espectaculos;

	if (!Array.isArray(plays)) {
		throw new ScrapingError(backendIdValues.teatroElTriciclo, 'Plays not an array');
	}

	const plainTextString = htmlToPlainText(plays[plays.length - 1].Sinopsis);
	console.log('BREAKPOINT plainTextString', plainTextString);

	return [];
}
