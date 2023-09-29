ALTER TABLE "activity" DROP CONSTRAINT "activity_title_datetime_location_id_activity_type_id";--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_title_datetime_location_id_activity_type_id_unique" UNIQUE("title","datetime","location_id","activity_type_id");