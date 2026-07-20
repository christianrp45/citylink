CREATE TABLE "CellMessage" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "cellId" uuid NOT NULL REFERENCES "Cell"("id") ON DELETE CASCADE,
  "fromUserId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "content" text NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now()
);
