import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { type BusinessRecommendation, businessRecommendation, user } from "../schema";

export async function getBusinessRecommendations(communityId: string) {
  return await db
    .select({
      id: businessRecommendation.id,
      userId: businessRecommendation.userId,
      comment: businessRecommendation.comment,
      createdAt: businessRecommendation.createdAt,
      userName: user.name,
      userAvatar: user.avatar,
      userProfession: user.profession,
    })
    .from(businessRecommendation)
    .innerJoin(user, eq(businessRecommendation.userId, user.id))
    .where(eq(businessRecommendation.communityId, communityId))
    .orderBy(desc(businessRecommendation.createdAt));
}

export async function toggleBusinessRecommendation(
  communityId: string,
  userId: string,
  comment?: string
): Promise<{ action: 'added' | 'removed' }> {
  const [existing] = await db
    .select()
    .from(businessRecommendation)
    .where(
      and(
        eq(businessRecommendation.communityId, communityId),
        eq(businessRecommendation.userId, userId)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .delete(businessRecommendation)
      .where(eq(businessRecommendation.id, existing.id));
    return { action: 'removed' };
  }

  await db.insert(businessRecommendation).values({
    communityId,
    userId,
    comment: comment ?? null,
  });
  return { action: 'added' };
}
