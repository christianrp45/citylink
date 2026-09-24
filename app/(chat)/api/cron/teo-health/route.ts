// GET /api/cron/teo-health
// Roda periodicamente (vercel.json) para checar se o Teo (Gemini) está
// respondendo. Se falhar, envia e-mail de alerta via Resend — evita
// depender de usuários reportarem que o Teo está fora do ar.

import { generateText } from "ai";
import { getFreeModel } from "@/lib/ai/providers";

const ALERT_TO = "contato@ecolabs.com.br";

async function sendAlertEmail(errorText: string) {
  if (!process.env.RESEND_API_KEY) {
    console.error("[cron/teo-health] Teo fora do ar, RESEND_API_KEY não configurado:", errorText);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Emetis <noreply@cliente.veraslog.com.br>",
      to: ALERT_TO,
      subject: "⚠️ Teo fora do ar — Emetis",
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto"><h2 style="color:#dc2626">Teo não está respondendo</h2><p>O health-check do Teo falhou em ${new Date().toISOString()}.</p><p style="background:#f1f5f9;padding:12px;border-radius:8px;font-family:monospace;font-size:13px;white-space:pre-wrap">${errorText}</p></div>`,
    }),
  });

  if (!res.ok) {
    console.error("[cron/teo-health] Falha ao enviar e-mail de alerta:", await res.text());
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { text } = await generateText({
      model: getFreeModel(),
      prompt: "Responda apenas 'ok'.",
    });

    return Response.json({ ok: true, checkedAt: new Date().toISOString(), response: text });
  } catch (err) {
    const errorText = err instanceof Error ? err.message : String(err);
    console.error("[cron/teo-health] Teo fora do ar:", errorText);
    await sendAlertEmail(errorText);
    return Response.json({ ok: false, error: errorText }, { status: 500 });
  }
}
