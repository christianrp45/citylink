/**
 * Ícones de missão — gamificação
 *
 * Substituem o emoji cru usado em lib/gamification.ts. Mesmo estilo de
 * traço do restante do set (viewBox 24×24, strokeLinecap/Linejoin round),
 * mas pensados pra ir dentro do selo dourado <MissionBadge>, não soltos
 * na UI utilitária — por isso não têm variante `filled` como os de nav.
 */

import type { ReactNode } from 'react';
import type { MissionAction } from '@/lib/gamification';

interface GlyphProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function Glyph({ size = 16, strokeWidth = 2, className, children }: GlyphProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Casa — reunião de célula */
function GlyphHouse(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </Glyph>
  );
}

/** Estrela cadente / destaque na leitura */
function GlyphSparkle(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

/** Livro aberto — plano de leitura */
function GlyphBookOpen(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <path d="M12 6c-1.5-1.3-4-2-7-2v14c3 0 5.5.7 7 2 1.5-1.3 4-2 7-2V4c-3 0-5.5.7-7 2z" />
      <path d="M12 6v14" />
    </Glyph>
  );
}

/** Carro — pedido de visita */
function GlyphCar(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <path d="M4 16V11l2.2-5A2 2 0 0 1 8.1 5h7.8a2 2 0 0 1 1.9 1.4L19.5 11V16" />
      <path d="M4 16h16v2a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2z" />
      <circle cx="7.5" cy="16" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="16" r="1.5" fill="currentColor" stroke="none" />
      <path d="M4 11h16" />
    </Glyph>
  );
}

/** Aperto de mãos — aceitar visitante */
function GlyphHandshake(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <path d="M2 12l4-4 4 3-2 2" />
      <path d="M22 12l-4-4-4 3 2 2" />
      <path d="M6 11l4.5 4.2a1.6 1.6 0 0 0 2.2 0l.3-.3a1.6 1.6 0 0 0 0-2.3" />
      <path d="M9 13.5l1.5 1.4a1.6 1.6 0 0 0 2.2 0" />
      <path d="M12.5 16l1 .9a1.6 1.6 0 0 0 2.2 0l.3-.3a1.6 1.6 0 0 0 0-2.2L14 12.3" />
    </Glyph>
  );
}

/** Presente — oferecer talento */
function GlyphGift(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <rect x="3" y="9" width="18" height="4" rx="0.5" />
      <path d="M5 13h14v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7z" />
      <path d="M12 9v12" />
      <path d="M12 9C10 5 6.5 5 6.5 7.5S10 9 12 9zM12 9c2-4 5.5-4 5.5-1.5S14 9 12 9z" />
    </Glyph>
  );
}

/** Envelope com coração — encorajamento */
function GlyphLoveNote(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M3 6.5l9 6 9-6" />
      <path d="M12 15.2c-1.6-1.4-3-2.3-3-3.5a1.5 1.5 0 0 1 3-.4 1.5 1.5 0 0 1 3 .4c0 1.2-1.4 2.1-3 3.5z" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

/** Prato posto — Mesa Posta / hospitalidade */
function GlyphTable(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <circle cx="12" cy="11" r="6" />
      <circle cx="12" cy="11" r="2" />
      <path d="M4 20c1.5-2 4.5-3 8-3s6.5 1 8 3" />
    </Glyph>
  );
}

/** Mãos em oração */
function GlyphPray(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <path d="M12 3v9" />
      <path d="M12 12c-1 3-3 3.5-5 5.5-1 1-1 2.5 0 3.2.9.6 2-.1 2.7-1" />
      <path d="M12 12c1 3 3 3.5 5 5.5 1 1 1 2.5 0 3.2-.9.6-2-.1-2.7-1" />
      <path d="M8.5 6c0 2 1.5 3.3 3.5 4 2-.7 3.5-2 3.5-4" />
    </Glyph>
  );
}

/** Pessoas — entrar em grupo/célula */
function GlyphPeople(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17.5" cy="9" r="2.3" />
      <path d="M14.5 14.2c2.7.4 4.8 2.6 4.8 5.8" />
    </Glyph>
  );
}

/** Confete — convite aceito */
function GlyphConfetti(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <path d="M4 20l4-13a1 1 0 0 1 1.7-.5l7.8 7.8a1 1 0 0 1-.5 1.7L4 20z" />
      <circle cx="18" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="21" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="3" r="1" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

/** Livros empilhados — lição da Formação */
function GlyphBookStack(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <rect x="4" y="15" width="16" height="4" rx="1" />
      <rect x="5" y="10" width="14" height="4" rx="1" />
      <rect x="6.5" y="5" width="11" height="4" rx="1" />
    </Glyph>
  );
}

/** Capelo — caderno concluído */
function GlyphGraduationCap(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <path d="M12 4l10 5-10 5-10-5 10-5z" />
      <path d="M6.5 11v5c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-5" />
      <path d="M22 9v6" />
    </Glyph>
  );
}

/** Troféu — mesmo desenho do IconTrophy da nav, tamanho de selo */
function GlyphTrophy(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" fill="currentColor" />
      <path d="M7 5H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4" />
      <path d="M17 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" />
      <path d="M12 14v3" />
      <path d="M8 21h8" />
      <path d="M12 17c-2.2 0-4 1.79-4 4h8c0-2.21-1.8-4-4-4z" fill="currentColor" />
    </Glyph>
  );
}

/** Semente — nível inicial */
function GlyphSeed(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <path d="M12 21c4-1 6-5 6-9-4 0-8 2-6 9z" />
      <path d="M12 21c-4-1-6-5-6-9 4 0 8 2 6 9z" fill="currentColor" />
    </Glyph>
  );
}

/** Broto — dois brotos saindo do solo */
function GlyphSprout(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <path d="M12 21v-7" />
      <path d="M12 14c0-3-2.5-4-5-4 0 3 2 5 5 4z" fill="currentColor" />
      <path d="M12 11c0-3 2.5-4 5-4 0 3-2 5-5 4z" fill="currentColor" />
      <path d="M4 21h16" />
    </Glyph>
  );
}

/** Árvore — copa arredondada com tronco */
function GlyphTree(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <circle cx="12" cy="9" r="6" fill="currentColor" />
      <path d="M12 15v6" />
      <path d="M9 21h6" />
    </Glyph>
  );
}

/** Fruto — maçã com folha */
function GlyphFruit(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <path d="M12 8c-4 0-6.5 3-6.5 7 0 3.5 2.5 6 4.5 6 1 0 1.3-.5 2-.5s1 .5 2 .5c2 0 4.5-2.5 4.5-6 0-4-2.5-7-6.5-7z" fill="currentColor" />
      <path d="M12 8V5" />
      <path d="M12 5c0-1.5 1.2-2.5 3-2.5-.3 1.7-1.5 2.5-3 2.5z" fill="currentColor" />
    </Glyph>
  );
}

/** Luz — sol/estrela radiante, nível máximo */
export function GlyphLight(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
    </Glyph>
  );
}

/** Chama — streak */
export function GlyphFlame(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <path
        d="M12 22c4 0 6.5-2.7 6.5-6.3 0-3-1.7-4.8-2.8-6.7-.4 1.5-1.3 2.4-2.2 2.4.5-2.5-.3-5.4-2.5-7.4-.3 2.6-1.4 4-3 5.7C6.3 11.4 5.5 13 5.5 15.2 5.5 19 8 22 12 22z"
        fill="currentColor"
      />
    </Glyph>
  );
}

/** Alvo — missões da semana */
export function GlyphTarget(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

export const LEVEL_GLYPHS: Record<string, (p: GlyphProps) => ReactNode> = {
  semente: GlyphSeed,
  broto: GlyphSprout,
  árvore: GlyphTree,
  fruto: GlyphFruit,
  luz: GlyphLight,
};

/** Selo de nível — mesma moldura do MissionBadge, cor conforme o nível */
export function LevelBadge({
  level,
  size = 40,
  color = 'var(--em-gold-500)',
}: {
  level: string;
  size?: number;
  color?: string;
}) {
  const GlyphIcon = LEVEL_GLYPHS[level] ?? GlyphSeed;
  return (
    <span
      className="inline-flex items-center justify-center rounded-full flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: `color-mix(in srgb, ${color} 18%, white)`,
        color,
      }}
    >
      <GlyphIcon size={Math.round(size * 0.55)} strokeWidth={2} />
    </span>
  );
}

export const MISSION_GLYPHS: Record<MissionAction, (p: GlyphProps) => ReactNode> = {
  attend_meeting: GlyphHouse,
  bible_highlight: GlyphSparkle,
  reading_plan: GlyphBookOpen,
  send_visit: GlyphCar,
  accept_visit: GlyphHandshake,
  offer_talent: GlyphGift,
  share_testimony: GlyphLoveNote,
  encourage_someone: GlyphLoveNote,
  open_hospitality: GlyphTable,
  pray_for_someone: GlyphPray,
  join_group: GlyphPeople,
  invite_accepted: GlyphConfetti,
  complete_formacao_lesson: GlyphBookStack,
  complete_formacao_caderno: GlyphGraduationCap,
  complete_formacao_all: GlyphTrophy,
};

/** Selo circular dourado — moldura padrão pra qualquer ícone de gamificação */
export function MissionBadge({
  action,
  size = 36,
  completed = false,
}: {
  action: MissionAction;
  size?: number;
  completed?: boolean;
}) {
  const GlyphIcon = MISSION_GLYPHS[action];
  return (
    <span
      className="inline-flex items-center justify-center rounded-full flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: completed
          ? 'linear-gradient(135deg, var(--em-gold-400), var(--em-gold-600))'
          : 'linear-gradient(135deg, #E2E8F0, #CBD5E1)',
        color: completed ? '#5A3402' : '#64748B',
        boxShadow: completed ? '0 2px 6px rgba(217, 119, 6, 0.35)' : 'none',
      }}
    >
      <GlyphIcon size={Math.round(size * 0.52)} strokeWidth={2} />
    </span>
  );
}
