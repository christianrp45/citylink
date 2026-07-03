import { auth } from "@/app/(auth)/auth";
import { getLanguageModel } from "@/lib/ai/providers";
import { generateText } from "ai";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { biblePassage, theme } = await request.json();

  if (!biblePassage) {
    return Response.json(
      { error: "Passagem bíblica é obrigatória" },
      { status: 400 }
    );
  }

  const prompt = `Você é um assistente pastoral brasileiro experiente e acolhedor.
Crie um roteiro completo de célula cristã baseado na passagem: ${biblePassage}
${theme ? `Tema sugerido: ${theme}` : ""}

Responda APENAS com JSON válido, sem texto adicional, seguindo exatamente este schema:
{
  "title": "título criativo e convidativo para o encontro",
  "theme": "tema central em uma frase",
  "icebreaker": "dinâmica ou pergunta leve para os primeiros 10 minutos, que quebre o gelo sem pressão espiritual",
  "studyQuestions": [
    "primeira pergunta de reflexão sobre a passagem",
    "segunda pergunta conectando a passagem à vida prática",
    "terceira pergunta sobre aplicação pessoal",
    "quarta pergunta para compartilhamento em grupo"
  ],
  "application": "desafio específico e prático para a semana, que qualquer pessoa consiga fazer",
  "prayer": "sugestão de como encerrar o encontro em oração, incluindo os temas a interceder"
}

Diretrizes:
- Linguagem: português brasileiro natural, caloroso e sem jargão religioso excessivo
- Foco em aplicação diária, não em teologia abstrata
- As perguntas devem gerar conversa real, não respostas decoradas
- Duração total sugerida: 90 minutos`;

  try {
    const { text } = await generateText({
      model: getLanguageModel("chat-model"),
      prompt,
    });

    // extrair JSON da resposta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { error: "IA não retornou formato válido" },
        { status: 500 }
      );
    }

    const guide = JSON.parse(jsonMatch[0]);
    return Response.json({ ...guide, generatedByAI: true });
  } catch {
    return Response.json(
      { error: "Erro ao gerar roteiro com IA" },
      { status: 500 }
    );
  }
}
