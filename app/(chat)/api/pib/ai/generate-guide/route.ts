import { auth } from "@/app/(auth)/auth";
import { getLanguageModel } from "@/lib/ai/providers";
import { generateText } from "ai";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { biblePassage, sermonTitle, preacher, theme, sermonContent } =
    await request.json();

  if (!biblePassage && !sermonContent) {
    return Response.json(
      { error: "Informe a passagem bíblica ou o conteúdo da pregação" },
      { status: 400 }
    );
  }

  const baseInfo = [
    sermonTitle && `Título da pregação: ${sermonTitle}`,
    preacher && `Pregador(a): ${preacher}`,
    biblePassage && `Passagem bíblica principal: ${biblePassage}`,
    theme && `Tema: ${theme}`,
    sermonContent &&
      `Conteúdo/texto da pregação para adaptar:\n---\n${sermonContent}\n---`,
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `Você é especialista em roteiros de células no formato da PIB Curitiba (Primeira Igreja Batista de Curitiba). Crie um roteiro completo seguindo EXATAMENTE a estrutura abaixo.

${baseInfo}

Responda APENAS com JSON válido, sem texto adicional, seguindo exatamente este schema:

{
  "title": "título criativo do encontro (baseado na pregação/passagem)",
  "biblePassage": "passagem bíblica principal (ex: Daniel 4:28-34)",
  "sermonTitle": "título exato da pregação",
  "preacher": "nome do pregador(a)",
  "theme": "tema central em uma frase curta",

  "leaderNote": "Mensagem de 2-3 linhas para o líder refletir sobre discipulado, formação de novos líderes ou saúde da célula, conectada ao tema da semana.",

  "icebreakerTitle": "Nome criativo/temático para o quebra-gelo (ex: 'Soft Skill Aleatória', 'Memória de Infância', 'Confissão Inusitada')",
  "icebreaker": "Descrição da dinâmica ou pergunta leve para quebrar o gelo. Deve ser descontraída, sem pressão espiritual, e conectada indiretamente ao tema.",

  "youtubeLinks": [
    { "title": "Nome da música de louvor 1", "url": "" },
    { "title": "Nome da música de louvor 2", "url": "" },
    { "title": "Nome da música de louvor 3", "url": "" }
  ],

  "introduction": "Parágrafo de introdução que apresenta o tema central da pregação de forma envolvente, contextualizando para o grupo.",

  "studyPoints": [
    {
      "title": "1) Título do Ponto 1: Subtítulo explicativo",
      "bibleRef": "Referência bíblica do ponto 1 (ex: Fp 2:3-4)",
      "content": "Desenvolvimento do ponto em 3-4 linhas. Explique o princípio bíblico, conecte com a vida real e seja claro e aplicável.",
      "discussionQuestion": "Pergunta de discussão em negrito — deve gerar conversa real e pessoal sobre este ponto específico."
    },
    {
      "title": "2) Título do Ponto 2: Subtítulo explicativo",
      "bibleRef": "Referência bíblica do ponto 2",
      "content": "Desenvolvimento do ponto em 3-4 linhas.",
      "discussionQuestion": "Pergunta de discussão que conecta a verdade bíblica à vida prática."
    },
    {
      "title": "3) Título do Ponto 3: Subtítulo explicativo",
      "bibleRef": "Referência bíblica do ponto 3",
      "content": "Desenvolvimento do ponto em 3-4 linhas.",
      "discussionQuestion": "Pergunta de discussão que leva à aplicação e mudança de vida."
    }
  ],

  "conclusion": "Parágrafo de conclusão que amarra os 3 pontos, reafirma a verdade central e convida à transformação.",
  "conclusionQuestion": "Pergunta final de checagem e aplicação prática: 'Qual dos pontos mais te chamou atenção? Qual passo prático você tomará esta semana?'",
  "leaderTip": "Dica pastoral para o líder conduzir o momento de conclusão (ex: dividir em micro-grupos de 2-5 pessoas, distribuir líderes em formação, encerrar em oração ou louvor).",

  "evangelism": "Orientação para o líder: se houver não crentes, como fazer o apelo; se todos forem crentes, como comunicar a visão de multiplicação e orar pelos perdidos.",
  "evangelismStory": "Título e texto de uma história inspiradora real (ou fictícia verossímil) sobre evangelismo, missões ou impacto do Reino — conectada ao tema da semana. 2-3 linhas.",
  "evangelismChallenge": "Desafio específico da semana relacionado a evangelismo, missões ou servir a comunidade."
}

Diretrizes importantes:
- Linguagem: português brasileiro natural, caloroso, sem jargão excessivo
- Se 'sermonContent' foi fornecido, adapte fielmente o conteúdo da pregação para os 3 pontos de estudo
- Os 3 pontos devem seguir a estrutura: título + ref bíblica + desenvolvimento + pergunta de discussão
- As perguntas de discussão devem ser pessoais e gerar conversa real, não respostas teóricas
- O quebrando-gelo deve ser leve e descontraído
- Os links do YouTube ficam vazios (o líder preencherá)`;

  try {
    const { text } = await generateText({
      model: getLanguageModel("google/gemini-2.5-flash-lite"),
      prompt,
    });

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
