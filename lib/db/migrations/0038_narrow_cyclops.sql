CREATE TABLE IF NOT EXISTS "UserBlock" (
	"blockerId" text NOT NULL,
	"blockedId" text NOT NULL,
	CONSTRAINT "UserBlock_blockerId_blockedId_pk" PRIMARY KEY("blockerId","blockedId")
);
--> statement-breakpoint
ALTER TABLE "UserPoints" ADD COLUMN "currentStreak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "UserPoints" ADD COLUMN "longestStreak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "UserPoints" ADD COLUMN "lastActivityDate" date;--> statement-breakpoint
ALTER TABLE "UserPrivacySettings" ADD COLUMN "pushVisits" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "UserPrivacySettings" ADD COLUMN "pushMessages" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "UserPrivacySettings" ADD COLUMN "pushFriendRequests" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "UserPrivacySettings" ADD COLUMN "pushMissions" boolean DEFAULT true NOT NULL;