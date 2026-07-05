// POST /api/hospitality  — criar janela de hospitalidade + notificar amigos
// GET  /api/hospitality  — janela ativa do usuário atual

import { auth } from "@/app/(auth)/auth";
import {
  createHospitalityWindow,
  getUserActiveWindow,
  getAcceptedFriendIds,
  getAllPushSubscriptionsForUsers,
  deletePushSubscription,
} from "@/lib/db/queries";
import { sendPush } from "@/lib/push";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const window = await getUserActiveWindow(session.user.id);
  return Response.json(window ?? null);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.type === "guest") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, startsAt, endsAt, radiusMeters } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return Response.json({ error: "title é obrigatório" }, { status: 400 });
  }
  if (!startsAt || !endsAt) {
    return Response.json({ error: "startsAt e endsAt são obrigatórios" }, { status: 400 });
  }

  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (end <= start) {
    return Response.json({ error: "endsAt deve ser posterior a startsAt" }, { status: 400 });
  }

  const created = await createHospitalityWindow({
    userId: session.user.id,
    title: title.trim(),
    description: typeof description === "string" ? description.trim() : undefined,
    startsAt: start,
    endsAt: end,
    radiusMeters: typeof radiusMeters === "number" ? Math.min(Math.max(radiusMeters, 100), 50000) : 5000,
  });

  // Notificar amigos aceitos
  const hostName = session.user.name ?? "Alguém";
  const friendIds = await getAcceptedFriendIds(session.user.id);
  if (friendIds.length > 0) {
    const subs = await getAllPushSubscriptionsForUsers(friendIds);
    await Promise.all(
      subs.map(async (sub) => {
        const ok = await sendPush(sub, {
          title: `${hostName} abriu uma janela 🏠`,
          body: title.trim(),
          url: "/map",
        });
        if (!ok) await deletePushSubscription(sub.endpoint);
      })
    );
  }

  return Response.json(created, { status: 201 });
}
