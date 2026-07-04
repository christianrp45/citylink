import { auth } from "@/app/(auth)/auth";
import {
  createVisitRequest,
  deletePushSubscription,
  getUserById,
  getUserPushSubscriptions,
} from "@/lib/db/queries";
import { sendPush } from "@/lib/push";

// POST /api/visits — solicitar visita
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.type === "guest") {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { toUserId, message } = await request.json();

  if (!toUserId || typeof toUserId !== "string") {
    return Response.json({ error: "toUserId inválido" }, { status: 400 });
  }

  if (toUserId === session.user.id) {
    return Response.json(
      { error: "Você não pode visitar a si mesmo" },
      { status: 400 }
    );
  }

  // Verifica se o destinatário existe
  const target = await getUserById(toUserId);
  if (!target) {
    return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const visit = await createVisitRequest(
    session.user.id,
    toUserId,
    typeof message === "string" ? message : undefined
  );

  // Se o destino tem Mesa Posta, aceita automaticamente
  const autoAccepted = target.availabilityStatus === "mesa-posta";

  // Notificação push para o destinatário (fire-and-forget)
  const senderName = session.user.email?.split('@')[0] ?? 'Alguém';
  const subs = await getUserPushSubscriptions(toUserId);
  await Promise.all(
    subs.map(async (sub) => {
      const ok = await sendPush(sub, {
        title: autoAccepted
          ? `${senderName} está a caminho! 🚗`
          : `${senderName} quer te visitar`,
        body: autoAccepted
          ? 'Mesa Posta ativa — chegada confirmada automaticamente.'
          : (typeof message === 'string' && message) || 'Toque para ver a solicitação.',
        url: '/profile',
      });
      if (!ok) await deletePushSubscription(sub.endpoint);
    })
  );

  return Response.json({ ...visit, autoAccepted }, { status: 201 });
}
