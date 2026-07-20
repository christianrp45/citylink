import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { userPoints, user, cellMember } from "../schema";

export async function getLeaderboard(cellId?: string, limit = 20) {
  if (cellId) {
    // Ranking dos membros ativos de uma célula específica
    return db
      .select({
        userId: userPoints.userId,
        name: user.name,
        avatar: user.avatar,
        total: userPoints.total,
        level: userPoints.level,
      })
      .from(userPoints)
      .innerJoin(user, eq(userPoints.userId, user.id))
      .innerJoin(
        cellMember,
        and(
          eq(cellMember.userId, userPoints.userId),
          eq(cellMember.cellId, cellId),
          eq(cellMember.isActive, true)
        )
      )
      .orderBy(desc(userPoints.total))
      .limit(limit);
  }

  // Ranking global
  return db
    .select({
      userId: userPoints.userId,
      name: user.name,
      avatar: user.avatar,
      total: userPoints.total,
      level: userPoints.level,
    })
    .from(userPoints)
    .innerJoin(user, eq(userPoints.userId, user.id))
    .orderBy(desc(userPoints.total))
    .limit(limit);
}
