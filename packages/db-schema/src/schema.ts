import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

const URL_LENGTH = 300;
const NAME_LENGTH = 150;

export const activityTable = pgTable('activity', {
	id: serial('id').primaryKey(),
	title: varchar('title', { length: NAME_LENGTH }).notNull(),
	description: varchar('description', { length: 400 }).notNull(),
	source: varchar('source', { length: URL_LENGTH }).notNull(),
	datetime: timestamp('datetime').notNull(),
	locationId: integer('location_id').references(() => locationTable.id, {
		onUpdate: 'cascade',
		onDelete: 'no action',
	}),
	activityTypeId: integer('activity_type_id').references(() => activityTypeTable.id, {
		onUpdate: 'cascade',
		onDelete: 'no action',
	}),
});

export const activityTypeTable = pgTable('activity_type', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: NAME_LENGTH }).notNull().unique(),
});

export const locationTable = pgTable('location', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: NAME_LENGTH }).notNull().unique(),
	url: varchar('url', { length: URL_LENGTH }).notNull().unique(),
});
