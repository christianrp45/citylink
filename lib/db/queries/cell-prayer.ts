import "server-only";

import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { prayerInteraction, prayerRequest, user } from "../schema";

export async function getPrayerRequestsByCell(cellId: string, userId: string) {
  const requests = await db
    .select({
      id: prayerRequest.id,
      cellId: prayerRequest.cellId,
      userId: prayerRequest.userId,
      userEmail: user.email,
      content: prayerRequest.content,
      isAnonymous: prayerRequest.isAnonymous,
      isAnswered: prayerRequest.isAnswered,
      createdAt: prayerRequest.createdAt,
    })
    .from(prayerRequest)
    .leftJoin(user, eq(prayerRequest.userId, user.id))
    .where(eq(prayerRequest.cellId, cellId))
    .orderBy(desc(prayerRequest.createdAt));

  // contar interações e verificar se o usuário já orou
  const withCounts = await Promise.all(
    requests.map(async (r) => {
      const [{ total }] = await db
        .select({ total: count() })
        .from(prayerInteraction)
        .where(eq(prayerInteraction.prayerRequestId, r.id));

      const userPrayed = await db
        .select()
        .from(prayerInteraction)
        .where(
          and(
            eq(prayerInteraction.prayerRequestId, r.id),
            eq(prayerInteraction.userId, userId)
          )
        );

      return {
        ...r,
        prayerCount: total,
        userHasPrayed: userPrayed.length > 0,
      };
    })
  );

  return withCounts;
}

export async function createPrayerRequest(data: {
  cellId: string;
  userId: string;
  content: string;
  isAnonymous: boolean;
}) {
  const [newRequest] = await db.insert(prayerRequest).values(data).returning();
  return newRequest;
}

export async function togglePrayerInteraction(
  prayerRequestId: string,
  userId: string
) {
  const existing = await db
    .select()
    .from(prayerInteraction)
    .where(
      and(
        eq(prayerInteraction.prayerRequestId, prayerRequestId),
        eq(prayerInteraction.userId, userId)
      )
    );

  if (existing.length > 0) {
    await db
      .delete(prayerInteraction)
      .where(
        and(
          eq(prayerInteraction.prayerRequestId, prayerRequestId),
          eq(prayerInteraction.userId, userId)
        )
      );
    return { praying: false };
  }

  await db.insert(prayerInteraction).values({ prayerRequestId, userId });
  return { praying: true };
}

export async function markPrayerAnswered(id: string) {
  await db
    .update(prayerRequest)
    .set({ isAnswered: true })
    .where(eq(prayerRequest.id, id));
}
