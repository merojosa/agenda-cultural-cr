import { compile } from 'html-to-text';

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

const compiledConvert = compile({ preserveNewlines: true, wordwrap: null });

export function htmlToPlainText(html: string): string {
	return compiledConvert(html);
}