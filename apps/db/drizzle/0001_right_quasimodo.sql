DO $$ BEGIN
 CREATE TYPE "backendId" AS ENUM('teatro_nacional', 'espressivo', 'mcj', 'ccecr', 'triciclo', 'memoria_escenica');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "author" (
	"email" varchar(100) PRIMARY KEY NOT NULL,
	"name" varchar(150)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "automaticLocation" (
	"id" integer PRIMARY KEY NOT NULL,
	"backendId" "backendId",
	"url" varchar(300),
	CONSTRAINT "automaticLocation_backendId_unique" UNIQUE("backendId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "manualLocation" (
	"id" integer PRIMARY KEY NOT NULL,
	"extra_information" varchar(400),
	"email" varchar(100)
);
--> statement-breakpoint
ALTER TABLE "activity" RENAME COLUMN "source" TO "activityUrl";--> statement-breakpoint
ALTER TABLE "location" DROP CONSTRAINT "location_name_unique";--> statement-breakpoint
ALTER TABLE "location" DROP CONSTRAINT "location_url_unique";--> statement-breakpoint
ALTER TABLE "activity" DROP CONSTRAINT "activity_location_id_location_id_fk";
--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "description" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "location_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "activity_type_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "activityUrl" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "location" ALTER COLUMN "name" SET DATA TYPE varchar(300);--> statement-breakpoint
ALTER TABLE "location" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity" ADD CONSTRAINT "activity_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "location" DROP COLUMN IF EXISTS "url";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automaticLocation" ADD CONSTRAINT "automaticLocation_id_location_id_fk" FOREIGN KEY ("id") REFERENCES "location"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "manualLocation" ADD CONSTRAINT "manualLocation_id_location_id_fk" FOREIGN KEY ("id") REFERENCES "location"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "manualLocation" ADD CONSTRAINT "manualLocation_email_author_email_fk" FOREIGN KEY ("email") REFERENCES "author"("email") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_title_datetime_location_id_activity_type_id_unique" UNIQUE("title","datetime","location_id","activity_type_id");