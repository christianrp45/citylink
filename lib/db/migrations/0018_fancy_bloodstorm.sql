CREATE TABLE IF NOT EXISTS "HospitalityWindow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"startsAt" timestamp NOT NULL,
	"endsAt" timestamp NOT NULL,
	"radiusMeters" integer DEFAULT 5000 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "HospitalityWindow" ADD CONSTRAINT "HospitalityWindow_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
