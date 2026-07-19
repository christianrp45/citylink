import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from "ai";
import { auth } from "@/app/(auth)/auth";
import { teoPrompt, teoWithPassagePrompt } from "@/lib/ai/prompts";
import { getFreeModel } from "@/lib/ai/providers";
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

  // Se vier contexto de passagem bíblica, usa prompt enriquecido
  const systemPrompt =
    context?.bookName && context?.chapter
      ? teoWithPassagePrompt(context.bookName, context.chapter)
      : teoPrompt;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const result = streamText({
        model: getFreeModel(),
        system: systemPrompt,
        messages: modelMessages,
      });
      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
}
