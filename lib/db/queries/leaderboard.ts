import "server-only";

import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { userPoints, user, cellMember, userMission } from "../schema";

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

/** Ranking semanal — soma pointsAwarded de userMission na weekKey informada, reseta toda semana */
export async function getWeeklyLeaderboard(weekKey: string, cellId?: string, limit = 20) {
  const weekTotal = sql<number>`sum(${userMission.pointsAwarded})`.mapWith(Number).as("weekTotal");

  const base = db
    .select({
      userId: userMission.userId,
      name: user.name,
      avatar: user.avatar,
      total: weekTotal,
      level: userPoints.level,
    })
    .from(userMission)
    .innerJoin(user, eq(userMission.userId, user.id))
    .leftJoin(userPoints, eq(userPoints.userId, userMission.userId));

  const query = cellId
    ? base.innerJoin(
        cellMember,
        and(
          eq(cellMember.userId, userMission.userId),
          eq(cellMember.cellId, cellId),
          eq(cellMember.isActive, true)
        )
      )
    : base;

  return query
    .where(and(eq(userMission.weekKey, weekKey), isNotNull(userMission.completedAt)))
    .groupBy(userMission.userId, user.name, user.avatar, userPoints.level)
    .orderBy(desc(weekTotal))
    .limit(limit);
}
