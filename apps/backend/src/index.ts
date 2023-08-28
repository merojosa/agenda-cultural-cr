import { updateTheaterData } from '#scraping/update-theater-data';

export const updateTheaterDataLambda = async () => {
	await updateTheaterData();
};
