import "server-only";

import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { cell, cellMember, user } from "../schema";

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
