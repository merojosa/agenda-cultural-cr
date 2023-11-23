import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { Config } from 'sst/node/config';

const client = postgres(Config.DATABASE_URL);
export const db = drizzle(client);
