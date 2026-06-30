CREATE TYPE "public"."feedback_value" AS ENUM('like', 'dislike');--> statement-breakpoint
CREATE TYPE "public"."formality" AS ENUM('casual', 'smart_casual', 'formal', 'sport');--> statement-breakpoint
CREATE TYPE "public"."garment_category" AS ENUM('top', 'bottom', 'dress', 'outerwear', 'footwear', 'accessory');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('female', 'male', 'non_binary', 'prefer_not_to_say');--> statement-breakpoint
CREATE TYPE "public"."outfit_status" AS ENUM('suggested', 'saved', 'worn');--> statement-breakpoint
CREATE TYPE "public"."season" AS ENUM('spring', 'summer', 'autumn', 'winter');--> statement-breakpoint
CREATE TABLE "account" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"outfit_id" uuid,
	"garment_id" uuid,
	"value" "feedback_value" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "garment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"image_url" text NOT NULL,
	"category" "garment_category" NOT NULL,
	"subcategory" text,
	"primary_color" text,
	"colors" text[],
	"pattern" text,
	"formality" "formality",
	"seasons" "season"[],
	"material" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outfit_garment" (
	"outfit_id" uuid NOT NULL,
	"garment_id" uuid NOT NULL,
	"role" text,
	CONSTRAINT "outfit_garment_outfit_id_garment_id_pk" PRIMARY KEY("outfit_id","garment_id")
);
--> statement-breakpoint
CREATE TABLE "outfit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"occasion" text,
	"context" jsonb,
	"explanation" text,
	"status" "outfit_status" DEFAULT 'suggested' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"gender" "gender",
	"preferred_styles" text[],
	"sizes" jsonb,
	"district" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"email_verified" timestamp,
	"image" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_token" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_outfit_id_outfit_id_fk" FOREIGN KEY ("outfit_id") REFERENCES "public"."outfit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_garment_id_garment_id_fk" FOREIGN KEY ("garment_id") REFERENCES "public"."garment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garment" ADD CONSTRAINT "garment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outfit_garment" ADD CONSTRAINT "outfit_garment_outfit_id_outfit_id_fk" FOREIGN KEY ("outfit_id") REFERENCES "public"."outfit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outfit_garment" ADD CONSTRAINT "outfit_garment_garment_id_garment_id_fk" FOREIGN KEY ("garment_id") REFERENCES "public"."garment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outfit" ADD CONSTRAINT "outfit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;