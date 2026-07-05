ALTER TABLE "Cell" ADD COLUMN "communityId" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Cell" ADD CONSTRAINT "Cell_communityId_Community_id_fk" FOREIGN KEY ("communityId") REFERENCES "public"."Community"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
