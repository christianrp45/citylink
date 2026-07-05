import {
  createProximityAlert,
  deleteExpiredProximityAlerts,
  getActiveFriendPairs,
  getActiveCommunityMemberPairs,
  getRecentProximityAlert,
  getAllPushSubscriptionsForUsers,
  deletePushSubscription,
} from "@/lib/db/queries";
import { sendPush } from "@/lib/push";

// Haversine em metros
function haversineMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6_371_000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(m: number) {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

async function notifyPair(
  userId: string,
  nearUserId: string,
  userName: string | null,
  nearUserName: string | null,
  distanceMeters: number,
  cooldownMinutes: number,
  relationContext: "friend" | "cell_member" | "community_member"
) {
  // Verifica cooldown
  const alreadyNotified = await getRecentProximityAlert(userId, nearUserId, cooldownMinutes);
  if (alreadyNotified) return;

  // Registra alerta (TTL = 24h por padrão)
  await createProximityAlert({
    userId,
    nearUserId,
    distanceMeters: Math.round(distanceMeters),
    relationContext,
    expiresInHours: 24,
  });

  // Busca subscriptions push
  const subs = await getAllPushSubscriptionsForUsers([userId]);
  const dist = formatDistance(distanceMeters);
  const name = nearUserName ?? "Alguém";

  await Promise.all(
    subs.map(async (sub) => {
      const ok = await sendPush(sub, {
        title: `${name} está a ${dist} de você! 📍`,
        body: "Que tal mandar uma mensagem ou pedir uma visita?",
        url: "/map",
      });
      if (!ok) await deletePushSubscription(sub.endpoint);
    })
  );
}

// GET /api/cron/proximity — chamado pelo Vercel Cron
export async function GET(request: Request) {
  // Proteção por CRON_SECRET
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Limpar alertas expirados (LGPD: dados mínimos)
    await deleteExpiredProximityAlerts();

    let notified = 0;

    // 2. Processar pares de amigos
    const friendPairs = await getActiveFriendPairs();

    for (const pair of friendPairs) {
      if (!pair.user1Lat || !pair.user1Lng || !pair.user2Lat || !pair.user2Lng) continue;

      const dist = haversineMeters(
        parseFloat(pair.user1Lat), parseFloat(pair.user1Lng),
        parseFloat(pair.user2Lat), parseFloat(pair.user2Lng)
      );

      const radius1 = pair.radius1 ?? 500;
      const radius2 = pair.radius2 ?? 500;

      // Notifica user1 se user2 está dentro do raio de user1
      if (dist <= radius1) {
        await notifyPair(
          pair.user1Id, pair.user2Id,
          pair.user1Name, pair.user2Name,
          dist, pair.cooldown1 ?? 60, "friend"
        );
        notified++;
      }

      // Notifica user2 se user1 está dentro do raio de user2
      if (dist <= radius2) {
        await notifyPair(
          pair.user2Id, pair.user1Id,
          pair.user2Name, pair.user1Name,
          dist, pair.cooldown2 ?? 60, "friend"
        );
        notified++;
      }
    }

    // 3. Processar pares de membros de comunidade (evitar duplicatas com amigos)
    const friendSet = new Set(
      friendPairs.map((p) => `${p.user1Id}:${p.user2Id}`)
    );

    const communityPairs = await getActiveCommunityMemberPairs();

    for (const pair of communityPairs) {
      // Pular se já são amigos (já notificado acima)
      const key1 = `${pair.user1Id}:${pair.user2Id}`;
      const key2 = `${pair.user2Id}:${pair.user1Id}`;
      if (friendSet.has(key1) || friendSet.has(key2)) continue;

      if (!pair.user1Lat || !pair.user1Lng || !pair.user2Lat || !pair.user2Lng) continue;

      const dist = haversineMeters(
        parseFloat(pair.user1Lat), parseFloat(pair.user1Lng),
        parseFloat(pair.user2Lat), parseFloat(pair.user2Lng)
      );

      const radius1 = pair.radius1 ?? 500;
      const radius2 = pair.radius2 ?? 500;

      if (dist <= radius1) {
        await notifyPair(
          pair.user1Id, pair.user2Id,
          pair.user1Name, pair.user2Name,
          dist, pair.cooldown1 ?? 60, "community_member"
        );
        notified++;
      }

      if (dist <= radius2) {
        await notifyPair(
          pair.user2Id, pair.user1Id,
          pair.user2Name, pair.user1Name,
          dist, pair.cooldown2 ?? 60, "community_member"
        );
        notified++;
      }
    }

    return Response.json({
      ok: true,
      notified,
      friendPairs: friendPairs.length,
      communityPairs: communityPairs.length,
      processedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cron/proximity]", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
