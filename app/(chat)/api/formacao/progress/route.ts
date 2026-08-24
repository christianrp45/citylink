import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db/client';
import { formacaoProgress } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { awardPoints } from '@/lib/gamification';

/** GET /api/formacao/progress?caderno=slug
 *  Retorna as lições concluídas do usuário para um caderno */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const caderno = searchParams.get('caderno');

  if (caderno) {
    const rows = await db
      .select({ licao: formacaoProgress.licao })
      .from(formacaoProgress)
      .where(
        and(
          eq(formacaoProgress.userId, session.user.id),
          eq(formacaoProgress.caderno, caderno),
        ),
      );
    return Response.json(rows.map((r) => r.licao));
  }

  // Sem caderno → retorna progresso de todos os cadernos
  const rows = await db
    .select({ caderno: formacaoProgress.caderno, licao: formacaoProgress.licao })
    .from(formacaoProgress)
    .where(eq(formacaoProgress.userId, session.user.id));

  const grouped: Record<string, string[]> = {};
  for (const r of rows) {
    if (!grouped[r.caderno]) grouped[r.caderno] = [];
    grouped[r.caderno].push(r.licao);
  }
  return Response.json(grouped);
}

/** POST /api/formacao/progress
 *  Marca uma lição como concluída e concede XP */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const { caderno, licao } = (await req.json()) as { caderno: string; licao: string };
  if (!caderno || !licao) return new Response('Bad Request', { status: 400 });

  // Evita duplicatas
  const existing = await db
    .select({ id: formacaoProgress.id })
    .from(formacaoProgress)
    .where(
      and(
        eq(formacaoProgress.userId, session.user.id),
        eq(formacaoProgress.caderno, caderno),
        eq(formacaoProgress.licao, licao),
      ),
    );

  if (existing.length === 0) {
    await db.insert(formacaoProgress).values({
      userId: session.user.id,
      caderno,
      licao,
    });

    // XP por lição concluída
    await awardPoints(session.user.id, 'complete_formacao_lesson').catch(() => {});
  }

  return Response.json({ ok: true });
}
