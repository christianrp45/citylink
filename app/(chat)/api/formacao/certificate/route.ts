import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db/client';
import { user, church, formacaoQuizResult } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

/** GET /api/formacao/certificate?caderno=slug
 *  Retorna dados para geração do certificado (nome, igreja, data de aprovação) */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const caderno = searchParams.get('caderno'); // null = certificado geral

  // Dados do usuário + igreja
  const [userData] = await db
    .select({
      name: user.name,
      primaryChurchId: user.primaryChurchId,
    })
    .from(user)
    .where(eq(user.id, session.user.id));

  let churchName: string | null = null;
  if (userData?.primaryChurchId) {
    const [churchData] = await db
      .select({ name: church.name })
      .from(church)
      .where(eq(church.id, userData.primaryChurchId));
    churchName = churchData?.name ?? null;
  }

  if (caderno) {
    // Certificado de caderno específico
    const [result] = await db
      .select({ completedAt: formacaoQuizResult.completedAt, score: formacaoQuizResult.score, total: formacaoQuizResult.total })
      .from(formacaoQuizResult)
      .where(
        and(
          eq(formacaoQuizResult.userId, session.user.id),
          eq(formacaoQuizResult.caderno, caderno),
          eq(formacaoQuizResult.passed, true),
        ),
      )
      .orderBy(formacaoQuizResult.completedAt)
      .limit(1);

    if (!result) return new Response('Certificado não disponível', { status: 404 });

    return Response.json({
      userName: userData?.name ?? 'Participante',
      churchName,
      completedAt: result.completedAt,
      score: result.score,
      total: result.total,
    });
  }

  // Certificado geral — verifica se passou em todos os 8
  const { CADERNOS } = await import('@/lib/data/formacao');
  const allSlugs = CADERNOS.map((c) => c.slug);

  const passedResults = await db
    .select({ caderno: formacaoQuizResult.caderno, completedAt: formacaoQuizResult.completedAt })
    .from(formacaoQuizResult)
    .where(
      and(
        eq(formacaoQuizResult.userId, session.user.id),
        eq(formacaoQuizResult.passed, true),
      ),
    );

  const passedSlugs = new Set(passedResults.map((r) => r.caderno));
  const allCompleted = allSlugs.every((s) => passedSlugs.has(s));
  if (!allCompleted) return new Response('Formação incompleta', { status: 404 });

  // Data de conclusão = última aprovação
  const lastDate = passedResults
    .map((r) => new Date(r.completedAt))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return Response.json({
    userName: userData?.name ?? 'Participante',
    churchName,
    completedAt: lastDate,
    type: 'full',
  });
}
