// GET /api/bible/chapter?book=jo&chapter=3
// Busca capítulo do JSON do thiagobodruk/biblia (NVI, GitHub raw)
// Fallback: bible-api.com (Almeida)

import { NextRequest } from "next/server";

const BASE_URL =
  "https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/nvi";

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

  try {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(book)}.json`, {
      next: { revalidate: 86_400 }, // cache 24h no servidor
    });

    if (!res.ok) {
      return Response.json({ error: "Livro não encontrado" }, { status: 404 });
    }

    const data: { abbrev: string; book: string; chapters: string[][] } =
      await res.json();

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
  } catch {
    return Response.json({ error: "Erro ao buscar capítulo" }, { status: 500 });
  }
}
