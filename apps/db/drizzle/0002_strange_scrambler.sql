ALTER TABLE "activity" DROP CONSTRAINT "activity_title_datetime_location_id_activity_type_id_unique";--> statement-breakpoint
ALTER TABLE "activity" DROP CONSTRAINT "activity_location_id_location_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity" ADD CONSTRAINT "activity_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "activity" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_title_datetime_location_id_activity_type_id" PRIMARY KEY("title","datetime","location_id","activity_type_id");