import "server-only";

import { and, eq, gt, isNotNull, lt, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/lib/db/client";
import { communityMember, friendship, proximityAlert, user, userProximityConfig } from "../schema";

export async function createProximityAlert(data: {
  userId: string;
  nearUserId: string;
  distanceMeters: number;
  relationContext: "friend" | "cell_member" | "community_member";
  expiresInHours?: number;
}) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + (data.expiresInHours ?? 24));

  await db.insert(proximityAlert).values({
    userId: data.userId,
    nearUserId: data.nearUserId,
    distanceMeters: data.distanceMeters,
    relationContext: data.relationContext,
    expiresAt,
  });
}

export async function getRecentProximityAlert(
  userId: string,
  nearUserId: string,
  cooldownMinutes: number
): Promise<boolean> {
  const since = new Date();
  since.setMinutes(since.getMinutes() - cooldownMinutes);
  const [row] = await db
    .select({ id: proximityAlert.id })
    .from(proximityAlert)
    .where(
      and(
        eq(proximityAlert.userId, userId),
        eq(proximityAlert.nearUserId, nearUserId),
        gt(proximityAlert.sentAt, since)
      )
    )
    .limit(1);
  return !!row;
}

export async function deleteExpiredProximityAlerts() {
  await db
    .delete(proximityAlert)
    .where(lt(proximityAlert.expiresAt, new Date()));
}

// Pares de amigos onde AMBOS têm proximidade ativa e localização recente
export async function getActiveFriendPairs() {
  const u1 = alias(user, "u1");
  const u2 = alias(user, "u2");
  const p1 = alias(userProximityConfig, "p1");
  const p2 = alias(userProximityConfig, "p2");

  return await db
    .select({
      user1Id: friendship.userId,
      user2Id: friendship.friendId,
      user1Name: u1.name,
      user1Lat: u1.lat,
      user1Lng: u1.lng,
      user2Name: u2.name,
      user2Lat: u2.lat,
      user2Lng: u2.lng,
      radius1: p1.radiusMeters,
      radius2: p2.radiusMeters,
      cooldown1: p1.cooldownMinutes,
      cooldown2: p2.cooldownMinutes,
      activeWhen1: p1.activeWhen,
      activeWhen2: p2.activeWhen,
    })
    .from(friendship)
    .innerJoin(u1, eq(u1.id, friendship.userId))
    .innerJoin(u2, eq(u2.id, friendship.friendId))
    .innerJoin(p1, and(eq(p1.userId, friendship.userId), eq(p1.isActive, true), eq(p1.notifyWhenFriendNear, true)))
    .innerJoin(p2, and(eq(p2.userId, friendship.friendId), eq(p2.isActive, true), eq(p2.notifyWhenFriendNear, true)))
    .where(
      and(
        isNotNull(u1.lat),
        isNotNull(u1.lng),
        isNotNull(u2.lat),
        isNotNull(u2.lng),
        ne(p1.activeWhen, "never"),
        ne(p2.activeWhen, "never"),
      )
    );
}

// Pares de membros da mesma comunidade onde AMBOS têm proximidade ativa
export async function getActiveCommunityMemberPairs() {
  const m1 = alias(communityMember, "m1");
  const m2 = alias(communityMember, "m2");
  const u1 = alias(user, "u1");
  const u2 = alias(user, "u2");
  const p1 = alias(userProximityConfig, "p1");
  const p2 = alias(userProximityConfig, "p2");

  return await db
    .select({
      communityId: m1.communityId,
      user1Id: m1.userId,
      user2Id: m2.userId,
      user1Name: u1.name,
      user1Lat: u1.lat,
      user1Lng: u1.lng,
      user2Name: u2.name,
      user2Lat: u2.lat,
      user2Lng: u2.lng,
      radius1: p1.radiusMeters,
      radius2: p2.radiusMeters,
      cooldown1: p1.cooldownMinutes,
      cooldown2: p2.cooldownMinutes,
    })
    .from(m1)
    .innerJoin(m2, and(
      eq(m2.communityId, m1.communityId),
      ne(m2.userId, m1.userId),
      isNotNull(m2.approvedAt),
    ))
    .innerJoin(u1, eq(u1.id, m1.userId))
    .innerJoin(u2, eq(u2.id, m2.userId))
    .innerJoin(p1, and(eq(p1.userId, m1.userId), eq(p1.isActive, true), eq(p1.notifyWhenCommunityNear, true)))
    .innerJoin(p2, and(eq(p2.userId, m2.userId), eq(p2.isActive, true), eq(p2.notifyWhenCommunityNear, true)))
    .where(
      and(
        isNotNull(m1.approvedAt),
        isNotNull(u1.lat),
        isNotNull(u1.lng),
        isNotNull(u2.lat),
        isNotNull(u2.lng),
        // Evitar duplicatas (só processar u1 < u2)
        ne(p1.activeWhen, "never"),
      )
    );
}
