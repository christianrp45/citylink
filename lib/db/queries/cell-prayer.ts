import "server-only";

import { and, desc, eq } from "drizzle-orm";
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

  const withCounts = await Promise.all(
    requests.map(async (r) => {
      const interactions = await db
        .select({ userId: prayerInteraction.userId, emoji: prayerInteraction.emoji })
        .from(prayerInteraction)
        .where(eq(prayerInteraction.prayerRequestId, r.id));

      // Agrupa reações por emoji
      const reactionMap = new Map<string, number>();
      for (const i of interactions) {
        reactionMap.set(i.emoji, (reactionMap.get(i.emoji) ?? 0) + 1);
      }
      const reactions = Array.from(reactionMap.entries()).map(([emoji, count]) => ({
        emoji,
        count,
      }));

      const userRow = interactions.find((i) => i.userId === userId);

      return {
        ...r,
        reactions,
        prayerCount: interactions.length,
        userHasPrayed: !!userRow,
        userReaction: userRow?.emoji ?? null,
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
  userId: string,
  emoji: string = "🙏"
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
    if (existing[0].emoji === emoji) {
      // Mesmo emoji → remove
      await db
        .delete(prayerInteraction)
        .where(
          and(
            eq(prayerInteraction.prayerRequestId, prayerRequestId),
            eq(prayerInteraction.userId, userId)
          )
        );
      return { praying: false, emoji: null };
    } else {
      // Emoji diferente → troca
      await db
        .update(prayerInteraction)
        .set({ emoji })
        .where(
          and(
            eq(prayerInteraction.prayerRequestId, prayerRequestId),
            eq(prayerInteraction.userId, userId)
          )
        );
      return { praying: true, emoji };
    }
  }

  await db.insert(prayerInteraction).values({ prayerRequestId, userId, emoji });
  return { praying: true, emoji };
}

export async function markPrayerAnswered(id: string) {
  await db
    .update(prayerRequest)
    .set({ isAnswered: true })
    .where(eq(prayerRequest.id, id));
}
