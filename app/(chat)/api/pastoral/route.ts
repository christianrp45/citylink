import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from "ai";
import { auth } from "@/app/(auth)/auth";
import { pastoralPrompt } from "@/lib/ai/prompts";
import { getLanguageModel } from "@/lib/ai/providers";
import { getMessageCountByUserId } from "@/lib/db/queries";

export const maxDuration = 60;

const PASTORAL_DAILY_LIMIT = 30;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const messageCount = await getMessageCountByUserId({
    id: session.user.id,
    differenceInHours: 24,
  });

  if (messageCount >= PASTORAL_DAILY_LIMIT) {
    return Response.json(
      { error: "Limite diário de mensagens atingido. Tente novamente amanhã." },
      { status: 429 }
    );
  }

  const { messages } = await request.json();
  const modelMessages = await convertToModelMessages(messages);

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const result = streamText({
        model: getLanguageModel("google/gemini-2.5-flash-lite"),
        system: pastoralPrompt,
        messages: modelMessages,
      });
      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
}
