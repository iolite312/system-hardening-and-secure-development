ALTER TABLE "comics" DROP CONSTRAINT "comics_created_by_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "comics" ADD COLUMN "serie" varchar(200) NOT NULL;--> statement-breakpoint
ALTER TABLE "comics" ADD COLUMN "number" varchar(200) NOT NULL;--> statement-breakpoint
ALTER TABLE "comics" DROP COLUMN "author";--> statement-breakpoint
ALTER TABLE "comics" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "comics" DROP COLUMN "cover_url";--> statement-breakpoint
ALTER TABLE "comics" DROP COLUMN "release_year";--> statement-breakpoint
ALTER TABLE "comics" DROP COLUMN "created_by_id";