ALTER TABLE "garment" ADD COLUMN "original_image_url" text;--> statement-breakpoint
ALTER TABLE "garment" ADD COLUMN "is_favourite" boolean DEFAULT false NOT NULL;