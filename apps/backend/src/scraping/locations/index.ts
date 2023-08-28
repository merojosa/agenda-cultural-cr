/* eslint-disable @typescript-eslint/no-explicit-any */
import { backendIdValues } from 'db-schema';
import { getTeatroNacionalData } from './teatro-nacional';
import { ActivityEntity } from '#scraping/scraping-types';
import { getTeatroElTricicloData } from './teatro-el-triciclo';

export const scrapingLocationsMethods: Record<
	(typeof backendIdValues)[keyof typeof backendIdValues],
	(...args: any[]) => Promise<ActivityEntity[]>
> = {
	[backendIdValues.teatroNacional]: getTeatroNacionalData,
	[backendIdValues.teatroElTriciclo]: getTeatroElTricicloData,
} as const;
