import { backendIdValues } from 'db-schema';
import { getTeatroNacionalData } from './teatro-nacional';

export const scrapingLocationsMethods = {
	[backendIdValues.teatroNacional]: getTeatroNacionalData,
} as const;
