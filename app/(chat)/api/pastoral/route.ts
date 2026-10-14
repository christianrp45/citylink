import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from "ai";
import { auth } from "@/app/(auth)/auth";
import { pastoralPrompt } from "@/lib/ai/prompts";
import { getFreeModel, getFallbackModel } from "@/lib/ai/providers";
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
      let wroteAnyChunk = false;
      try {
        const result = streamText({
          model: getFreeModel(),
          system: pastoralPrompt,
          messages: modelMessages,
        });
        for await (const chunk of result.toUIMessageStream()) {
          wroteAnyChunk = true;
          writer.write(chunk);
        }
      } catch (err) {
        if (wroteAnyChunk) throw err;
        console.warn("[pastoral] getFreeModel falhou, tentando fallback:", err instanceof Error ? err.message : err);
        const fallback = streamText({
          model: getFallbackModel(),
          system: pastoralPrompt,
          messages: modelMessages,
        });
        for await (const chunk of fallback.toUIMessageStream()) {
          writer.write(chunk);
        }
      }
    },
  });

  return createUIMessageStreamResponse({ stream });
}
