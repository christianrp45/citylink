-- Turma de formação vinculada a uma célula
CREATE TABLE IF NOT EXISTS "FormacaoTurma" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "cellId" uuid NOT NULL REFERENCES "Cell"("id") ON DELETE CASCADE,
  "caderno" varchar(60) NOT NULL,
  "createdBy" uuid NOT NULL REFERENCES "User"("id"),
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "active" boolean NOT NULL DEFAULT true
);

-- Matrícula do membro em uma turma
CREATE TABLE IF NOT EXISTS "FormacaoMatricula" (
  "turmaId" uuid NOT NULL REFERENCES "FormacaoTurma"("id") ON DELETE CASCADE,
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "enrolledAt" timestamp DEFAULT now() NOT NULL,
  PRIMARY KEY ("turmaId", "userId")
);

CREATE INDEX IF NOT EXISTS "formacao_turma_cell"
  ON "FormacaoTurma" ("cellId");

CREATE INDEX IF NOT EXISTS "formacao_matricula_user"
  ON "FormacaoMatricula" ("userId");
