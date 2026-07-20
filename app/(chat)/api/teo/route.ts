import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
} from "ai";
import { auth } from "@/app/(auth)/auth";
import { teoPrompt, teoWithPassagePrompt, newUserTeoPrompt } from "@/lib/ai/prompts";
import { getFreeModel } from "@/lib/ai/providers";
import { buscarCapitulo, versiculoDoDia } from "@/lib/ai/tools/teo-tools";
import { searchTheology } from "@/lib/ai/theological-search";
import { getMessageCountByUserId } from "@/lib/db/queries";

export const maxDuration = 60;

const TEO_DAILY_LIMIT = 50;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const messageCount = await getMessageCountByUserId({
    id: session.user.id,
    differenceInHours: 24,
  });

  if (messageCount >= TEO_DAILY_LIMIT) {
    return Response.json(
      { error: "Limite diário atingido. Tente novamente amanhã." },
      { status: 429 }
    );
  }

  const { messages, context } = await request.json();
  const modelMessages = await convertToModelMessages(messages);

  // Seleciona o prompt base conforme o contexto
  let systemPrompt = teoPrompt;
  if (context?.isNewUser) {
    systemPrompt = newUserTeoPrompt;
  } else if (context?.bookName && context?.chapter) {
    systemPrompt = teoWithPassagePrompt(context.bookName, context.chapter);
  }

  // ── Pre-retrieval: injeta contexto teológico relevante no system prompt ──
  // Busca BM25 local na última mensagem do usuário antes de chamar o LLM.
  // Mais confiável que tool call para modelos menores (sem loop de ferramenta).
  const lastUserText = messages
    .filter((m: { role: string }) => m.role === "user")
    .at(-1)
    ?.parts?.find((p: { type: string }) => p.type === "text")?.text ?? "";

  if (lastUserText) {
    const theological = searchTheology(lastUserText, 2);
    if (theological.length > 0) {
      const ctx = theological
        .map((r) =>
          `**${r.title}** (${r.topic})\n${r.content.slice(0, 600)}…\nFontes: ${r.sources.join("; ")}`
        )
        .join("\n\n---\n\n");
      systemPrompt += `\n\n── CONTEXTO TEOLÓGICO (use se relevante) ──\n${ctx}`;
    }
  }

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const result = streamText({
        model: getFreeModel(),
        system: systemPrompt,
        messages: modelMessages,
        tools: {
          buscarCapitulo,
          versiculoDoDia,
        },
        stopWhen: stepCountIs(5),
      });
      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
}
