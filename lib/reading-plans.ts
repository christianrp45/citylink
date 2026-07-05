export type PlanDay = {
  day: number;
  passage: string;   // ex: "Gênesis 1-2"
  book: string;      // abbrev: "gn"
  chapter: number;   // capítulo inicial do dia
};

export type ReadingPlan = {
  slug: string;
  title: string;
  description: string;
  emoji: string;
  totalDays: number;
  days: PlanDay[];
};

// ─── Salmos em 30 Dias ───────────────────────────────────────────────────────

const SALMOS_30: PlanDay[] = Array.from({ length: 30 }, (_, i) => {
  const startCh = i * 5 + 1;
  const endCh = Math.min(startCh + 4, 150);
  return {
    day: i + 1,
    passage: `Salmos ${startCh}–${endCh}`,
    book: 'sl',
    chapter: startCh,
  };
});

// ─── NT em 90 Dias ───────────────────────────────────────────────────────────

const NT_BOOKS = [
  { abbrev: 'mt', name: 'Mateus',   chapters: 28 },
  { abbrev: 'mc', name: 'Marcos',   chapters: 16 },
  { abbrev: 'lc', name: 'Lucas',    chapters: 24 },
  { abbrev: 'jo', name: 'João',     chapters: 21 },
  { abbrev: 'at', name: 'Atos',     chapters: 28 },
  { abbrev: 'rm', name: 'Romanos',  chapters: 16 },
  { abbrev: '1co', name: '1 Coríntios', chapters: 16 },
  { abbrev: '2co', name: '2 Coríntios', chapters: 13 },
  { abbrev: 'gl',  name: 'Gálatas', chapters: 6  },
  { abbrev: 'ef',  name: 'Efésios', chapters: 6  },
  { abbrev: 'fp',  name: 'Filipenses', chapters: 4 },
  { abbrev: 'cl',  name: 'Colossenses', chapters: 4 },
  { abbrev: '1ts', name: '1 Tessalonicenses', chapters: 5 },
  { abbrev: '2ts', name: '2 Tessalonicenses', chapters: 3 },
  { abbrev: '1tm', name: '1 Timóteo', chapters: 6 },
  { abbrev: '2tm', name: '2 Timóteo', chapters: 4 },
  { abbrev: 'tt',  name: 'Tito',    chapters: 3  },
  { abbrev: 'fm',  name: 'Filemom', chapters: 1  },
  { abbrev: 'hb',  name: 'Hebreus', chapters: 13 },
  { abbrev: 'tg',  name: 'Tiago',   chapters: 5  },
  { abbrev: '1pe', name: '1 Pedro', chapters: 5  },
  { abbrev: '2pe', name: '2 Pedro', chapters: 3  },
  { abbrev: '1jo', name: '1 João',  chapters: 5  },
  { abbrev: '2jo', name: '2 João',  chapters: 1  },
  { abbrev: '3jo', name: '3 João',  chapters: 1  },
  { abbrev: 'jd',  name: 'Judas',   chapters: 1  },
  { abbrev: 'ap',  name: 'Apocalipse', chapters: 22 },
];

function buildNT90(): PlanDay[] {
  const all: { book: string; abbrev: string; chapter: number }[] = [];
  for (const b of NT_BOOKS) {
    for (let ch = 1; ch <= b.chapters; ch++) {
      all.push({ book: b.name, abbrev: b.abbrev, chapter: ch });
    }
  }
  // 260 capítulos em 90 dias ≈ 3 por dia
  const days: PlanDay[] = [];
  let idx = 0;
  for (let day = 1; day <= 90 && idx < all.length; day++) {
    const count = day <= 80 ? 3 : 2;
    const first = all[idx];
    const passages: string[] = [];
    for (let j = 0; j < count && idx < all.length; j++, idx++) {
      const c = all[idx];
      const last = all[idx - 1];
      if (j === 0 || c.book !== last?.book) passages.push(`${c.book} ${c.chapter}`);
      else passages[passages.length - 1] += `–${c.chapter}`;
    }
    days.push({ day, passage: passages.join(', '), book: first.abbrev, chapter: first.chapter });
  }
  return days;
}

// ─── Bíblia em 1 Ano ─────────────────────────────────────────────────────────
// Simplificado: ~3 caps/dia, alterna AT + NT

function buildBiblia1Ano(): PlanDay[] {
  // 1189 capítulos em 365 dias ≈ 3,25/dia
  // Plano simplificado com referência por livro
  const AT = [
    { abbrev: 'gn', name: 'Gênesis', chapters: 50 }, { abbrev: 'ex', name: 'Êxodo', chapters: 40 },
    { abbrev: 'lv', name: 'Levítico', chapters: 27 }, { abbrev: 'nm', name: 'Números', chapters: 36 },
    { abbrev: 'dt', name: 'Deuteronômio', chapters: 34 }, { abbrev: 'js', name: 'Josué', chapters: 24 },
    { abbrev: 'jz', name: 'Juízes', chapters: 21 }, { abbrev: 'rt', name: 'Rute', chapters: 4 },
    { abbrev: '1sm', name: '1 Samuel', chapters: 31 }, { abbrev: '2sm', name: '2 Samuel', chapters: 24 },
    { abbrev: '1rs', name: '1 Reis', chapters: 22 }, { abbrev: '2rs', name: '2 Reis', chapters: 25 },
    { abbrev: '1cr', name: '1 Crônicas', chapters: 29 }, { abbrev: '2cr', name: '2 Crônicas', chapters: 36 },
    { abbrev: 'ed', name: 'Esdras', chapters: 10 }, { abbrev: 'ne', name: 'Neemias', chapters: 13 },
    { abbrev: 'et', name: 'Ester', chapters: 10 }, { abbrev: 'jó', name: 'Jó', chapters: 42 },
    { abbrev: 'sl', name: 'Salmos', chapters: 150 }, { abbrev: 'pv', name: 'Provérbios', chapters: 31 },
    { abbrev: 'ec', name: 'Eclesiastes', chapters: 12 }, { abbrev: 'ct', name: 'Cânticos', chapters: 8 },
    { abbrev: 'is', name: 'Isaías', chapters: 66 }, { abbrev: 'jr', name: 'Jeremias', chapters: 52 },
    { abbrev: 'lm', name: 'Lamentações', chapters: 5 }, { abbrev: 'ez', name: 'Ezequiel', chapters: 48 },
    { abbrev: 'dn', name: 'Daniel', chapters: 12 }, { abbrev: 'os', name: 'Oséias', chapters: 14 },
    { abbrev: 'jl', name: 'Joel', chapters: 3 }, { abbrev: 'am', name: 'Amós', chapters: 9 },
    { abbrev: 'ob', name: 'Obadias', chapters: 1 }, { abbrev: 'jn', name: 'Jonas', chapters: 4 },
    { abbrev: 'mq', name: 'Miquéias', chapters: 7 }, { abbrev: 'na', name: 'Naum', chapters: 3 },
    { abbrev: 'hc', name: 'Habacuque', chapters: 3 }, { abbrev: 'sf', name: 'Sofonias', chapters: 3 },
    { abbrev: 'ag', name: 'Ageu', chapters: 2 }, { abbrev: 'zc', name: 'Zacarias', chapters: 14 },
    { abbrev: 'ml', name: 'Malaquias', chapters: 4 },
    ...NT_BOOKS,
  ];

  const all: { abbrev: string; name: string; chapter: number }[] = [];
  for (const b of AT) {
    for (let ch = 1; ch <= b.chapters; ch++) all.push({ abbrev: b.abbrev, name: b.name, chapter: ch });
  }

  const days: PlanDay[] = [];
  let idx = 0;
  for (let day = 1; day <= 365 && idx < all.length; day++) {
    const first = all[idx];
    const passages: string[] = [];
    for (let j = 0; j < 3 && idx < all.length; j++, idx++) {
      const c = all[idx];
      const prev = all[idx - 1];
      if (j === 0 || c.name !== prev?.name) passages.push(`${c.name} ${c.chapter}`);
      else passages[passages.length - 1] = passages[passages.length - 1].replace(/\d+$/, '') + c.chapter;
    }
    days.push({ day, passage: passages.join(' · '), book: first.abbrev, chapter: first.chapter });
  }
  return days;
}

export const READING_PLANS: ReadingPlan[] = [
  {
    slug: 'salmos-30',
    title: 'Salmos em 30 Dias',
    description: 'Percorra todos os 150 Salmos em um mês',
    emoji: '🎵',
    totalDays: 30,
    days: SALMOS_30,
  },
  {
    slug: 'nt-90',
    title: 'NT em 90 Dias',
    description: 'Todo o Novo Testamento em 3 meses',
    emoji: '✝️',
    totalDays: 90,
    days: buildNT90(),
  },
  {
    slug: 'biblia-1-ano',
    title: 'Bíblia em 1 Ano',
    description: 'Leia toda a Bíblia em 365 dias',
    emoji: '📖',
    totalDays: 365,
    days: buildBiblia1Ano(),
  },
];
