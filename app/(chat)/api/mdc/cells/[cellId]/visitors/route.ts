import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db/client';
import { cellMember, cellVisitor } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

// Verifica se o usuário é líder ou co-líder da célula
async function isLeader(cellId: string, userId: string) {
  const [member] = await db
    .select()
    .from(cellMember)
    .where(
      and(
        eq(cellMember.cellId, cellId),
        eq(cellMember.userId, userId),
      )
    )
    .limit(1);
  return member && ['leader', 'co-leader'].includes(member.role);
}

export async function GET(_req: Request, { params }: { params: Promise<{ cellId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Não autenticado' }, { status: 401 });

  const { cellId } = await params;

  const visitors = await db
    .select()
    .from(cellVisitor)
    .where(eq(cellVisitor.cellId, cellId))
    .orderBy(cellVisitor.visitedAt);

  return Response.json(visitors);
}

export async function POST(req: Request, { params }: { params: Promise<{ cellId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Não autenticado' }, { status: 401 });

  const { cellId } = await params;

  const leader = await isLeader(cellId, session.user.id);
  if (!leader) return Response.json({ error: 'Apenas líderes podem adicionar visitantes' }, { status: 403 });

  const body = await req.json();
  const { name, phone, email, notes } = body;

  if (!name?.trim()) return Response.json({ error: 'Nome é obrigatório' }, { status: 400 });

  const [created] = await db
    .insert(cellVisitor)
    .values({
      cellId,
      name: name.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      notes: notes?.trim() || null,
      addedBy: session.user.id,
    })
    .returning();

  return Response.json(created, { status: 201 });
}
