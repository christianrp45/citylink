import { auth } from "@/app/(auth)/auth";
import { getQuebraGelosParaPrompt } from "@/lib/data/quebra-gelos";

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

  const prompt = `Você é um teólogo e pastor batista experiente, especialista em formação de discípulos no modelo da Convenção Batista Brasileira (CBB). Sua tarefa é criar um roteiro de célula completo, teologicamente sólido e pastoralmente rico, seguindo o formato batista de grupos de discipulado em células (MDC).

IDENTIDADE TEOLÓGICA — aplique sempre:
- Autoridade absoluta e suficiência das Sagradas Escrituras (Sola Scriptura)
- Salvação pela graça soberana de Deus mediante a fé em Jesus Cristo (Sola Gratia, Sola Fide)
- Centralidade de Cristo em toda a Escritura (Cristo no AT e NT)
- Visão batista da Igreja: congregacional, composta de crentes regenerados, com dois ordenanças (Batismo e Ceia)
- Compromisso com a Grande Comissão (Mt 28.18-20): evangelismo, discipulado e multiplicação de células
- Perspectiva da CBB: vida comunitária, mordomia cristã, família como célula básica da sociedade
- Uso da Bíblia de Estudo — quando pertinente, mencione o contexto histórico-cultural do texto

${baseInfo}

Responda APENAS com JSON válido, sem texto adicional, seguindo exatamente este schema:

{
  "title": "Título criativo e teologicamente significativo do encontro",
  "biblePassage": "Passagem bíblica principal com referência completa (ex: Romanos 8.28-39)",
  "sermonTitle": "Título exato da pregação",
  "preacher": "Nome do pregador(a)",
  "theme": "Tema central em uma frase — deve revelar a verdade bíblica principal",

  "leaderNote": "Mensagem pastoral de 3-4 linhas EXCLUSIVA para o líder: reflexão sobre o texto em relação ao seu papel de discipulador, saúde espiritual da célula, formação de novos líderes no modelo CBB. Inclua um versículo de encorajamento.",

  "icebreakerTitle": "Nome da dinâmica de quebra-gelo",
  "icebreaker": "Descrição detalhada da dinâmica (5-7 linhas): como iniciar, conduzir e encerrar. Leve, descontraída, sem pressão espiritual, mas com conexão temática indireta. Especifique tempo sugerido (5-10 min).",

  "youtubeLinks": [
    { "title": "Nome da música de louvor 1 — preferencialmente hinos batistas ou louvor contemporâneo cristocêntrico", "url": "" },
    { "title": "Nome da música de louvor 2", "url": "" },
    { "title": "Nome da música de louvor 3", "url": "" }
  ],

  "introduction": "Parágrafo de introdução denso (5-7 linhas): apresente o contexto histórico-cultural do texto bíblico, a relevância do tema para a vida cristã hoje, e como ele se encaixa no plano redentor de Deus. Desperte curiosidade e necessidade espiritual no grupo.",

  "studyPoints": [
    {
      "title": "1) Título do Ponto 1: Subtítulo que revela a verdade bíblica",
      "bibleRef": "Referência principal + 1-2 referências cruzadas complementares (ex: Rm 3.23; Is 53.6; Ef 2.1-3)",
      "content": "Desenvolvimento teológico profundo em 6-8 linhas: (1) explique o significado exegético do texto no seu contexto original; (2) apresente a verdade doutrinária que emerge; (3) mostre como isso se conecta à narrativa bíblica maior (criação, queda, redenção, restauração); (4) aplique concretamente à vida do crente batista hoje.",
      "discussionQuestion": "Pergunta profunda e pessoal que não pode ser respondida com 'sim' ou 'não' — deve desafiar o grupo a refletir sobre sua vida à luz desta verdade bíblica específica.",
      "innerReflection": "Reflexão interior de 3-4 linhas que ilumina o movimento interno que esta verdade provoca: que padrão emocional ou mental a pessoa costuma usar para resistir ou distorcer esta verdade? Como o ego se defende dela? Que forma de desconexão — de si mesmo, dos outros ou de Deus — esta verdade expõe? E como a aceitação genuína desta Palavra pode iniciar um movimento de restauração interior? Escreva em linguagem pastoral e acolhedora, sem jargão técnico."
    },
    {
      "title": "2) Título do Ponto 2: Subtítulo que revela a verdade bíblica",
      "bibleRef": "Referência principal + referências cruzadas",
      "content": "Desenvolvimento teológico profundo em 6-8 linhas seguindo a mesma estrutura: contexto exegético, verdade doutrinária, narrativa bíblica maior, aplicação prática batista.",
      "discussionQuestion": "Pergunta que conecta a verdade bíblica a uma situação concreta da vida, relacionamentos ou missão do grupo.",
      "innerReflection": "Reflexão interior de 3-4 linhas: que impulso interno — de controle, autossuficiência ou negação — esta verdade confronta? Como a pessoa pode, inconscientemente, inverter esta verdade para se proteger de sua exigência? Que emoção ou resistência costuma surgir quando somos chamados a viver isso de verdade? Escreva de forma suave, sem acusação, convidando à consciência e à rendição."
    },
    {
      "title": "3) Título do Ponto 3: Subtítulo que revela a verdade bíblica",
      "bibleRef": "Referência principal + referências cruzadas",
      "content": "Desenvolvimento teológico profundo em 6-8 linhas. Este ponto deve levar à decisão e transformação: o que Deus exige de nós à luz desta verdade?",
      "discussionQuestion": "Pergunta de compromisso: que mudança concreta esta verdade exige da sua vida esta semana? Como você vai obedecer?",
      "innerReflection": "Reflexão interior de 3-4 linhas voltada à transformação: que parte de mim ainda quer ser o centro — o juiz de si mesmo, o dono de suas decisões? Como esta verdade me convida a soltar esse controle e confiar em Deus de forma concreta? Que passo interior — não apenas externo — esta Palavra pede? Finalize com uma frase de convite à rendição e à liberdade que vem de confiar em Cristo."
    }
  ],

  "conclusion": "Conclusão pastoral densa (5-7 linhas): amarre os 3 pontos mostrando a progressão lógica e espiritual, reafirme a verdade central com autoridade das Escrituras, convide à transformação e ao compromisso com Cristo. Termine com uma frase memorável ou versículo-chave.",
  "conclusionQuestion": "Pergunta de aplicação final dupla: (1) Qual verdade deste estudo mais te desafiou? (2) Que passo concreto e verificável você tomará nos próximos 7 dias em obediência a esta Palavra?",
  "leaderTip": "Orientação pastoral prática para o líder: como conduzir o momento de decisão, como orar com o grupo, como dividir em duplas para oração específica, como identificar alguém que precisa de acompanhamento pastoral. Mencione o modelo de célula (célula → distrito → igreja local).",

  "evangelism": "Orientação evangelística em 4-5 linhas: se houver visitantes ou não-crentes, roteiro de apelo claro e respeitoso baseado no Evangelho de graça; se todos forem crentes, desafio à visão missionária — quem você convidará para a próxima célula? Conecte ao compromisso batista com a Grande Comissão.",
  "evangelismStory": "História real ou verossímil de 4-5 linhas sobre conversão, evangelismo ou impacto missionário — preferencialmente no contexto batista brasileiro ou de células. Inclua um título impactante.",
  "evangelismChallenge": "Desafio missionário específico, mensurável e com prazo: uma ação concreta de evangelismo, serviço ou intercessão que o grupo fará até o próximo encontro."
}

Diretrizes de qualidade:
- Profundidade teológica sem pedantismo — acessível mas desafiador
- Sempre ancore cada ponto nas Escrituras, nunca em opinião ou experiência humana
- Linguagem: português brasileiro natural, caloroso, pastoral — como um pastor falando ao seu rebanho
- Se 'sermonContent' foi fornecido, adapte fielmente mantendo os argumentos do pregador
- As perguntas devem ser impossíveis de responder com uma palavra — devem gerar conversa real
- Referências cruzadas devem ser genuínas e relevantes, não decorativas
- O quebra-gelo deve ser escolhido da lista abaixo ou criado — nunca forçado ao tema

BANCO DE QUEBRA-GELOS DISPONÍVEIS:
${quebraGelosList}`;

  const apiKey = process.env.SAMBANOVA_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Chave da API SambaNova não configurada no servidor." }, { status: 500 });
  }

  const MODELS_FALLBACK = [
    "Meta-Llama-3.3-70B-Instruct",
    "Qwen3-32B",
    "Meta-Llama-3.1-405B-Instruct",
  ];

  async function callSambaNova(model: string) {
    return fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 6000,
      }),
    });
  }

  try {
    let aiRes: Response | null = null;
    let usedModel = "";

    for (const model of MODELS_FALLBACK) {
      aiRes = await callSambaNova(model);
      if (aiRes.status !== 429) {
        usedModel = model;
        break;
      }
      console.warn(`[generate-guide] 429 no modelo ${model}, tentando próximo...`);
      aiRes = null;
    }

    if (!aiRes) {
      return Response.json(
        { error: "Serviço de IA com alta demanda no momento. Aguarde alguns segundos e tente novamente." },
        { status: 503 }
      );
    }

    if (!aiRes.ok) {
      const errBody = await aiRes.text();
      console.error("[generate-guide] SambaNova API error:", aiRes.status, errBody);
      return Response.json(
        { error: `Erro da API SambaNova (${aiRes.status}): ${errBody.slice(0, 200)}` },
        { status: 500 }
      );
    }

    console.log(`[generate-guide] roteiro gerado com modelo: ${usedModel}`);

    const groqData = await aiRes.json();
    const text: string = groqData.choices?.[0]?.message?.content ?? "";

    if (!text) {
      console.error("[generate-guide] Groq retornou resposta vazia:", JSON.stringify(groqData).slice(0, 300));
      return Response.json({ error: "IA retornou resposta vazia. Tente novamente." }, { status: 500 });
    }

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
    } catch {
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
