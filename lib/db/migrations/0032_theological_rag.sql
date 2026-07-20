-- Habilita a extensão pgvector (necessário apenas uma vez por banco)
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabela de chunks teológicos com embeddings para RAG do Teo
CREATE TABLE IF NOT EXISTS "TheologicalChunk" (
  "id"        TEXT         PRIMARY KEY,           -- slug único (ex: 'sot-graca-irresistivel')
  "topic"     VARCHAR(100) NOT NULL,              -- categoria (Soteriologia, Cristologia, etc.)
  "title"     VARCHAR(200) NOT NULL,              -- título do artigo
  "content"   TEXT         NOT NULL,              -- texto do chunk
  "sources"   JSONB        NOT NULL DEFAULT '[]', -- array de referências bibliográficas
  "embedding" vector(768),                        -- Gemini text-embedding-004 (768 dims)
  "updatedAt" TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Índice HNSW para busca por similaridade coseno (muito mais rápido que força bruta)
CREATE INDEX IF NOT EXISTS theological_chunk_embedding_idx
  ON "TheologicalChunk"
  USING hnsw ("embedding" vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
