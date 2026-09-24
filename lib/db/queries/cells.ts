import "server-only";

import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { cell, cellMember, user } from "../schema";

/** Líder(es) das célula(s) ativa(s) de um usuário — pra escalonar pedidos discretos de ajuda */
export async function getCellLeaderIdsForUser(userId: string): Promise<string[]> {
  const rows = await db
    .select({ leaderId: cell.leaderId, coLeaderId: cell.coLeaderId })
    .from(cellMember)
    .innerJoin(cell, eq(cellMember.cellId, cell.id))
    .where(and(eq(cellMember.userId, userId), eq(cellMember.isActive, true)));

  const ids = new Set<string>();
  for (const row of rows) {
    ids.add(row.leaderId);
    if (row.coLeaderId) ids.add(row.coLeaderId);
  }
  ids.delete(userId); // não notifica a própria pessoa se ela for líder da célula
  return [...ids];
}

export async function getCells(filters?: { communityId?: string | null }) {
  const conditions = [];
  if (filters?.communityId !== undefined) {
    conditions.push(
      filters.communityId === null
        ? isNull(cell.communityId)
        : eq(cell.communityId, filters.communityId)
    );
  }

  return db
    .select({
      id: cell.id,
      name: cell.name,
      description: cell.description,
      communityId: cell.communityId,
      neighborhood: cell.neighborhood,
      address: cell.address,
      meetingDay: cell.meetingDay,
      meetingTime: cell.meetingTime,
      targetAudience: cell.targetAudience,
      maxMembers: cell.maxMembers,
      isOpen: cell.isOpen,
      entryMode: cell.entryMode,
      createdAt: cell.createdAt,
      leaderId: cell.leaderId,
      leaderName: sql<string>`COALESCE(${user.name}, ${user.email})`,
      leaderEmail: user.email,
    })
    .from(cell)
    .leftJoin(user, eq(cell.leaderId, user.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(cell.createdAt));
}

export async function getCellById(id: string) {
  const [result] = await db.select().from(cell).where(eq(cell.id, id));
  return result ?? null;
}

export async function createCell(data: {
  name: string;
  description?: string;
  communityId?: string;
  leaderId: string;
  neighborhood?: string;
  address?: string;
  meetingDay?: number;
  meetingTime?: string;
  targetAudience?: "jovens" | "casais" | "adultos" | "terceira-idade" | "misto";
  maxMembers?: number;
  entryMode?: "open" | "invite_only";
}) {
  const [newCell] = await db.insert(cell).values(data).returning();

  // líder entra automaticamente como membro
  await db.insert(cellMember).values({
    cellId: newCell.id,
    userId: data.leaderId,
    role: "leader",
  });

  return newCell;
}
