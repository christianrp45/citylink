// GET /api/cron/birthdays
// Disparado diariamente às 8h (vercel.json)
// Notifica amigos quando é o aniversário de alguém

import { db } from "@/lib/db/client";
import { user, friendship } from "@/lib/db/schema";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { getUserPushSubscriptions, deletePushSubscription } from "@/lib/db/queries";
import { sendPush } from "@/lib/push";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    const month = today.getUTCMonth() + 1; // 1-12
    const day   = today.getUTCDate();

    // Busca usuários cujo aniversário é hoje (mes e dia)
    const birthdayUsers = await db
      .select({ id: user.id, name: user.name })
      .from(user)
      .where(
        and(
          isNotNull(user.birthDate),
          sql`EXTRACT(MONTH FROM ${user.birthDate}) = ${month}`,
          sql`EXTRACT(DAY   FROM ${user.birthDate}) = ${day}`
        )
      );

    if (birthdayUsers.length === 0) {
      return Response.json({ ok: true, notified: 0, birthdays: 0 });
    }

    let notified = 0;

    for (const birthday of birthdayUsers) {
      // Busca amigos aceitos do aniversariante
      const friendRows = await db
        .select({ friendId: friendship.friendId })
        .from(friendship)
        .where(
          and(
            eq(friendship.userId, birthday.id),
            eq(friendship.status, "accepted")
          )
        );

      const friendIds = friendRows.map((r) => r.friendId);
      if (friendIds.length === 0) continue;

      const name = birthday.name ?? "Um amigo";

      // Envia push para cada amigo
      for (const friendId of friendIds) {
        const subs = await getUserPushSubscriptions(friendId);
        await Promise.all(
          subs.map(async (sub) => {
            const ok = await sendPush(sub, {
              title: `🎂 Hoje é aniversário de ${name}!`,
              body: "Que tal enviar uma mensagem de parabéns?",
              url: `/chat?with=${birthday.id}`,
            });
            if (!ok) await deletePushSubscription(sub.endpoint);
          })
        );
        if (subs.length > 0) notified++;
      }
    }

    return Response.json({
      ok: true,
      birthdays: birthdayUsers.length,
      notified,
      processedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cron/birthdays]", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
