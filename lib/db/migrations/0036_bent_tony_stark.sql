CREATE TABLE IF NOT EXISTS "BusinessRecommendation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"communityId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"comment" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CellMessage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cellId" uuid NOT NULL,
	"fromUserId" uuid NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CellVisitor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cellId" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone" varchar(30),
	"email" varchar(120),
	"notes" text,
	"addedBy" uuid,
	"becameMember" boolean DEFAULT false NOT NULL,
	"visitedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "FormacaoMatricula" (
	"turmaId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"enrolledAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "FormacaoMatricula_turmaId_userId_pk" PRIMARY KEY("turmaId","userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "FormacaoProgress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"caderno" varchar(60) NOT NULL,
	"licao" varchar(10) NOT NULL,
	"completedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "FormacaoQuizResult" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"caderno" varchar(60) NOT NULL,
	"score" integer NOT NULL,
	"total" integer NOT NULL,
	"passed" boolean NOT NULL,
	"attempt" integer DEFAULT 1 NOT NULL,
	"completedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "FormacaoTurma" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cellId" uuid NOT NULL,
	"caderno" varchar(60) NOT NULL,
	"createdBy" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "InviteCode" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(10) NOT NULL,
	"type" varchar NOT NULL,
	"targetId" uuid NOT NULL,
	"createdBy" uuid NOT NULL,
	"role" varchar DEFAULT 'member' NOT NULL,
	"maxUses" integer,
	"usedCount" integer DEFAULT 0 NOT NULL,
	"expiresAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "InviteCode_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserLocation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"label" varchar(50) NOT NULL,
	"type" varchar DEFAULT 'other' NOT NULL,
	"lat" varchar(20) NOT NULL,
	"lng" varchar(20) NOT NULL,
	"isActive" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserMission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"action" varchar(50) NOT NULL,
	"weekKey" varchar(10) NOT NULL,
	"completedAt" timestamp,
	"pointsAwarded" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserPoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"level" varchar(20) DEFAULT 'semente' NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "UserPoints_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserTalent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Cell" ADD COLUMN "entryMode" varchar DEFAULT 'invite_only' NOT NULL;--> statement-breakpoint
ALTER TABLE "CellGuide" ADD COLUMN "leaderNotes" text;--> statement-breakpoint
ALTER TABLE "Friendship" ADD COLUMN "circle" varchar DEFAULT 'friends' NOT NULL;--> statement-breakpoint
ALTER TABLE "PrayerInteraction" ADD COLUMN "emoji" varchar(10) DEFAULT '🙏' NOT NULL;--> statement-breakpoint
ALTER TABLE "TestimonialLike" ADD COLUMN "emoji" varchar(10) DEFAULT '❤️' NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "primaryChurchId" uuid;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "birthDate" date;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "referredBy" uuid;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "personalInviteCode" varchar(10);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BusinessRecommendation" ADD CONSTRAINT "BusinessRecommendation_communityId_Community_id_fk" FOREIGN KEY ("communityId") REFERENCES "public"."Community"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BusinessRecommendation" ADD CONSTRAINT "BusinessRecommendation_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CellMessage" ADD CONSTRAINT "CellMessage_cellId_Cell_id_fk" FOREIGN KEY ("cellId") REFERENCES "public"."Cell"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CellMessage" ADD CONSTRAINT "CellMessage_fromUserId_User_id_fk" FOREIGN KEY ("fromUserId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CellVisitor" ADD CONSTRAINT "CellVisitor_cellId_Cell_id_fk" FOREIGN KEY ("cellId") REFERENCES "public"."Cell"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CellVisitor" ADD CONSTRAINT "CellVisitor_addedBy_User_id_fk" FOREIGN KEY ("addedBy") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FormacaoMatricula" ADD CONSTRAINT "FormacaoMatricula_turmaId_FormacaoTurma_id_fk" FOREIGN KEY ("turmaId") REFERENCES "public"."FormacaoTurma"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FormacaoMatricula" ADD CONSTRAINT "FormacaoMatricula_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FormacaoProgress" ADD CONSTRAINT "FormacaoProgress_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FormacaoQuizResult" ADD CONSTRAINT "FormacaoQuizResult_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FormacaoTurma" ADD CONSTRAINT "FormacaoTurma_cellId_Cell_id_fk" FOREIGN KEY ("cellId") REFERENCES "public"."Cell"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FormacaoTurma" ADD CONSTRAINT "FormacaoTurma_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "InviteCode" ADD CONSTRAINT "InviteCode_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserMission" ADD CONSTRAINT "UserMission_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserPoints" ADD CONSTRAINT "UserPoints_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserTalent" ADD CONSTRAINT "UserTalent_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
