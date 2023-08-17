// https://gist.github.com/tokland/d3bae3b6d3c1576d8700405829bbdb52
export function escapeXpathString(xPathValue: string) {
	const splitedQuotes = xPathValue.replace(/'/g, `', "'", '`);
	return `concat('${splitedQuotes}', '')`;
}

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
