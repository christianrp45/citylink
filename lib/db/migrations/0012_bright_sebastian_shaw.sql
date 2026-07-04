CREATE TABLE IF NOT EXISTS "DirectMessage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fromUserId" uuid NOT NULL,
	"toUserId" uuid NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"readAt" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_fromUserId_User_id_fk" FOREIGN KEY ("fromUserId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_toUserId_User_id_fk" FOREIGN KEY ("toUserId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
