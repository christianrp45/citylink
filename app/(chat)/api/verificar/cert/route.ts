import { db } from '@/lib/db/client';
import { user, formacaoQuizResult, church } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

/** GET /api/verificar/cert?userId=...&caderno=...
 *  Public endpoint — verifies whether a certificate is authentic. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const caderno = searchParams.get('caderno') ?? 'all';

  if (!userId) return Response.json({ valid: false, reason: 'Parâmetros inválidos' }, { status: 400 });

  const [userData] = await db
    .select({ name: user.name, primaryChurchId: user.primaryChurchId })
    .from(user)
    .where(eq(user.id, userId));

  if (!userData) return Response.json({ valid: false, reason: 'Usuário não encontrado' }, { status: 404 });

  let churchName: string | null = null;
  if (userData.primaryChurchId) {
    const [c] = await db.select({ name: church.name }).from(church).where(eq(church.id, userData.primaryChurchId));
    churchName = c?.name ?? null;
  }

  if (caderno !== 'all') {
    const [result] = await db
      .select({ completedAt: formacaoQuizResult.completedAt, score: formacaoQuizResult.score, total: formacaoQuizResult.total })
      .from(formacaoQuizResult)
      .where(and(eq(formacaoQuizResult.userId, userId), eq(formacaoQuizResult.caderno, caderno), eq(formacaoQuizResult.passed, true)))
      .limit(1);

    if (!result) return Response.json({ valid: false, reason: 'Certificado não encontrado ou não aprovado' }, { status: 404 });

    return Response.json({
      valid: true,
      userName: userData.name ?? 'Participante',
      churchName,
      caderno,
      completedAt: result.completedAt,
      score: result.score,
      total: result.total,
    });
  }

  // Full formação
  const { CADERNOS } = await import('@/lib/data/formacao');
  const allSlugs = CADERNOS.map((c) => c.slug);
  const passedResults = await db
    .select({ caderno: formacaoQuizResult.caderno, completedAt: formacaoQuizResult.completedAt })
    .from(formacaoQuizResult)
    .where(and(eq(formacaoQuizResult.userId, userId), eq(formacaoQuizResult.passed, true)));

  const passedSlugs = new Set(passedResults.map((r) => r.caderno));
  const allCompleted = allSlugs.every((s) => passedSlugs.has(s));

  if (!allCompleted) return Response.json({ valid: false, reason: 'Formação incompleta' }, { status: 404 });

  const lastDate = passedResults.map((r) => new Date(r.completedAt)).sort((a, b) => b.getTime() - a.getTime())[0];

  return Response.json({
    valid: true,
    userName: userData.name ?? 'Participante',
    churchName,
    caderno: 'all',
    completedAt: lastDate,
    type: 'full',
  });
}
