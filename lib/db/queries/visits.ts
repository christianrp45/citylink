import "server-only";

import { and, count, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/lib/db/client";
import { user, visitRequest } from "../schema";
import { ChatbotError } from "../../errors";

export async function createVisitRequest(
  fromUserId: string,
  toUserId: string,
  message?: string
) {
  try {
    const [row] = await db
      .insert(visitRequest)
      .values({ fromUserId, toUserId, message, status: "pending" })
      .returning();
    return row;
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to create visit request");
  }
}

export async function respondVisitRequest(
  requestId: string,
  toUserId: string,
  status: "accepted" | "declined" | "postponed"
) {
  try {
    const [row] = await db
      .update(visitRequest)
      .set({ status, respondedAt: new Date() })
      .where(
        and(eq(visitRequest.id, requestId), eq(visitRequest.toUserId, toUserId))
      )
      .returning();
    return row;
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to respond to visit request");
  }
}

export async function getAcceptedVisitsAsSender(fromUserId: string) {
  const toUser = alias(user, "toUser");
  return db
    .select({
      id: visitRequest.id,
      status: visitRequest.status,
      message: visitRequest.message,
      createdAt: visitRequest.createdAt,
      respondedAt: visitRequest.respondedAt,
      toUserId: visitRequest.toUserId,
      toUserName: toUser.name,
      toUserAvatar: toUser.avatar,
      toUserProfession: toUser.profession,
    })
    .from(visitRequest)
    .innerJoin(toUser, eq(toUser.id, visitRequest.toUserId))
    .where(
      and(
        eq(visitRequest.fromUserId, fromUserId),
        eq(visitRequest.status, "accepted")
      )
    )
    .orderBy(desc(visitRequest.respondedAt));
}

export async function getPendingVisitRequests(toUserId: string) {
  try {
    const fromUser = db
      .select({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        profession: user.profession,
      })
      .from(user)
      .as("fromUser");

    return await db
      .select({
        id: visitRequest.id,
        message: visitRequest.message,
        status: visitRequest.status,
        createdAt: visitRequest.createdAt,
        fromUserId: visitRequest.fromUserId,
        fromUserName: fromUser.name,
        fromUserAvatar: fromUser.avatar,
        fromUserProfession: fromUser.profession,
      })
      .from(visitRequest)
      .innerJoin(fromUser, eq(fromUser.id, visitRequest.fromUserId))
      .where(
        and(
          eq(visitRequest.toUserId, toUserId),
          eq(visitRequest.status, "pending")
        )
      )
      .orderBy(desc(visitRequest.createdAt));
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to get pending visits");
  }
}

export async function countPendingVisits(toUserId: string) {
  try {
    const [row] = await db
      .select({ count: count(visitRequest.id) })
      .from(visitRequest)
      .where(
        and(
          eq(visitRequest.toUserId, toUserId),
          eq(visitRequest.status, "pending")
        )
      );
    return row?.count ?? 0;
  } catch (_error) {
    return 0;
  }
}
