CREATE TABLE IF NOT EXISTS "BibleHighlight" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"book" varchar(10) NOT NULL,
	"chapter" integer NOT NULL,
	"verse" integer NOT NULL,
	"color" varchar DEFAULT 'yellow' NOT NULL,
	"note" text,
	"version" varchar(10) DEFAULT 'nvi' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BibleHighlight" ADD CONSTRAINT "BibleHighlight_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
