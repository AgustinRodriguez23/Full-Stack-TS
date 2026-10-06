ALTER TABLE "pins" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pins" DROP COLUMN "category";--> statement-breakpoint
DROP TYPE "public"."pin_category";