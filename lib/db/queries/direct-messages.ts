import "server-only";

import { and, asc, count, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { directMessage, user } from "../schema";
import { ChatbotError } from "../../errors";

export async function getConversations(userId: string) {
  // Busca todas as mensagens envolvendo o usuário
  const msgs = await db
    .select({
      id: directMessage.id,
      fromUserId: directMessage.fromUserId,
      toUserId: directMessage.toUserId,
      content: directMessage.content,
      createdAt: directMessage.createdAt,
      readAt: directMessage.readAt,
    })
    .from(directMessage)
    .where(
      or(
        eq(directMessage.fromUserId, userId),
        eq(directMessage.toUserId, userId)
      )
    )
    .orderBy(desc(directMessage.createdAt));

  // Agrupa por parceiro de conversa
  const convMap = new Map<
    string,
    {
      lastMessage: (typeof msgs)[0];
      unreadCount: number;
    }
  >();

  for (const msg of msgs) {
    const otherId =
      msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
    if (!convMap.has(otherId)) {
      convMap.set(otherId, { lastMessage: msg, unreadCount: 0 });
    }
    if (msg.toUserId === userId && !msg.readAt) {
      convMap.get(otherId)!.unreadCount++;
    }
  }

  if (convMap.size === 0) return [];

  // Busca dados dos parceiros
  const partnerIds = [...convMap.keys()];
  const partners = await db
    .select({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      profession: user.profession,
      availabilityStatus: user.availabilityStatus,
    })
    .from(user)
    .where(inArray(user.id, partnerIds));

  const partnerMap = new Map(partners.map((p) => [p.id, p]));

  return [...convMap.entries()]
    .map(([otherId, conv]) => ({
      ...conv,
      partner: partnerMap.get(otherId) ?? null,
    }))
    .filter((c) => c.partner !== null)
    .sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
    );
}

export async function getMessageHistory(userId: string, otherId: string) {
  try {
    return await db
      .select()
      .from(directMessage)
      .where(
        or(
          and(
            eq(directMessage.fromUserId, userId),
            eq(directMessage.toUserId, otherId)
          ),
          and(
            eq(directMessage.fromUserId, otherId),
            eq(directMessage.toUserId, userId)
          )
        )
      )
      .orderBy(asc(directMessage.createdAt));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get message history"
    );
  }
}

export async function sendDirectMessage(
  fromUserId: string,
  toUserId: string,
  content: string
) {
  try {
    const [msg] = await db
      .insert(directMessage)
      .values({ fromUserId, toUserId, content })
      .returning();
    return msg;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to send direct message"
    );
  }
}

export async function markMessagesAsRead(fromUserId: string, toUserId: string) {
  try {
    await db
      .update(directMessage)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(directMessage.fromUserId, fromUserId),
          eq(directMessage.toUserId, toUserId),
          isNull(directMessage.readAt) // só atualiza os ainda não lidos
        )
      );
  } catch {
    // silencioso
  }
}

export async function countUnreadMessages(userId: string) {
  try {
    const [row] = await db
      .select({ count: count(directMessage.id) })
      .from(directMessage)
      .where(
        and(
          eq(directMessage.toUserId, userId),
          isNull(directMessage.readAt) // readAt IS NULL = não lido
        )
      );
    return row?.count ?? 0;
  } catch {
    return 0;
  }
}
