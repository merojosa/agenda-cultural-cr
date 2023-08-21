import {
	pgTable,
	serial,
	varchar,
	timestamp,
	integer,
	text,
	pgEnum,
	unique,
} from 'drizzle-orm/pg-core';

const URL_LENGTH = 300;
const NAME_LENGTH = 150;

export const activityTable = pgTable(
	'activity',
	{
		id: serial('id').primaryKey(),
		title: varchar('title', { length: NAME_LENGTH }).notNull(),
		description: text('description'),
		activityUrl: varchar('activityUrl', { length: URL_LENGTH }),
		datetime: timestamp('datetime').notNull(),
		locationId: integer('location_id')
			.notNull()
			.references(() => locationTable.id, {
				onUpdate: 'cascade',
				onDelete: 'set null',
			}),
		activityTypeId: integer('activity_type_id')
			.notNull()
			.references(() => activityTypeTable.id, {
				onUpdate: 'cascade',
				onDelete: 'no action',
			}),
	},
	(table) => ({
		unq: unique().on(table.title, table.datetime, table.locationId, table.activityTypeId),
	})
);

export const activityTypeTable = pgTable('activity_type', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: NAME_LENGTH }).notNull().unique(),
});

export const locationTable = pgTable('location', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: NAME_LENGTH }).notNull(),
	gpsLocationUrl: varchar('name', { length: URL_LENGTH }),
});

export const backendIdEnum = pgEnum('backendId', [
	'teatro_nacional',
	'espressivo',
	'mcj',
	'ccecr',
	'triciclo',
	'memoria_escenica',
]);

export const automaticLocationTable = pgTable('automaticLocation', {
	locationId: integer('id')
		.primaryKey()
		.references(() => locationTable.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),
	backendId: backendIdEnum('backendId').unique(),
	url: varchar('url', { length: URL_LENGTH }),
});

export const manualLocationTable = pgTable('manualLocation', {
	locationId: integer('id')
		.primaryKey()
		.references(() => locationTable.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),
	extraInformation: varchar('extra_information', { length: 400 }),
	authorEmail: varchar('email', { length: 100 }).references(() => authorTable.email, {
		onUpdate: 'cascade',
		onDelete: 'cascade',
	}),
});

export const authorTable = pgTable('author', {
	email: varchar('email', { length: 100 }).primaryKey(),
	name: varchar('name', { length: NAME_LENGTH }),
});
