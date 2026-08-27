CREATE TABLE IF NOT EXISTS "UserBlock" (
  "blockerId" text NOT NULL,
  "blockedId" text NOT NULL,
  PRIMARY KEY ("blockerId", "blockedId")
);
