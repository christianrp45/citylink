import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { consentLog, userPrivacySettings, userProximityConfig, userVisibilityConfig } from "../schema";

export async function getUserPrivacySettings(userId: string) {
  const [row] = await db
    .select()
    .from(userPrivacySettings)
    .where(eq(userPrivacySettings.userId, userId));
  return row ?? null;
}

export async function upsertUserPrivacySettings(
  userId: string,
  data: Partial<{
    consentDataProcessing: boolean;
    consentLocation: boolean;
    consentProximityAlerts: boolean;
    consentVisitRequests: boolean;
    consentProfileVisible: boolean;
  }>
) {
  const now = new Date();
  const values: Record<string, any> = { userId, updatedAt: now };
  if (data.consentDataProcessing !== undefined) {
    values.consentDataProcessing = data.consentDataProcessing;
    values.consentDataProcessingAt = now;
  }
  if (data.consentLocation !== undefined) {
    values.consentLocation = data.consentLocation;
    values.consentLocationAt = now;
  }
  if (data.consentProximityAlerts !== undefined) {
    values.consentProximityAlerts = data.consentProximityAlerts;
    values.consentProximityAlertsAt = now;
  }
  if (data.consentVisitRequests !== undefined) {
    values.consentVisitRequests = data.consentVisitRequests;
    values.consentVisitRequestsAt = now;
  }
  if (data.consentProfileVisible !== undefined) {
    values.consentProfileVisible = data.consentProfileVisible;
    values.consentProfileVisibleAt = now;
  }

  await db
    .insert(userPrivacySettings)
    .values(values as any)
    .onConflictDoUpdate({
      target: userPrivacySettings.userId,
      set: { ...values },
    });
}

export async function getUserVisibilityConfig(userId: string) {
  const [row] = await db
    .select()
    .from(userVisibilityConfig)
    .where(eq(userVisibilityConfig.userId, userId));
  return row ?? null;
}

type VisibilityOption = "nobody" | "friends" | "my_community" | "all";

export async function upsertUserVisibilityConfig(
  userId: string,
  data: Partial<{
    locationVisibleTo: VisibilityOption;
    visitRequestFrom: VisibilityOption;
    chatFrom: VisibilityOption;
    profileVisibleTo: VisibilityOption;
  }>
) {
  await db
    .insert(userVisibilityConfig)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: userVisibilityConfig.userId,
      set: {
        ...(data.locationVisibleTo !== undefined && { locationVisibleTo: data.locationVisibleTo }),
        ...(data.visitRequestFrom !== undefined && { visitRequestFrom: data.visitRequestFrom }),
        ...(data.chatFrom !== undefined && { chatFrom: data.chatFrom }),
        ...(data.profileVisibleTo !== undefined && { profileVisibleTo: data.profileVisibleTo }),
        updatedAt: new Date(),
      },
    });
}

export async function getUserProximityConfig(userId: string) {
  const [row] = await db
    .select()
    .from(userProximityConfig)
    .where(eq(userProximityConfig.userId, userId));
  return row ?? null;
}

type ActiveWhenOption = "same_city" | "same_state" | "same_country" | "always" | "never";

export async function upsertUserProximityConfig(
  userId: string,
  data: Partial<{
    isActive: boolean;
    radiusMeters: number;
    activeWhen: ActiveWhenOption;
    locationExpiresHours: number;
    notifyWhenFriendNear: boolean;
    notifyWhenCellMemberNear: boolean;
    notifyWhenCommunityNear: boolean;
    cooldownMinutes: number;
  }>
) {
  await db
    .insert(userProximityConfig)
    .values({ userId, ...data } as any)
    .onConflictDoUpdate({
      target: userProximityConfig.userId,
      set: { ...data, updatedAt: new Date() },
    });
}

export async function updateProximityLastSeen(userId: string) {
  await db
    .update(userProximityConfig)
    .set({ lastLocationAt: new Date() })
    .where(eq(userProximityConfig.userId, userId));
}

// ConsentLog — INSERT ONLY (nunca atualizar, auditoria LGPD)
export async function logConsent(data: {
  userId: string;
  module: string;
  action: "granted" | "revoked";
  ipAddress?: string;
  userAgent?: string;
}) {
  await db.insert(consentLog).values({
    userId: data.userId,
    module: data.module as any,
    action: data.action,
    // Anonimiza IP: apenas primeiros 3 octetos (ex: 200.158.32.xxx)
    ipAddress: data.ipAddress
      ? data.ipAddress.split(".").slice(0, 3).join(".") + ".xxx"
      : undefined,
    userAgent: data.userAgent,
  });
}
