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

  // Busca likes e comentários para cada testemunho
  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return [];

  const [likes, comments] = await Promise.all([
    db
      .select()
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

  return rows.map((r) => ({
    ...r,
    likes: likes.filter((l) => l.testimonialId === r.id).map((l) => l.userId),
    comments: comments.filter((c) => c.testimonialId === r.id),
  }));
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
  userId: string
) {
  // Verifica se já curtiu
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
    await db
      .delete(testimonialLike)
      .where(
        and(
          eq(testimonialLike.testimonialId, testimonialId),
          eq(testimonialLike.userId, userId)
        )
      );
    return false; // removeu like
  } else {
    await db
      .insert(testimonialLike)
      .values({ testimonialId, userId })
      .onConflictDoNothing();
    return true; // adicionou like
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
