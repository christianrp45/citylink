import "server-only";

import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { prayerGroup, prayerGroupMember } from "../schema";

export async function getPrayerGroups() {
  const groups = await db
    .select({
      id: prayerGroup.id,
      name: prayerGroup.name,
      description: prayerGroup.description,
      schedule: prayerGroup.schedule,
      topic: prayerGroup.topic,
      isOnline: prayerGroup.isOnline,
      creatorId: prayerGroup.creatorId,
      createdAt: prayerGroup.createdAt,
    })
    .from(prayerGroup)
    .orderBy(desc(prayerGroup.createdAt));

  const ids = groups.map((g) => g.id);
  if (ids.length === 0) return [];

  const members = await db
    .select()
    .from(prayerGroupMember)
    .where(inArray(prayerGroupMember.groupId, ids));

  return groups.map((g) => ({
    ...g,
    memberCount: members.filter((m) => m.groupId === g.id).length,
    memberIds: members.filter((m) => m.groupId === g.id).map((m) => m.userId),
  }));
}

export async function createPrayerGroup(data: {
  name: string;
  description?: string;
  schedule?: string;
  topic?: string;
  isOnline?: boolean;
  creatorId: string;
}) {
  const [created] = await db.insert(prayerGroup).values(data).returning();
  // Criador entra automaticamente
  await db
    .insert(prayerGroupMember)
    .values({ groupId: created.id, userId: data.creatorId })
    .onConflictDoNothing();
  return created;
}

export async function joinPrayerGroup(groupId: string, userId: string) {
  await db
    .insert(prayerGroupMember)
    .values({ groupId, userId })
    .onConflictDoNothing();
}

export async function leavePrayerGroup(groupId: string, userId: string) {
  await db
    .delete(prayerGroupMember)
    .where(
      and(
        eq(prayerGroupMember.groupId, groupId),
        eq(prayerGroupMember.userId, userId)
      )
    );
}

export async function getMyPrayerGroupIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ groupId: prayerGroupMember.groupId })
    .from(prayerGroupMember)
    .where(eq(prayerGroupMember.userId, userId));
  return rows.map((r) => r.groupId);
}
