-- Pontos acumulados do usuário
CREATE TABLE "UserPoints" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "total" integer NOT NULL DEFAULT 0,
  "level" varchar(20) NOT NULL DEFAULT 'semente',
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  UNIQUE ("userId")
);

-- Missões semanais por usuário
CREATE TABLE "UserMission" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "action" varchar(50) NOT NULL,
  "weekKey" varchar(10) NOT NULL, -- ex: "2026-W30"
  "completedAt" timestamp,
  "pointsAwarded" integer NOT NULL DEFAULT 0,
  UNIQUE ("userId", "action", "weekKey")
);
