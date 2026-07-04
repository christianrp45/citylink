CREATE TABLE IF NOT EXISTS "Friendship" (
	"userId" uuid NOT NULL,
	"friendId" uuid NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Friendship_userId_friendId_pk" PRIMARY KEY("userId","friendId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "VisitRequest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fromUserId" uuid NOT NULL,
	"toUserId" uuid NOT NULL,
	"message" text,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"respondedAt" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_friendId_User_id_fk" FOREIGN KEY ("friendId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "VisitRequest" ADD CONSTRAINT "VisitRequest_fromUserId_User_id_fk" FOREIGN KEY ("fromUserId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "VisitRequest" ADD CONSTRAINT "VisitRequest_toUserId_User_id_fk" FOREIGN KEY ("toUserId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
