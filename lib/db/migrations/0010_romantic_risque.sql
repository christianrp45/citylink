ALTER TABLE "User" ADD COLUMN "name" varchar(100);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "phone" varchar(20);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "profession" varchar(100);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "avatar" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "availabilityStatus" varchar DEFAULT 'mesa-posta';--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "lat" varchar(20);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "lng" varchar(20);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "updatedAt" timestamp DEFAULT now();