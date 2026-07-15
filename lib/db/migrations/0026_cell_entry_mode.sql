-- Migration 0026: adiciona entryMode à tabela Cell
-- 'open'        = qualquer pessoa pode entrar diretamente
-- 'invite_only' = somente via código de convite (padrão)

ALTER TABLE "Cell"
  ADD COLUMN "entryMode" varchar DEFAULT 'invite_only' NOT NULL;
