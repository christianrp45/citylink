import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { bibleHighlight } from "../schema";

export async function getUserHighlights(userId: string) {
  return db
    .select()
    .from(bibleHighlight)
    .where(eq(bibleHighlight.userId, userId))
    .orderBy(desc(bibleHighlight.createdAt));
}

export async function getVerseHighlights(
  userId: string,
  book: string,
  chapter: number
) {
  return db
    .select()
    .from(bibleHighlight)
    .where(
      and(
        eq(bibleHighlight.userId, userId),
        eq(bibleHighlight.book, book),
        eq(bibleHighlight.chapter, chapter)
      )
    );
}

export async function upsertHighlight(params: {
  userId: string;
  book: string;
  chapter: number;
  verse: number;
  color: "yellow" | "green" | "pink" | "blue";
  note?: string;
  version?: string;
}) {
  // Remove highlight existente para o mesmo versículo (uma cor por versículo)
  await db
    .delete(bibleHighlight)
    .where(
      and(
        eq(bibleHighlight.userId, params.userId),
        eq(bibleHighlight.book, params.book),
        eq(bibleHighlight.chapter, params.chapter),
        eq(bibleHighlight.verse, params.verse)
      )
    );
  const [row] = await db
    .insert(bibleHighlight)
    .values({
      userId: params.userId,
      book: params.book,
      chapter: params.chapter,
      verse: params.verse,
      color: params.color,
      note: params.note ?? null,
      version: params.version ?? "nvi",
    })
    .returning();
  return row;
}

export async function deleteHighlight(userId: string, highlightId: string) {
  await db
    .delete(bibleHighlight)
    .where(
      and(eq(bibleHighlight.id, highlightId), eq(bibleHighlight.userId, userId))
    );
}
