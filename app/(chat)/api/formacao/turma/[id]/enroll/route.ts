import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db/client';
import { formacaoTurma, formacaoMatricula } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

/** POST /api/formacao/turma/[id]/enroll — matricular */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;

  const [turma] = await db
    .select({ id: formacaoTurma.id, active: formacaoTurma.active })
    .from(formacaoTurma)
    .where(eq(formacaoTurma.id, id));

  if (!turma || !turma.active) return new Response('Turma não encontrada ou encerrada', { status: 404 });

  // Idempotente — ignora se já matriculado
  await db
    .insert(formacaoMatricula)
    .values({ turmaId: id, userId: session.user.id })
    .onConflictDoNothing();

  return Response.json({ ok: true });
}

/** DELETE /api/formacao/turma/[id]/enroll — cancelar matrícula */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;

  await db
    .delete(formacaoMatricula)
    .where(and(eq(formacaoMatricula.turmaId, id), eq(formacaoMatricula.userId, session.user.id)));

  return Response.json({ ok: true });
}
