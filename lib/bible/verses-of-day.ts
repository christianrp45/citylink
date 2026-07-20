// Versículos rotativos para o versículo do dia e push matinal
// Usados por: /api/bible/verse-of-day e /api/cron/daily-verse

export type DailyVerse = {
  ref: string;
  text: string;
  book: string;
  chapter: number;
  verse: number;
};

export const DAILY_VERSES: DailyVerse[] = [
  { ref: "João 3:16", text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", book: "jo", chapter: 3, verse: 16 },
  { ref: "Filipenses 4:13", text: "Tudo posso naquele que me fortalece.", book: "fp", chapter: 4, verse: 13 },
  { ref: "Jeremias 29:11", text: "Porque eu sei os planos que tenho para vós, diz o Senhor, planos de paz e não de mal, para vos dar um futuro e uma esperança.", book: "jr", chapter: 29, verse: 11 },
  { ref: "Salmos 23:1", text: "O Senhor é o meu pastor; nada me faltará.", book: "sl", chapter: 23, verse: 1 },
  { ref: "Romanos 8:28", text: "Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.", book: "rm", chapter: 8, verse: 28 },
  { ref: "Isaías 40:31", text: "Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias; correrão e não se cansarão; caminharão e não se fatigarão.", book: "is", chapter: 40, verse: 31 },
  { ref: "Provérbios 3:5-6", text: "Confia no Senhor de todo o teu coração e não te apoies na tua própria prudência. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.", book: "pv", chapter: 3, verse: 5 },
  { ref: "Mateus 11:28", text: "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.", book: "mt", chapter: 11, verse: 28 },
  { ref: "Salmos 46:1", text: "Deus é o nosso refúgio e força, socorro bem presente nas tribulações.", book: "sl", chapter: 46, verse: 1 },
  { ref: "Gálatas 5:22-23", text: "Mas o fruto do Espírito é: amor, alegria, paz, longanimidade, benignidade, bondade, fidelidade, mansidão, temperança.", book: "gl", chapter: 5, verse: 22 },
  { ref: "Efésios 2:8", text: "Porque pela graça sois salvos, por meio da fé; e isto não vem de vós; é dom de Deus.", book: "ef", chapter: 2, verse: 8 },
  { ref: "Josué 1:9", text: "Não to mandei eu? Sê forte e corajoso; não temas, nem te espantes, porque o Senhor teu Deus é contigo em todo o lugar por onde andares.", book: "js", chapter: 1, verse: 9 },
  { ref: "Salmos 37:4", text: "Deleita-te também no Senhor, e ele te concederá os desejos do teu coração.", book: "sl", chapter: 37, verse: 4 },
  { ref: "Marcos 11:24", text: "Por isso vos digo que tudo quanto pedirdes, orando, crede que recebereis, e tê-lo-eis.", book: "mc", chapter: 11, verse: 24 },
  { ref: "2 Coríntios 5:17", text: "Assim que, se alguém está em Cristo, nova criatura é; as coisas velhas já passaram; eis que tudo se fez novo.", book: "2co", chapter: 5, verse: 17 },
  { ref: "Romanos 12:2", text: "E não vos conformeis com este século, mas transformai-vos pela renovação da vossa mente, para que experimenteis qual seja a boa, agradável e perfeita vontade de Deus.", book: "rm", chapter: 12, verse: 2 },
  { ref: "Salmos 119:105", text: "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.", book: "sl", chapter: 119, verse: 105 },
  { ref: "Mateus 6:33", text: "Mas buscai primeiro o reino de Deus e a sua justiça, e todas estas coisas vos serão acrescentadas.", book: "mt", chapter: 6, verse: 33 },
  { ref: "João 14:6", text: "Disse-lhe Jesus: Eu sou o caminho, e a verdade, e a vida. Ninguém vem ao Pai senão por mim.", book: "jo", chapter: 14, verse: 6 },
  { ref: "Provérbios 22:6", text: "Instrui o menino no caminho em que deve andar, e até quando envelhecer não se desviará dele.", book: "pv", chapter: 22, verse: 6 },
  { ref: "Salmos 27:1", text: "O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é a força da minha vida; de quem me recearei?", book: "sl", chapter: 27, verse: 1 },
  { ref: "Filipenses 4:6-7", text: "Não andeis ansiosos por coisa alguma; antes em tudo sejam os vossos pedidos conhecidos diante de Deus pela oração e súplica com ação de graças. E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e as vossas mentes em Cristo Jesus.", book: "fp", chapter: 4, verse: 6 },
  { ref: "João 10:10", text: "O ladrão não vem senão para roubar, matar e destruir; eu vim para que tenham vida, e a tenham em abundância.", book: "jo", chapter: 10, verse: 10 },
  { ref: "Isaías 41:10", text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a minha destra fiel.", book: "is", chapter: 41, verse: 10 },
  { ref: "Salmos 103:1-2", text: "Bendize, ó minha alma, ao Senhor, e tudo o que há em mim bendiga o seu santo nome. Bendize, ó minha alma, ao Senhor, e não te esqueças de nenhum dos seus benefícios.", book: "sl", chapter: 103, verse: 1 },
  { ref: "1 Coríntios 13:4-5", text: "O amor é longânimo, é benigno; o amor não arde em ciúmes, não se ufana, não se ensoberbece, não se conduz inconvenientemente, não procura os seus próprios interesses.", book: "1co", chapter: 13, verse: 4 },
  { ref: "Tiago 1:17", text: "Toda boa dádiva e todo dom perfeito são lá do alto, descendo do Pai das luzes, em quem não há mudança nem sombra de variação.", book: "tg", chapter: 1, verse: 17 },
  { ref: "Apocalipse 3:20", text: "Eis que estou à porta e bato; se alguém ouvir a minha voz e abrir a porta, entrarei em sua casa e cearei com ele e ele comigo.", book: "ap", chapter: 3, verse: 20 },
  { ref: "Salmos 16:11", text: "Tu me farás ver a vereda da vida; na tua presença há plenitude de alegria; à tua destra há delícias perpetuamente.", book: "sl", chapter: 16, verse: 11 },
  { ref: "Hebreus 11:1", text: "Ora, a fé é a certeza de coisas que se esperam, a convicção de coisas que se não vêem.", book: "hb", chapter: 11, verse: 1 },
  { ref: "João 15:13", text: "Ninguém tem maior amor do que este: de dar alguém a sua vida pelos seus amigos.", book: "jo", chapter: 15, verse: 13 },
  { ref: "Miquéias 6:8", text: "Ele te declarou, ó homem, o que é bom; e que é o que o Senhor pede de ti, senão que pratiques a justiça, ames a misericórdia e andes humildemente com o teu Deus?", book: "mq", chapter: 6, verse: 8 },
];

/** Retorna o versículo do dia baseado no dia do ano (rotação determinística). */
export function getVerseOfDay(): DailyVerse {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}
