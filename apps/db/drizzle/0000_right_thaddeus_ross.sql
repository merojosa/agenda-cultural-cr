DO $$ BEGIN
 CREATE TYPE "backend_id" AS ENUM('teatro_nacional', 'espressivo', 'mcj', 'ccecr', 'triciclo', 'memoria_escenica');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(150) NOT NULL,
	"description" text,
	"activity_url" varchar(300),
	"datetime" timestamp NOT NULL,
	"location_id" integer NOT NULL,
	"activity_type_id" integer NOT NULL,
	CONSTRAINT "activity_title_datetime_location_id_activity_type_id_unique" UNIQUE("title","datetime","location_id","activity_type_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activity_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	CONSTRAINT "activity_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "author" (
	"email" varchar(100) PRIMARY KEY NOT NULL,
	"name" varchar(150)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "automatic_location" (
	"id" integer PRIMARY KEY NOT NULL,
	"backend_id" "backend_id",
	"url" varchar(300),
	CONSTRAINT "automatic_location_backend_id_unique" UNIQUE("backend_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "location" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"gps_location_url" varchar(300)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "manual_location" (
	"location_id" integer PRIMARY KEY NOT NULL,
	"extra_information" varchar(400),
	"author_email" varchar(100)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity" ADD CONSTRAINT "activity_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity" ADD CONSTRAINT "activity_activity_type_id_activity_type_id_fk" FOREIGN KEY ("activity_type_id") REFERENCES "activity_type"("id") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automatic_location" ADD CONSTRAINT "automatic_location_id_location_id_fk" FOREIGN KEY ("id") REFERENCES "location"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "manual_location" ADD CONSTRAINT "manual_location_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "manual_location" ADD CONSTRAINT "manual_location_author_email_author_email_fk" FOREIGN KEY ("author_email") REFERENCES "author"("email") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
