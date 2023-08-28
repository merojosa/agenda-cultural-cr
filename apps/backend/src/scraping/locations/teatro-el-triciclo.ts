import { ActivityEntity, ScrapingError } from '#scraping/scraping-types';
import { htmlToPlainText } from '#utils/util.scraping';
import { backendIdValues } from 'db-schema';
import { DateTime } from 'luxon';

const API_URL = 'https://www.teatroeltriciclo.com/boleteria/CarteleraPublica';

function transformDatetimeToTime(value: string) {
	const arrayStr = value.split(',');
	const timeStr = arrayStr[arrayStr.length - 1]?.trim();

	if (!timeStr) {
		return null;
	}

	const [time, period] = timeStr.split(' ');
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

	return { hours, minutes } as const;
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

	const entities = [] as ActivityEntity[];
	plays.forEach((value: Record<string, string | undefined>) => {
		if (
			// Is the play record valid?
			value.Id &&
			value.Nombre &&
			value.Sinopsis &&
			value.IdSala &&
			Array.isArray(value.Funciones)
		) {
			const description = htmlToPlainText(value.Sinopsis);
			const title = value.Nombre;
			const source = `https://www.teatroeltriciclo.com/es/Cartelera#/cartelera/${value.IdSala}/${value.Id}`;

			value.Funciones.forEach(
				(functionValue: Record<string, string | number | boolean | undefined>) => {
					if (
						// Is the datetime record valid?
						typeof functionValue.D === 'number' &&
						typeof functionValue.M === 'number' &&
						typeof functionValue.Y === 'number' &&
						typeof functionValue.De === 'string' &&
						functionValue.S === false // For some reason, when .S is true, it doesn't appear to buy tickets
					) {
						const time = transformDatetimeToTime(functionValue.De);

						if (time) {
							entities.push({
								backendId: 'teatro_triciclo',
								title,
								description,
								source,
								datetime: DateTime.fromObject({
									year: functionValue.Y,
									month: functionValue.M,
									day: functionValue.D,
									hour: time.hours,
									minute: time.minutes,
								}),
							});
						}
					}
				}
			);
		}
	});

	return entities;
}
