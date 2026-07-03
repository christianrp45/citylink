CREATE TABLE IF NOT EXISTS "Cell" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"leaderId" uuid NOT NULL,
	"coLeaderId" uuid,
	"neighborhood" varchar(100),
	"address" text,
	"lat" varchar(20),
	"lng" varchar(20),
	"meetingDay" integer,
	"meetingTime" varchar(5),
	"targetAudience" varchar DEFAULT 'misto' NOT NULL,
	"maxMembers" integer DEFAULT 15,
	"isOpen" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CellAttendance" (
	"meetingId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"rsvpStatus" varchar DEFAULT 'no-response' NOT NULL,
	"attended" boolean,
	"respondedAt" timestamp,
	CONSTRAINT "CellAttendance_meetingId_userId_pk" PRIMARY KEY("meetingId","userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CellGuide" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meetingId" uuid NOT NULL,
	"title" text NOT NULL,
	"biblePassage" varchar(100),
	"theme" text,
	"icebreaker" text,
	"studyQuestions" json,
	"application" text,
	"prayer" text,
	"youtubeLinks" json,
	"isPublished" boolean DEFAULT false NOT NULL,
	"publishedAt" timestamp,
	"generatedByAI" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CellMeeting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cellId" uuid NOT NULL,
	"scheduledAt" timestamp NOT NULL,
	"address" text,
	"lat" varchar(20),
	"lng" varchar(20),
	"status" varchar DEFAULT 'scheduled' NOT NULL,
	"visitorCount" integer DEFAULT 0,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CellMember" (
	"cellId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"role" varchar DEFAULT 'member' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "CellMember_cellId_userId_pk" PRIMARY KEY("cellId","userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PrayerInteraction" (
	"prayerRequestId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "PrayerInteraction_prayerRequestId_userId_pk" PRIMARY KEY("prayerRequestId","userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PrayerRequest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cellId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"content" text NOT NULL,
	"isAnonymous" boolean DEFAULT false NOT NULL,
	"isAnswered" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Cell" ADD CONSTRAINT "Cell_leaderId_User_id_fk" FOREIGN KEY ("leaderId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Cell" ADD CONSTRAINT "Cell_coLeaderId_User_id_fk" FOREIGN KEY ("coLeaderId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CellAttendance" ADD CONSTRAINT "CellAttendance_meetingId_CellMeeting_id_fk" FOREIGN KEY ("meetingId") REFERENCES "public"."CellMeeting"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CellAttendance" ADD CONSTRAINT "CellAttendance_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CellGuide" ADD CONSTRAINT "CellGuide_meetingId_CellMeeting_id_fk" FOREIGN KEY ("meetingId") REFERENCES "public"."CellMeeting"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CellMeeting" ADD CONSTRAINT "CellMeeting_cellId_Cell_id_fk" FOREIGN KEY ("cellId") REFERENCES "public"."Cell"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CellMember" ADD CONSTRAINT "CellMember_cellId_Cell_id_fk" FOREIGN KEY ("cellId") REFERENCES "public"."Cell"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CellMember" ADD CONSTRAINT "CellMember_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PrayerInteraction" ADD CONSTRAINT "PrayerInteraction_prayerRequestId_PrayerRequest_id_fk" FOREIGN KEY ("prayerRequestId") REFERENCES "public"."PrayerRequest"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PrayerInteraction" ADD CONSTRAINT "PrayerInteraction_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PrayerRequest" ADD CONSTRAINT "PrayerRequest_cellId_Cell_id_fk" FOREIGN KEY ("cellId") REFERENCES "public"."Cell"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PrayerRequest" ADD CONSTRAINT "PrayerRequest_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
