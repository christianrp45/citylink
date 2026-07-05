// GET /api/bible/chapter?book=jo&chapter=3
// Fonte primária: JSDelivr CDN (thiagobodruk/biblia, NVI)
// Fallback: raw.githubusercontent.com

import { NextRequest } from "next/server";

// JSDelivr CDN — muito mais rápido e confiável que raw.githubusercontent.com em produção
const CDN_URL = "https://cdn.jsdelivr.net/gh/thiagobodruk/biblia/json/nvi";
const FALLBACK_URL = "https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/nvi";

async function fetchBook(book: string): Promise<{ abbrev: string; book: string; chapters: string[][] } | null> {
  const encoded = encodeURIComponent(book);

  // Tenta CDN primeiro
  try {
    const res = await fetch(`${CDN_URL}/${encoded}.json`, {
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(8_000),
    });
    if (res.ok) return res.json();
  } catch {
    // CDN falhou, tenta fallback
  }

  // Fallback: GitHub raw
  try {
    const res = await fetch(`${FALLBACK_URL}/${encoded}.json`, {
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) return res.json();
  } catch {
    // ambos falharam
  }

  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const book = searchParams.get("book")?.toLowerCase();
  const chapterStr = searchParams.get("chapter");

  if (!book || !chapterStr) {
    return Response.json({ error: "book e chapter são obrigatórios" }, { status: 400 });
  }

  const chapter = parseInt(chapterStr, 10);
  if (isNaN(chapter) || chapter < 1) {
    return Response.json({ error: "chapter inválido" }, { status: 400 });
  }

  const data = await fetchBook(book);

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
      bookName: data.book,
      chapter,
      totalChapters: data.chapters.length,
      verses: chapterVerses.map((text, i) => ({ verse: i + 1, text })),
    },
    {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    }
  );
}
