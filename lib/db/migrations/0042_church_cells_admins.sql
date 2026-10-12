ALTER TABLE "Cell" ADD COLUMN "churchId" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Cell" ADD CONSTRAINT "Cell_churchId_Church_id_fk" FOREIGN KEY ("churchId") REFERENCES "public"."Church"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE "ChurchAdmin" (
  "churchId" uuid NOT NULL REFERENCES "Church"("id"),
  "userId" uuid NOT NULL REFERENCES "User"("id"),
  "createdAt" timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY ("churchId", "userId")
);
