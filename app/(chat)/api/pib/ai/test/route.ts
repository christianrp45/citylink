import { auth } from "@/app/(auth)/auth";
import { getFreeModel } from "@/lib/ai/providers";
import { generateText } from "ai";

// Endpoint temporário de diagnóstico — remove após resolver o problema.
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Verifica se a variável de ambiente está acessível
  const hasKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const keyPrefix = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.slice(0, 8) ?? "não encontrada";

  try {
    const model = getFreeModel();
    const { text } = await generateText({
      model,
      prompt: 'Responda apenas: OK',
      maxTokens: 10,
    });
    return Response.json({ ok: true, response: text, hasKey, keyPrefix });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack?.slice(0, 500) : undefined;
    return Response.json({ ok: false, error: message, stack, hasKey, keyPrefix }, { status: 500 });
  }
}
