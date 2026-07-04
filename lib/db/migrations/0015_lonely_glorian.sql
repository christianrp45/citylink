CREATE TABLE IF NOT EXISTS "Church" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"denomination" varchar(100),
	"description" text,
	"address" text,
	"lat" varchar(20),
	"lng" varchar(20),
	"phone" varchar(30),
	"schedule" text,
	"pastor" varchar(100),
	"members" integer DEFAULT 0,
	"adminUserId" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PrayerGroup" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"schedule" varchar(100),
	"topic" varchar(100),
	"isOnline" boolean DEFAULT false NOT NULL,
	"creatorId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PrayerGroupMember" (
	"groupId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "PrayerGroupMember_groupId_userId_pk" PRIMARY KEY("groupId","userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Testimonial" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TestimonialComment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"testimonialId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TestimonialLike" (
	"testimonialId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "TestimonialLike_testimonialId_userId_pk" PRIMARY KEY("testimonialId","userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "VolunteerEnrollment" (
	"opportunityId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"enrolledAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "VolunteerEnrollment_opportunityId_userId_pk" PRIMARY KEY("opportunityId","userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "VolunteerOpportunity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" varchar(100),
	"address" text,
	"lat" varchar(20),
	"lng" varchar(20),
	"date" timestamp NOT NULL,
	"spots" integer DEFAULT 10 NOT NULL,
	"organizerName" varchar(100),
	"creatorId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Church" ADD CONSTRAINT "Church_adminUserId_User_id_fk" FOREIGN KEY ("adminUserId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PrayerGroup" ADD CONSTRAINT "PrayerGroup_creatorId_User_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PrayerGroupMember" ADD CONSTRAINT "PrayerGroupMember_groupId_PrayerGroup_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."PrayerGroup"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PrayerGroupMember" ADD CONSTRAINT "PrayerGroupMember_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TestimonialComment" ADD CONSTRAINT "TestimonialComment_testimonialId_Testimonial_id_fk" FOREIGN KEY ("testimonialId") REFERENCES "public"."Testimonial"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TestimonialComment" ADD CONSTRAINT "TestimonialComment_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TestimonialLike" ADD CONSTRAINT "TestimonialLike_testimonialId_Testimonial_id_fk" FOREIGN KEY ("testimonialId") REFERENCES "public"."Testimonial"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TestimonialLike" ADD CONSTRAINT "TestimonialLike_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "VolunteerEnrollment" ADD CONSTRAINT "VolunteerEnrollment_opportunityId_VolunteerOpportunity_id_fk" FOREIGN KEY ("opportunityId") REFERENCES "public"."VolunteerOpportunity"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "VolunteerEnrollment" ADD CONSTRAINT "VolunteerEnrollment_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "VolunteerOpportunity" ADD CONSTRAINT "VolunteerOpportunity_creatorId_User_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
