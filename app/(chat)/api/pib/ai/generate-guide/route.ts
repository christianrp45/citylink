import { auth } from "@/app/(auth)/auth";
import { getQuebraGelosParaPrompt } from "@/lib/data/quebra-gelos";

export async function GET() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return Response.json({ ok: false, error: "SEM_CHAVE" });
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "diga OK" }] }], generationConfig: { maxOutputTokens: 5 } }) }
    );
    const body = await r.text();
    return Response.json({ ok: r.ok, status: r.status, key: apiKey.slice(0,6)+"...", body: body.slice(0,300) });
  } catch(e: unknown) {
    return Response.json({ ok: false, error: String(e) });
  }
}

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

  const quebraGelosList = getQuebraGelosParaPrompt();

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

  "icebreakerTitle": "Nome da dinâmica escolhida ou adaptada (pode referenciar uma da lista ou criar nova)",
  "icebreaker": "Descrição completa da dinâmica: como conduzir, o que cada um faz, quanto tempo. Deve ser descontraída, sem pressão espiritual, e conectada indiretamente ao tema.",

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
- O quebra-gelo deve ser leve e descontraído; escolha ou adapte uma das dinâmicas abaixo conforme o tema, ou crie uma nova se nenhuma se encaixar bem
- Os links do YouTube ficam vazios (o líder preencherá)

BANCO DE QUEBRA-GELOS DISPONÍVEIS (escolha o mais adequado ao tema da semana):
${quebraGelosList}`;

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Chave da API do Google não configurada no servidor." }, { status: 500 });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error("[generate-guide] Google API error:", geminiRes.status, errBody);
      return Response.json(
        { error: `Erro da API Google (${geminiRes.status}): ${errBody.slice(0, 200)}` },
        { status: 500 }
      );
    }

    const geminiData = await geminiRes.json();
    const text: string = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!text) {
      console.error("[generate-guide] Google retornou resposta vazia:", JSON.stringify(geminiData).slice(0, 300));
      return Response.json({ error: "IA retornou resposta vazia. Tente novamente." }, { status: 500 });
    }

    // Remove markdown code fences que alguns modelos adicionam (```json ... ```)
    const cleaned = text
      .replace(/^```(?:json)?\s*/m, "")
      .replace(/\s*```\s*$/m, "")
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[generate-guide] resposta sem JSON:", text.slice(0, 300));
      return Response.json(
        { error: "IA não retornou formato válido. Tente novamente." },
        { status: 500 }
      );
    }

    let guide: Record<string, unknown>;
    try {
      guide = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("[generate-guide] JSON inválido:", jsonMatch[0].slice(0, 300));
      return Response.json(
        { error: "Resposta da IA com JSON inválido. Tente novamente." },
        { status: 500 }
      );
    }

    return Response.json({ ...guide, generatedByAI: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[generate-guide] erro:", message);
    return Response.json(
      { error: `Erro ao gerar roteiro: ${message}` },
      { status: 500 }
    );
  }
}
