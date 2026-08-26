import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db/client';
import { cellMember, cellVisitor } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

async function isLeader(cellId: string, userId: string) {
  const [member] = await db
    .select()
    .from(cellMember)
    .where(and(eq(cellMember.cellId, cellId), eq(cellMember.userId, userId)))
    .limit(1);
  return member && ['leader', 'co-leader'].includes(member.role);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ cellId: string; visitorId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Não autenticado' }, { status: 401 });

  const { cellId, visitorId } = await params;
  const leader = await isLeader(cellId, session.user.id);
  if (!leader) return Response.json({ error: 'Sem permissão' }, { status: 403 });

  const body = await req.json();
  const { becameMember } = body;

  const [updated] = await db
    .update(cellVisitor)
    .set({ becameMember: !!becameMember })
    .where(and(eq(cellVisitor.id, visitorId), eq(cellVisitor.cellId, cellId)))
    .returning();

  return Response.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ cellId: string; visitorId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Não autenticado' }, { status: 401 });

  const { cellId, visitorId } = await params;
  const leader = await isLeader(cellId, session.user.id);
  if (!leader) return Response.json({ error: 'Sem permissão' }, { status: 403 });

  await db
    .delete(cellVisitor)
    .where(and(eq(cellVisitor.id, visitorId), eq(cellVisitor.cellId, cellId)));

  return new Response(null, { status: 204 });
}
