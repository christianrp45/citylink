CREATE TABLE "UserLocation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"label" varchar(50) NOT NULL,
	"type" varchar(20) DEFAULT 'other' NOT NULL,
	"lat" varchar(20) NOT NULL,
	"lng" varchar(20) NOT NULL,
	"isActive" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
