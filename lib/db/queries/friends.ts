import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { friendship, user } from "../schema";
import { ChatbotError } from "../../errors";

export async function sendFriendRequest(userId: string, friendId: string) {
  try {
    return await db
      .insert(friendship)
      .values({ userId, friendId, status: "pending" })
      .returning();
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to send friend request");
  }
}

export async function acceptFriendRequest(userId: string, friendId: string) {
  try {
    // Aceita o pedido original e cria a relação inversa
    await db
      .update(friendship)
      .set({ status: "accepted" })
      .where(and(eq(friendship.userId, friendId), eq(friendship.friendId, userId)));

    // Garante que a relação inversa existe
    await db
      .insert(friendship)
      .values({ userId, friendId, status: "accepted" })
      .onConflictDoUpdate({
        target: [friendship.userId, friendship.friendId],
        set: { status: "accepted" },
      });
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to accept friend request");
  }
}

export async function removeFriend(userId: string, friendId: string) {
  try {
    await db
      .delete(friendship)
      .where(
        and(eq(friendship.userId, userId), eq(friendship.friendId, friendId))
      );
    await db
      .delete(friendship)
      .where(
        and(eq(friendship.userId, friendId), eq(friendship.friendId, userId))
      );
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to remove friend");
  }
}

export async function getFriends(userId: string) {
  try {
    const rows = await db
      .select({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        profession: user.profession,
        availabilityStatus: user.availabilityStatus,
        lat: user.lat,
        lng: user.lng,
        status: friendship.status,
        circle: friendship.circle,
      })
      .from(friendship)
      .innerJoin(user, eq(user.id, friendship.friendId))
      .where(and(eq(friendship.userId, userId), eq(friendship.status, "accepted")))
      .orderBy(asc(user.name));
    return rows;
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to get friends");
  }
}

// Retorna mapa friendId → circle para uso no /api/users/nearby
export async function getFriendCircles(userId: string): Promise<Record<string, "family" | "friends">> {
  const rows = await db
    .select({ friendId: friendship.friendId, circle: friendship.circle })
    .from(friendship)
    .where(and(eq(friendship.userId, userId), eq(friendship.status, "accepted")));
  return Object.fromEntries(rows.map((r) => [r.friendId, (r.circle ?? "friends") as "family" | "friends"]));
}

export async function updateFriendCircle(
  userId: string,
  friendId: string,
  circle: "family" | "friends"
) {
  await db
    .update(friendship)
    .set({ circle })
    .where(and(eq(friendship.userId, userId), eq(friendship.friendId, friendId)));
}

export async function getFriendshipStatus(userId: string, otherUserId: string) {
  try {
    const [row] = await db
      .select()
      .from(friendship)
      .where(
        and(eq(friendship.userId, userId), eq(friendship.friendId, otherUserId))
      );
    return row ?? null;
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to get friendship status");
  }
}

export async function getAcceptedFriendIds(userId: string) {
  const rows = await db
    .select({ friendId: friendship.friendId })
    .from(friendship)
    .where(
      and(eq(friendship.userId, userId), eq(friendship.status, "accepted"))
    );
  return rows.map((r) => r.friendId);
}
