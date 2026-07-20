import { getFreeModel } from "@/lib/ai/providers";
import { generateText } from "ai";

export const maxDuration = 30;

export async function GET() {
  try {
    const { text } = await generateText({
      model: getFreeModel(),
      prompt: "Responda apenas: OK",
      maxTokens: 10,
    });
    return Response.json({ ok: true, text });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
