CREATE TABLE IF NOT EXISTS "ReadingPlanProgress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"planSlug" varchar(100) NOT NULL,
	"completedDays" json DEFAULT '[]'::json NOT NULL,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"lastReadAt" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ReadingPlanProgress" ADD CONSTRAINT "ReadingPlanProgress_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
