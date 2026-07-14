import "server-only";

import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pushSubscription } from "../schema";

export async function savePushSubscription(
  userId: string,
  endpoint: string,
  p256dh: string,
  auth: string
) {
  // Upsert por endpoint — evita duplicatas se o usuário subscrever novamente
  await db
    .insert(pushSubscription)
    .values({ userId, endpoint, p256dh, auth })
    .onConflictDoNothing();
}

export async function getUserPushSubscriptions(userId: string) {
  return db
    .select()
    .from(pushSubscription)
    .where(eq(pushSubscription.userId, userId));
}

export async function deletePushSubscription(endpoint: string) {
  await db
    .delete(pushSubscription)
    .where(eq(pushSubscription.endpoint, endpoint));
}

export async function getAllPushSubscriptionsForUsers(userIds: string[]) {
  if (userIds.length === 0) return [];
  return db
    .select()
    .from(pushSubscription)
    .where(inArray(pushSubscription.userId, userIds));
}
