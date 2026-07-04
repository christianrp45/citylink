import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNotNull,
  isNull,
  lt,
  ne,
  or,
  type SQL,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { ArtifactKind } from "@/components/artifact";
import type { VisibilityType } from "@/components/visibility-selector";
import { ChatbotError } from "../errors";
import { generateUUID } from "../utils";
import {
  alertResponse,
  type Chat,
  chat,
  church,
  type DBMessage,
  directMessage,
  document,
  event,
  eventAttendee,
  friendship,
  message,
  prayerGroup,
  prayerGroupMember,
  pushSubscription,
  samaritanAlert,
  type Suggestion,
  stream,
  suggestion,
  testimonial,
  testimonialComment,
  testimonialLike,
  type User,
  user,
  visitRequest,
  volunteerEnrollment,
  volunteerOpportunity,
  vote,
} from "./schema";
import { generateHashedPassword } from "./utils";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<User[]> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get user by email"
    );
  }
}

export async function createUser(
  email: string,
  password: string,
  name?: string,
  phone?: string,
  profession?: string
) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db
      .insert(user)
      .values({ email, password: hashedPassword, name, phone, profession });
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to create user");
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const [result] = await db.select().from(user).where(eq(user.id, id));
    return result ?? null;
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to get user by id");
  }
}

export async function getNearbyUsers(excludeId: string) {
  try {
    return await db
      .select({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        profession: user.profession,
        availabilityStatus: user.availabilityStatus,
        lat: user.lat,
        lng: user.lng,
      })
      .from(user)
      .where(
        and(
          ne(user.id, excludeId),
          isNotNull(user.lat),
          isNotNull(user.lng),
        )
      );
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get nearby users"
    );
  }
}

export async function updateUserProfile(
  id: string,
  data: {
    name?: string;
    phone?: string;
    profession?: string;
    avatar?: string;
    bio?: string;
    availabilityStatus?: "mesa-posta" | "requer-aviso" | "offline";
    lat?: string;
    lng?: string;
  }
) {
  try {
    const [updated] = await db
      .update(user)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();
    return updated;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to update user profile"
    );
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to create guest user"
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    const userChats = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, userId));

    if (userChats.length === 0) {
      return { deletedCount: 0 };
    }

    const chatIds = userChats.map((c) => c.id);

    await db.delete(vote).where(inArray(vote.chatId, chatIds));
    await db.delete(message).where(inArray(message.chatId, chatIds));
    await db.delete(stream).where(inArray(stream.chatId, chatIds));

    const deletedChats = await db
      .delete(chat)
      .where(eq(chat.userId, userId))
      .returning();

    return { deletedCount: deletedChats.length };
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id)
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Chat[] = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatbotError(
          "not_found:database",
          `Chat with id ${startingAfter} not found`
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatbotError(
          "not_found:database",
          `Chat with id ${endingBefore} not found`
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get chats by user id"
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    if (!selectedChat) {
      return null;
    }

    return selectedChat;
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to get chat by id");
  }
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
  try {
    return await db.insert(message).values(messages);
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to save messages");
  }
}

export async function updateMessage({
  id,
  parts,
}: {
  id: string;
  parts: DBMessage["parts"];
}) {
  try {
    return await db.update(message).set({ parts }).where(eq(message.id, id));
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to update message");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === "up" })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === "up",
    });
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to vote message");
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get votes by chat id"
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to save document");
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get documents by id"
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get document by id"
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp)
        )
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete documents by id after timestamp"
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to save suggestions"
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(eq(suggestion.documentId, documentId));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get suggestions by document id"
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get message by id"
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
      );

    const messageIds = messagesToDelete.map(
      (currentMessage) => currentMessage.id
    );

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds))
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds))
        );
    }
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to update chat visibility by id"
    );
  }
}

export async function updateChatTitleById({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) {
  try {
    return await db.update(chat).set({ title }).where(eq(chat.id, chatId));
  } catch (error) {
    console.warn("Failed to update title for chat", chatId, error);
    return;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, "user")
        )
      )
      .execute();

    return stats?.count ?? 0;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get message count by user id"
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to create stream id"
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get stream ids by chat id"
    );
  }
}

// ============================================================
// CITYLINK — AMIZADES
// ============================================================

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
      })
      .from(friendship)
      .innerJoin(user, eq(user.id, friendship.friendId))
      .where(eq(friendship.userId, userId))
      .orderBy(asc(user.name));
    return rows;
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to get friends");
  }
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

// ============================================================
// CITYLINK — VISITAS
// ============================================================

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
  status: "accepted" | "declined"
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

// ============================================================
// CITYLINK — MENSAGENS DIRETAS
// ============================================================

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

// ============================================================
// FASE 5 — EVENTOS
// ============================================================

export async function getEvents() {
  return db
    .select({
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type,
      address: event.address,
      lat: event.lat,
      lng: event.lng,
      date: event.date,
      organizerId: event.organizerId,
      organizerName: user.name,
      organizerAvatar: user.avatar,
      createdAt: event.createdAt,
    })
    .from(event)
    .leftJoin(user, eq(event.organizerId, user.id))
    .orderBy(asc(event.date));
}

export async function getMyEventIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ eventId: eventAttendee.eventId })
    .from(eventAttendee)
    .where(eq(eventAttendee.userId, userId));
  return rows.map((r) => r.eventId);
}

export async function createEvent(data: {
  title: string;
  description?: string;
  type: "social" | "religious" | "volunteer" | "business";
  address?: string;
  lat?: string;
  lng?: string;
  date: Date;
  organizerId: string;
}) {
  const [created] = await db.insert(event).values(data).returning();
  return created;
}

export async function joinEvent(eventId: string, userId: string) {
  await db
    .insert(eventAttendee)
    .values({ eventId, userId })
    .onConflictDoNothing();
}

export async function leaveEvent(eventId: string, userId: string) {
  await db
    .delete(eventAttendee)
    .where(
      and(eq(eventAttendee.eventId, eventId), eq(eventAttendee.userId, userId))
    );
}

// ============================================================
// FASE 5 — ALERTAS SAMARITANOS
// ============================================================

export async function getAlerts(
  lat?: number,
  lng?: number,
  radiusMeters = 5000
) {
  const rows = await db
    .select({
      id: samaritanAlert.id,
      userId: samaritanAlert.userId,
      userName: user.name,
      userAvatar: user.avatar,
      type: samaritanAlert.type,
      description: samaritanAlert.description,
      lat: samaritanAlert.lat,
      lng: samaritanAlert.lng,
      status: samaritanAlert.status,
      createdAt: samaritanAlert.createdAt,
    })
    .from(samaritanAlert)
    .leftJoin(user, eq(samaritanAlert.userId, user.id))
    .where(eq(samaritanAlert.status, "open"))
    .orderBy(desc(samaritanAlert.createdAt));

  if (!lat || !lng) return rows;

  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  return rows.filter((a) => {
    if (!a.lat || !a.lng) return true;
    const dLat = toRad(parseFloat(a.lat) - lat);
    const dLng = toRad(parseFloat(a.lng) - lng);
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const c =
      2 *
      Math.asin(
        Math.sqrt(
          sinLat * sinLat +
            Math.cos(toRad(lat)) *
              Math.cos(toRad(parseFloat(a.lat))) *
              sinLng * sinLng
        )
      );
    return R * c <= radiusMeters;
  });
}

export async function createAlert(data: {
  userId: string;
  type: "urgency" | "prayer" | "practical_help";
  description: string;
  lat?: string;
  lng?: string;
}) {
  const [created] = await db.insert(samaritanAlert).values(data).returning();
  return created;
}

export async function respondToAlert(alertId: string, userId: string) {
  await db
    .insert(alertResponse)
    .values({ alertId, userId })
    .onConflictDoNothing();
}

export async function resolveAlert(alertId: string, userId: string) {
  await db
    .update(samaritanAlert)
    .set({ status: "resolved" })
    .where(
      and(eq(samaritanAlert.id, alertId), eq(samaritanAlert.userId, userId))
    );
}

// ============================================================
// FASE 6 — PUSH SUBSCRIPTIONS
// ============================================================

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

// ============================================================
// FASE 7 — IGREJAS
// ============================================================

export async function getChurches() {
  return db.select().from(church).orderBy(asc(church.name));
}

export async function createChurch(data: {
  name: string;
  denomination?: string;
  description?: string;
  address?: string;
  lat?: string;
  lng?: string;
  phone?: string;
  schedule?: string;
  pastor?: string;
  members?: number;
  adminUserId: string;
}) {
  const [created] = await db.insert(church).values(data).returning();
  return created;
}

// ============================================================
// FASE 7 — TESTEMUNHOS
// ============================================================

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

// ============================================================
// FASE 7 — GRUPOS DE ORAÇÃO
// ============================================================

export async function getPrayerGroups() {
  const groups = await db
    .select({
      id: prayerGroup.id,
      name: prayerGroup.name,
      description: prayerGroup.description,
      schedule: prayerGroup.schedule,
      topic: prayerGroup.topic,
      isOnline: prayerGroup.isOnline,
      creatorId: prayerGroup.creatorId,
      createdAt: prayerGroup.createdAt,
    })
    .from(prayerGroup)
    .orderBy(desc(prayerGroup.createdAt));

  const ids = groups.map((g) => g.id);
  if (ids.length === 0) return [];

  const members = await db
    .select()
    .from(prayerGroupMember)
    .where(inArray(prayerGroupMember.groupId, ids));

  return groups.map((g) => ({
    ...g,
    memberCount: members.filter((m) => m.groupId === g.id).length,
    memberIds: members.filter((m) => m.groupId === g.id).map((m) => m.userId),
  }));
}

export async function createPrayerGroup(data: {
  name: string;
  description?: string;
  schedule?: string;
  topic?: string;
  isOnline?: boolean;
  creatorId: string;
}) {
  const [created] = await db.insert(prayerGroup).values(data).returning();
  // Criador entra automaticamente
  await db
    .insert(prayerGroupMember)
    .values({ groupId: created.id, userId: data.creatorId })
    .onConflictDoNothing();
  return created;
}

export async function joinPrayerGroup(groupId: string, userId: string) {
  await db
    .insert(prayerGroupMember)
    .values({ groupId, userId })
    .onConflictDoNothing();
}

export async function leavePrayerGroup(groupId: string, userId: string) {
  await db
    .delete(prayerGroupMember)
    .where(
      and(
        eq(prayerGroupMember.groupId, groupId),
        eq(prayerGroupMember.userId, userId)
      )
    );
}

export async function getMyPrayerGroupIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ groupId: prayerGroupMember.groupId })
    .from(prayerGroupMember)
    .where(eq(prayerGroupMember.userId, userId));
  return rows.map((r) => r.groupId);
}

// ============================================================
// FASE 7 — VOLUNTARIADO
// ============================================================

export async function getVolunteerOpportunities() {
  return db
    .select({
      id: volunteerOpportunity.id,
      title: volunteerOpportunity.title,
      description: volunteerOpportunity.description,
      category: volunteerOpportunity.category,
      address: volunteerOpportunity.address,
      date: volunteerOpportunity.date,
      spots: volunteerOpportunity.spots,
      organizerName: volunteerOpportunity.organizerName,
      creatorId: volunteerOpportunity.creatorId,
      createdAt: volunteerOpportunity.createdAt,
    })
    .from(volunteerOpportunity)
    .where(gt(volunteerOpportunity.date, new Date()))
    .orderBy(asc(volunteerOpportunity.date));
}

export async function getVolunteerEnrollmentCounts(
  opportunityIds: string[]
): Promise<Record<string, number>> {
  if (opportunityIds.length === 0) return {};
  const rows = await db
    .select({
      opportunityId: volunteerEnrollment.opportunityId,
      count: count(volunteerEnrollment.userId),
    })
    .from(volunteerEnrollment)
    .where(inArray(volunteerEnrollment.opportunityId, opportunityIds))
    .groupBy(volunteerEnrollment.opportunityId);
  return Object.fromEntries(rows.map((r) => [r.opportunityId, r.count]));
}

export async function getMyEnrollmentIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ opportunityId: volunteerEnrollment.opportunityId })
    .from(volunteerEnrollment)
    .where(eq(volunteerEnrollment.userId, userId));
  return rows.map((r) => r.opportunityId);
}

export async function createVolunteerOpportunity(data: {
  title: string;
  description?: string;
  category?: string;
  address?: string;
  lat?: string;
  lng?: string;
  date: Date;
  spots: number;
  organizerName?: string;
  creatorId: string;
}) {
  const [created] = await db
    .insert(volunteerOpportunity)
    .values(data)
    .returning();
  return created;
}

export async function enrollVolunteer(
  opportunityId: string,
  userId: string
) {
  await db
    .insert(volunteerEnrollment)
    .values({ opportunityId, userId })
    .onConflictDoNothing();
}

export async function unenrollVolunteer(
  opportunityId: string,
  userId: string
) {
  await db
    .delete(volunteerEnrollment)
    .where(
      and(
        eq(volunteerEnrollment.opportunityId, opportunityId),
        eq(volunteerEnrollment.userId, userId)
      )
    );
}
