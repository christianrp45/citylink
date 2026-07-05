CREATE TABLE IF NOT EXISTS "Community" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(100),
	"type" varchar DEFAULT 'other' NOT NULL,
	"description" text,
	"avatar" text,
	"address" text,
	"city" varchar(100),
	"state" varchar(50),
	"country" varchar(50) DEFAULT 'BR',
	"phone" varchar(30),
	"website" text,
	"isPublic" boolean DEFAULT true NOT NULL,
	"requireApproval" boolean DEFAULT false NOT NULL,
	"adminUserId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Community_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CommunityMember" (
	"communityId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"role" varchar DEFAULT 'member' NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL,
	"approvedAt" timestamp,
	"canPost" boolean DEFAULT true NOT NULL,
	"canInvite" boolean DEFAULT false NOT NULL,
	"canManageEvents" boolean DEFAULT false NOT NULL,
	CONSTRAINT "CommunityMember_communityId_userId_pk" PRIMARY KEY("communityId","userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ConsentLog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"module" varchar NOT NULL,
	"action" varchar NOT NULL,
	"ipAddress" varchar(20),
	"userAgent" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProximityAlert" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"nearUserId" uuid NOT NULL,
	"distanceMeters" integer NOT NULL,
	"relationContext" varchar NOT NULL,
	"sentAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserPrivacySettings" (
	"userId" uuid PRIMARY KEY NOT NULL,
	"consentDataProcessing" boolean DEFAULT false NOT NULL,
	"consentDataProcessingAt" timestamp,
	"consentLocation" boolean DEFAULT false NOT NULL,
	"consentLocationAt" timestamp,
	"consentProximityAlerts" boolean DEFAULT false NOT NULL,
	"consentProximityAlertsAt" timestamp,
	"consentVisitRequests" boolean DEFAULT false NOT NULL,
	"consentVisitRequestsAt" timestamp,
	"consentProfileVisible" boolean DEFAULT false NOT NULL,
	"consentProfileVisibleAt" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserProximityConfig" (
	"userId" uuid PRIMARY KEY NOT NULL,
	"isActive" boolean DEFAULT false NOT NULL,
	"radiusMeters" integer DEFAULT 500 NOT NULL,
	"activeWhen" varchar DEFAULT 'same_city' NOT NULL,
	"locationExpiresHours" integer DEFAULT 6 NOT NULL,
	"lastLocationAt" timestamp,
	"notifyWhenFriendNear" boolean DEFAULT true NOT NULL,
	"notifyWhenCellMemberNear" boolean DEFAULT true NOT NULL,
	"notifyWhenCommunityNear" boolean DEFAULT false NOT NULL,
	"cooldownMinutes" integer DEFAULT 60 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserVisibilityConfig" (
	"userId" uuid PRIMARY KEY NOT NULL,
	"locationVisibleTo" varchar DEFAULT 'friends' NOT NULL,
	"visitRequestFrom" varchar DEFAULT 'friends' NOT NULL,
	"chatFrom" varchar DEFAULT 'friends' NOT NULL,
	"profileVisibleTo" varchar DEFAULT 'my_community' NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "accountType" varchar DEFAULT 'individual' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Community" ADD CONSTRAINT "Community_adminUserId_User_id_fk" FOREIGN KEY ("adminUserId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CommunityMember" ADD CONSTRAINT "CommunityMember_communityId_Community_id_fk" FOREIGN KEY ("communityId") REFERENCES "public"."Community"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CommunityMember" ADD CONSTRAINT "CommunityMember_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ConsentLog" ADD CONSTRAINT "ConsentLog_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProximityAlert" ADD CONSTRAINT "ProximityAlert_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProximityAlert" ADD CONSTRAINT "ProximityAlert_nearUserId_User_id_fk" FOREIGN KEY ("nearUserId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserPrivacySettings" ADD CONSTRAINT "UserPrivacySettings_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserProximityConfig" ADD CONSTRAINT "UserProximityConfig_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserVisibilityConfig" ADD CONSTRAINT "UserVisibilityConfig_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
