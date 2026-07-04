CREATE TABLE IF NOT EXISTS "AlertResponse" (
	"alertId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"message" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "AlertResponse_alertId_userId_pk" PRIMARY KEY("alertId","userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" varchar DEFAULT 'social' NOT NULL,
	"address" text,
	"lat" varchar(20),
	"lng" varchar(20),
	"date" timestamp NOT NULL,
	"organizerId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "EventAttendee" (
	"eventId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "EventAttendee_eventId_userId_pk" PRIMARY KEY("eventId","userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SamaritanAlert" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"type" varchar DEFAULT 'practical_help' NOT NULL,
	"description" text NOT NULL,
	"lat" varchar(20),
	"lng" varchar(20),
	"status" varchar DEFAULT 'open' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AlertResponse" ADD CONSTRAINT "AlertResponse_alertId_SamaritanAlert_id_fk" FOREIGN KEY ("alertId") REFERENCES "public"."SamaritanAlert"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "AlertResponse" ADD CONSTRAINT "AlertResponse_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_User_id_fk" FOREIGN KEY ("organizerId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_eventId_Event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SamaritanAlert" ADD CONSTRAINT "SamaritanAlert_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
