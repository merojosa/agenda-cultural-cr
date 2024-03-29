import {
	pgTable,
	serial,
	varchar,
	integer,
	text,
	pgEnum,
	unique,
	date,
	time,
	boolean,
} from 'drizzle-orm/pg-core';

const URL_LENGTH = 300;
const NAME_LENGTH = 150;

export const eventTable = pgTable(
	'event',
	{
		id: serial('id').primaryKey(),
		title: varchar('title', { length: NAME_LENGTH }).notNull(),
		date: date('date', { mode: 'date' }).notNull(),
		time: time('time'),
		imageUrl: varchar('image_url', { length: URL_LENGTH }),
		locationId: integer('location_id')
			.notNull()
			.references(() => locationTable.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),
		eventTypeId: integer('event_type_id')
			.notNull()
			.references(() => eventTypeTable.id, {
				onUpdate: 'cascade',
				onDelete: 'no action',
			}),
		eventUrl: varchar('event_url', { length: URL_LENGTH }),
		description: text('description'),
	},
	(table) => ({
		unq: unique().on(table.title, table.date, table.time, table.locationId, table.eventTypeId),
	}),
);

export const eventTypeTable = pgTable('event_type', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: NAME_LENGTH }).notNull().unique(),
});

export const locationTable = pgTable('location', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: NAME_LENGTH }).notNull(),
	gpsLocationUrl: varchar('gps_location_url', { length: URL_LENGTH }),
});

export const backendIdValues = {
	teatroNacional: 'https://teatronacional.go.cr',
	teatroElTriciclo: 'https://teatroeltriciclo.com',
	espressivo: 'https://espressivo.cr/',
	ccecr: 'https://ccecr.org/',
} as const;

export const backendIdEnum = pgEnum('backend_id', [
	backendIdValues.teatroNacional,
	backendIdValues.teatroElTriciclo,
	backendIdValues.espressivo,
	backendIdValues.ccecr,
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
	enable: boolean('enable').notNull().default(true),
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
	eventType: {
		teatro: 1,
	},
	location: {
		[backendIdValues.teatroNacional]: 1,
		[backendIdValues.teatroElTriciclo]: 2,
		[backendIdValues.espressivo]: 3,
		[backendIdValues.ccecr]: 4,
	},
} as const;
