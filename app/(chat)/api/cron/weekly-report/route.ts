// GET /api/cron/weekly-report
// Disparado toda segunda-feira às 8h (vercel.json)
// Envia push para cada líder de célula com resumo da semana anterior

import { getWeeklyReportData } from "@/lib/db/queries";
import { getUserPushSubscriptions, deletePushSubscription } from "@/lib/db/queries";
import { sendPush } from "@/lib/push";

export async function GET(request: Request) {
  // Proteção por CRON_SECRET
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entries = await getWeeklyReportData();

    let sent = 0;
    let skipped = 0;

    for (const entry of entries) {
      // Só notifica se houver algum dado relevante para reportar
      const hasReunion = entry.lastMeetingAttendance !== null;
      const hasPrayer = entry.newPrayerRequests > 0;
      const hasInactive = entry.inactiveCount > 0;

      if (!hasReunion && !hasPrayer && !hasInactive) {
        skipped++;
        continue;
      }

      // Monta o corpo da notificação
      const parts: string[] = [];
      if (hasReunion) {
        parts.push(`Reunião: ${entry.lastMeetingAttendance}% presença`);
      }
      if (hasPrayer) {
        parts.push(`${entry.newPrayerRequests} pedido${entry.newPrayerRequests > 1 ? 's' : ''} de oração`);
      }
      if (hasInactive) {
        parts.push(`${entry.inactiveCount} inativo${entry.inactiveCount > 1 ? 's' : ''}`);
      }

      const subs = await getUserPushSubscriptions(entry.leaderId);
      await Promise.all(
        subs.map(async (sub) => {
          const ok = await sendPush(sub, {
            title: `📊 ${entry.cellName} — Resumo semanal`,
            body: parts.join(" · "),
            url: `/mdc/dashboard`,
          });
          if (!ok) await deletePushSubscription(sub.endpoint);
        })
      );

      if (subs.length > 0) sent++;
    }

    return Response.json({
      ok: true,
      total: entries.length,
      sent,
      skipped,
      processedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cron/weekly-report]", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
