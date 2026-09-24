import "server-only";

import { and, count, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { cellMember, user } from "../schema";

const APPROVED = and(eq(cellMember.isActive, true), isNotNull(cellMember.approvedAt));

export async function getCellMembers(cellId: string) {
  return db
    .select({
      cellId: cellMember.cellId,
      userId: cellMember.userId,
      userEmail: user.email,
      role: cellMember.role,
      isActive: cellMember.isActive,
      joinedAt: cellMember.joinedAt,
    })
    .from(cellMember)
    .leftJoin(user, eq(cellMember.userId, user.id))
    .where(and(eq(cellMember.cellId, cellId), APPROVED));
}

export async function getCellMemberCount(cellId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(cellMember)
    .where(and(eq(cellMember.cellId, cellId), APPROVED));
  return result?.count ?? 0;
}

/** Pedidos de vínculo pendentes (aguardando o líder aceitar) */
export async function getPendingCellRequests(cellId: string) {
  return db
    .select({
      cellId: cellMember.cellId,
      userId: cellMember.userId,
      userName: user.name,
      userAvatar: user.avatar,
      joinedAt: cellMember.joinedAt,
    })
    .from(cellMember)
    .leftJoin(user, eq(cellMember.userId, user.id))
    .where(
      and(eq(cellMember.cellId, cellId), eq(cellMember.isActive, true), isNull(cellMember.approvedAt))
    );
}

/**
 * Solicita vínculo com a célula — sempre cria um pedido pendente, nunca
 * entra direto. Reentrar depois de ter saído restaura o status anterior
 * (quem já tinha sido aprovado volta aprovado, sem pedir de novo).
 */
export async function joinCell(cellId: string, userId: string) {
  const [existing] = await db
    .select()
    .from(cellMember)
    .where(and(eq(cellMember.cellId, cellId), eq(cellMember.userId, userId)));

  if (existing) {
    await db
      .update(cellMember)
      .set({ isActive: true })
      .where(and(eq(cellMember.cellId, cellId), eq(cellMember.userId, userId)));
    return { pending: !existing.approvedAt };
  }

  await db.insert(cellMember).values({ cellId, userId, role: "member" });
  return { pending: true };
}

/** Líder/co-líder aceita um pedido de vínculo */
export async function approveCellMember(cellId: string, userId: string) {
  await db
    .update(cellMember)
    .set({ approvedAt: new Date() })
    .where(and(eq(cellMember.cellId, cellId), eq(cellMember.userId, userId)));
}

/** Líder/co-líder recusa (ou remove) um vínculo — some da célula por completo */
export async function removeCellMember(cellId: string, userId: string) {
  await db
    .delete(cellMember)
    .where(and(eq(cellMember.cellId, cellId), eq(cellMember.userId, userId)));
}
