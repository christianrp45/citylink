// GET /api/bible/chapter?book=jo&chapter=3
// Fonte: JSDelivr CDN (thiagobodruk/biblia, NVI) — arquivo único nvi.json
// Fallback: raw.githubusercontent.com

import { NextRequest } from "next/server";

const CDN_URL = "https://cdn.jsdelivr.net/gh/thiagobodruk/biblia/json/nvi.json";
const FALLBACK_URL = "https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/nvi.json";

type BibleBook = { abbrev: string; name: string; chapters: string[][] };

// Mapeamento de abreviações usadas no app → abreviações do JSON
const ABBREV_MAP: Record<string, string> = {
  at: "atos", // Atos dos Apóstolos
};

async function fetchBible(): Promise<BibleBook[] | null> {
  // Tenta CDN primeiro
  try {
    const res = await fetch(CDN_URL, {
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(15_000),
    });
    if (res.ok) return res.json();
  } catch {
    // CDN falhou, tenta fallback
  }

  // Fallback: GitHub raw
  try {
    const res = await fetch(FALLBACK_URL, {
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(20_000),
    });
    if (res.ok) return res.json();
  } catch {
    // ambos falharam
  }

  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const bookParam = searchParams.get("book")?.toLowerCase();
  const chapterStr = searchParams.get("chapter");

  if (!bookParam || !chapterStr) {
    return Response.json({ error: "book e chapter são obrigatórios" }, { status: 400 });
  }

  const chapter = parseInt(chapterStr, 10);
  if (isNaN(chapter) || chapter < 1) {
    return Response.json({ error: "chapter inválido" }, { status: 400 });
  }

  // Normaliza abreviação (ex: "at" → "atos")
  const bookAbbrev = ABBREV_MAP[bookParam] ?? bookParam;

  const bible = await fetchBible();
  if (!bible) {
    return Response.json({ error: "Bíblia indisponível no momento" }, { status: 503 });
  }

  const data = bible.find((b) => b.abbrev === bookAbbrev);
  if (!data) {
    return Response.json({ error: "Livro não encontrado. Verifique a abreviação." }, { status: 404 });
  }

  const chapterVerses = data.chapters[chapter - 1];
  if (!chapterVerses) {
    return Response.json({ error: "Capítulo não encontrado" }, { status: 404 });
  }

  return Response.json(
    {
      book: data.abbrev,
      bookName: data.name,
      chapter,
      totalChapters: data.chapters.length,
      verses: chapterVerses.map((text, i) => ({ verse: i + 1, text })),
    },
    {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    }
  );
}
