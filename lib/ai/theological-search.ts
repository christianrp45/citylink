/**
 * Busca BM25 local no corpus teológico — sem API, sem banco, custo zero.
 *
 * BM25 (Best Match 25) é o mesmo algoritmo de relevância do Elasticsearch.
 * Para 30–60 chunks estáticos, supera embeddings em precisão para termos técnicos
 * teológicos (justificação, sanctificação, batismo, etc.) porque não depende de
 * representações vetoriais treinadas em textos gerais.
 */

import { THEOLOGICAL_CORPUS, type TheologicalChunk } from './theological-corpus';

// ─── Tokenização ──────────────────────────────────────────────────────────────

const STOPWORDS_PT = new Set([
  'a','ao','aos','as','com','da','das','de','do','dos','e','é','em',
  'na','nas','no','nos','o','os','ou','para','pela','pelas','pelo',
  'pelos','por','que','se','uma','um','uns','umas','à','às','isso',
  'isto','ele','ela','eles','elas','seu','sua','seus','suas','mas',
  'não','nos','lhe','lhes','mais','como','também','já','quando','ser',
  'foi','são','está','este','esta','estes','estas','todo','toda',
  'todos','todas','isso','aqui','ali','há','tem','ter','entre',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // remove acentos
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS_PT.has(t));
}

// ─── Construção do índice invertido ──────────────────────────────────────────

type InvertedIndex = Map<string, Map<string, number>>; // term → {docId → tf}

let _index: InvertedIndex | null = null;
let _docLengths: Map<string, number> | null = null;
let _avgDocLength = 0;

function buildIndex() {
  if (_index) return;

  const index: InvertedIndex = new Map();
  const docLengths = new Map<string, number>();
  let totalTokens = 0;

  for (const chunk of THEOLOGICAL_CORPUS) {
    const tokens = tokenize(`${chunk.title} ${chunk.topic} ${chunk.content}`);
    docLengths.set(chunk.id, tokens.length);
    totalTokens += tokens.length;

    const tf = new Map<string, number>();
    for (const tok of tokens) {
      tf.set(tok, (tf.get(tok) ?? 0) + 1);
    }

    for (const [term, count] of tf) {
      if (!index.has(term)) index.set(term, new Map());
      index.get(term)!.set(chunk.id, count);
    }
  }

  _index = index;
  _docLengths = docLengths;
  _avgDocLength = totalTokens / THEOLOGICAL_CORPUS.length;
}

// ─── Scoring BM25 ────────────────────────────────────────────────────────────

const K1 = 1.5;  // saturação de frequência do termo
const B  = 0.75; // normalização por comprimento do documento

function bm25Score(term: string, docId: string): number {
  if (!_index || !_docLengths) return 0;

  const postings = _index.get(term);
  if (!postings) return 0;

  const N = THEOLOGICAL_CORPUS.length;
  const df = postings.size;
  const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);

  const tf = postings.get(docId) ?? 0;
  if (tf === 0) return 0;

  const dl = _docLengths.get(docId) ?? _avgDocLength;
  const norm = (K1 * (tf * (1 + K1))) / (tf + K1 * (1 - B + B * (dl / _avgDocLength)));

  return idf * norm;
}

// ─── API pública ──────────────────────────────────────────────────────────────

export type SearchResult = TheologicalChunk & { score: number };

/**
 * Retorna os chunks mais relevantes para a query, ordenados por BM25.
 * @param query  Pergunta ou tema teológico em PT-BR
 * @param topK   Quantos resultados retornar (padrão 3)
 */
export function searchTheology(query: string, topK = 3): SearchResult[] {
  buildIndex();

  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];

  const scores = new Map<string, number>();
  for (const chunk of THEOLOGICAL_CORPUS) {
    scores.set(chunk.id, 0);
  }

  for (const term of queryTerms) {
    for (const chunk of THEOLOGICAL_CORPUS) {
      const s = bm25Score(term, chunk.id);
      if (s > 0) scores.set(chunk.id, (scores.get(chunk.id) ?? 0) + s);
    }
  }

  return THEOLOGICAL_CORPUS
    .map((c) => ({ ...c, score: scores.get(c.id) ?? 0 }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
