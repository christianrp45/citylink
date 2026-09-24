CREATE TABLE IF NOT EXISTS "UserBadge" (
	"userId" uuid NOT NULL,
	"badge" varchar(50) NOT NULL,
	"unlockedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "UserBadge_userId_badge_pk" PRIMARY KEY("userId","badge")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
