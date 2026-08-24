import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db/client';
import { formacaoMatricula, formacaoTurma, cell } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { getCadernoMeta } from '@/lib/data/formacao';

/** GET /api/formacao/minhas-turmas
 *  Retorna todas as turmas em que o usuário está matriculado */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const rows = await db
    .select({
      turmaId: formacaoMatricula.turmaId,
      enrolledAt: formacaoMatricula.enrolledAt,
      caderno: formacaoTurma.caderno,
      active: formacaoTurma.active,
      cellId: formacaoTurma.cellId,
      cellName: cell.name,
    })
    .from(formacaoMatricula)
    .innerJoin(formacaoTurma, eq(formacaoMatricula.turmaId, formacaoTurma.id))
    .innerJoin(cell, eq(formacaoTurma.cellId, cell.id))
    .where(
      and(
        eq(formacaoMatricula.userId, session.user.id),
        eq(formacaoTurma.active, true),
      ),
    );

  return Response.json(
    rows.map((r) => ({ ...r, meta: getCadernoMeta(r.caderno) })),
  );
}
