import "server-only";

import { and, asc, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { cell, community, communityMember, inviteCode, user } from "../schema";

export async function getCommunities(filters?: { type?: string; city?: string; isPublic?: boolean }) {
  let query = db.select().from(community);
  const conditions = [];
  if (filters?.isPublic !== undefined) conditions.push(eq(community.isPublic, filters.isPublic));
  if (filters?.type) conditions.push(eq(community.type as any, filters.type));
  if (filters?.city) conditions.push(eq(community.city as any, filters.city));
  if (conditions.length > 0) {
    return await (query as any).where(and(...conditions)).orderBy(desc(community.createdAt));
  }
  return await query.orderBy(desc(community.createdAt));
}

export async function getCommunityById(id: string) {
  const [row] = await db.select().from(community).where(eq(community.id, id));
  return row ?? null;
}

export async function createCommunity(data: {
  name: string;
  type: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  website?: string;
  isPublic?: boolean;
  requireApproval?: boolean;
  adminUserId: string;
}) {
  const slug = data.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);

  const [created] = await db
    .insert(community)
    .values({
      name: data.name,
      slug,
      type: data.type as any,
      description: data.description,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country ?? "BR",
      phone: data.phone,
      website: data.website,
      isPublic: data.isPublic ?? true,
      requireApproval: data.requireApproval ?? false,
      adminUserId: data.adminUserId,
    })
    .returning();

  // Admin é automaticamente membro owner
  await db.insert(communityMember).values({
    communityId: created.id,
    userId: data.adminUserId,
    role: "owner",
    approvedAt: new Date(),
    canPost: true,
    canInvite: true,
    canManageEvents: true,
  });

  return created;
}

export async function getCommunityMembers(communityId: string) {
  return await db
    .select({
      userId: communityMember.userId,
      role: communityMember.role,
      joinedAt: communityMember.joinedAt,
      approvedAt: communityMember.approvedAt,
      name: user.name,
      avatar: user.avatar,
      profession: user.profession,
    })
    .from(communityMember)
    .innerJoin(user, eq(communityMember.userId, user.id))
    .where(
      and(
        eq(communityMember.communityId, communityId),
        isNotNull(communityMember.approvedAt)
      )
    )
    .orderBy(asc(communityMember.joinedAt));
}

export async function getMyCommunityIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ communityId: communityMember.communityId })
    .from(communityMember)
    .where(
      and(
        eq(communityMember.userId, userId),
        isNotNull(communityMember.approvedAt)
      )
    );
  return rows.map((r) => r.communityId);
}

export async function joinCommunity(communityId: string, userId: string, requireApproval: boolean) {
  await db
    .insert(communityMember)
    .values({
      communityId,
      userId,
      role: "member",
      approvedAt: requireApproval ? null : new Date(),
    })
    .onConflictDoNothing();
}

export async function leaveCommunity(communityId: string, userId: string) {
  await db
    .delete(communityMember)
    .where(
      and(
        eq(communityMember.communityId, communityId),
        eq(communityMember.userId, userId)
      )
    );
}

export async function approveCommunityMember(communityId: string, userId: string) {
  await db
    .update(communityMember)
    .set({ approvedAt: new Date() })
    .where(
      and(
        eq(communityMember.communityId, communityId),
        eq(communityMember.userId, userId)
      )
    );
}

export async function getPendingCommunityMembers(communityId: string) {
  return await db
    .select({
      userId: communityMember.userId,
      role: communityMember.role,
      joinedAt: communityMember.joinedAt,
      name: user.name,
      avatar: user.avatar,
      profession: user.profession,
    })
    .from(communityMember)
    .innerJoin(user, eq(communityMember.userId, user.id))
    .where(
      and(
        eq(communityMember.communityId, communityId),
        isNull(communityMember.approvedAt)
      )
    )
    .orderBy(asc(communityMember.joinedAt));
}

export async function getUserCommunityRole(communityId: string, userId: string) {
  const [row] = await db
    .select({ role: communityMember.role, approvedAt: communityMember.approvedAt })
    .from(communityMember)
    .where(
      and(
        eq(communityMember.communityId, communityId),
        eq(communityMember.userId, userId)
      )
    );
  return row ?? null;
}

/**
 * Deleta uma comunidade e limpa as referências dependentes.
 * Só pode ser chamado pelo admin/owner da comunidade.
 */
export async function deleteCommunity(communityId: string) {
  // 1. Remove membros
  await db.delete(communityMember).where(eq(communityMember.communityId, communityId));
  // 2. Desvincula células (communityId é nullable, então setamos null em vez de deletar)
  await db.update(cell).set({ communityId: null }).where(eq(cell.communityId, communityId));
  // 3. Remove convites associados
  await db.delete(inviteCode).where(
    and(eq(inviteCode.targetId, communityId), eq(inviteCode.type, 'community'))
  );
  // 4. Deleta a comunidade
  await db.delete(community).where(eq(community.id, communityId));
}
