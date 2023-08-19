import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function runMigrations() {
	if (!process.env.DATABASE_URL) {
		console.error('Migration error: DATABASE_URL not specified');
		process.exit(1);
	}

	const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });

	try {
		await migrate(drizzle(migrationClient), { migrationsFolder: './drizzle' });
		process.exit();
	} catch (error) {
		console.error('Migration error: ', error);
		process.exit(1);
	}
}

runMigrations();
