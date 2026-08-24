/**
 * Questões de avaliação de fixação — Série Integrar
 * Formato: 5 questões de múltipla escolha por caderno (gabarito na opção correta)
 * Aprovação: ≥ 3/5 corretas (60%)
 */

export type QuizOption = {
  id: 'a' | 'b' | 'c' | 'd';
  texto: string;
};

export type QuizQuestion = {
  id: number;
  enunciado: string;
  opcoes: QuizOption[];
  correta: 'a' | 'b' | 'c' | 'd';
};

export type CadernoQuiz = {
  caderno: string;
  questoes: QuizQuestion[];
};

export const QUIZZES: Record<string, QuizQuestion[]> = {

  // ─── Caderno I — Primeiros Passos com Jesus ──────────────────────────────────
  'primeiros-passos': [
    {
      id: 1,
      enunciado: 'Segundo a Bíblia, Jesus Cristo é:',
      opcoes: [
        { id: 'a', texto: 'Um profeta poderoso, mas apenas humano' },
        { id: 'b', texto: 'O Filho de Deus, eterno e criador de todas as coisas' },
        { id: 'c', texto: 'Um anjo especial enviado por Deus ao mundo' },
        { id: 'd', texto: 'Um homem santo escolhido entre os profetas' },
      ],
      correta: 'b',
    },
    {
      id: 2,
      enunciado: 'A Bíblia é considerada a Palavra de Deus porque:',
      opcoes: [
        { id: 'a', texto: 'Foi escrita por grandes líderes religiosos da Antiguidade' },
        { id: 'b', texto: 'Foi aprovada por um concílio de bispos no século IV' },
        { id: 'c', texto: 'É inspirada pelo Espírito Santo, preservada por Deus ao longo da história' },
        { id: 'd', texto: 'Contém apenas histórias morais de valor universal' },
      ],
      correta: 'c',
    },
    {
      id: 3,
      enunciado: 'A salvação é alcançada por:',
      opcoes: [
        { id: 'a', texto: 'Boas obras e obediência rigorosa à lei de Deus' },
        { id: 'b', texto: 'A graça de Deus recebida pela fé em Jesus Cristo' },
        { id: 'c', texto: 'Frequentar a igreja e participar dos sacramentos' },
        { id: 'd', texto: 'Ser batizado e entregar dízimos fielmente' },
      ],
      correta: 'b',
    },
    {
      id: 4,
      enunciado: 'O batismo cristão representa principalmente:',
      opcoes: [
        { id: 'a', texto: 'O momento em que a pessoa é salva e nasce de novo' },
        { id: 'b', texto: 'Um rito religioso de passagem cultural' },
        { id: 'c', texto: 'A lavagem dos pecados passados pelo poder da água' },
        { id: 'd', texto: 'Um símbolo público de morte e ressurreição com Cristo' },
      ],
      correta: 'd',
    },
    {
      id: 5,
      enunciado: 'O Espírito Santo é:',
      opcoes: [
        { id: 'a', texto: 'Uma força ou energia divina impessoal' },
        { id: 'b', texto: 'Um anjo de alta hierarquia no céu' },
        { id: 'c', texto: 'A terceira pessoa da Trindade, nosso Auxiliador' },
        { id: 'd', texto: 'A presença espiritual de Jesus após a ressurreição' },
      ],
      correta: 'c',
    },
  ],

  // ─── Caderno II — Primeiros Passos com a Igreja ──────────────────────────────
  'primeiros-passos-com-a-igreja': [
    {
      id: 1,
      enunciado: 'A Igreja, segundo a Bíblia, é:',
      opcoes: [
        { id: 'a', texto: 'O templo físico onde os cristãos se reúnem para culto' },
        { id: 'b', texto: 'A organização religiosa fundada pelos apóstolos' },
        { id: 'c', texto: 'O conjunto de pessoas que creem em Cristo — o Corpo de Cristo' },
        { id: 'd', texto: 'A hierarquia de pastores e líderes cristãos' },
      ],
      correta: 'c',
    },
    {
      id: 2,
      enunciado: 'O discipulado significa:',
      opcoes: [
        { id: 'a', texto: 'Um programa de estudo bíblico com material didático' },
        { id: 'b', texto: 'Fazer seguidores de Cristo que, por sua vez, formam outros seguidores' },
        { id: 'c', texto: 'Uma relação exclusiva entre pastor e membro escolhido' },
        { id: 'd', texto: 'O mesmo processo que o evangelismo' },
      ],
      correta: 'b',
    },
    {
      id: 3,
      enunciado: 'Por que devo participar de uma célula?',
      opcoes: [
        { id: 'a', texto: 'Para cumprir um requisito da liderança da igreja' },
        { id: 'b', texto: 'Para viver o discipulado em comunidade e crescer espiritualmente' },
        { id: 'c', texto: 'Para ganhar pontos de presença no sistema da igreja' },
        { id: 'd', texto: 'Porque é obrigatório para ser membro batizado' },
      ],
      correta: 'b',
    },
    {
      id: 4,
      enunciado: 'A correção fraterna na Igreja serve para:',
      opcoes: [
        { id: 'a', texto: 'Punir membros que cometem erros graves' },
        { id: 'b', texto: 'Manter a ordem e disciplina institucional' },
        { id: 'c', texto: 'Restaurar com amor o irmão que se afastou do caminho de Cristo' },
        { id: 'd', texto: 'Excluir pessoas problemáticas da comunidade' },
      ],
      correta: 'c',
    },
    {
      id: 5,
      enunciado: 'A missão principal da Igreja é:',
      opcoes: [
        { id: 'a', texto: 'Manter tradições religiosas ao longo das gerações' },
        { id: 'b', texto: 'Oferecer serviços sociais e assistência à comunidade' },
        { id: 'c', texto: 'Fazer discípulos de todas as nações, batizando e ensinando' },
        { id: 'd', texto: 'Preservar a doutrina batista histórica' },
      ],
      correta: 'c',
    },
  ],

  // ─── Caderno III — Dons e Espiritualidade ────────────────────────────────────
  'dons-e-espiritualidade': [
    {
      id: 1,
      enunciado: 'Um servo de Jesus se caracteriza principalmente por:',
      opcoes: [
        { id: 'a', texto: 'Buscar reconhecimento e promoção na liderança' },
        { id: 'b', texto: 'Usar sua posição para servir a outros com humildade' },
        { id: 'c', texto: 'Evitar tarefas humildes para focar no ministério principal' },
        { id: 'd', texto: 'Aguardar ser convocado antes de oferecer ajuda' },
      ],
      correta: 'b',
    },
    {
      id: 2,
      enunciado: 'A santificação é:',
      opcoes: [
        { id: 'a', texto: 'Um evento único e instantâneo na conversão' },
        { id: 'b', texto: 'Alcançada somente por pastores e líderes consagrados' },
        { id: 'c', texto: 'Um processo contínuo de crescimento em santidade com a ajuda do Espírito' },
        { id: 'd', texto: 'Completada somente após a morte do crente' },
      ],
      correta: 'c',
    },
    {
      id: 3,
      enunciado: 'Os dons espirituais são dados:',
      opcoes: [
        { id: 'a', texto: 'Apenas a pastores e líderes ordenados pela Igreja' },
        { id: 'b', texto: 'Somente a quem pratica jejum e oração prolongados' },
        { id: 'c', texto: 'A todos os crentes pelo Espírito Santo para edificação da Igreja' },
        { id: 'd', texto: 'Apenas aos que contribuem fielmente com o dízimo' },
      ],
      correta: 'c',
    },
    {
      id: 4,
      enunciado: 'O fruto do Espírito difere dos dons espirituais porque:',
      opcoes: [
        { id: 'a', texto: 'O fruto é produzido pelo esforço humano; os dons vêm de Deus' },
        { id: 'b', texto: 'O fruto reflete o caráter de Cristo em nós; os dons são capacitações para o serviço' },
        { id: 'c', texto: 'O fruto é para líderes; os dons são para todos os membros' },
        { id: 'd', texto: 'O fruto é permanente; os dons são temporários' },
      ],
      correta: 'b',
    },
    {
      id: 5,
      enunciado: 'A oração cristã é fundamentalmente:',
      opcoes: [
        { id: 'a', texto: 'Uma técnica de meditação para alcançar paz interior' },
        { id: 'b', texto: 'Uma fórmula ritualística para obter bênçãos de Deus' },
        { id: 'c', texto: 'Uma conversa íntima e relacional com o Deus pessoal' },
        { id: 'd', texto: 'Um ritual religioso obrigatório diário' },
      ],
      correta: 'c',
    },
  ],

  // ─── Caderno IV — Eu, um Discipulador!? ──────────────────────────────────────
  'eu-um-discipulador': [
    {
      id: 1,
      enunciado: 'O objetivo principal do discipulado bíblico é:',
      opcoes: [
        { id: 'a', texto: 'Aumentar a frequência nas células e o dízimo da igreja' },
        { id: 'b', texto: 'Treinar pessoas para o ministério pastoral ordenado' },
        { id: 'c', texto: 'Fazer seguidores de Cristo que formam outros seguidores' },
        { id: 'd', texto: 'Ensinar a Bíblia de forma sistemática e acadêmica' },
      ],
      correta: 'c',
    },
    {
      id: 2,
      enunciado: 'Um dos maiores obstáculos do discipulado é:',
      opcoes: [
        { id: 'a', texto: 'Falta de material didático adequado e atualizado' },
        { id: 'b', texto: 'A ideia equivocada de que é preciso ser perfeito para discipular' },
        { id: 'c', texto: 'O tamanho da igreja ser pequeno demais para o programa' },
        { id: 'd', texto: 'A falta de apoio financeiro da liderança sênior' },
      ],
      correta: 'b',
    },
    {
      id: 3,
      enunciado: 'O discipulador deve ser principalmente:',
      opcoes: [
        { id: 'a', texto: 'Alguém com formação teológica avançada e certificada' },
        { id: 'b', texto: 'Um professor que transmite conhecimento bíblico detalhado' },
        { id: 'c', texto: 'Um exemplo de vida cristã que caminha junto com o discípulo' },
        { id: 'd', texto: 'Alguém mais velho e experiente na fé do que o discípulo' },
      ],
      correta: 'c',
    },
    {
      id: 4,
      enunciado: 'Ao lidar com um discípulo que tem dúvidas e erros frequentes, o discipulador deve:',
      opcoes: [
        { id: 'a', texto: 'Encaminhar para o pastor para disciplina formal' },
        { id: 'b', texto: 'Suspender o discipulado até que ele esteja mais maduro' },
        { id: 'c', texto: 'Apresentar mais material para ele estudar sozinho' },
        { id: 'd', texto: 'Acompanhar com paciência, oração e orientação bíblica contínua' },
      ],
      correta: 'd',
    },
    {
      id: 5,
      enunciado: 'Os estudos de caso no processo de discipulado servem para:',
      opcoes: [
        { id: 'a', texto: 'Avaliar o conhecimento teórico do discípulo formalmente' },
        { id: 'b', texto: 'Aplicar princípios bíblicos a situações reais da vida' },
        { id: 'c', texto: 'Substituir a leitura do material didático principal' },
        { id: 'd', texto: 'Comparar o progresso de diferentes discípulos na turma' },
      ],
      correta: 'b',
    },
  ],

  // ─── Caderno V — Líderes de Célula ───────────────────────────────────────────
  'lideres-de-celula': [
    {
      id: 1,
      enunciado: 'A célula existe principalmente para:',
      opcoes: [
        { id: 'a', texto: 'Substituir os cultos da igreja nos finais de semana' },
        { id: 'b', texto: 'Ser o ambiente de discipulado, cuidado e multiplicação da Igreja' },
        { id: 'c', texto: 'Arrecadar fundos para projetos da liderança sênior' },
        { id: 'd', texto: 'Reunir pessoas com interesses e idades semelhantes' },
      ],
      correta: 'b',
    },
    {
      id: 2,
      enunciado: 'A multiplicação de células ocorre quando:',
      opcoes: [
        { id: 'a', texto: 'A célula ultrapassa 20 membros regularmente' },
        { id: 'b', texto: 'A liderança da igreja decide que é hora de crescer' },
        { id: 'c', texto: 'Um novo líder é formado e enviado com parte do grupo' },
        { id: 'd', texto: 'A célula conclui todos os cadernos de formação' },
      ],
      correta: 'c',
    },
    {
      id: 3,
      enunciado: 'O líder de célula deve priorizar:',
      opcoes: [
        { id: 'a', texto: 'Preparar estudos bíblicos aprofundados para cada reunião' },
        { id: 'b', texto: 'Garantir presença mínima de 10 pessoas por reunião' },
        { id: 'c', texto: 'Fazer discipulado de seu assistente para futura multiplicação' },
        { id: 'd', texto: 'Reportar todas as atividades semanalmente à liderança' },
      ],
      correta: 'c',
    },
    {
      id: 4,
      enunciado: 'A vida devocional do líder de célula é fundamental porque:',
      opcoes: [
        { id: 'a', texto: 'É um requisito formal para ser reconhecido como líder' },
        { id: 'b', texto: 'Demonstra espiritualidade superior à dos demais membros' },
        { id: 'c', texto: 'O líder só pode dar o que possui em sua relação com Deus' },
        { id: 'd', texto: 'Garante automaticamente o crescimento e sucesso da célula' },
      ],
      correta: 'c',
    },
    {
      id: 5,
      enunciado: 'O papel do supervisor de célula é:',
      opcoes: [
        { id: 'a', texto: 'Controlar e fiscalizar o trabalho dos líderes' },
        { id: 'b', texto: 'Substituir o líder nas reuniões quando necessário' },
        { id: 'c', texto: 'Apoiar, discipular e cuidar dos líderes sob sua responsabilidade' },
        { id: 'd', texto: 'Definir os temas de estudo para cada célula da região' },
      ],
      correta: 'c',
    },
  ],

  // ─── Caderno VI — Nós Cremos ─────────────────────────────────────────────────
  'nos-cremos': [
    {
      id: 1,
      enunciado: 'Para a fé batista, a autoridade máxima em matéria de fé e prática é:',
      opcoes: [
        { id: 'a', texto: 'A tradição da Igreja ao longo dos séculos' },
        { id: 'b', texto: 'A Bíblia Sagrada, inspirada e suficiente' },
        { id: 'c', texto: 'As decisões do Concílio de líderes denominacionais' },
        { id: 'd', texto: 'A consciência moral individual de cada crente' },
      ],
      correta: 'b',
    },
    {
      id: 2,
      enunciado: 'Jesus Cristo é:',
      opcoes: [
        { id: 'a', texto: 'Apenas plenamente divino — sua humanidade foi apenas aparente' },
        { id: 'b', texto: 'Apenas plenamente humano — divinizado por suas obras' },
        { id: 'c', texto: 'Plenamente Deus e plenamente homem em uma só pessoa' },
        { id: 'd', texto: 'Uma manifestação especial do Espírito Santo na terra' },
      ],
      correta: 'c',
    },
    {
      id: 3,
      enunciado: 'O pecado original afetou o ser humano ao:',
      opcoes: [
        { id: 'a', texto: 'Tornar impossível qualquer ação moral positiva' },
        { id: 'b', texto: 'Condenar somente Adão e Eva, sem afetar seus descendentes' },
        { id: 'c', texto: 'Separar o ser humano de Deus e inclinar sua vontade para o mal' },
        { id: 'd', texto: 'Eliminar completamente a imagem de Deus no homem' },
      ],
      correta: 'c',
    },
    {
      id: 4,
      enunciado: 'A salvação bíblica é:',
      opcoes: [
        { id: 'a', texto: 'Garantida a todos os seres humanos independentemente da fé' },
        { id: 'b', texto: 'Dom gratuito de Deus recebido pela fé em Jesus Cristo' },
        { id: 'c', texto: 'Alcançada pela combinação de fé e boas obras' },
        { id: 'd', texto: 'Progressiva e confirmada somente no dia do julgamento' },
      ],
      correta: 'b',
    },
    {
      id: 5,
      enunciado: 'Deus se revela ao ser humano principalmente através de:',
      opcoes: [
        { id: 'a', texto: 'Sonhos e visões concedidos aos líderes espirituais' },
        { id: 'b', texto: 'A tradição acumulada da Igreja ao longo dos séculos' },
        { id: 'c', texto: 'A criação (revelação geral) e as Escrituras Sagradas (revelação especial)' },
        { id: 'd', texto: 'A consciência moral inata presente em cada ser humano' },
      ],
      correta: 'c',
    },
  ],

  // ─── Caderno VII — Autoridade e Submissão Espiritual ─────────────────────────
  'autoridade-e-submissao': [
    {
      id: 1,
      enunciado: 'Toda autoridade humana existe porque:',
      opcoes: [
        { id: 'a', texto: 'Os homens decidiram organizá-la para a convivência social' },
        { id: 'b', texto: 'É delegada por Deus para ordem e bem da sociedade e da Igreja' },
        { id: 'c', texto: 'A Igreja a instituiu para manter a moralidade pública' },
        { id: 'd', texto: 'Surgiu evolutivamente como necessidade humana natural' },
      ],
      correta: 'b',
    },
    {
      id: 2,
      enunciado: 'A atitude bíblica correta diante da autoridade espiritual é:',
      opcoes: [
        { id: 'a', texto: 'Obediência cega a toda determinação do líder' },
        { id: 'b', texto: 'Questionamento sistemático para garantir transparência' },
        { id: 'c', texto: 'Submissão respeitosa, buscando entender a visão da liderança' },
        { id: 'd', texto: 'Participação apenas quando concordar com as decisões tomadas' },
      ],
      correta: 'c',
    },
    {
      id: 3,
      enunciado: 'O sacerdócio universal dos cristãos significa que:',
      opcoes: [
        { id: 'a', texto: 'Todo cristão pode fundar sua própria denominação' },
        { id: 'b', texto: 'Todo crente tem acesso direto a Deus e é chamado a servir' },
        { id: 'c', texto: 'Os pastores não têm autoridade especial sobre os membros' },
        { id: 'd', texto: 'Todo cristão pode administrar os sacramentos da Igreja' },
      ],
      correta: 'b',
    },
    {
      id: 4,
      enunciado: 'O propósito principal da autoridade na Igreja é:',
      opcoes: [
        { id: 'a', texto: 'Manter a hierarquia e ordem institucional da denominação' },
        { id: 'b', texto: 'Garantir a fidelidade financeira dos membros à instituição' },
        { id: 'c', texto: 'Servir, proteger e edificar os membros do Corpo de Cristo' },
        { id: 'd', texto: 'Permitir que líderes governem com eficiência administrativa' },
      ],
      correta: 'c',
    },
    {
      id: 5,
      enunciado: 'Quando uma liderança exige algo contrário à Bíblia, o crente deve:',
      opcoes: [
        { id: 'a', texto: 'Obedecer por respeito à autoridade espiritual constituída' },
        { id: 'b', texto: 'Sair imediatamente da igreja sem qualquer diálogo' },
        { id: 'c', texto: 'Obedecer a Deus em vez dos homens, com respeito e sabedoria' },
        { id: 'd', texto: 'Denunciar publicamente o líder nas redes sociais' },
      ],
      correta: 'c',
    },
  ],

  // ─── Caderno VIII — Cosmovisão Cristã ────────────────────────────────────────
  'cosmovisao-crista': [
    {
      id: 1,
      enunciado: 'Cosmovisão cristã é:',
      opcoes: [
        { id: 'a', texto: 'A opinião dos cristãos sobre questões políticas e sociais' },
        { id: 'b', texto: 'O conjunto de tradições e costumes da cultura evangélica' },
        { id: 'c', texto: 'A lente bíblica pela qual interpretamos toda a realidade e tomamos decisões' },
        { id: 'd', texto: 'A visão de mundo adquirida ao frequentar a igreja regularmente' },
      ],
      correta: 'c',
    },
    {
      id: 2,
      enunciado: 'A identidade cristã é fundamentada em:',
      opcoes: [
        { id: 'a', texto: 'Nossa performance espiritual e consistência devocional' },
        { id: 'b', texto: 'A opinião de nossa comunidade e líderes a nosso respeito' },
        { id: 'c', texto: 'Quem Deus diz que somos segundo as Escrituras' },
        { id: 'd', texto: 'Nossas conquistas e o sucesso em nossa vocação profissional' },
      ],
      correta: 'c',
    },
    {
      id: 3,
      enunciado: 'A ética cristã difere da ética secular porque:',
      opcoes: [
        { id: 'a', texto: 'É mais rígida e gera mais sentimento de culpa nos seguidores' },
        { id: 'b', texto: 'É baseada em mandamentos antigos que não se aplicam à vida moderna' },
        { id: 'c', texto: 'Parte do coração transformado por Cristo, não apenas de regras externas' },
        { id: 'd', texto: 'É exclusiva para pastores e líderes espirituais consagrados' },
      ],
      correta: 'c',
    },
    {
      id: 4,
      enunciado: 'A cultura, sob a perspectiva cristã, deve ser vista como:',
      opcoes: [
        { id: 'a', texto: 'Completamente corrompida e a ser totalmente rejeitada' },
        { id: 'b', texto: 'Plenamente aceita, pois Deus está presente em toda expressão cultural' },
        { id: 'c', texto: 'Um campo missionário onde aplicar os valores do Reino de Deus' },
        { id: 'd', texto: 'Indiferente à fé, pois o espiritual e o cultural não se misturam' },
      ],
      correta: 'c',
    },
    {
      id: 5,
      enunciado: 'O design bíblico para masculinidade e feminilidade reconhece que:',
      opcoes: [
        { id: 'a', texto: 'Homens e mulheres são idênticos em papéis e funções' },
        { id: 'b', texto: 'Mulheres são inferiores aos homens em valor e dignidade' },
        { id: 'c', texto: 'Homem e mulher são iguais em dignidade, mas complementares em design' },
        { id: 'd', texto: 'Os papéis de gênero são criações culturais sem base bíblica' },
      ],
      correta: 'c',
    },
  ],
};

export const QUIZ_PASS_SCORE = 3; // mínimo de acertos para aprovação (de 5)
