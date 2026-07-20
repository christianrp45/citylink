import { tool } from 'ai';
import { z } from 'zod';
import { getVerseOfDay } from '@/lib/bible/verses-of-day';
import { searchTheology } from '@/lib/ai/theological-search';

const CDN_URL =
  'https://cdn.jsdelivr.net/gh/thiagobodruk/biblia/json/nvi.json';
const FALLBACK_URL =
  'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/nvi.json';

type BibleBook = { abbrev: string; name: string; chapters: string[][] };

async function fetchBible(): Promise<BibleBook[] | null> {
  for (const url of [CDN_URL, FALLBACK_URL]) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 86_400 },
        signal: AbortSignal.timeout(15_000),
      });
      if (res.ok) return res.json();
    } catch {
      // tenta próxima fonte
    }
  }
  return null;
}

/**
 * Busca um capítulo inteiro da Bíblia (NVI).
 * Útil para Teo citar versículos exatos ao explicar um texto.
 */
export const buscarCapitulo = tool({
  description:
    'Busca um capítulo da Bíblia NVI para citar versículos com precisão. ' +
    'Use sempre que o usuário mencionar uma passagem específica e você precisar do texto exato.',
  inputSchema: z.object({
    abbrev: z
      .string()
      .describe(
        "Abreviação do livro em português (ex: 'gn', 'ex', 'sl', 'mt', 'jo', 'rm', 'ap'). " +
        "Use 'atos' para Atos dos Apóstolos.",
      ),
    chapter: z
      .number()
      .int()
      .min(1)
      .describe('Número do capítulo a buscar (começa em 1)'),
  }),
  execute: async ({ abbrev, chapter }) => {
    const bible = await fetchBible();
    if (!bible) return { error: 'Bíblia indisponível no momento.' };

    const book = bible.find(
      (b) => b.abbrev === abbrev.toLowerCase().trim(),
    );
    if (!book) {
      return {
        error: `Livro '${abbrev}' não encontrado. Verifique a abreviação (ex: 'gn', 'jo', 'rm').`,
      };
    }

    const verses = book.chapters[chapter - 1];
    if (!verses) {
      return {
        error: `${book.name} não tem capítulo ${chapter} (total: ${book.chapters.length}).`,
      };
    }

    return {
      book: book.name,
      chapter,
      totalChapters: book.chapters.length,
      text: verses
        .map((v, i) => `${i + 1} ${v}`)
        .join('\n'),
    };
  },
});

/**
 * Busca informações teológicas na base de conhecimento do Teo (RAG).
 * Fontes: A.H. Strong, Vine's Dictionary, Spurgeon, 1689 Baptist Confession,
 *         A.T. Robertson, Declaração Doutrinária da CBB.
 */
export const buscarTeologia = tool({
  description:
    'Busca na base de conhecimento teológico do Teo (Strong, Vine\'s, Spurgeon, Confissão Batista de 1689, Robertson, CBB). ' +
    'Use quando o usuário perguntar sobre doutrinas, conceitos teológicos, palavras gregas/hebraicas, ' +
    'prática cristã, eclesiologia batista ou qualquer tema que se beneficie de fontes teológicas sólidas.',
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        'A pergunta ou tema teológico a buscar. Seja específico: prefira ' +
        '"o que é justificação pela fé" a "me fale sobre salvação".',
      ),
  }),
  execute: async ({ query }) => {
    const results = searchTheology(query, 3);
    if (results.length === 0) {
      return { error: 'Nenhum resultado encontrado para este tema.' };
    }
    return {
      results: results.map((r) => ({
        title: r.title,
        topic: r.topic,
        content: r.content,
        sources: r.sources,
      })),
    };
  },
});

/**
 * Retorna o versículo do dia atual do Emetis.
 */
export const versiculoDoDia = tool({
  description:
    'Retorna o versículo do dia atual exibido no app Emetis. ' +
    'Use quando o usuário perguntar sobre o versículo do dia ou quiser refletir sobre ele.',
  inputSchema: z.object({}),
  execute: async () => {
    return getVerseOfDay();
  },
});
