// GET /api/cron/daily-verse
// Disparado diariamente às 6h (vercel.json)
// Envia o versículo do dia via push para todos os usuários com notificações ativas

import { getAllPushSubscriptions, deletePushSubscription } from "@/lib/db/queries";
import { sendPush } from "@/lib/push";
import { getVerseOfDay } from "@/lib/bible/verses-of-day";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const verse = getVerseOfDay();
    const subs = await getAllPushSubscriptions();

    if (subs.length === 0) {
      return Response.json({ ok: true, sent: 0, verse: verse.ref });
    }

    // Trunca o texto para caber na notificação (max ~100 chars)
    const bodyText =
      verse.text.length > 100
        ? verse.text.slice(0, 97) + "…"
        : verse.text;

    let sent = 0;
    await Promise.all(
      subs.map(async (sub) => {
        const ok = await sendPush(sub, {
          title: `📖 ${verse.ref}`,
          body: bodyText,
          url: `/bible/read/${verse.book}/${verse.chapter}`,
        });
        if (ok) {
          sent++;
        } else {
          await deletePushSubscription(sub.endpoint);
        }
      })
    );

    return Response.json({
      ok: true,
      sent,
      total: subs.length,
      verse: verse.ref,
      processedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cron/daily-verse]", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
