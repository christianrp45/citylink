-- UserBlock e as colunas de push em UserPrivacySettings já existem em produção
-- (aplicadas fora do fluxo de migração em algum momento) — removidas daqui pra
-- não colidir. Esta migração cuida só das colunas novas de streak.
ALTER TABLE "UserPoints" ADD COLUMN IF NOT EXISTS "currentStreak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "UserPoints" ADD COLUMN IF NOT EXISTS "longestStreak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "UserPoints" ADD COLUMN IF NOT EXISTS "lastActivityDate" date;
