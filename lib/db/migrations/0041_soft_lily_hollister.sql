ALTER TABLE "CellMember" ADD COLUMN "approvedAt" timestamp;
--> statement-breakpoint
-- Backfill: quem já é membro ativo hoje continua com acesso — só pedidos
-- NOVOS (feitos depois deste deploy) passam a exigir aprovação do líder.
UPDATE "CellMember" SET "approvedAt" = "joinedAt" WHERE "isActive" = true;