import { auth } from "@/app/(auth)/auth";
import {
  respondVisitRequest,
  getAllPushSubscriptionsForUsers,
  deletePushSubscription,
} from "@/lib/db/queries";
import { sendPush } from "@/lib/push";

const PUSH_MESSAGES = {
  accepted: {
    title: "Visita confirmada! ✅",
    body: "Sua solicitação foi aceita. Pode ir!",
    url: "/profile",
  },
  declined: {
    title: "Visita recusada",
    body: "Não foi desta vez. Tente outro momento.",
    url: "/map",
  },
  postponed: {
    title: "Daqui a 30 minutos 🕐",
    body: "Ainda não é a hora certa. Tente de novo em 30 min.",
    url: "/map",
  },
};

// POST /api/visits/respond — aceitar, recusar ou adiar visita
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.type === "guest") {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { requestId, status } = await request.json();

  if (!requestId || typeof requestId !== "string") {
    return Response.json({ error: "requestId inválido" }, { status: 400 });
  }

  const VALID = ["accepted", "declined", "postponed"] as const;
  if (!VALID.includes(status)) {
    return Response.json(
      { error: "status deve ser 'accepted', 'declined' ou 'postponed'" },
      { status: 400 }
    );
  }

  const updated = await respondVisitRequest(requestId, session.user.id, status);

  if (!updated) {
    return Response.json(
      { error: "Solicitação não encontrada ou sem permissão" },
      { status: 404 }
    );
  }

  // Notificar o remetente via push
  const responderName = session.user.name ?? "Alguém";
  const pushPayload = {
    ...PUSH_MESSAGES[status as keyof typeof PUSH_MESSAGES],
    title: `${responderName}: ${PUSH_MESSAGES[status as keyof typeof PUSH_MESSAGES].title}`,
  };

  const subs = await getAllPushSubscriptionsForUsers([updated.fromUserId]);
  await Promise.all(
    subs.map(async (sub) => {
      const ok = await sendPush(sub, pushPayload);
      if (!ok) await deletePushSubscription(sub.endpoint);
    })
  );

  return Response.json(updated);
}
