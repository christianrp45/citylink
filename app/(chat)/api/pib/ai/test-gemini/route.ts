import { auth } from "@/app/(auth)/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return Response.json({ ok: false, step: "api_key", error: "GOOGLE_GENERATIVE_AI_API_KEY não encontrada" });
  }

  const keyPreview = `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Responda apenas: OK" }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      }
    );

    const body = await res.text();

    return Response.json({
      ok: res.ok,
      step: "gemini_call",
      status: res.status,
      keyPreview,
      responseBody: body.slice(0, 500),
    });
  } catch (err: unknown) {
    return Response.json({
      ok: false,
      step: "fetch_error",
      keyPreview,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
