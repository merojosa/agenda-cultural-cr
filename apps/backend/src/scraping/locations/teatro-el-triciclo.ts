import { type BackendLocation, ScrapingError, type ScrapingResult } from '#scraping/scraping-types';
import { logger } from '#scraping/services/logger';
import { htmlToPlainText } from '#scraping/utils/scraping-utils';
import { backendIdValues } from 'db-schema';
import { DateTime } from 'luxon';
import type { Logger } from 'pino';

const BASE_URL = 'https://www.teatroeltriciclo.com';
const API_URL = `${BASE_URL}/boleteria/CarteleraPublica`;

export class TeatroElTriciclo implements BackendLocation {
	private logger: Logger;

	constructor() {
		this.logger = logger.child({ id: TeatroElTriciclo.name });
	}

	private transformDatetimeToTime(value: string) {
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

	public async getData(): Promise<ScrapingResult> {
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

		const entities: ScrapingResult = {
			imageUrlsCollector: new Set<string>(),
			activityEntities: [],
		};
		plays.forEach((value: Record<string, string | undefined>) => {
			if (
				// Is the play record valid?
				value.Id &&
				value.Nombre &&
				value.ImagenBanner &&
				value.Sinopsis &&
				value.IdSala &&
				Array.isArray(value.Funciones)
			) {
				const description = htmlToPlainText(value.Sinopsis);
				const title = value.Nombre;
				const source = `${BASE_URL}/es/Cartelera#/cartelera/${value.IdSala}/${value.Id}`;
				const imageUrl = `${BASE_URL}${value.ImagenBanner}`;

				entities.imageUrlsCollector.add(imageUrl);

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
							const time = this.transformDatetimeToTime(functionValue.De);

							entities.activityEntities.push({
								backendId: backendIdValues.teatroElTriciclo,
								title,
								description,
								source,
								imageUrl,
								date: DateTime.fromObject({
									year: functionValue.Y,
									month: functionValue.M,
									day: functionValue.D,
								}),
								time: time ? DateTime.fromObject({ hour: time.hours, minute: time.minutes }) : null,
							});
						} else if (functionValue.S === false) {
							// Log the warning only if functionValue.S is false
							this.logger.warn({ functionValue }, 'Activity excluded');
						}
					}
				);
			}
		});

		return entities;
	}
}
