// GET /api/notifications — agrega notificações de múltiplas fontes
// Sem tabela própria: agrega visitas, mensagens, amizades pendentes e missões

import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/client";
import {
  visitRequest,
  friendship,
  directMessage,
  userMission,
  user,
} from "@/lib/db/schema";
import { and, desc, eq, gt, isNotNull, isNull } from "drizzle-orm";
import { currentWeekKey, MISSIONS } from "@/lib/gamification";

export type NotificationItem = {
  id: string;
  type: "visit" | "friend_request" | "message" | "mission";
  title: string;
  body: string;
  href: string;
  createdAt: string;
  avatarUrl?: string;
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }
  const userId = session.user.id;

  const weekKey = currentWeekKey();
  const notifications: NotificationItem[] = [];

  // 1. Visitas pendentes recebidas
  const pendingVisits = await db
    .select({
      id: visitRequest.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      message: visitRequest.message,
      createdAt: visitRequest.createdAt,
    })
    .from(visitRequest)
    .innerJoin(user, eq(visitRequest.fromUserId, user.id))
    .where(and(eq(visitRequest.toUserId, userId), eq(visitRequest.status, "pending")))
    .orderBy(desc(visitRequest.createdAt))
    .limit(10);

  for (const v of pendingVisits) {
    notifications.push({
      id: `visit-${v.id}`,
      type: "visit",
      title: "Pedido de visita",
      body: `${v.senderName ?? "Alguém"} quer te visitar${v.message ? `: "${v.message.slice(0, 60)}"` : ""}`,
      href: "/profile",
      createdAt: v.createdAt.toISOString(),
      avatarUrl: v.senderAvatar ?? undefined,
    });
  }

  // 2. Pedidos de amizade pendentes
  const pendingFriends = await db
    .select({
      senderId: friendship.userId,
      senderName: user.name,
      senderAvatar: user.avatar,
      createdAt: friendship.createdAt,
    })
    .from(friendship)
    .innerJoin(user, eq(friendship.userId, user.id))
    .where(and(eq(friendship.friendId, userId), eq(friendship.status, "pending")))
    .orderBy(desc(friendship.createdAt))
    .limit(10);

  for (const f of pendingFriends) {
    notifications.push({
      id: `friend-${f.senderId}`,
      type: "friend_request",
      title: "Pedido de amizade",
      body: `${f.senderName ?? "Alguém"} quer se conectar com você`,
      href: "/community",
      createdAt: f.createdAt.toISOString(),
      avatarUrl: f.senderAvatar ?? undefined,
    });
  }

  // 3. Mensagens não lidas — uma notificação por remetente
  const unreadMessages = await db
    .select({
      fromUserId: directMessage.fromUserId,
      senderName: user.name,
      senderAvatar: user.avatar,
      content: directMessage.content,
      createdAt: directMessage.createdAt,
    })
    .from(directMessage)
    .innerJoin(user, eq(directMessage.fromUserId, user.id))
    .where(and(eq(directMessage.toUserId, userId), isNull(directMessage.readAt)))
    .orderBy(desc(directMessage.createdAt))
    .limit(20);

  const seenSenders = new Set<string>();
  for (const m of unreadMessages) {
    if (seenSenders.has(m.fromUserId)) continue;
    seenSenders.add(m.fromUserId);
    notifications.push({
      id: `msg-${m.fromUserId}`,
      type: "message",
      title: "Nova mensagem",
      body: `${m.senderName ?? "Alguém"}: ${m.content.slice(0, 80)}`,
      href: `/chat?with=${m.fromUserId}`,
      createdAt: m.createdAt.toISOString(),
      avatarUrl: m.senderAvatar ?? undefined,
    });
  }

  // 4. Missões completadas esta semana
  const completedMissions = await db
    .select({ action: userMission.action, completedAt: userMission.completedAt })
    .from(userMission)
    .where(
      and(
        eq(userMission.userId, userId),
        eq(userMission.weekKey, weekKey),
        isNotNull(userMission.completedAt),
        gt(userMission.pointsAwarded, 0)
      )
    )
    .orderBy(desc(userMission.completedAt));

  for (const m of completedMissions) {
    if (!m.completedAt) continue;
    const mission = MISSIONS[m.action as keyof typeof MISSIONS];
    if (!mission) continue;
    notifications.push({
      id: `mission-${m.action}-${weekKey}`,
      type: "mission",
      title: "Missão completada",
      body: `${mission.emoji} ${mission.label} (+${mission.points} pts)`,
      href: "/profile",
      createdAt: m.completedAt.toISOString(),
    });
  }

  // Ordena tudo por data desc
  notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return Response.json(notifications.slice(0, 30));
}
