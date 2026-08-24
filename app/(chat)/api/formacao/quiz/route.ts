import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db/client';
import { formacaoQuizResult, user, church } from '@/lib/db/schema';
import { and, eq, count } from 'drizzle-orm';
import { awardPoints } from '@/lib/gamification';
import { QUIZZES, QUIZ_PASS_SCORE } from '@/lib/data/formacao-quiz';

/** POST /api/formacao/quiz
 *  Recebe respostas, corrige, salva resultado e concede XP se aprovado */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const { caderno, respostas } = (await req.json()) as {
    caderno: string;
    respostas: Record<number, 'a' | 'b' | 'c' | 'd'>; // { questionId: opcaoEscolhida }
  };

  const questoes = QUIZZES[caderno];
  if (!questoes) return new Response('Caderno não encontrado', { status: 404 });

  // Corrige
  let score = 0;
  for (const q of questoes) {
    if (respostas[q.id] === q.correta) score++;
  }

  const total = questoes.length;
  const passed = score >= QUIZ_PASS_SCORE;

  // Conta tentativas anteriores
  const [{ value: attemptCount }] = await db
    .select({ value: count() })
    .from(formacaoQuizResult)
    .where(
      and(
        eq(formacaoQuizResult.userId, session.user.id),
        eq(formacaoQuizResult.caderno, caderno),
      ),
    );

  await db.insert(formacaoQuizResult).values({
    userId: session.user.id,
    caderno,
    score,
    total,
    passed,
    attempt: Number(attemptCount) + 1,
  });

  if (passed) {
    // XP por caderno concluído
    await awardPoints(session.user.id, 'complete_formacao_caderno').catch(() => {});

    // Verifica se completou todos os 8 cadernos
    const { CADERNOS } = await import('@/lib/data/formacao');
    const allSlugs = CADERNOS.map((c) => c.slug);

    const passedResults = await db
      .select({ caderno: formacaoQuizResult.caderno })
      .from(formacaoQuizResult)
      .where(
        and(
          eq(formacaoQuizResult.userId, session.user.id),
          eq(formacaoQuizResult.passed, true),
        ),
      );

    const passedSlugs = new Set(passedResults.map((r) => r.caderno));
    const allCompleted = allSlugs.every((s) => passedSlugs.has(s));

    if (allCompleted) {
      await awardPoints(session.user.id, 'complete_formacao_all').catch(() => {});
    }
  }

  return Response.json({ score, total, passed, attempt: Number(attemptCount) + 1 });
}

/** GET /api/formacao/quiz?caderno=slug
 *  Retorna o melhor resultado do usuário para um caderno */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const caderno = searchParams.get('caderno');
  if (!caderno) return new Response('Bad Request', { status: 400 });

  const results = await db
    .select()
    .from(formacaoQuizResult)
    .where(
      and(
        eq(formacaoQuizResult.userId, session.user.id),
        eq(formacaoQuizResult.caderno, caderno),
      ),
    )
    .orderBy(formacaoQuizResult.completedAt);

  const passed = results.find((r) => r.passed) ?? null;
  return Response.json({ results, passed, attempts: results.length });
}
