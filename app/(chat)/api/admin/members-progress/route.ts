import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db/client';
import {
  cell,
  cellMember,
  community,
  communityMember,
  formacaoProgress,
  user,
} from '@/lib/db/schema';
import { eq, and, inArray, count, sql } from 'drizzle-orm';

/**
 * GET /api/admin/members-progress
 * Retorna membros de todas as comunidades gerenciadas pela instituição logada,
 * com progresso nos cadernos de formação e participação em células.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Não autenticado' }, { status: 401 });

  // Comunidades onde o usuário é admin/owner
  const adminCommunities = await db
    .select({ id: community.id, name: community.name })
    .from(community)
    .where(eq(community.adminUserId, session.user.id));

  if (adminCommunities.length === 0) {
    return Response.json({ members: [], communities: [] });
  }

  const communityIds = adminCommunities.map((c) => c.id);

  // Membros de todas essas comunidades (aprovados)
  const members = await db
    .select({
      userId: communityMember.userId,
      communityId: communityMember.communityId,
      role: communityMember.role,
      joinedAt: communityMember.joinedAt,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    })
    .from(communityMember)
    .innerJoin(user, eq(user.id, communityMember.userId))
    .where(
      and(
        inArray(communityMember.communityId, communityIds),
        sql`${communityMember.approvedAt} IS NOT NULL`,
      )
    );

  if (members.length === 0) {
    return Response.json({ members: [], communities: adminCommunities });
  }

  const userIds = [...new Set(members.map((m) => m.userId))];

  // Progresso nos cadernos (número de lições concluídas por caderno)
  const progressRows = await db
    .select({
      userId: formacaoProgress.userId,
      caderno: formacaoProgress.caderno,
      lessonCount: count(),
    })
    .from(formacaoProgress)
    .where(inArray(formacaoProgress.userId, userIds))
    .groupBy(formacaoProgress.userId, formacaoProgress.caderno);

  // Células em que cada membro participa (dentro das comunidades da instituição)
  const cellsOfCommunities = await db
    .select({ id: cell.id, name: cell.name, communityId: cell.communityId })
    .from(cell)
    .where(inArray(cell.communityId, communityIds));

  const cellIds = cellsOfCommunities.map((c) => c.id);

  const cellMemberships =
    cellIds.length > 0
      ? await db
          .select({
            userId: cellMember.userId,
            cellId: cellMember.cellId,
            role: cellMember.role,
          })
          .from(cellMember)
          .where(
            and(
              inArray(cellMember.userId, userIds),
              inArray(cellMember.cellId, cellIds),
            )
          )
      : [];

  // Monta a resposta agrupando dados por usuário
  const progressByUser: Record<string, Record<string, number>> = {};
  for (const row of progressRows) {
    if (!progressByUser[row.userId]) progressByUser[row.userId] = {};
    progressByUser[row.userId][row.caderno] = Number(row.lessonCount);
  }

  const cellsByUser: Record<string, { cellId: string; cellName: string; role: string }[]> = {};
  for (const cm of cellMemberships) {
    if (!cellsByUser[cm.userId]) cellsByUser[cm.userId] = [];
    const cellInfo = cellsOfCommunities.find((c) => c.id === cm.cellId);
    if (cellInfo) {
      cellsByUser[cm.userId].push({ cellId: cm.cellId, cellName: cellInfo.name, role: cm.role });
    }
  }

  const enriched = members.map((m) => ({
    ...m,
    formacaoProgress: progressByUser[m.userId] ?? {},
    cells: cellsByUser[m.userId] ?? [],
  }));

  return Response.json({ members: enriched, communities: adminCommunities });
}
