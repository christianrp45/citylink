import { db } from "@/lib/db/client";
import { sql } from "drizzle-orm";

// Rota temporária de migração — DELETE após uso
export async function GET() {
  try {
    await db.execute(
      sql`ALTER TABLE "CellGuide" ADD COLUMN IF NOT EXISTS "leaderNotes" text`
    );
    return Response.json({ ok: true, message: 'Coluna leaderNotes adicionada com sucesso.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
