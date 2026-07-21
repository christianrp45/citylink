-- Rastreamento de indicações e código pessoal de convite por usuário
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredBy" uuid REFERENCES "User"("id") ON DELETE SET NULL;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "personalInviteCode" varchar(10) UNIQUE;
