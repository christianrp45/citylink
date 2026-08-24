import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db/client';
import { formacaoTurma, formacaoMatricula, formacaoProgress, formacaoQuizResult, user } from '@/lib/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { getCadernoMeta } from '@/lib/data/formacao';
import { parseVolumeSections } from '@/lib/formacao-parser';

/** GET /api/formacao/turma/[id]
 *  Detalhe da turma com progresso de todos os membros matriculados (para o líder) */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;

  const [turma] = await db.select().from(formacaoTurma).where(eq(formacaoTurma.id, id));
  if (!turma) return new Response('Not Found', { status: 404 });

  // Lista de membros matriculados
  const matriculas = await db
    .select({ userId: formacaoMatricula.userId, enrolledAt: formacaoMatricula.enrolledAt })
    .from(formacaoMatricula)
    .where(eq(formacaoMatricula.turmaId, id));

  if (matriculas.length === 0) {
    return Response.json({ turma, meta: getCadernoMeta(turma.caderno), members: [] });
  }

  const userIds = matriculas.map((m) => m.userId);

  // Nomes dos membros
  const users = await db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)
    .where(inArray(user.id, userIds));

  // Progresso de lições
  const licoes = await db
    .select({ userId: formacaoProgress.userId, licao: formacaoProgress.licao })
    .from(formacaoProgress)
    .where(and(inArray(formacaoProgress.userId, userIds), eq(formacaoProgress.caderno, turma.caderno)));

  // Quiz passado
  const quizzes = await db
    .select({ userId: formacaoQuizResult.userId, passed: formacaoQuizResult.passed })
    .from(formacaoQuizResult)
    .where(
      and(
        inArray(formacaoQuizResult.userId, userIds),
        eq(formacaoQuizResult.caderno, turma.caderno),
        eq(formacaoQuizResult.passed, true),
      ),
    );

  // Total de lições do caderno
  let totalLicoes = 0;
  try {
    const sections = await parseVolumeSections(turma.caderno);
    totalLicoes = sections.length;
  } catch { /* se não encontrar o arquivo, totalLicoes=0 */ }

  const licoesPorUser = new Map<string, number>();
  for (const l of licoes) {
    licoesPorUser.set(l.userId, (licoesPorUser.get(l.userId) ?? 0) + 1);
  }
  const quizPassedSet = new Set(quizzes.map((q) => q.userId));
  const enrolledAtMap = new Map(matriculas.map((m) => [m.userId, m.enrolledAt]));

  const members = users.map((u) => ({
    userId: u.id,
    name: u.name ?? u.email ?? 'Membro',
    enrolledAt: enrolledAtMap.get(u.id),
    licoesFeitas: licoesPorUser.get(u.id) ?? 0,
    totalLicoes,
    pct: totalLicoes ? Math.round(((licoesPorUser.get(u.id) ?? 0) / totalLicoes) * 100) : 0,
    quizPassed: quizPassedSet.has(u.id),
  }));

  return Response.json({ turma, meta: getCadernoMeta(turma.caderno), members });
}

/** PATCH /api/formacao/turma/[id]  — encerrar turma (líder) */
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;
  const [turma] = await db.select().from(formacaoTurma).where(eq(formacaoTurma.id, id));
  if (!turma) return new Response('Not Found', { status: 404 });
  if (turma.createdBy !== session.user.id) return new Response('Forbidden', { status: 403 });

  await db.update(formacaoTurma).set({ active: false }).where(eq(formacaoTurma.id, id));
  return Response.json({ ok: true });
}
