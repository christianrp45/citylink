// GET  /api/bible/highlights?book=jo&chapter=3  — destaques do usuário no capítulo
// POST /api/bible/highlights                     — criar/atualizar destaque
// DELETE /api/bible/highlights?id=<uuid>         — remover destaque

import { auth } from "@/app/(auth)/auth";
import {
  getUserHighlights,
  getVerseHighlights,
  upsertHighlight,
  deleteHighlight,
} from "@/lib/db/queries";
import { NextRequest } from "next/server";
import { awardPoints } from "@/lib/gamification";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const book = searchParams.get("book");
  const chapterStr = searchParams.get("chapter");

  if (book && chapterStr) {
    const chapter = parseInt(chapterStr, 10);
    const highlights = await getVerseHighlights(session.user.id, book, chapter);
    return Response.json(highlights);
  }

  // Sem filtro: retorna todos os destaques do usuário
  const highlights = await getUserHighlights(session.user.id);
  return Response.json(highlights);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { book, chapter, verse, color, note, version } = body;

  if (!book || !chapter || !verse || !color) {
    return Response.json({ error: "book, chapter, verse e color são obrigatórios" }, { status: 400 });
  }

  const VALID_COLORS = ["yellow", "green", "pink", "blue"] as const;
  if (!VALID_COLORS.includes(color)) {
    return Response.json({ error: "color inválida" }, { status: 400 });
  }

  const highlight = await upsertHighlight({
    userId: session.user.id,
    book,
    chapter: Number(chapter),
    verse: Number(verse),
    color,
    note: typeof note === "string" ? note : undefined,
    version: typeof version === "string" ? version : "nvi",
  });

  void awardPoints(session.user.id, "bible_highlight");

  return Response.json(highlight, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id é obrigatório" }, { status: 400 });

  await deleteHighlight(session.user.id, id);
  return Response.json({ ok: true });
}
