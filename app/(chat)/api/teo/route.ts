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

  // Seleciona o prompt certo conforme o contexto
  let systemPrompt = teoPrompt;
  if (context?.isNewUser) {
    systemPrompt = newUserTeoPrompt;
  } else if (context?.bookName && context?.chapter) {
    systemPrompt = teoWithPassagePrompt(context.bookName, context.chapter);
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
