import { updateTheaterData } from "@scraping/theater/update-theater-data";

export const updateTheaterDataLambda = async () => {
  await updateTheaterData();
};
