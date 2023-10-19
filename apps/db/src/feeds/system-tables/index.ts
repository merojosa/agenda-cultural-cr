import * as schema from '#schema';
import type { InferInsertModel } from 'drizzle-orm';
import type { AnyPgTable, PgInsertValue } from 'drizzle-orm/pg-core';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// Exclude SQL and Placeholder types from PgInsertValue
type RawTableTypes<TTable extends AnyPgTable> = {
	[Key in keyof PgInsertValue<TTable>]: InferInsertModel<TTable>[Key];
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
		},
		teatroElTriciclo: {
			name: 'Teatro El Triciclo',
			gpsLocationUrl: 'https://maps.app.goo.gl/BSTC1dpVYRdboRnG8',
		},
		espressivo: {
			name: 'Espressivo',
			gpsLocationUrl: 'https://maps.app.goo.gl/wRkPaqZZsiPhqiKU7',
		},
	} satisfies Record<
		keyof typeof schema.backendIdValues,
		RawTableTypes<typeof schema.locationTable>
	>,
	automaticLocation: {
		teatroNacional: {
			locationId: schema.DB_IDS.location['https://teatronacional.go.cr'],
			backendId: 'https://teatronacional.go.cr',
			url: 'https://www.teatronacional.go.cr/Calendario',
		},
		teatroElTriciclo: {
			locationId: schema.DB_IDS.location['https://teatroeltriciclo.com'],
			backendId: 'https://teatroeltriciclo.com',
			url: 'https://www.teatroeltriciclo.com/boleteria/CarteleraPublica',
		},
		espressivo: {
			locationId: schema.DB_IDS.location['https://espressivo.cr/'],
			backendId: 'https://espressivo.cr/',
			url: 'https://espressivo.cr/calendario/',
		},
	} satisfies Record<
		keyof typeof schema.backendIdValues,
		RawTableTypes<typeof schema.automaticLocationTable>
	>,
} as const;

export async function systemTables(db: PostgresJsDatabase) {
	// Activity type:
	await db
		.insert(schema.activityTypeTable)
		.values({ ...data.activityType.teatro, id: schema.DB_IDS.activityType.teatro })
		.onConflictDoUpdate({
			target: schema.activityTypeTable.id,
			set: { ...data.activityType.teatro },
		});

	// Location:
	const locationInserts = Object.keys(schema.backendIdValues).map((backendIdValueKey) =>
		db
			.insert(schema.locationTable)
			.values({
				...data.location[backendIdValueKey as keyof typeof schema.backendIdValues],
				id: schema.DB_IDS.location[
					schema.backendIdValues[backendIdValueKey as keyof typeof schema.backendIdValues]
				],
			})
			.onConflictDoUpdate({
				target: schema.locationTable.id,
				set: { ...data.location[backendIdValueKey as keyof typeof schema.backendIdValues] },
			})
	);
	await Promise.all(locationInserts);

	// Automatic locations
	const automaticLocationInserts = Object.keys(schema.backendIdValues).map((backendIdValueKey) =>
		db
			.insert(schema.automaticLocationTable)
			.values({
				...data.automaticLocation[backendIdValueKey as keyof typeof schema.backendIdValues],
			})
			.onConflictDoUpdate({
				target: schema.automaticLocationTable.locationId,
				set: {
					...data.automaticLocation[backendIdValueKey as keyof typeof schema.backendIdValues],
				},
			})
	);
	await Promise.all(automaticLocationInserts);
}
