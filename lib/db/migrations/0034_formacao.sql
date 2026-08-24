-- Progresso das lições de formação por usuário
CREATE TABLE IF NOT EXISTS "FormacaoProgress" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "caderno" varchar(60) NOT NULL,
  "licao" varchar(10) NOT NULL,
  "completedAt" timestamp DEFAULT now() NOT NULL
);

-- Resultado do quiz de cada caderno
CREATE TABLE IF NOT EXISTS "FormacaoQuizResult" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "caderno" varchar(60) NOT NULL,
  "score" integer NOT NULL,
  "total" integer NOT NULL,
  "passed" boolean NOT NULL,
  "attempt" integer NOT NULL DEFAULT 1,
  "completedAt" timestamp DEFAULT now() NOT NULL
);

-- Índices para queries de progresso
CREATE INDEX IF NOT EXISTS "formacao_progress_user_caderno"
  ON "FormacaoProgress" ("userId", "caderno");

CREATE INDEX IF NOT EXISTS "formacao_quiz_user_caderno"
  ON "FormacaoQuizResult" ("userId", "caderno");
