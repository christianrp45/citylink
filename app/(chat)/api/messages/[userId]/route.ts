import { auth } from "@/app/(auth)/auth";
import {
  getMessageHistory,
  getUserPushSubscriptions,
  markMessagesAsRead,
  sendDirectMessage,
  getUserById,
  deletePushSubscription,
} from "@/lib/db/queries";
import { sendPush } from "@/lib/push";
import { awardPoints } from "@/lib/gamification";

// GET /api/messages/[userId] — histórico com um usuário
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { userId: otherId } = await params;

  const history = await getMessageHistory(session.user.id, otherId);

  // Marca como lidas as mensagens recebidas
  await markMessagesAsRead(otherId, session.user.id);

  return Response.json(history);
}

// POST /api/messages/[userId] — enviar mensagem
export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();

  if (!session?.user?.id || session.user.type === "guest") {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { userId: toUserId } = await params;
  const { content } = await request.json();

  if (!content || typeof content !== "string" || !content.trim()) {
    return Response.json({ error: "Mensagem vazia" }, { status: 400 });
  }

  if (toUserId === session.user.id) {
    return Response.json(
      { error: "Você não pode enviar mensagem para si mesmo" },
      { status: 400 }
    );
  }

  const target = await getUserById(toUserId);
  if (!target) {
    return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const msg = await sendDirectMessage(
    session.user.id,
    toUserId,
    content.trim()
  );

  // Notificação push para o destinatário (fire-and-forget)
  const senderName = session.user.email?.split('@')[0] ?? 'Alguém';
  const subs = await getUserPushSubscriptions(toUserId);
  await Promise.all(
    subs.map(async (sub) => {
      const ok = await sendPush(sub, {
        title: `Nova mensagem de ${senderName}`,
        body: content.trim().slice(0, 80),
        url: `/chat?with=${session.user.id}`,
      });
      if (!ok) await deletePushSubscription(sub.endpoint);
    })
  );

  void awardPoints(session.user.id, "encourage_someone");

  return Response.json(msg, { status: 201 });
}
