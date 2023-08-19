CREATE TABLE IF NOT EXISTS "activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(150) NOT NULL,
	"description" varchar(400) NOT NULL,
	"source" varchar(300) NOT NULL,
	"datetime" timestamp NOT NULL,
	"location_id" integer,
	"activity_type_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activity_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	CONSTRAINT "activity_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "location" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"url" varchar(300) NOT NULL,
	CONSTRAINT "location_name_unique" UNIQUE("name"),
	CONSTRAINT "location_url_unique" UNIQUE("url")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity" ADD CONSTRAINT "activity_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity" ADD CONSTRAINT "activity_activity_type_id_activity_type_id_fk" FOREIGN KEY ("activity_type_id") REFERENCES "activity_type"("id") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
