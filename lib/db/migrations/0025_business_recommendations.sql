CREATE TABLE IF NOT EXISTS "BusinessRecommendation" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "communityId" uuid NOT NULL REFERENCES "Community"("id") ON DELETE CASCADE,
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "comment" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "BusinessRecommendation_communityId_userId_unique" UNIQUE("communityId","userId")
);
