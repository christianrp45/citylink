import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db/client';
import { formacaoTurma, formacaoMatricula, cellMember } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { getCadernoMeta } from '@/lib/data/formacao';

/** GET /api/formacao/turma?cellId=xxx
 *  Lista turmas ativas de uma célula com status de matrícula do usuário */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const cellId = searchParams.get('cellId');
  if (!cellId) return new Response('Bad Request', { status: 400 });

  const turmas = await db
    .select()
    .from(formacaoTurma)
    .where(and(eq(formacaoTurma.cellId, cellId), eq(formacaoTurma.active, true)));

  // Matrículas do usuário nessas turmas
  const matriculas = await db
    .select({ turmaId: formacaoMatricula.turmaId })
    .from(formacaoMatricula)
    .where(eq(formacaoMatricula.userId, session.user.id));

  const enrolledSet = new Set(matriculas.map((m) => m.turmaId));

  const result = turmas.map((t) => ({
    ...t,
    meta: getCadernoMeta(t.caderno),
    enrolled: enrolledSet.has(t.id),
  }));

  return Response.json(result);
}

/** POST /api/formacao/turma
 *  Líder cria uma turma para um caderno dentro de uma célula */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const { cellId, caderno } = (await req.json()) as { cellId: string; caderno: string };
  if (!cellId || !caderno) return new Response('Bad Request', { status: 400 });

  // Verifica se é líder ou co-líder
  const [membership] = await db
    .select({ role: cellMember.role })
    .from(cellMember)
    .where(and(eq(cellMember.cellId, cellId), eq(cellMember.userId, session.user.id)));

  if (!membership || !['leader', 'co-leader'].includes(membership.role)) {
    return new Response('Forbidden', { status: 403 });
  }

  // Verifica se já existe turma ativa para esse caderno nessa célula
  const [existing] = await db
    .select({ id: formacaoTurma.id })
    .from(formacaoTurma)
    .where(
      and(
        eq(formacaoTurma.cellId, cellId),
        eq(formacaoTurma.caderno, caderno),
        eq(formacaoTurma.active, true),
      ),
    );

  if (existing) {
    return Response.json({ error: 'Já existe uma turma ativa para este caderno' }, { status: 409 });
  }

  const [turma] = await db
    .insert(formacaoTurma)
    .values({ cellId, caderno, createdBy: session.user.id })
    .returning();

  return Response.json(turma, { status: 201 });
}
