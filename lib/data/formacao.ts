/**
 * Metadados estáticos dos 8 cadernos da Série Integrar.
 * Fonte: Primeira Igreja Batista de Curitiba (PIB Curitiba).
 *
 * Este material é utilizado com fins educacionais por qualquer
 * instituição que use a plataforma Emetis.
 */

export type CadernoMeta = {
  slug: string;
  numero: string;   // "I", "II", etc.
  titulo: string;
  subtitulo: string;
  descricao: string;
  emoji: string;
  cor: string;      // cor Tailwind para o card
  unidade: string;  // "Dia", "Aula", "Sessão"
};

export const CADERNOS: CadernoMeta[] = [
  {
    slug: 'primeiros-passos',
    numero: 'I',
    titulo: 'Primeiros Passos com Jesus',
    subtitulo: 'Seguindo os passos de Jesus',
    descricao: 'Fundamentos da fé: quem é Jesus, Bíblia, oração, salvação, batismo e vida em célula.',
    emoji: '🐣',
    cor: 'indigo',
    unidade: 'Dia',
  },
  {
    slug: 'primeiros-passos-com-a-igreja',
    numero: 'II',
    titulo: 'Primeiros Passos com a Igreja',
    subtitulo: 'Vivendo na comunidade de Jesus',
    descricao: 'Discipulado, vida comunitária, célula, celebração e mordomia dentro da Igreja.',
    emoji: '⛪',
    cor: 'blue',
    unidade: 'Dia',
  },
  {
    slug: 'dons-e-espiritualidade',
    numero: 'III',
    titulo: 'Dons e Espiritualidade',
    subtitulo: 'CFM — Escola de Líderes',
    descricao: 'Serviço, santificação, vida de oração, Palavra de Deus, Espírito Santo e dons espirituais.',
    emoji: '🕊️',
    cor: 'violet',
    unidade: 'Aula',
  },
  {
    slug: 'eu-um-discipulador',
    numero: 'IV',
    titulo: 'Eu, um Discipulador!?',
    subtitulo: 'CFM — Escola de Líderes',
    descricao: 'O que é discipulado, princípios, como vencer obstáculos e prática com estudos de caso.',
    emoji: '🤝',
    cor: 'emerald',
    unidade: 'Aula',
  },
  {
    slug: 'lideres-de-celula',
    numero: 'V',
    titulo: 'Líderes de Célula',
    subtitulo: 'Multiplicação do Reino de Deus',
    descricao: 'Visão celular, dinâmica do encontro, discipulado de líderes, multiplicação e vida devocional.',
    emoji: '🌱',
    cor: 'teal',
    unidade: 'Sessão',
  },
  {
    slug: 'nos-cremos',
    numero: 'VI',
    titulo: 'Nós Cremos',
    subtitulo: 'Fundamentos doutrinários',
    descricao: 'Doutrina batista: Bíblia, Deus, homem e pecado, Jesus, Espírito Santo e salvação.',
    emoji: '✝️',
    cor: 'amber',
    unidade: 'Aula',
  },
  {
    slug: 'autoridade-e-submissao',
    numero: 'VII',
    titulo: 'Autoridade e Submissão Espiritual',
    subtitulo: 'CFM — Escola de Líderes',
    descricao: 'Autoridade delegada, propósito da autoridade e o sacerdócio universal dos cristãos.',
    emoji: '🛡️',
    cor: 'orange',
    unidade: 'Aula',
  },
  {
    slug: 'cosmovisao-crista',
    numero: 'VIII',
    titulo: 'Cosmovisão Cristã',
    subtitulo: 'Vivendo com propósito bíblico',
    descricao: 'Cosmovisão, cultura, identidade cristã, ética e o design bíblico para masculinidade e feminilidade.',
    emoji: '🌍',
    cor: 'rose',
    unidade: 'Dia',
  },
];

export function getCadernoMeta(slug: string): CadernoMeta | undefined {
  return CADERNOS.find((c) => c.slug === slug);
}

// Mapa de cor → classes Tailwind (necessário para evitar purge)
export const COR_CLASSES: Record<string, { bg: string; text: string; border: string; badge: string; light: string }> = {
  indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', light: 'bg-indigo-50' },
  blue:   { bg: 'bg-blue-600',   text: 'text-blue-600',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',   light: 'bg-blue-50'   },
  violet: { bg: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700', light: 'bg-violet-50' },
  emerald:{ bg: 'bg-emerald-600',text: 'text-emerald-600',border: 'border-emerald-200',badge: 'bg-emerald-100 text-emerald-700',light: 'bg-emerald-50'},
  teal:   { bg: 'bg-teal-600',   text: 'text-teal-600',   border: 'border-teal-200',   badge: 'bg-teal-100 text-teal-700',   light: 'bg-teal-50'   },
  amber:  { bg: 'bg-amber-500',  text: 'text-amber-600',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700', light: 'bg-amber-50'  },
  orange: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700',light: 'bg-orange-50' },
  rose:   { bg: 'bg-rose-600',   text: 'text-rose-600',   border: 'border-rose-200',   badge: 'bg-rose-100 text-rose-700',   light: 'bg-rose-50'   },
};
