import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { systemTables } from './system-tables';

export async function feeds(db: PostgresJsDatabase) {
	await systemTables(db);
}
