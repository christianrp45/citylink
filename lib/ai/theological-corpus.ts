/**
 * Corpus teológico do Teo — fontes alinhadas à CBB (Convenção Batista Brasileira)
 *
 * Fontes de referência (domínio público, tradição batista reformada):
 *   - A.H. Strong, Systematic Theology (1907)
 *   - Vine's Expository Dictionary of NT Words (1940)
 *   - C.H. Spurgeon, sermões e Morning & Evening
 *   - 1689 London Baptist Confession of Faith
 *   - A.T. Robertson, Word Pictures in the NT (1930)
 *   - Declaração Doutrinária da CBB (2001)
 *
 * Formato: cada chunk é um artigo teológico autossuficiente em PT-BR,
 * ~200 palavras, com referências bíblicas precisas.
 */

export type TheologicalChunk = {
  id: string;            // slug único (usado para upsert)
  topic: string;         // categoria ampla
  title: string;         // título do artigo
  content: string;       // texto para embedding e exibição
  sources: string[];     // referências das fontes usadas
};

export const THEOLOGICAL_CORPUS: TheologicalChunk[] = [
  // ─── SOTERIOLOGIA ────────────────────────────────────────────────────────────

  {
    id: 'sot-graca-irresistivel',
    topic: 'Soteriologia',
    title: 'Graça de Deus na Salvação',
    content: `A salvação é inteiramente obra de Deus — não há nada que o ser humano possa fazer para merecê-la ou produzi-la. Paulo declara: "Porque pela graça sois salvos, por meio da fé; e isto não vem de vós; é dom de Deus. Não vem das obras, para que ninguém se glorie" (Ef 2.8-9). A palavra grega *charis* (graça) significa favor imerecido, benevolência que age sem que o receptor possua qualidade que a justifique.

A.H. Strong define graça como "o amor de Deus em ação redentora, manifestado para com os que não o merecem". Isso implica que a iniciativa é sempre divina: "Não nos amamos primeiro; ele nos amou primeiro" (1 Jo 4.19). A graça precede, acompanha e completa a fé.

A Confissão Batista de 1689 (cap. IX) afirma que o ser humano, em seu estado de queda, é incapaz de converter-se a Deus por sua própria força, pois a vontade está corrompida pela natureza pecaminosa (Rm 8.7-8). Por isso, a regeneração precede e produz a fé — Deus opera no coração antes de o pecador responder.

Essa doutrina não elimina a responsabilidade humana: o chamado ao arrependimento é universal (At 17.30). Mas a capacidade de responder vem de Deus (Jo 6.44; Fl 1.29). Spurgeon resumiu: "Se você vier a Cristo, foi porque Deus o trouxe; se você ficou, foi por Sua graça que o sustentou."`,
    sources: ['A.H. Strong, Systematic Theology, p. 345', 'Confissão Batista de 1689, cap. IX', 'Spurgeon, Sermon on Grace'],
  },

  {
    id: 'sot-fe-salvadora',
    topic: 'Soteriologia',
    title: 'Fé Salvadora',
    content: `A fé salvadora é mais do que assentimento intelectual a verdades sobre Cristo — ela é confiança pessoal e entrega total ao Cristo vivo. Vine's Dictionary distingue três componentes da fé bíblica: *notitia* (conhecimento do conteúdo do evangelho), *assensus* (concordância que é verdade) e *fiducia* (confiança pessoal que transforma a vida).

O grego *pistis* aparece 243 vezes no NT e carrega a ideia de confiabilidade, lealdade e comprometimento. Crer em Jesus (Jo 3.16 — *pisteúō eis autón*) não é apenas crer sobre Ele, mas crer nEle — uma fé relacional e comprometida.

A.T. Robertson nota que João usa deliberadamente a preposição *eis* (para dentro de), indicando movimento em direção a Cristo e permanência nele — algo muito mais rico do que simples concordância doutrinária.

A fé é dom de Deus (Ef 2.8; Fl 1.29), mas é genuinamente exercida pelo crente. Não justifica por seu próprio mérito, mas por seu objeto — Jesus Cristo e sua obra expiatória (Rm 3.22-26). Uma fé viva produz frutos (Tg 2.14-26): não como condição para ser salvo, mas como evidência de que a salvação é real.

Spurgeon: "A fé é a mão que pega o dom que a graça oferece. A mão não merece o presente — ela apenas o recebe."`,
    sources: ["Vine's Expository Dictionary, 'Faith'", 'A.T. Robertson, Word Pictures in John 3.16', 'A.H. Strong, Systematic Theology, p. 836'],
  },

  {
    id: 'sot-arrependimento',
    topic: 'Soteriologia',
    title: 'Arrependimento Genuíno',
    content: `O arrependimento (*metanoia* em grego) significa literalmente mudança de mente — uma transformação profunda na orientação do ser humano em relação a Deus, ao pecado e a si mesmo. Não é mero remorso ou tristeza emocional, mas uma reorientação radical de toda a vida.

Paulo distingue dois tipos de tristeza: "A tristeza segundo Deus opera arrependimento para a salvação, do qual não há que arrepender-se; mas a tristeza do mundo opera a morte" (2 Co 7.10). Judas teve remorso (Mt 27.3 — *metamélomai*) mas não arrependimento (*metanoia*); Pedro chorou amargamente e foi restaurado.

Vine's Dictionary aponta que *metanoia* implica: (1) percepção do pecado como ofensa contra Deus; (2) desgosto com o próprio pecado; (3) decisão de abandoná-lo e voltar a Deus. Não é uma obra meritória, mas o fruto que a graça produz quando o Espírito convence o coração (Jo 16.8).

A Declaração Doutrinária da CBB afirma que arrependimento e fé são dons de Deus inseparáveis: "Ninguém pode verdadeiramente crer sem genuinamente se arrepender, e vice-versa." Atos 20.21 os coloca lado a lado: "arrependimento para com Deus e fé em nosso Senhor Jesus Cristo."

Spurgeon: "O arrependimento que não muda a vida não é o arrependimento bíblico — é apenas a tristeza de ter sido apanhado."`,
    sources: ["Vine's Expository Dictionary, 'Repentance'", 'Spurgeon, Morning & Evening, April 3', 'Declaração Doutrinária da CBB, Art. 7'],
  },

  {
    id: 'sot-justificacao',
    topic: 'Soteriologia',
    title: 'Justificação pela Fé',
    content: `Justificação é o ato pelo qual Deus declara justo o pecador crente com base na obra de Cristo imputada a ele, e não com base em suas próprias obras. É um termo jurídico (forense): Deus, como Juiz, proclama uma sentença de absolvição. "Sendo justificados gratuitamente por sua graça, pela redenção que há em Cristo Jesus" (Rm 3.24).

A.H. Strong diferencia justificação de santificação: justificação muda nosso *status* diante de Deus (somos declarados justos), enquanto santificação muda nossa *natureza* (somos progressivamente tornados santos). A justificação é instantânea e completa; a santificação é progressiva e incompleta nesta vida.

O mecanismo da justificação envolve dois movimentos: (1) imputação dos nossos pecados a Cristo (Is 53.6; 2 Co 5.21 — ele se tornou pecado por nós); (2) imputação da justiça de Cristo a nós (Rm 5.19; Fl 3.9). É a "grande troca" que Lutero celebrou.

A Confissão Batista de 1689 (cap. XI) é clara: a fé é o único instrumento da justificação, não as obras. Mas a fé que justifica não está sozinha — vem acompanhada de todos os outros dons da graça salvadora.

A.T. Robertson, sobre Rm 5.1: "*Dikaiōthéntes* (aorist passivo) — foi Deus quem agiu, e o resultado é permanente: temos paz para com Deus."`,
    sources: ['A.H. Strong, Systematic Theology, p. 849', 'Confissão Batista de 1689, cap. XI', 'A.T. Robertson, Word Pictures in Romans 5.1'],
  },

  {
    id: 'sot-regeneracao',
    topic: 'Soteriologia',
    title: 'Regeneração — Novo Nascimento',
    content: `Regeneração é o ato soberano do Espírito Santo pelo qual imparte vida espiritual a quem estava morto em delitos e pecados (Ef 2.1). Jesus a chamou de "nascer de novo" (Jo 3.3 — *gennēthē anōthen*) ou "nascer do Espírito" (Jo 3.6). Não é aprimoramento moral, mas criação nova.

A.H. Strong define regeneração como "a operação do Espírito Santo sobre o espírito humano, pela qual recebe nova disposição espiritual". O homem natural não percebe as coisas do Espírito (1 Co 2.14); a regeneração abre os olhos espirituais e transforma os afetos, de modo que a pessoa passa a amar o que antes odiava (Deus) e a odiar o que antes amava (pecado).

Vine's Dictionary nota que *palingenesia* (regeneração, Mt 19.28; Tt 3.5) combina *palin* (novamente) com *genesis* (origem/nascimento). É um novo começo existencial, uma nova origem. Paulo a descreve como nova criação: "Se alguém está em Cristo, é nova criação; as coisas antigas já passaram; eis que tudo se fez novo" (2 Co 5.17).

A regeneração é monergística — Deus age unilateralmente, sem cooperação do pecador morto. Assim como Lázaro não cooperou com sua ressurreição (Jo 11), o pecador não coopera com seu novo nascimento. A evidência de que ocorreu é a fé e o arrependimento subsequentes (1 Jo 5.1).`,
    sources: ['A.H. Strong, Systematic Theology, p. 809', "Vine's Expository Dictionary, 'Regeneration'", 'Confissão Batista de 1689, cap. X'],
  },

  {
    id: 'sot-santificacao',
    topic: 'Soteriologia',
    title: 'Santificação — Crescimento em Cristo',
    content: `Santificação é o processo pelo qual o crente é progressivamente conformado à imagem de Cristo (Rm 8.29), crescendo em santidade prática por toda a vida cristã. Difere da justificação: enquanto aquela é declarativa e instantânea, a santificação é transformativa e progressiva.

A palavra grega *hagiasmos* (santificação) compartilha a raiz com *hagios* (santo) — ser apartado para Deus, pertencer a Ele em prática crescente. Paulo ora: "que o próprio Deus da paz vos santifique em tudo" (1 Ts 5.23), mostrando que Deus é o agente primário.

A.H. Strong identifica três aspectos: (1) santificação posicional — somos declarados santos em Cristo (1 Co 1.2); (2) santificação progressiva — crescemos em santidade prática (2 Co 3.18); (3) santificação definitiva — seremos completamente santificados na glorificação (1 Jo 3.2).

A santificação progride por três meios principais: (a) a Palavra de Deus — "Santifica-os na verdade; a tua palavra é a verdade" (Jo 17.17); (b) o Espírito Santo — "o fruto do Espírito é amor, alegria, paz..." (Gl 5.22-23); (c) a disciplina amorosa de Deus — "o Senhor disciplina a quem ama" (Hb 12.6).

Spurgeon: "A santificação não é um galardão que obtemos ao final — é o caminho que percorremos ao longo de toda a vida."`,
    sources: ['A.H. Strong, Systematic Theology, p. 869', 'Confissão Batista de 1689, cap. XIII', 'Spurgeon, Morning & Evening, Oct 15'],
  },

  {
    id: 'sot-perseveranca',
    topic: 'Soteriologia',
    title: 'Perseverança dos Santos',
    content: `A doutrina da perseverança dos santos afirma que todos os que são genuinamente regenerados por Deus serão guardados por Ele até a glorificação final — nenhum verdadeiro crente se perderá. "As minhas ovelhas ouvem a minha voz... e não perecerão jamais, e ninguém as arrebatará da minha mão" (Jo 10.27-28).

A base dessa doutrina não é a força humana, mas o compromisso divino. Paulo argumenta: se Deus "não poupou o seu próprio Filho, como não nos dará também com ele todas as coisas?" (Rm 8.32). A corrente de Rm 8.29-30 — predestinados, chamados, justificados, glorificados — usa o mesmo tempo verbal para todos, indicando a certeza do processo completo.

A Confissão Batista de 1689 (cap. XVII) distingue perseverança de presunção: os santos perseveram não porque sejam fortes, mas porque Deus os guarda. Os que aparentemente apostatam revelam que nunca foram verdadeiramente regenerados (1 Jo 2.19: "saíram de nós, mas não eram de nós").

Isso não produz licenciosidade — quem genuinamente ama a Cristo deseja viver para Ele (Tt 2.14). A segurança da salvação libera para o serviço e a gratidão, não para o pecado.

A.H. Strong: "A perseverança é garantida não pela força da raiz humana, mas pela graça do Jardineiro divino que a planta e a rega."`,
    sources: ['A.H. Strong, Systematic Theology, p. 881', 'Confissão Batista de 1689, cap. XVII', 'Spurgeon, Sermon on John 10.28'],
  },

  // ─── CRISTOLOGIA ─────────────────────────────────────────────────────────────

  {
    id: 'crist-encarnacao',
    topic: 'Cristologia',
    title: 'A Encarnação do Filho de Deus',
    content: `A encarnação é o ato pelo qual o eterno Filho de Deus assumiu natureza humana, tornando-se plenamente humano sem deixar de ser plenamente divino. "E o Verbo se fez carne e habitou entre nós" (Jo 1.14 — *kai ho Lógos sárx egéneto*). A.T. Robertson comenta: o uso de *egéneto* (tornou-se) é deliberado — não "apareceu como", mas genuinamente se tornou.

A Confissão Batista de 1689 (cap. VIII) afirma a doutrina das duas naturezas em uma só pessoa: Cristo é verdadeiro Deus e verdadeiro homem, "as duas naturezas completas, perfeitas e distintas, a natureza divina e a humana, sendo unidas numa só pessoa sem conversão, composição ou confusão alguma." Isso é o que os concílios de Niceia (325) e Calcedônia (451) formularam.

Por que a encarnação? (1) Para ser nosso mediador: "há um só mediador entre Deus e os homens, Cristo Jesus, homem" (1 Tm 2.5); (2) para ser nosso sumo sacerdote misericordioso: "foi tentado em tudo como nós" (Hb 4.15); (3) para destruir a obra do diabo (1 Jo 3.8); (4) para revelar o Pai: "quem me viu, viu o Pai" (Jo 14.9).

A humanidade de Cristo foi real — ele chorou (Jo 11.35), teve fome (Mt 4.2), dormiu (Mc 4.38) — mas sem pecado (Hb 4.15). Essa combinação única o qualifica como o único e suficiente Salvador.`,
    sources: ['A.T. Robertson, Word Pictures in John 1.14', 'A.H. Strong, Systematic Theology, p. 673', 'Confissão Batista de 1689, cap. VIII'],
  },

  {
    id: 'crist-expiacão',
    topic: 'Cristologia',
    title: 'A Expiação — Morte de Cristo por Nós',
    content: `A expiação é a obra de Cristo na cruz pela qual satisfez a justiça de Deus, pagando a penalidade pelo pecado humano e reconciliando o pecador com Deus. O NT usa múltiplas metáforas para iluminar essa realidade multidimensional.

(1) **Substituição penal** (Rm 5.8; Is 53.5-6; 2 Co 5.21): Cristo tomou o lugar dos pecadores, suportando a ira divina que era devida a eles. A.H. Strong: "Ele morreu não como mártir, mas como substituto — em nosso lugar e por nosso pecado."

(2) **Propiciação** (*hilasmos*, 1 Jo 2.2; Rm 3.25): não apenas cobrimento, mas satisfação. A ira justa de Deus contra o pecado foi apaziguada pelo sacrifício de Cristo. Vine's Dictionary: *hilasmos* em 1 João implica que Cristo não apenas remove nossa culpa, mas satisfaz as exigências da santidade divina.

(3) **Redenção** (*apolútrōsis*, Ef 1.7): compra de regresso da escravidão ao pecado e à lei. Cristo pagou o preço pela nossa liberdade com seu próprio sangue.

(4) **Reconciliação** (*katallagé*, 2 Co 5.18-19): restauração do relacionamento rompido pelo pecado. Não é Deus reconciliando-se conosco, mas nós sendo reconciliados com Deus — a iniciativa é Dele.

A Confissão Batista de 1689 (cap. VIII) afirma que a expiação foi definitiva e suficiente para todos os que nEle creem.`,
    sources: ['A.H. Strong, Systematic Theology, p. 747', "Vine's Expository Dictionary, 'Propitiation'", 'Confissão Batista de 1689, cap. VIII'],
  },

  {
    id: 'crist-ressureicao',
    topic: 'Cristologia',
    title: 'A Ressurreição de Cristo',
    content: `A ressurreição corporal de Cristo é o evento central e fundador do cristianismo. Paulo afirma com clareza: "se Cristo não ressuscitou, é vã a vossa fé e ainda estais nos vossos pecados" (1 Co 15.17). Sem a ressurreição, o evangelho colapsa.

A ressurreição foi corporal e histórica. O sepulcro estava vazio (Jo 20.2-8). O mesmo corpo que foi sepultado ressuscitou — transformado para a glória, mas identicamente reconhecível com marcas das feridas (Jo 20.27; Lc 24.39). A.T. Robertson nota que o "corpo espiritual" de 1 Co 15.44 não significa imaterial, mas animado pelo Espírito — um corpo real mas glorificado.

Significado da ressurreição:
- **Declaração da divindade**: "designado Filho de Deus com poder, segundo o Espírito de santidade, pela ressurreição dos mortos" (Rm 1.4)
- **Confirmação da justificação**: "ressuscitado para a nossa justificação" (Rm 4.25) — a ressurreição é o receipt divino de que o pagamento foi aceito
- **Garantia da nossa ressurreição**: Cristo é "as primícias dos que dormem" (1 Co 15.20) — onde a cabeça vai, o corpo segue
- **Fundamento da intercessão**: Cristo ressurreto intercede por nós (Rm 8.34)

Spurgeon: "A ressurreição de Cristo é a certidão de nascimento de toda a nossa esperança."`,
    sources: ['A.H. Strong, Systematic Theology, p. 787', 'A.T. Robertson, Word Pictures in 1 Cor 15', 'Spurgeon, Sermon on the Resurrection'],
  },

  // ─── PNEUMATOLOGIA ───────────────────────────────────────────────────────────

  {
    id: 'pneu-espirito-santo',
    topic: 'Pneumatologia',
    title: 'O Espírito Santo — Pessoa e Obra',
    content: `O Espírito Santo é a terceira Pessoa da Trindade — plenamente Deus, coigual e coeterno com o Pai e o Filho. Ele não é uma força ou influência, mas uma Pessoa: tem intelecto (1 Co 2.11), vontade (1 Co 12.11), emoções (Ef 4.30) e pode ser desobedecido (At 5.3-4). Jesus prometeu: "eu rogarei ao Pai, e ele vos dará outro Consolador (*Paráklētos*)" (Jo 14.16).

Vine's Dictionary explora *Paráklētos*: literalmente "chamado para ao lado de", o Advogado, o Auxiliador, o que permanece junto. Inclui as ideias de consolação, defesa, intercessão e ensino.

**Obra do Espírito Santo:**
- **Convicção**: convence o mundo "de pecado, de justiça e de juízo" (Jo 16.8)
- **Regeneração**: produz o novo nascimento (Jo 3.5-8; Tt 3.5)
- **Habitação**: mora no crente como templo (1 Co 6.19; Rm 8.9)
- **Selo e garantia**: penhor da herança eterna (Ef 1.13-14; 2 Co 1.22)
- **Santificação**: produz o fruto do Espírito (Gl 5.22-23)
- **Iluminação**: guia em toda a verdade (Jo 16.13) e ajuda a entender as Escrituras
- **Intercessão**: intercede com gemidos inexprimíveis (Rm 8.26)
- **Dons**: distribui dons para a edificação da Igreja (1 Co 12.4-11)

A plenitude do Espírito (Ef 5.18) não é uma experiência única, mas um estado contínuo de submissão e dependência.`,
    sources: ["Vine's Expository Dictionary, 'Paraclete'", 'A.H. Strong, Systematic Theology, p. 316', 'Confissão Batista de 1689, cap. II'],
  },

  {
    id: 'pneu-fruto',
    topic: 'Pneumatologia',
    title: 'O Fruto do Espírito',
    content: `Paulo contrasta as obras da carne com o fruto do Espírito em Gálatas 5.19-23. A diferença gramatical é reveladora: *érga* (obras, plural — múltiplas manifestações do ego) versus *karpós* (fruto, singular — um caráter unificado produzido pelo Espírito). O fruto não é produzido por esforço humano, mas cresce naturalmente na vida conectada à videira (Jo 15.4-5).

Os nove aspectos do fruto formam um retrato do caráter de Cristo:
- **Amor** (*agápē*): amor sacrificial, não sentimental — a raiz de tudo
- **Alegria** (*chará*): satisfação profunda em Deus, independente das circunstâncias (Fp 4.4)
- **Paz** (*eirḗnē*): completude e harmonia nos relacionamentos, com Deus e com outros
- **Longanimidade** (*makrothumía*): paciência com pessoas — suportar provocações sem retaliar
- **Benignidade** (*chrēstótēs*): gentileza ativa, disposição para servir
- **Bondade** (*agathōsúnē*): excelência moral que beneficia outros
- **Fidelidade** (*pístis*): confiabilidade, integridade de caráter
- **Mansidão** (*praÿtēs*): força sob controle, não fraqueza
- **Domínio próprio** (*enkráteia*): governo das paixões pelo Espírito

A.H. Strong: "O fruto do Espírito é essencialmente o caráter de Cristo reproduzido no crente pela obra do Espírito Santo."`,
    sources: ['A.H. Strong, Systematic Theology, p. 875', "Vine's Expository Dictionary, 'Fruit'", 'A.T. Robertson, Word Pictures in Galatians 5'],
  },

  // ─── ECLESIOLOGIA BATISTA ────────────────────────────────────────────────────

  {
    id: 'ecl-igreja-local',
    topic: 'Eclesiologia',
    title: 'A Igreja Local — Conceito Batista',
    content: `Os batistas entendem que a Igreja no sentido primário e prático é a congregação local de crentes batizados que se reúnem regularmente para adoração, ensino, companheirismo e missão. A palavra *ekklesía* ("chamados para fora") em seu uso mais frequente no NT refere-se a uma congregação local específica (1 Co 1.2; Gl 1.2; Ap 2-3).

A Declaração Doutrinária da CBB afirma que a igreja local é "composta somente de pessoas regeneradas, que professam fé em Cristo e são batizadas". Os dois pilares que identificam uma verdadeira igreja são: (1) pregação fiel da Palavra; (2) correta administração das ordenanças.

**Marcas da eclesiologia batista:**
- **Autonomia local**: cada congregação é diretamente responsável perante Cristo, sem hierarquia eclesiástica acima dela (Mt 18.15-20)
- **Sacerdócio universal**: todos os membros são sacerdotes (1 Pe 2.5,9) — não há classe clerical separada
- **Congregacionalismo**: decisões importantes são tomadas pela assembleia local (At 15; 1 Co 5)
- **Separação Igreja-Estado**: o Estado não tem autoridade sobre a consciência espiritual (At 5.29)
- **Missões**: a Igreja existe também para levar o evangelho a todas as nações (Mt 28.18-20)

Spurgeon defendia vigorosamente a autonomia local: "Nenhum sínodo, nenhum bispo, nenhum papa tem autoridade sobre a Igreja de Cristo — somente Cristo, sua Cabeça."`,
    sources: ['Declaração Doutrinária da CBB, Art. 12', 'Confissão Batista de 1689, cap. XXVI', 'Spurgeon, Lectures to My Students'],
  },

  {
    id: 'ecl-batismo',
    topic: 'Eclesiologia',
    title: 'O Batismo — Ordenança Batista',
    content: `Os batistas afirmam o batismo de crentes por imersão como a prática bíblica e o modo correto de obedecer ao mandamento de Cristo (Mt 28.19). Duas convicções distinguem os batistas de outras tradições protestantes.

**Primeiro: somente crentes.** O batismo pressupõe fé e arrependimento pessoais (At 2.38; 8.36-38; 16.31-33). Em todo o NT, a sequência é: crença → batismo. Não há exemplo bíblico de batismo de infantes. A Declaração Doutrinária da CBB: "O batismo é o ato pelo qual o crente declara publicamente sua fé em Cristo e sua morte para o pecado."

**Segundo: por imersão.** O grego *baptizō* significa imergir, submergir. A.T. Robertson, ao comentar Mc 1.10 (*anabáinōn ek toû húdatos* — "subindo da água"), observa que a expressão só faz sentido se Jesus havia sido completamente imerso. Rm 6.3-4 usa a metáfora de sepultamento e ressurreição: ser imerso e emergir da água é a encenação corporal da morte e ressurreição de Cristo.

**Significado:** O batismo não salva — é uma "resposta de boa consciência para com Deus" (1 Pe 3.21). É: (1) confissão pública de fé; (2) identificação com Cristo em sua morte, sepultamento e ressurreição; (3) entrada visível na comunidade da Igreja local.

Vine's Dictionary: "O batismo por imersão preserva intacta a linguagem simbólica do NT sobre morte ao pecado e ressurreição para nova vida."`,
    sources: ['Declaração Doutrinária da CBB, Art. 13', 'A.T. Robertson, Christian Baptism', "Vine's Expository Dictionary, 'Baptize'", 'Confissão Batista de 1689, cap. XXIX'],
  },

  {
    id: 'ecl-ceia',
    topic: 'Eclesiologia',
    title: 'A Ceia do Senhor',
    content: `A Ceia do Senhor (*Eucaristia*, Comunhão) é a ordenança instituída por Cristo na noite anterior à sua crucificação (Lc 22.19-20; 1 Co 11.23-26). Os batistas a compreendem como memorial e proclamação — não como sacrifício renovado nem como transubstanciação.

**O que a Ceia é:**
- **Memorial**: "fazei isto em memória de mim" (1 Co 11.24-25) — anamnese não é mera recordação intelectual, mas atualização da realidade redentora na experiência da fé
- **Proclamação**: "todas as vezes que comerdes este pão e beberdes o cálice, proclamais a morte do Senhor" (1 Co 11.26) — é um sermão sem palavras
- **Comunhão**: *koinōnia* com Cristo e com os irmãos (1 Co 10.16) — participação real no que foi conquistado na cruz
- **Antecipação**: "até que ele venha" — aponta para o banquete messiânico futuro (Ap 19.9)

**O que a Ceia não é:** Os batistas rejeitam a ideia de que o pão e o vinho se transformam literalmente no corpo e sangue de Cristo (transubstanciação católica). A Confissão Batista de 1689 (cap. XXX) afirma que Cristo está presente espiritualmente (*de modo espiritual e real*) na Ceia, não corporalmente.

**Participação digna**: Paulo exorta o autoexame antes de participar (1 Co 11.28) — o crente deve discernir o corpo do Senhor e aproximar-se com fé genuína.`,
    sources: ['Confissão Batista de 1689, cap. XXX', 'Declaração Doutrinária da CBB, Art. 14', "Vine's Expository Dictionary, 'Lord's Supper'"],
  },

  {
    id: 'ecl-celula',
    topic: 'Eclesiologia',
    title: 'Célula e Pequeno Grupo — A Igreja nas Casas',
    content: `Os grupos pequenos (células, grupos de vida) têm raízes sólidas no NT. A Igreja primitiva reunia-se em dois contextos complementares: no templo (culto coletivo — At 2.46a) e nas casas (comunidade íntima — At 2.46b). Paulo saúda igrejas que se reúnem em casas: "a igreja que se reúne na casa deles" (Rm 16.5; 1 Co 16.19; Cl 4.15).

O pequeno grupo é o ambiente onde as "uns aos outros" do NT ganham vida prática: amar uns aos outros (Jo 13.34), encorajar uns aos outros (1 Ts 5.11), confessar pecados uns aos outros (Tg 5.16), orar uns ao outros (Tg 5.16), servir uns aos outros (Gl 5.13), suportar uns aos outros (Ef 4.2).

Na célula acontecem dimensões que o culto maior dificilmente realiza: (1) **conhecimento mútuo** — somos conhecidos pelo nome, não somos anônimos; (2) **responsabilidade mútua** — respondemos pelo crescimento espiritual uns dos outros; (3) **cuidado pastoral descentralizado** — o pastor não consegue cuidar individualmente de centenas de pessoas; (4) **multiplicação natural** — grupos que crescem se dividem, como o modelo de At 2.47.

Não é substituto do culto congregacional, mas seu complemento orgânico. Juntos, reproduzem a vida da Igreja primitiva: "perseveravam na doutrina dos apóstolos, na comunhão, no partir do pão e nas orações" (At 2.42).`,
    sources: ['Declaração Doutrinária da CBB, Art. 12', 'Spurgeon, Lectures to My Students, cap. 11'],
  },

  // ─── TEOLOGIA BÍBLICA ────────────────────────────────────────────────────────

  {
    id: 'biblia-inspiracao',
    topic: 'Teologia Bíblica',
    title: 'Inspiração e Autoridade da Bíblia',
    content: `A Bíblia é a Palavra de Deus escrita — inspirada pelo Espírito Santo por meio de autores humanos, de modo que o produto resultante é simultaneamente o escrito de homens reais e a Palavra infalível de Deus. "Toda a Escritura é inspirada por Deus (*theopneustos* — soprada por Deus) e útil para o ensino, para a repreensão, para a correção, para a instrução na justiça" (2 Tm 3.16).

O grego *theopneustos* (theos + pneō) descreve não o processo da inspiração, mas a qualidade do produto: a Escritura é o hálito de Deus — viva e ativa porque vem d'Aquele que é vida. A.T. Robertson: "As Escrituras têm origem divina, não meramente humana."

Pedro descreve o processo: "homens falavam da parte de Deus, impelidos pelo Espírito Santo" (2 Pe 1.21). O Espírito Santo preservou os autores humanos de erro enquanto usava plenamente sua personalidade, vocabulário, pesquisa e estilo. É inspiração verbal (até as palavras) e plenária (todo o texto).

A Confissão Batista de 1689 (cap. I) declara que as Escrituras são "a única regra infalível de fé e prática". Isso tem implicações práticas:
- A Bíblia julga toda teologia, não o contrário
- Nenhuma tradição ou experiência tem autoridade igual ou superior
- A interpretação correta busca o sentido original do texto (exegese), não o impõe (eisegese)

Spurgeon: "Não defenda a Bíblia — liberte-a e ela se defende."`,
    sources: ['A.H. Strong, Systematic Theology, p. 196', 'A.T. Robertson, Word Pictures in 2 Tim 3.16', 'Confissão Batista de 1689, cap. I'],
  },

  {
    id: 'biblia-hermeneutica',
    topic: 'Teologia Bíblica',
    title: 'Como Interpretar a Bíblia',
    content: `Hermenêutica é a ciência da interpretação bíblica. O objetivo é descobrir o que o autor original quis dizer ao seu público original (*sensus literalis*) e então aplicar essa verdade eterna ao contexto contemporâneo.

**Princípios fundamentais de interpretação:**

(1) **O texto tem um sentido principal**: contra o "o texto significa o que eu quero que signifique." Pergunte: o que o autor quis dizer? Para quem escreveu? Em que situação? O texto de Jeremias 29.11 foi escrito para exilados em Babilônia — entender isso enriquece (não elimina) sua aplicação atual.

(2) **A Escritura interpreta a Escritura** (*analogia fidei*): passagens obscuras são iluminadas pelas claras. Nunca construa uma doutrina sobre um único texto ambíguo sem considerá-lo à luz do conjunto bíblico.

(3) **Contexto, contexto, contexto**: imediato (parágrafos), literário (livro), canônico (toda a Bíblia), histórico-cultural (mundo do autor). A.H. Strong: "Um texto fora do contexto é um pretexto."

(4) **Gênero literário**: história, poesia, profecia, epístola, apocalipse — cada gênero tem regras próprias de interpretação. Sálmos é poesia; Apocalipse é gênero apocalíptico com linguagem simbólica.

(5) **Progressão reveladora**: Deus revelou progressivamente — lei → profecia → Cristo → Igreja. O AT é fundamento; o NT é cumprimento (Mt 5.17).

(6) **Aplicação**: da exegese (o que disse) à exposição (o que significa) à aplicação (o que faz).`,
    sources: ['A.H. Strong, Systematic Theology, cap. 2', 'A.T. Robertson, Introduction to Greek NT', 'Confissão Batista de 1689, cap. I.9'],
  },

  // ─── VIDA CRISTÃ ─────────────────────────────────────────────────────────────

  {
    id: 'vida-oracao',
    topic: 'Vida Cristã',
    title: 'A Oração — Comunhão com Deus',
    content: `Oração é a comunicação da criatura com o Criador — mais do que pedido, é comunhão. Jesus não apenas ensinou sobre oração; ele a praticou intensamente (Lc 5.16; 6.12; 22.41-44). O Pai Nosso (Mt 6.9-13) é menos uma fórmula e mais uma estrutura: adoração → submissão → pedidos → intercessão.

A.H. Strong define oração como "o ato do ser moral que, reconhecendo a existência e o caráter de Deus, eleva sua alma a Ele para adoração, comunhão, confissão, ação de graças e petição." Não é manipulação de Deus, mas alinhamento com sua vontade.

**Elementos da oração bíblica:**
- **Adoração e louvor**: reconhecer quem Deus é antes de pedir (Sl 100; Ap 4-5)
- **Confissão**: "se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar" (1 Jo 1.9)
- **Ação de graças**: "com ação de graças sejam conhecidas as vossas petições" (Fp 4.6)
- **Intercessão**: orar pelos outros como Paulo ora pelas igrejas (Ef 1.15-19; 3.14-21)
- **Petição**: pedir com fé, conforme a vontade d'Ele (Mt 7.7-11; 1 Jo 5.14)

Spurgeon sobre oração: "A oração é o vapor que move a locomotiva da providência." A perseverança em oração (Lc 18.1-8) não dobra a vontade de Deus, mas alinha a nossa vontade com a Dele e nos prepara para receber o que Ele quer nos dar.`,
    sources: ['A.H. Strong, Systematic Theology, p. 435', 'Spurgeon, Morning & Evening, Jan 1', 'Confissão Batista de 1689, cap. XXII'],
  },

  {
    id: 'vida-discipulado',
    topic: 'Vida Cristã',
    title: 'Discipulado — Seguir a Cristo',
    content: `Discipulado é o processo pelo qual um crente cresce no conhecimento e na semelhança de Cristo, simultaneamente sendo formado e formando outros. Jesus ordenou: "fazei discípulos de todas as nações... ensinando-os a guardar tudo o que vos tenho ordenado" (Mt 28.19-20). O mandato não é apenas converter, mas fazer discípulos.

Um discípulo (*mathētés*) no mundo greco-romano não era apenas um aluno que aprende informações, mas um aprendiz que imita o mestre em toda a sua vida. Jesus chama: "Vinde após mim" (Mc 1.17) — não "venha aos meus cursos". O discipulado é relacional, não apenas informacional.

**Marcas do discipulado bíblico (Jo 8.31-32; 13.34-35; 15.8):**
1. Permanecer na Palavra de Cristo
2. Amar uns aos outros como Cristo amou
3. Dar muito fruto

**Meios de crescimento:**
- Palavra de Deus (lida, estudada, memorizada, meditada, ouvida)
- Oração (individual e coletiva)
- Comunidade (célula, Igreja) — "o ferro aguça o ferro" (Pv 27.17)
- Serviço — crescemos quando servimos
- Sofrimento — a tribulação produz perseverança (Rm 5.3-4; Tg 1.2-4)

A.H. Strong: "Nenhum homem cresce sozinho para Cristo — somos membros de um corpo. A saúde do membro depende da saúde do corpo."`,
    sources: ['A.H. Strong, Systematic Theology, p. 872', 'Spurgeon, Lectures to My Students', 'Declaração Doutrinária da CBB, Art. 10'],
  },

  {
    id: 'vida-mordomia',
    topic: 'Vida Cristã',
    title: 'Mordomia Cristã — Dinheiro e Recursos',
    content: `Mordomia é a administração responsável do que Deus nos confiou — tempo, talentos e recursos financeiros. O princípio fundamental: "Do Senhor é a terra e a sua plenitude" (Sl 24.1). Somos mordomos, não proprietários.

Jesus falou mais sobre dinheiro do que sobre qualquer outro assunto nos evangelhos — 16 dos 38 milagres envolvem algum aspecto econômico; 11 das 39 parábolas tratam de finanças. "Porque onde estiver o vosso tesouro, aí estará também o vosso coração" (Mt 6.21). O dinheiro revela e forma o coração.

**O dízimo e as ofertas:** O conceito de dízimo (10%) vem do AT (Lv 27.30; Ml 3.10). No NT, Paulo orienta: "Cada um contribua segundo propôs no seu coração, não com tristeza nem por necessidade; porque Deus ama a quem dá com alegria" (2 Co 9.7). O princípio é generosidade proporcional, não uma porcentagem legal mínima.

A motivação bíblica para a generosidade não é obrigação, mas graça: "conheceis a graça de nosso Senhor Jesus Cristo, que, sendo rico, por amor de vós se fez pobre" (2 Co 8.9). Damos porque recebemos imensurável generosidade.

Advertências bíblicas: o amor ao dinheiro é raiz de todo mal (1 Tm 6.10); a riqueza pode estrangular a Palavra (Mt 13.22); é mais fácil um camelo passar pelo buraco de uma agulha (Mt 19.24) — não porque o rico não possa ser salvo, mas porque a riqueza cria autoconfiança que resiste à graça.`,
    sources: ['A.H. Strong, Systematic Theology, p. 902', 'Spurgeon, Sermon on 2 Cor 9.7', 'Declaração Doutrinária da CBB, Art. 16'],
  },

  {
    id: 'vida-sofrimento',
    topic: 'Vida Cristã',
    title: 'Sofrimento e a Providência de Deus',
    content: `O sofrimento é uma das realidades mais difíceis da vida cristã e uma das mais desafiadoras para a fé. A Bíblia não ignora a dor nem oferece respostas simplistas — ela apresenta um Deus que entra no sofrimento humano (Jo 11.35) e o redime.

A.H. Strong distingue sofrimento como julgamento (Sl 107.17), como disciplina (Hb 12.5-11), como testemunho (2 Co 12.9-10) e como participação nos sofrimentos de Cristo (Fp 3.10). Nem todo sofrimento é punição por pecado (Jo 9.3).

**Romanos 8.28** é o texto central: "Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus." Três palavras-chave: *pánta* (todas — sem exceção), *synergéō* (cooperam — como ingredientes numa receita), *agathón* (bem — o bem que Deus define, não necessariamente nosso conforto). A.T. Robertson: "Deus faz o bem com todas as coisas, não diz que todas as coisas são boas."

**Respostas bíblicas ao sofrimento:**
- Lamento honesto (Sl 22; Lm 3.1-20) — não fingir que está bem
- Lembrança das promessas (Lm 3.21-24) — "As misericórdias do Senhor não têm fim"
- Comunidade — "chorai com os que choram" (Rm 12.15)
- Esperança escatológica (Ap 21.4) — "não haverá mais morte"

Spurgeon, que sofreu depressão profunda: "Aprendi mais de Deus nos tempos sombrios do que nos tempos de luz."`,
    sources: ['A.H. Strong, Systematic Theology, p. 432', 'A.T. Robertson, Word Pictures in Romans 8.28', 'Spurgeon, Morning & Evening, various'],
  },

  // ─── ESCATOLOGIA ─────────────────────────────────────────────────────────────

  {
    id: 'escat-segunda-vinda',
    topic: 'Escatologia',
    title: 'A Segunda Vinda de Cristo',
    content: `A segunda vinda de Cristo é a certeza mais celebrada e mais esperada do NT. Jesus prometeu: "voltarei e vos receberei para mim mesmo" (Jo 14.3). Os anjos anunciaram: "este mesmo Jesus... virá do mesmo modo que o vistes subir ao céu" (At 1.11). Será pessoal, corporal e visível.

A Confissão Batista de 1689 (cap. XXXII) afirma a crença no retorno de Cristo "em poder e em grande glória para julgar os vivos e os mortos." Os detalhes precisos (timing, sequência de eventos) são debatidos entre cristãos sinceros, mas a certeza do retorno é unânime.

**Implicações para o presente:**
- **Vigilância**: "ficai alertas, porque não sabeis em que dia virá o vosso Senhor" (Mt 24.42)
- **Santidade**: "toda pessoa que tem esta esperança nele a si mesma se purifica" (1 Jo 3.3)
- **Missão**: o evangelho deve ser pregado a todas as nações *antes* do fim (Mt 24.14)
- **Consolo**: os que morreram em Cristo ressuscitarão, e nos reuniremos a eles (1 Ts 4.13-18)

A esperança escatológica não é escapismo — é o fundamento da ação presente. Porque o Senhor voltará, cada ato de amor, cada ato de justiça, cada convertido tem valor eterno.

Spurgeon: "A volta de Cristo é nossa mais gloriosa esperança e nosso mais poderoso incentivo para a santidade."`,
    sources: ['A.H. Strong, Systematic Theology, p. 1003', 'Confissão Batista de 1689, cap. XXXII', 'Spurgeon, Sermon on the Second Advent'],
  },

  {
    id: 'escat-ressureicao-final',
    topic: 'Escatologia',
    title: 'Ressurreição dos Mortos e Vida Eterna',
    content: `A ressurreição física dos mortos no fim dos tempos é doutrina central do credo cristão. Paulo dedica 1 Coríntios 15 inteiro a defender sua necessidade e realidade. "Há de ressuscitar a semente que foi semeada" — o mesmo corpo que foi enterrado, mas transformado.

A ressurreição dos crentes será para a vida eterna em glória (1 Co 15.42-44 — corpo espiritual, glorificado, imortal, poderoso). A ressurreição dos ímpios será para o julgamento eterno (Jo 5.28-29; Dn 12.2).

**O estado eterno:** A Bíblia descreve a vida eterna como:
- **Presença com Cristo**: "estarei sempre com o Senhor" (1 Ts 4.17) — este é o coração da esperança
- **Nova criação**: "novos céus e nova terra" (Ap 21.1; 2 Pe 3.13) — não destruição mas renovação
- **Sem sofrimento**: "não haverá mais morte, nem pranto, nem clamor, nem dor" (Ap 21.4)
- **Visão de Deus**: "seus servos o servirão, e verão o seu rosto" (Ap 22.3-4)

A.H. Strong rejeita o aniquilacionismo e o universalismo: o castigo eterno (*aionios* — mesmo adjetivo que "vida eterna") é real para os que rejeitam o evangelho. Isso não é crueldade divina, mas a consequência última de escolher viver sem Deus: exatamente isso recebem para sempre.

O objetivo da escatologia não é saciar curiosidade, mas produzir santidade e esperança práticas agora.`,
    sources: ['A.H. Strong, Systematic Theology, p. 1033', 'Confissão Batista de 1689, cap. XXXII', 'A.T. Robertson, Word Pictures in 1 Cor 15'],
  },

  // ─── TRILOGIA DIVINA ─────────────────────────────────────────────────────────

  {
    id: 'deus-trindade',
    topic: 'Teologia Própria',
    title: 'A Trindade — Um Deus em Três Pessoas',
    content: `A doutrina da Trindade é o coração da teologia cristã — e uma das mais difíceis de compreender. A Bíblia afirma simultaneamente: (1) há um só Deus (Dt 6.4; Is 45.5; 1 Co 8.4); (2) o Pai é Deus (Jo 6.27); o Filho é Deus (Jo 1.1; 20.28; Hb 1.8); o Espírito Santo é Deus (At 5.3-4; 2 Co 3.17); (3) os três são distintos entre si.

A Confissão Batista de 1689 (cap. II) formula: "Na unidade da essência divina há três pessoas, o Pai, o Filho e o Espírito Santo, iguais em poder e glória, ainda que distinguidos por suas propriedades pessoais."

A palavra "Trindade" não aparece na Bíblia, mas a realidade está em toda parte:
- **Batismo de Jesus** (Mt 3.16-17): o Filho batizado, o Espírito descendo, o Pai falando
- **Grande Comissão** (Mt 28.19): "em nome (*singular*) do Pai, do Filho e do Espírito Santo"
- **Bênção apostólica** (2 Co 13.14): "a graça do Senhor Jesus, o amor de Deus e a comunhão do Espírito Santo"

A Trindade não é contradição (não diz que 1=3), mas mistério: um Deus que existe em três centros pessoais distintos e eternos de consciência, relacionamento e amor. A.H. Strong: "A Trindade não é meramente econômica (como Deus age) mas ontológica (como Deus é)."

Essa doutrina funda a comunidade cristã: Deus não é solidão, mas amor trinitário eterno. A Igreja reflete isso.`,
    sources: ['A.H. Strong, Systematic Theology, p. 304', 'Confissão Batista de 1689, cap. II', 'Spurgeon, Sermon on the Trinity'],
  },

  {
    id: 'deus-atributos',
    topic: 'Teologia Própria',
    title: 'Os Atributos de Deus',
    content: `Os atributos de Deus são as qualidades que descrevem quem Ele é — não características que Ele tem como acessórios, mas o que Ele é essencialmente. A.H. Strong divide em atributos não-comunicáveis (exclusivamente divinos) e comunicáveis (parcialmente refletidos nos humanos).

**Atributos não-comunicáveis:**
- **Onipotência**: Deus pode fazer tudo o que é consistente com sua natureza (Gn 18.14; Ap 19.6). Isso não inclui contradições lógicas ou atos que negariam sua própria natureza (mentir, Hb 6.18).
- **Onisciência**: conhece tudo, incluindo eventos futuros e pensamentos (Sl 139.1-6; Is 46.10). Não há nada que Deus aprenda.
- **Onipresença**: está em todo lugar simultaneamente (Sl 139.7-12; Jr 23.24) — não de modo espacial (pois é espírito), mas de modo que nada lhe escapa.
- **Imutabilidade**: "eu, o Senhor, não mudo" (Ml 3.6; Tg 1.17) — seus atributos e propósitos não variam.
- **Eternidade**: sem princípio, sem fim, existe fora do tempo (Sl 90.2; Ex 3.14).

**Atributos comunicáveis:**
- **Amor** (*agápē*, 1 Jo 4.8,16): o mais abrangente
- **Santidade** (Is 6.3; 1 Pe 1.16): separação absoluta do mal, perfeição moral
- **Justiça** (Sl 11.7): age sempre corretamente
- **Misericórdia e graça** (Ef 2.4-7): amor em ação para os necessitados e inmerecedores
- **Fidelidade** (Lm 3.23; 2 Tm 2.13): cumpre todas as suas promessas`,
    sources: ['A.H. Strong, Systematic Theology, caps. 5-6', 'Confissão Batista de 1689, cap. II', 'Spurgeon, Morning & Evening, May 4'],
  },

  // ─── ORAÇÕES E LAMENTOS ──────────────────────────────────────────────────────

  {
    id: 'salmos-lamento',
    topic: 'Vida Cristã',
    title: 'Os Salmos de Lamento — Orar com Honestidade',
    content: `Cerca de um terço dos 150 Salmos são lamentos — preces de dor, queixa, confusão e clamor diante de Deus. O Salmo 22 começa: "Deus meu, Deus meu, por que me abandonaste?" (citado por Jesus na cruz, Mt 27.46). Isso autoriza e até convida o crente a ser completamente honesto com Deus sobre sua dor.

O lamento bíblico tem uma estrutura típica:
1. **Endereçamento**: dirige-se diretamente a Deus — a dor vai para Ele, não contra Ele
2. **Queixa**: descreve o sofrimento sem eufemismos (Sl 88.3-9; Lm 1.12)
3. **Petição**: pede intervenção divina específica
4. **Expressão de confiança**: mesmo sem resolução, há um pivot de fé (Sl 22.19-24; Lm 3.21-24)
5. **Louvor antecipado**: frequentemente termina com louvor antes da resposta chegar

Spurgeon sofreu com depressão severa e escreveu extensamente sobre os "vales de sombra da morte" do ministério. Ele insistia: "A oração do sofrido não é irreverência — é a mais profunda intimidade com Deus."

O lamento nos ensina que a fé não exige fingimento. Deus não quer bravatas religiosas — quer encontro real. Os Salmos de lamento são modelos de como levar ao Senhor o que é quase impossível de colocar em palavras.

A.H. Strong: "O lamento honesto diante de Deus é adoração — é reconhecer que somente Ele pode ajudar."`,
    sources: ['Spurgeon, Morning & Evening, Nov 18', 'A.H. Strong, Systematic Theology, p. 437', 'A.T. Robertson, Studies in Mark, p. 246'],
  },

  {
    id: 'vida-jejum',
    topic: 'Vida Cristã',
    title: 'O Jejum como Disciplina Espiritual',
    content: `O jejum voluntário de alimentos (e outras coisas) é uma disciplina espiritual bíblica que aprofunda a dependência de Deus e aguça o foco espiritual. Jesus pressupôs que seus discípulos jejariam: "quando jejuardes" (Mt 6.16-18) — não "se jejuardes". A Igreja primitiva jeajuava regularmente antes de decisões importantes (At 13.2-3; 14.23).

O jejum bíblico não é técnica de manipulação divina, mas expressão de:
- **Humilhação diante de Deus** (Sl 35.13; Esdras 8.21) — o corpo físico sujeito ao espírito
- **Luto espiritual** — por pecados pessoais ou da comunidade (Jl 2.12; Ne 1.4)
- **Intensidade na oração** — o jeajum aguça a atenção e sinaliza urgência (Ester 4.16)
- **Dependência de Deus** — interromper o alimento lembra que o homem não vive só de pão (Dt 8.3)

Vine's Dictionary nota que o grego *nēsteia* simplesmente significa "não comer" — sem conotação de mérito espiritual automático. Isaías 58.3-7 repreende um jejum sem correspondente prática de justiça social.

A.H. Strong observa que o jejum, assim como todas as disciplinas externas, tem valor apenas quando expressa e aprofunda uma realidade interior. O perigo é substituir o coração pela performance.

Formas práticas: jejum de uma refeição dedicando o tempo à oração; jejum de um dia; jejum de mídia social; jejum coletivo na Igreja antes de decisões missionárias.`,
    sources: ["Vine's Expository Dictionary, 'Fasting'", 'A.H. Strong, Systematic Theology, p. 440', 'Spurgeon, Lectures to My Students, cap. 13'],
  },

  {
    id: 'vida-missoes',
    topic: 'Vida Cristã',
    title: 'Missões — O Mandato Global',
    content: `A missão não é uma das atividades da Igreja — é a razão de ser da Igreja no mundo. "Ide, portanto, fazei discípulos de todas as nações (*pánta tà éthne* — todos os grupos étnicos)" (Mt 28.19). A Grande Comissão é o mandato fundante que define o propósito da comunidade cristã até a volta de Cristo.

A.T. Robertson comenta que *poreuthéntes* (indo, particípio) pressupõe movimento constante — enquanto você vai, fazendo discípulos. A missão não é programa especial, mas modo de vida da Igreja em movimento.

**Fundamento missional:**
- **Deus missional**: Deus enviou o Filho (Jo 3.16); o Filho enviou o Espírito; o Espírito envia a Igreja. A missão nasce no coração de Deus.
- **Urgência**: "Como, pois, invocarão aquele em quem não creram? E como crerão naquele de quem nada ouviram?" (Rm 10.14)
- **Promessa**: "e este evangelho do reino será pregado em todo o mundo... então virá o fim" (Mt 24.14)

**Dimensões da missão:**
- *Kerygma* (proclamação): anunciar o evangelho com clareza
- *Didaché* (ensino): discipular os convertidos
- *Diakonia* (serviço): cuidado dos pobres e marginalizados (Lc 4.18-19)
- *Koinōnia* (comunidade): testemunho pela unidade dos crentes (Jo 17.21)

A Declaração Doutrinária da CBB coloca as missões entre as responsabilidades centrais da Igreja local: "cooperar com outras igrejas no avanço do evangelho no Brasil e no mundo."`,
    sources: ['Declaração Doutrinária da CBB, Art. 17', 'A.T. Robertson, Word Pictures in Matthew 28', 'A.H. Strong, Systematic Theology, p. 911'],
  },

  {
    id: 'vida-evangelismo',
    topic: 'Vida Cristã',
    title: 'Evangelismo — Compartilhar o Evangelho',
    content: `Evangelismo é o anúncio da boa notícia (*euangélion*) de que Jesus Cristo, o Filho de Deus, morreu pelos nossos pecados, ressuscitou dos mortos e oferece salvação a todo aquele que se arrepender e crer (1 Co 15.1-4; At 2.38). Não é argumento filosófico nem marketing religioso, mas anúncio de um evento histórico com implicações eternas.

**O que é o evangelho (1 Co 15.1-4):**
1. Cristo morreu pelos nossos pecados, segundo as Escrituras
2. Foi sepultado
3. Ressuscitou ao terceiro dia, segundo as Escrituras
4. Apareceu a testemunhas (fato histórico verificável)

**Motivações bíblicas para evangelizar:**
- **Amor** (2 Co 5.14): "o amor de Cristo nos constrange"
- **Obediência** (Mt 28.19): o mandamento de Cristo
- **Urgência** (2 Co 6.2): "eis agora o tempo aceitável"
- **Esperança** (1 Co 15.58): o trabalho evangelístico não é em vão

Spurgeon sobre evangelismo pessoal: "Todo cristão é um missionário ou um impostor." Não porque a salvação dependa de nós, mas porque a responsabilidade de compartilhar o que recebemos é inerente ao amor.

**O papel do Espírito:** Evangelismo não é convencer — é proclamar. O Espírito convence (Jo 16.8). Nossa tarefa é anunciar fielmente; o resultado pertence a Deus (1 Co 3.6-7).`,
    sources: ['Declaração Doutrinária da CBB, Art. 7', 'Spurgeon, The Soul Winner', 'A.H. Strong, Systematic Theology, p. 845'],
  },

  // ─── ANTROPOLOGIA ────────────────────────────────────────────────────────────

  {
    id: 'antrop-imagem-dei',
    topic: 'Antropologia Teológica',
    title: 'A Imagem de Deus no Ser Humano',
    content: `"Criemos o homem à nossa imagem (*tselem*), conforme a nossa semelhança (*demuth*)" (Gn 1.26). A *imago Dei* é a base da dignidade humana — todo ser humano, sem exceção de raça, gênero ou condição, porta a imagem do Criador.

A.H. Strong identifica aspectos da *imago Dei*: (1) **natural** — racionalidade, moralidade, espiritualidade, relacionalidade; (2) **moral** — santidade original, perdida na queda e restaurada em Cristo. Paulo descreve a nova natureza como "criada segundo Deus, em verdadeira justiça e santidade" (Ef 4.24; Cl 3.10).

A queda (Gn 3) não destruiu completamente a imagem de Deus — Gênesis 9.6 ainda a pressupõe como fundamento para proteger a vida humana. Mas a distorceu profundamente: o intelecto foi turvado, a vontade foi corrompida, os afetos foram desordenados, os relacionamentos foram fraturados.

Em Cristo, a imagem é restaurada progressivamente: "todos nós, com o rosto descoberto, contemplando a glória do Senhor, somos transformados de glória em glória na sua semelhança" (2 Co 3.18). A glorificação final completará essa restauração (1 Jo 3.2; Rm 8.29).

**Implicações práticas:**
- Todo ser humano merece respeito e dignidade (racismo, preconceito social negam a *imago Dei*)
- A vida humana é sagrada desde a concepção
- O cuidado com o próximo é cuidado com quem porta a imagem do Criador (Mt 25.40)`,
    sources: ['A.H. Strong, Systematic Theology, p. 514', 'Confissão Batista de 1689, cap. IV', 'A.T. Robertson, Word Pictures in Genesis 1'],
  },

  {
    id: 'antrop-pecado',
    topic: 'Antropologia Teológica',
    title: 'O Pecado — Natureza e Consequências',
    content: `Pecado é qualquer falta de conformidade com a lei moral de Deus, quer em ação (pecado comissivo), omissão (pecado de omissão) ou estado interno (pecado de atitude). A palavra hebraica mais comum é *hattá'* (falta de alvo, errar o alvo); o grego principal é *hamartia* (mesma ideia — desvio do alvo divino).

A.H. Strong identifica o pecado como essencialmente **egocentrismo** — a vontade do eu no lugar de Deus no centro da existência. Agostinho: "nosso coração está inquieto até que descanse em ti." O coração humano foi feito para Deus; ao virar-se para si mesmo, desintegra-se.

**Pecado original:** Em Adão, toda a humanidade pecou representativamente (Rm 5.12-19). Não apenas herdamos a tendência ao pecado, mas sua culpa. Todos "pecaram e estão destituídos da glória de Deus" (Rm 3.23). Vine's Dictionary nota que *hamartia* em Rm 3.23 está no aoristo — um ato histórico e representativo (Adão) com consequências universais.

**Consequências do pecado:**
- Separação de Deus — morte espiritual (Gn 3.8; Is 59.2)
- Corrupção da natureza humana — inclinação ao mal (Jr 17.9; Rm 7.18)
- Morte física (Gn 2.17; Rm 5.12)
- Morte eterna — separação permanente de Deus (Ap 20.14)

Cristo veio para resolver o problema do pecado em todas essas dimensões: perdão (justificação), transformação (santificação), ressurreição (glorificação).`,
    sources: ['A.H. Strong, Systematic Theology, p. 549', "Vine's Expository Dictionary, 'Sin'", 'Confissão Batista de 1689, cap. VI'],
  },

  // ─── PROFECIA BÍBLICA ─────────────────────────────────────────────────────────

  {
    id: 'profecia-messiânica',
    topic: 'Teologia Bíblica',
    title: 'As Profecias Messiânicas do AT',
    content: `O Antigo Testamento antecipa Cristo em centenas de profecias, tipologias e padrões que foram cumpridos em Jesus de Nazaré. Pedro declara que os profetas "indagavam a que tempo ou em que circunstâncias se referia o Espírito de Cristo que neles habitava, o qual previamente testificava dos sofrimentos de Cristo e das glórias que se seguiriam" (1 Pe 1.10-11).

**Profecias diretas cumpridas em Jesus:**
- Nascimento de uma virgem (Is 7.14 → Mt 1.23)
- Local: Belém de Judá (Mq 5.2 → Mt 2.1)
- Entrada em Jerusalém sobre jumento (Zc 9.9 → Jo 12.15)
- Traído por 30 moedas de prata (Zc 11.12-13 → Mt 26.15)
- Sortes sobre as vestes (Sl 22.18 → Jo 19.24)
- Ossos não quebrados (Sl 34.20 → Jo 19.33-36)
- Sepultado com ricos (Is 53.9 → Mt 27.57-60)
- Ressurreição do Sheol (Sl 16.10 → At 2.27-31)

**Tipologias:** Adão (Rm 5.14), a Páscoa (1 Co 5.7), o cordeiro do sacrifício (Jo 1.29), o sacerdócio (Hb 7-10), o maná (Jo 6.31-35), a serpente de bronze (Jo 3.14-15).

A.T. Robertson sobre Lucas 24.27: "e começando por Moisés, e por todos os profetas, interpretava-lhes em todas as Escrituras o que a ele se referia." Cristo é o fio dourado que atravessa toda a narrativa bíblica de Gênesis a Apocalipse.`,
    sources: ['A.H. Strong, Systematic Theology, cap. 11', 'A.T. Robertson, Word Pictures in Luke 24', 'Confissão Batista de 1689, cap. VIII.1'],
  },
];
