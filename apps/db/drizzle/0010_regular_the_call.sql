ALTER TABLE "activity" RENAME TO "event";--> statement-breakpoint
ALTER TABLE "activity_type" RENAME TO "event_type";--> statement-breakpoint
ALTER TABLE "event" RENAME COLUMN "activity_type_id" TO "event_type_id";--> statement-breakpoint
ALTER TABLE "event" RENAME COLUMN "activity_url" TO "event_url";--> statement-breakpoint
ALTER TABLE "event" DROP CONSTRAINT "activity_title_date_time_location_id_activity_type_id_unique";--> statement-breakpoint
ALTER TABLE "event_type" DROP CONSTRAINT "activity_type_name_unique";--> statement-breakpoint
ALTER TABLE "event" DROP CONSTRAINT "activity_location_id_location_id_fk";
--> statement-breakpoint
ALTER TABLE "event" DROP CONSTRAINT "activity_activity_type_id_activity_type_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event" ADD CONSTRAINT "event_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event" ADD CONSTRAINT "event_event_type_id_event_type_id_fk" FOREIGN KEY ("event_type_id") REFERENCES "event_type"("id") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_title_date_time_location_id_event_type_id_unique" UNIQUE("title","date","time","location_id","event_type_id");--> statement-breakpoint
ALTER TABLE "event_type" ADD CONSTRAINT "event_type_name_unique" UNIQUE("name");