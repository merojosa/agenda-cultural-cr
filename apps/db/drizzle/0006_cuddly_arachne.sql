ALTER TABLE "activity" RENAME COLUMN "datetime" TO "date";--> statement-breakpoint
ALTER TABLE "activity" DROP CONSTRAINT "activity_title_datetime_location_id_activity_type_id_unique";--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "time" time;--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_title_date_time_location_id_activity_type_id_unique" UNIQUE("title","date","time","location_id","activity_type_id");