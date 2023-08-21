import * as schema from '#schema';
import { I as InferModelDrizzle } from 'drizzle-orm/column.d-04875079';
import { AnyPgTable, PgInsertValue } from 'drizzle-orm/pg-core';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

const DB_IDS = {
	activityType: {
		teatro: 1,
	},
	location: {
		teatroNacional: 1,
	},
} as const;

// Exclude SQL and Placeholder types from PgInsertValue
type RawTableTypes<TTable extends AnyPgTable> = {
	[Key in keyof PgInsertValue<TTable>]: InferModelDrizzle<TTable, 'insert'>[Key];
};

const data = {
	activityType: {
		teatro: {
			name: 'Teatro',
		} as RawTableTypes<typeof schema.activityTypeTable>,
	},
	location: {
		teatroNacional: {
			name: 'Teatro Nacional',
			gpsLocationUrl: 'https://maps.app.goo.gl/RTJPky5Y3LhuSpEA7',
		} as RawTableTypes<typeof schema.locationTable>,
	},
	automaticLocation: {
		teatroNacional: {
			locationId: DB_IDS.location.teatroNacional,
			backendId: 'teatro_nacional',
			url: 'https://www.teatronacional.go.cr/Calendario',
		} as RawTableTypes<typeof schema.automaticLocationTable>,
	},
} as const;

export async function systemTables(db: PostgresJsDatabase) {
	await db
		.insert(schema.activityTypeTable)
		.values({ ...data.activityType.teatro, id: DB_IDS.activityType.teatro })
		.onConflictDoUpdate({
			target: schema.activityTypeTable.id,
			set: { ...data.activityType.teatro },
		});

	await db
		.insert(schema.locationTable)
		.values({ ...data.location.teatroNacional, id: DB_IDS.location.teatroNacional })
		.onConflictDoUpdate({
			target: schema.locationTable.id,
			set: { ...data.location.teatroNacional },
		});

	await db
		.insert(schema.automaticLocationTable)
		.values({ ...data.automaticLocation.teatroNacional })
		.onConflictDoUpdate({
			target: schema.automaticLocationTable.locationId,
			set: { ...data.automaticLocation.teatroNacional },
		});
}
