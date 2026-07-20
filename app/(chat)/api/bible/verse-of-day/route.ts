// GET /api/bible/verse-of-day — versículo do dia (rotação diária sem API externa)

import { getVerseOfDay } from "@/lib/bible/verses-of-day";

export async function GET() {
  const verse = getVerseOfDay();

  return Response.json(verse, {
    headers: {
      // Cache por 1h no edge (troca à meia-noite aprox)
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
