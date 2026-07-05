CREATE TABLE "InviteCode" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(10) NOT NULL,
	"type" varchar(20) NOT NULL,
	"targetId" uuid NOT NULL,
	"createdBy" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"maxUses" integer,
	"usedCount" integer DEFAULT 0 NOT NULL,
	"expiresAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "InviteCode_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "InviteCode" ADD CONSTRAINT "InviteCode_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "primaryChurchId" uuid;--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_primaryChurchId_Church_id_fk" FOREIGN KEY ("primaryChurchId") REFERENCES "public"."Church"("id") ON DELETE set null ON UPDATE no action;
