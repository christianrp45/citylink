/**
 * Script de ingestão do corpus teológico para o RAG do Teo.
 *
 * Execução (uma vez após migração 0032 aplicada):
 *   npx tsx scripts/ingest-theology.ts
 *
 * Pré-requisitos:
 *   - POSTGRES_URL no .env.local
 *   - GEMINI_API_KEY no .env.local  (https://aistudio.google.com → Get API Key)
 */

import 'dotenv/config';
import postgres from 'postgres';
import { THEOLOGICAL_CORPUS } from '../lib/ai/theological-corpus';

const sql = postgres(process.env.POSTGRES_URL!);

async function embedText(text: string): Promise<number[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY não configurada no .env.local');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: { parts: [{ text }] } }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini HTTP ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.embedding.values as number[];
}

async function main() {
  console.log(`\nIngestão teológica — ${THEOLOGICAL_CORPUS.length} chunks\n`);

  for (const chunk of THEOLOGICAL_CORPUS) {
    process.stdout.write(`  • ${chunk.id} ... `);

    // Título + conteúdo juntos = embedding mais rico em contexto
    const textToEmbed = `${chunk.title}\n\n${chunk.content}`;
    const embedding = await embedText(textToEmbed);

    await sql`
      INSERT INTO "TheologicalChunk" (id, topic, title, content, sources, embedding, "updatedAt")
      VALUES (
        ${chunk.id},
        ${chunk.topic},
        ${chunk.title},
        ${chunk.content},
        ${JSON.stringify(chunk.sources)}::jsonb,
        ${JSON.stringify(embedding)}::vector,
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        topic       = EXCLUDED.topic,
        title       = EXCLUDED.title,
        content     = EXCLUDED.content,
        sources     = EXCLUDED.sources,
        embedding   = EXCLUDED.embedding,
        "updatedAt" = NOW()
    `;

    console.log('✓');
    // Pausa de 1.1s entre requests (Gemini free tier: 60 req/min)
    await new Promise((r) => setTimeout(r, 1100));
  }

  console.log('\nIngestão concluída!\n');
  await sql.end();
}

main().catch((err) => {
  console.error('Erro na ingestão:', err);
  process.exit(1);
});
