import {
	pgTable,
	serial,
	varchar,
	timestamp,
	integer,
	text,
	pgEnum,
	primaryKey,
} from 'drizzle-orm/pg-core';

const URL_LENGTH = 300;
const NAME_LENGTH = 150;

export const activityTable = pgTable(
	'activity',
	{
		title: varchar('title', { length: NAME_LENGTH }).notNull(),
		datetime: timestamp('datetime').notNull(),
		locationId: integer('location_id')
			.notNull()
			.references(() => locationTable.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),
		activityTypeId: integer('activity_type_id')
			.notNull()
			.references(() => activityTypeTable.id, {
				onUpdate: 'cascade',
				onDelete: 'no action',
			}),
		activityUrl: varchar('activity_url', { length: URL_LENGTH }),
		description: text('description'),
	},
	(table) => ({
		unq: primaryKey(table.title, table.datetime, table.locationId, table.activityTypeId),
	})
);

export const activityTypeTable = pgTable('activity_type', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: NAME_LENGTH }).notNull().unique(),
});

export const locationTable = pgTable('location', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: NAME_LENGTH }).notNull(),
	gpsLocationUrl: varchar('gps_location_url', { length: URL_LENGTH }),
});

export const backendIdValues = {
	teatroNacional: 'teatro_nacional',
	teatroElTriciclo: 'teatro_triciclo',
} as const;

export const backendIdEnum = pgEnum('backend_id', [
	backendIdValues.teatroNacional,
	backendIdValues.teatroElTriciclo,
]);

export const automaticLocationTable = pgTable('automatic_location', {
	locationId: integer('id')
		.primaryKey()
		.references(() => locationTable.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),
	backendId: backendIdEnum('backend_id').unique(),
	url: varchar('url', { length: URL_LENGTH }),
});

export const manualLocationTable = pgTable('manual_location', {
	locationId: integer('location_id')
		.primaryKey()
		.references(() => locationTable.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),
	extraInformation: varchar('extra_information', { length: 400 }),
	authorEmail: varchar('author_email', { length: 100 })
		.notNull()
		.references(() => authorTable.email, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),
});

export const authorTable = pgTable('author', {
	email: varchar('email', { length: 100 }).primaryKey(),
	name: varchar('name', { length: NAME_LENGTH }),
});

export const DB_IDS = {
	activityType: {
		teatro: 1,
	},
	location: {
		[backendIdValues.teatroNacional]: 1,
		[backendIdValues.teatroElTriciclo]: 2,
	},
} as const;
