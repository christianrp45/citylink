import "server-only";

import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { testimonial, testimonialComment, testimonialLike, user } from "../schema";

export async function getTestimonials() {
  const rows = await db
    .select({
      id: testimonial.id,
      userId: testimonial.userId,
      authorName: user.name,
      authorAvatar: user.avatar,
      title: testimonial.title,
      content: testimonial.content,
      createdAt: testimonial.createdAt,
    })
    .from(testimonial)
    .leftJoin(user, eq(testimonial.userId, user.id))
    .orderBy(desc(testimonial.createdAt));

  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return [];

  const [likes, comments] = await Promise.all([
    db
      .select({
        testimonialId: testimonialLike.testimonialId,
        userId: testimonialLike.userId,
        emoji: testimonialLike.emoji,
      })
      .from(testimonialLike)
      .where(inArray(testimonialLike.testimonialId, ids)),
    db
      .select({
        id: testimonialComment.id,
        testimonialId: testimonialComment.testimonialId,
        userId: testimonialComment.userId,
        authorName: user.name,
        content: testimonialComment.content,
        createdAt: testimonialComment.createdAt,
      })
      .from(testimonialComment)
      .leftJoin(user, eq(testimonialComment.userId, user.id))
      .where(inArray(testimonialComment.testimonialId, ids))
      .orderBy(asc(testimonialComment.createdAt)),
  ]);

  return rows.map((r) => {
    const myLikes = likes.filter((l) => l.testimonialId === r.id);
    const reactionMap = new Map<string, string[]>();
    for (const l of myLikes) {
      const arr = reactionMap.get(l.emoji) ?? [];
      arr.push(l.userId);
      reactionMap.set(l.emoji, arr);
    }
    const reactions = Array.from(reactionMap.entries()).map(([emoji, userIds]) => ({
      emoji,
      count: userIds.length,
      userIds,
    }));

    return {
      ...r,
      reactions,
      comments: comments.filter((c) => c.testimonialId === r.id),
    };
  });
}

export async function createTestimonial(data: {
  userId: string;
  title: string;
  content: string;
}) {
  const [created] = await db.insert(testimonial).values(data).returning();
  return created;
}

export async function toggleTestimonialLike(
  testimonialId: string,
  userId: string,
  emoji: string = "❤️"
) {
  const existing = await db
    .select()
    .from(testimonialLike)
    .where(
      and(
        eq(testimonialLike.testimonialId, testimonialId),
        eq(testimonialLike.userId, userId)
      )
    );

  if (existing.length > 0) {
    if (existing[0].emoji === emoji) {
      // Mesmo emoji → remove reação
      await db
        .delete(testimonialLike)
        .where(
          and(
            eq(testimonialLike.testimonialId, testimonialId),
            eq(testimonialLike.userId, userId)
          )
        );
      return { reacted: false, emoji: null };
    } else {
      // Emoji diferente → troca
      await db
        .update(testimonialLike)
        .set({ emoji })
        .where(
          and(
            eq(testimonialLike.testimonialId, testimonialId),
            eq(testimonialLike.userId, userId)
          )
        );
      return { reacted: true, emoji };
    }
  } else {
    await db.insert(testimonialLike).values({ testimonialId, userId, emoji });
    return { reacted: true, emoji };
  }
}

export async function addTestimonialComment(data: {
  testimonialId: string;
  userId: string;
  content: string;
}) {
  const [created] = await db
    .insert(testimonialComment)
    .values(data)
    .returning();
  return created;
}
