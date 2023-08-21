import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { feeds } from './feeds';

async function seedTables() {
	if (!process.env.DATABASE_URL) {
		console.error('Seeding error: DATABASE_URL not specified');
		process.exit(1);
	}

	const client = postgres(process.env.DATABASE_URL);
	const db = drizzle(client);

	await db.transaction(async (tx) => {
		try {
			await feeds(tx);
		} catch (error) {
			console.error('Seeding error:', error);
			tx.rollback();
			return;
		}
	});
}

async function main() {
	await seedTables();
	process.exit();
}

main();
