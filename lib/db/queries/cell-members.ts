import "server-only";

import { and, count, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { cellMember, user } from "../schema";

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
    .where(and(eq(cellMember.cellId, cellId), eq(cellMember.isActive, true)));
}

export async function getCellMemberCount(cellId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(cellMember)
    .where(and(eq(cellMember.cellId, cellId), eq(cellMember.isActive, true)));
  return result?.count ?? 0;
}

export async function joinCell(cellId: string, userId: string) {
  const existing = await db
    .select()
    .from(cellMember)
    .where(and(eq(cellMember.cellId, cellId), eq(cellMember.userId, userId)));

  if (existing.length > 0) {
    // reativar se estava inativo
    await db
      .update(cellMember)
      .set({ isActive: true })
      .where(and(eq(cellMember.cellId, cellId), eq(cellMember.userId, userId)));
    return;
  }

  await db.insert(cellMember).values({ cellId, userId, role: "member" });
}
