/**
 * formacao-parser.ts
 * Parser server-side para os 8 cadernos da Série Integrar (doc/).
 * Lê os arquivos .md e extrai seções (lições/aulas/sessões) e conteúdo.
 */
import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type FormacaoSection = {
  slug: string;       // índice 1-based como string: "1", "2", "3"...
  titulo: string;     // título da lição/aula/sessão
  groupTitulo?: string; // título do grupo (semana) — só para vol I e VIII
  groupSlug?: string;
  index: number;      // 0-based
};

export type FormacaoSectionWithContent = FormacaoSection & {
  content: string;    // markdown cru desta seção
  contentHtml: string; // HTML renderizado para exibição
};

// ─── Mapeamento arquivo por slug ───────────────────────────────────────────────

export const VOLUME_FILES: Record<string, string> = {
  'primeiros-passos':            'I - PRIMEIROS PASSOS COM JESUS.md',
  'primeiros-passos-com-a-igreja': 'II - Primeiros Passos com a Igreja.md',
  'dons-e-espiritualidade':      'III - Dons e Espiritualidade.md',
  'eu-um-discipulador':          'IV - Eu_um_discipulador.md',
  'lideres-de-celula':           'V - Lideres_de_Celulas.md',
  'nos-cremos':                  'VI - Nos_cremos.md',
  'autoridade-e-submissao':      'VII - Autoridade_e_submissao.md',
  'cosmovisao-crista':           'VIII - Cosmovisao_crista.md',
};

// ─── Configuração de parse por volume ─────────────────────────────────────────

type ParseConfig = {
  sectionRe: RegExp;   // heading que marca uma lição/aula/sessão
  groupRe?: RegExp;    // heading que marca um grupo (semana)
};

const VOLUME_CONFIGS: Record<string, ParseConfig> = {
  'primeiros-passos':              { sectionRe: /^### DIA \d+/i,       groupRe: /^## Semana \d+/i },
  'primeiros-passos-com-a-igreja': { sectionRe: /^## Semana \d+ [·•] Dia \d+/i },
  'dons-e-espiritualidade':        { sectionRe: /^# Aula \d+/i },
  'eu-um-discipulador':            { sectionRe: /^# AULA \d+/i },
  'lideres-de-celula':             { sectionRe: /^# SESSÃO/i },
  'nos-cremos':                    { sectionRe: /^# AULA \d+/i },
  'autoridade-e-submissao':        { sectionRe: /^# AULA \d+/i },
  'cosmovisao-crista':             { sectionRe: /^### Dia \d+/i,       groupRe: /^# SEMANA \d+/i },
};

// ─── Leitura de arquivo ────────────────────────────────────────────────────────

function readVolumeFile(slug: string): string {
  const filename = VOLUME_FILES[slug];
  if (!filename) throw new Error(`Volume desconhecido: ${slug}`);
  const filePath = path.join(process.cwd(), 'doc', filename);
  return fs.readFileSync(filePath, 'utf-8');
}

// ─── Parse de seções (metadados apenas) ───────────────────────────────────────

export function parseVolumeSections(slug: string): FormacaoSection[] {
  const content = readVolumeFile(slug);
  const config = VOLUME_CONFIGS[slug];
  const lines = content.split('\n');

  const sections: FormacaoSection[] = [];
  let currentGroup: { titulo: string; slug: string } | undefined;
  let sectionIndex = 0;

  for (const line of lines) {
    const trimmed = line.trimEnd();

    if (config.groupRe?.test(trimmed)) {
      currentGroup = {
        titulo: trimmed.replace(/^#+\s*/, '').trim(),
        slug: `grupo-${sectionIndex}`,
      };
      continue;
    }

    if (config.sectionRe.test(trimmed)) {
      sections.push({
        slug: String(sectionIndex + 1),
        titulo: trimmed.replace(/^#+\s*/, '').trim(),
        groupTitulo: currentGroup?.titulo,
        groupSlug: currentGroup?.slug,
        index: sectionIndex,
      });
      sectionIndex++;
    }
  }

  return sections;
}

// ─── Extração de conteúdo de uma seção ────────────────────────────────────────

export function getFormacaoSection(
  caderno: string,
  sectionSlug: string,
): FormacaoSectionWithContent | null {
  const sections = parseVolumeSections(caderno);
  const sectionIdx = sections.findIndex((s) => s.slug === sectionSlug);
  if (sectionIdx === -1) return null;

  const section = sections[sectionIdx];
  const content = readVolumeFile(caderno);
  const config = VOLUME_CONFIGS[caderno];
  const lines = content.split('\n');

  let startLine = -1;
  let endLine = lines.length;
  let count = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    const isSection = config.sectionRe.test(line);
    const isGroup = config.groupRe?.test(line) ?? false;

    if (isSection) {
      if (startLine !== -1) {
        endLine = i;
        break;
      }
      if (count === sectionIdx) {
        startLine = i;
      }
      count++;
    } else if (isGroup && startLine !== -1) {
      endLine = i;
      break;
    }
  }

  if (startLine === -1) return null;

  const rawContent = lines.slice(startLine, endLine).join('\n').trim();

  return {
    ...section,
    content: rawContent,
    contentHtml: markdownToHtml(rawContent),
  };
}

// ─── Conversor markdown → HTML simples ────────────────────────────────────────

function processInline(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>');
}

// ── Helpers para detecção de elementos interativos ────────────────────────────

/** Linha é um item de checkbox: `[ ] texto` ou `- [ ] texto` */
function isCheckboxLine(line: string): boolean {
  const t = line.trim();
  return /^\[[ xX]\]\s/.test(t) || /^[-*]\s+\[[ xX]\]\s/.test(t);
}

/** Extrai o texto de um checkbox */
function checkboxText(line: string): string {
  return line.trim().replace(/^[-*]\s+/, '').replace(/^\[[ xX]\]\s*/, '').trim();
}

/** Linha é uma pergunta que exige resposta escrita */
function isQuestion(line: string): boolean {
  const t = line.trim();
  if (!t || t.length < 8) return false;
  if (/^#{1,4}\s/.test(t)) return false;   // headings não são perguntas
  if (isCheckboxLine(t)) return false;
  // Termina com ? → pergunta direta
  if (t.endsWith('?')) return true;
  // Verbos que pedem resposta descritiva
  if (/^(Conte |Descreva |Explique )/i.test(t)) return true;
  return false;
}

/** Linhas que explicitamente pedem um campo de escrita (textarea grande) */
function isWriteHere(line: string): boolean {
  const lower = line.trim().toLowerCase();
  return (
    lower.includes('escreva aqui') ||
    lower.includes('registre aqui') ||
    lower.includes('anote aqui') ||
    lower.startsWith('falando com deus') ||
    lower.startsWith('guardando a palavra') ||
    (lower.startsWith('anote') && lower.includes('dúvidas'))
  );
}

/** Procura próxima linha não-vazia e retorna se é checkbox */
function nextNonEmptyIsCheckbox(lines: string[], idx: number): boolean {
  for (let i = idx + 1; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t) continue;
    return isCheckboxLine(lines[i]);
  }
  return false;
}

export function markdownToHtml(md: string): string {
  const lines = md.split('\n').map((l) => l.trimEnd());
  const out: string[] = [];
  let inUl = false;
  let inOl = false;
  let inBq = false;
  let inCbGroup = false;
  let para: string[] = [];
  let qNum = 0; // contador de questões numeradas

  const flushPara = () => {
    if (para.length) {
      const t = para.join(' ').trim();
      if (t) out.push(`<p>${t}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  };
  const flushBq = () => {
    if (inBq) { out.push('</blockquote>'); inBq = false; }
  };
  const flushCbGroup = () => {
    if (inCbGroup) { out.push('</div>'); inCbGroup = false; }
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim();

    // ── Heading ───────────────────────────────────────────────────────────────
    const hm = t.match(/^(#{1,4})\s+(.*)/);
    if (hm) {
      flushPara(); flushList(); flushBq(); flushCbGroup();
      const lvl = Math.min(hm[1].length + 1, 5);
      out.push(`<h${lvl}>${processInline(hm[2])}</h${lvl}>`);
      continue;
    }

    // ── HR ────────────────────────────────────────────────────────────────────
    if (/^[-*_]{3,}$/.test(t)) {
      flushPara(); flushList(); flushBq(); flushCbGroup();
      out.push('<hr>');
      continue;
    }

    // ── Blockquote ────────────────────────────────────────────────────────────
    const bqm = t.match(/^>\s*(.*)/);
    if (bqm) {
      flushPara(); flushList(); flushCbGroup();
      if (!inBq) { out.push('<blockquote>'); inBq = true; }
      const inner = bqm[1].trim();
      if (inner) out.push(`<p>${processInline(inner)}</p>`);
      continue;
    } else {
      flushBq();
    }

    // ── Checkbox item [ ] ─────────────────────────────────────────────────────
    if (isCheckboxLine(raw)) {
      flushPara(); flushList(); flushBq();
      if (!inCbGroup) {
        out.push('<div class="fm-cb-group">');
        inCbGroup = true;
      }
      const cbT = processInline(checkboxText(raw));
      out.push(
        `<label class="fm-cb-label"><input type="checkbox" class="fm-cb"> <span>${cbT}</span></label>`,
      );
      continue;
    } else {
      flushCbGroup();
    }

    // ── Prompt "escreva aqui" (textarea grande sem número) ───────────────────
    if (isWriteHere(t)) {
      flushPara(); flushList();
      out.push(
        `<div class="fm-write">` +
        `<p class="fm-write-label">${processInline(t)}</p>` +
        `<textarea class="fm-textarea fm-textarea-lg" placeholder="Escreva aqui…"></textarea>` +
        `</div>`,
      );
      continue;
    }

    // ── Pergunta com resposta ─────────────────────────────────────────────────
    if (isQuestion(t)) {
      flushPara(); flushList();
      qNum++;
      const followedByCheckbox = nextNonEmptyIsCheckbox(lines, i);
      if (followedByCheckbox) {
        // Apenas numera como label — o grupo de checkboxes vem a seguir
        out.push(
          `<p class="fm-q-label"><span class="fm-q-num">${qNum}</span>${processInline(t)}</p>`,
        );
      } else {
        // Pergunta aberta → textarea
        out.push(
          `<div class="fm-question">` +
          `<p class="fm-q-label"><span class="fm-q-num">${qNum}</span>${processInline(t)}</p>` +
          `<textarea class="fm-textarea" placeholder="Sua resposta…"></textarea>` +
          `</div>`,
        );
      }
      continue;
    }

    // ── Lista não-ordenada ────────────────────────────────────────────────────
    const ulm = t.match(/^[-*]\s+(.*)/);
    if (ulm) {
      flushPara();
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push(`<li>${processInline(ulm[1])}</li>`);
      continue;
    }

    // ── Lista ordenada ────────────────────────────────────────────────────────
    const olm = t.match(/^\d+[.)]\s+(.*)/);
    if (olm) {
      flushPara();
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (!inOl) { out.push('<ol>'); inOl = true; }
      out.push(`<li>${processInline(olm[1])}</li>`);
      continue;
    }

    // ── Tabela ────────────────────────────────────────────────────────────────
    if (t.startsWith('|')) {
      flushPara(); flushList();
      const cells = t.split('|').filter(Boolean).map((c) => c.trim()).filter((c) => !/^[-:]+$/.test(c));
      if (cells.length) out.push(`<p>${cells.map(processInline).join(' &mdash; ')}</p>`);
      continue;
    }

    // ── Linha vazia ───────────────────────────────────────────────────────────
    if (!t) {
      flushPara(); flushList();
      continue;
    }

    // ── Texto normal ──────────────────────────────────────────────────────────
    if (inUl || inOl) flushList();
    para.push(processInline(t));
  }

  flushPara(); flushList(); flushBq(); flushCbGroup();
  return linkBibleRefs(out.join('\n'));
}

// ─── Mapeamento de livros bíblicos (PT-BR) → abreviatura da API ───────────────

const BOOK_MAP: [RegExp, string][] = [
  // Antigo Testamento — nomes completos
  [/G[eê]nesis|Gn/g,                   'gn'],
  [/[ÊE]xodo|Ex/g,                     'ex'],
  [/Lev[ií]tico|Lv/g,                  'lv'],
  [/N[uú]meros|Nm/g,                   'nm'],
  [/Deuteron[oô]mio|Dt/g,              'dt'],
  [/Jos[uú]e|Js/g,                     'js'],
  [/Ju[ií]zes|Jz/g,                    'jz'],
  [/Rute|Rt/g,                         'rt'],
  [/1\s*Samuel|1\s*Sm/g,               '1sm'],
  [/2\s*Samuel|2\s*Sm/g,               '2sm'],
  [/1\s*Reis|1\s*Rs/g,                 '1rs'],
  [/2\s*Reis|2\s*Rs/g,                 '2rs'],
  [/1\s*Cr[oô]nicas|1\s*Cr/g,         '1cr'],
  [/2\s*Cr[oô]nicas|2\s*Cr/g,         '2cr'],
  [/Esdras|Ed/g,                       'ed'],
  [/Neemias|Ne/g,                      'ne'],
  [/[ÉE]ster|Et/g,                     'et'],
  [/J[oó]/g,                           'jó'],
  [/Salmos?|Sl/g,                      'sl'],
  [/Prov[eé]rbios|Pv/g,               'pv'],
  [/Eclesiastes|Ec/g,                  'ec'],
  [/C[aâ]nticos?|Ct/g,                'ct'],
  [/Isa[ií]as|Is/g,                    'is'],
  [/Jeremias|Jr/g,                     'jr'],
  [/Lamenta[çc][oõ]es|Lm/g,           'lm'],
  [/Ezequiel|Ez/g,                     'ez'],
  [/Daniel|Dn/g,                       'dn'],
  [/Os[eé]ias|Os/g,                   'os'],
  [/Joel|Jl/g,                         'jl'],
  [/Am[oó]s|Am/g,                     'am'],
  [/Obadias|Ob/g,                      'ob'],
  [/Jonas|Jn/g,                        'jn'],
  [/Miqu[eé]ias|Mq/g,                 'mq'],
  [/Naum|Na/g,                         'na'],
  [/Habacuque|Hc/g,                    'hc'],
  [/Sofonias|Sf/g,                     'sf'],
  [/Ageu|Ag/g,                         'ag'],
  [/Zacarias|Zc/g,                     'zc'],
  [/Malaquias|Ml/g,                    'ml'],
  // Novo Testamento — nomes completos
  [/Mateus|Mt/g,                       'mt'],
  [/Marcos|Mc/g,                       'mc'],
  [/Lucas|Lc/g,                        'lc'],
  [/Jo[aã]o|Jo/g,                     'jo'],
  [/Atos(?:\s+dos\s+Ap[oó]stolos)?|At/g, 'at'],
  [/Romanos|Rm/g,                      'rm'],
  [/1\s*Cor[ií]ntios|1\s*Co/g,        '1co'],
  [/2\s*Cor[ií]ntios|2\s*Co/g,        '2co'],
  [/G[aá]latas|Gl/g,                  'gl'],
  [/Ef[eé]sios|Ef/g,                  'ef'],
  [/Filipenses|Fp/g,                   'fp'],
  [/Colossenses|Cl/g,                  'cl'],
  [/1\s*Tessalonicenses|1\s*Ts/g,     '1ts'],
  [/2\s*Tessalonicenses|2\s*Ts/g,     '2ts'],
  [/1\s*Tim[oó]teo|1\s*Tm/g,         '1tm'],
  [/2\s*Tim[oó]teo|2\s*Tm/g,         '2tm'],
  [/Tito|Tt/g,                         'tt'],
  [/Filemom|Fm/g,                      'fm'],
  [/Hebreus|Hb/g,                      'hb'],
  [/Tiago|Tg/g,                        'tg'],
  [/1\s*Pedro|1\s*Pe/g,               '1pe'],
  [/2\s*Pedro|2\s*Pe/g,               '2pe'],
  [/1\s*Jo[aã]o|1\s*Jo/g,            '1jo'],
  [/2\s*Jo[aã]o|2\s*Jo/g,            '2jo'],
  [/3\s*Jo[aã]o|3\s*Jo/g,            '3jo'],
  [/Judas|Jd/g,                        'jd'],
  [/Apocalipse|Revelação|Ap/g,        'ap'],
];

/**
 * Detecta referências bíblicas no HTML gerado e as transforma em links.
 * Formato BR: "Livro capítulo.versículo" ex: "João 3.16", "1Pe 2.4-5"
 * Os links usam data-verse-link="true" para que o cliente injete o ?from=
 */
function linkBibleRefs(html: string): string {
  // Processa apenas nós de texto (entre > e <), nunca dentro de tags HTML
  return html.replace(/>([^<]*)</g, (match, text: string) => {
    if (!text.trim()) return match;
    const linked = replaceRefs(text);
    return `>${linked}<`;
  });
}

function replaceRefs(text: string): string {
  // Regex geral: captura sequência "Livro capítulo.versículo[-versículo]"
  // Padrão BR: usa ponto como separador de capítulo/versículo
  const REF_RE =
    /((?:1\s*|2\s*|3\s*)?(?:G[eê]nesis|[ÊE]xodo|Lev[ií]tico|N[uú]meros|Deuteron[oô]mio|Jos[uú]e|Ju[ií]zes|Rute|Samuel|Reis|Cr[oô]nicas|Esdras|Neemias|[ÉE]ster|J[oó]|Salmos?|Prov[eé]rbios|Eclesiastes|C[aâ]nticos?|Isa[ií]as|Jeremias|Lamenta[çc][oõ]es|Ezequiel|Daniel|Os[eé]ias|Joel|Am[oó]s|Obadias|Jonas|Miqu[eé]ias|Naum|Habacuque|Sofonias|Ageu|Zacarias|Malaquias|Mateus|Marcos|Lucas|Jo[aã]o|Atos|Romanos|Cor[ií]ntios|G[aá]latas|Ef[eé]sios|Filipenses|Colossenses|Tessalonicenses|Tim[oó]teo|Tito|Filemom|Hebreus|Tiago|Pedro|Apocalipse|Revelação|Gn|Ex|Lv|Nm|Dt|Js|Jz|Rt|Sm|Rs|Cr|Ed|Ne|Et|Sl|Pv|Ec|Ct|Is|Jr|Lm|Ez|Dn|Os|Jl|Am|Ob|Jn|Mq|Na|Hc|Sf|Ag|Zc|Ml|Mt|Mc|Lc|Jo|At|Rm|Co|Gl|Ef|Fp|Cl|Ts|Tm|Tt|Fm|Hb|Tg|Pe|Ap|Jd))\s+(\d+)\.(\d+(?:-\d+)?(?:;\s*\d+\.\d+(?:-\d+)?)*)/g;

  return text.replace(REF_RE, (full, bookName: string, chapter: string) => {
    const abbrev = resolveBook(bookName.trim());
    if (!abbrev) return full;
    const url = `/bible/read/${abbrev}/${chapter}`;
    return `<a href="${url}" data-verse-link="true" class="verse-link">${full}</a>`;
  });
}

function resolveBook(name: string): string | null {
  for (const [re, abbrev] of BOOK_MAP) {
    re.lastIndex = 0;
    if (re.test(name)) return abbrev;
  }
  return null;
}
