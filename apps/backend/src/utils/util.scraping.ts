import * as cheerio from 'cheerio';

export const spanishMonths: Record<string, number> = {
	enero: 1,
	febrero: 2,
	marzo: 3,
	abril: 4,
	mayo: 5,
	junio: 6,
	julio: 7,
	agosto: 8,
	septiembre: 9,
	octubre: 10,
	noviembre: 11,
	diciembre: 12,
} as const;

export function htmlToPlainText(html: string): string {
	// Load the HTML string into a Cheerio object
	const $ = cheerio.load(html);

	// Use Cheerio's text() method to extract plain text
	const plainText = $.text();

	return plainText;
}
