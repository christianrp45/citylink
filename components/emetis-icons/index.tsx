/**
 * Emetis Icon Set — biblioteca de ícones SVG customizados
 *
 * Estilo: geométrico com traços arredondados, warm & modern
 * Viewport: 24×24  |  strokeLinecap: round  |  strokeLinejoin: round
 * Peso padrão: 1.8 (inativo)  /  2.2 (ativo)
 *
 * Uso:
 *   import { IconMap, IconBible } from '@/components/icons'
 *   <IconMap size={22} color="currentColor" strokeWidth={2} />
 *
 * Ícones de navegação têm variante filled=true para estado ativo.
 */

import type { ReactNode } from 'react';

// ─── Base wrapper ─────────────────────────────────────────────────────────────

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  filled?: boolean;
  'aria-label'?: string;
}

function Svg({
  size = 24,
  color = 'currentColor',
  strokeWidth = 1.8,
  className,
  children,
  'aria-label': label,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={!label}
      aria-label={label}
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

// ─── NAV ICONS ────────────────────────────────────────────────────────────────
// Ícones principais da barra de navegação — têm versão filled

/** Mapa — pino de localização com ponto interno */
export function IconMap({ filled, ...p }: IconProps) {
  return (
    <Svg {...p}>
      <path
        d="M12 2a7 7 0 0 1 7 7c0 5.5-7 13-7 13S5 14.5 5 9a7 7 0 0 1 7-7z"
        fill={filled ? 'currentColor' : 'none'}
      />
      {filled ? (
        <circle cx="12" cy="9" r="2.5" fill="white" stroke="none" />
      ) : (
        <circle cx="12" cy="9" r="2.5" />
      )}
    </Svg>
  );
}

/** Amigos — duas silhuetas de pessoas */
export function IconCommunity({ filled, ...p }: IconProps) {
  return (
    <Svg {...p}>
      {/* Cabeças */}
      <circle cx="8.5" cy="7" r="3" fill={filled ? 'currentColor' : 'none'} />
      <circle cx="17" cy="7.5" r="2.5" fill={filled ? 'currentColor' : 'none'} />
      {/* Corpos */}
      <path
        d="M2 21c0-3.3 2.9-6 6.5-6H12c3.3 0 6 2.7 6 6"
        fill={filled ? 'currentColor' : 'none'}
      />
      <path d="M20 21c0-2.5-1.5-4.5-3.5-5.3" />
    </Svg>
  );
}

/** Bíblia — livro aberto com marcador */
export function IconBible({ filled, ...p }: IconProps) {
  return (
    <Svg {...p}>
      {/* Capa esquerda */}
      <path
        d="M3 5a2 2 0 0 1 2-2h5v16H5a2 2 0 0 1-2-2V5z"
        fill={filled ? 'currentColor' : 'none'}
      />
      {/* Capa direita */}
      <path
        d="M21 5a2 2 0 0 0-2-2h-5v16h5a2 2 0 0 0 2-2V5z"
        fill={filled ? 'currentColor' : 'none'}
      />
      {/* Lombada */}
      <line x1="10" y1="3" x2="10" y2="19" />
      <line x1="14" y1="3" x2="14" y2="19" />
      {/* Marcador de página */}
      {!filled && (
        <path d="M6 3v6l1.5-1.5L9 9V3" />
      )}
    </Svg>
  );
}

/** Chat — balão de fala com ponto indicador */
export function IconChat({ filled, ...p }: IconProps) {
  return (
    <Svg {...p}>
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        fill={filled ? 'currentColor' : 'none'}
      />
      {/* Pontos internos */}
      {filled ? (
        <>
          <circle cx="9" cy="10" r="1" fill="white" stroke="none" />
          <circle cx="12" cy="10" r="1" fill="white" stroke="none" />
          <circle cx="15" cy="10" r="1" fill="white" stroke="none" />
        </>
      ) : (
        <>
          <circle cx="9" cy="10" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="12" cy="10" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="15" cy="10" r="0.8" fill="currentColor" stroke="none" />
        </>
      )}
    </Svg>
  );
}

/**
 * Grupos — três nós conectados em triângulo
 * Motivo da marca: espelha a Torre de Sinal do logo Emetis
 */
export function IconGroups({ filled, ...p }: IconProps) {
  return (
    <Svg {...p}>
      {/* Nó topo */}
      <circle cx="12" cy="4.5" r="2.5" fill={filled ? 'currentColor' : 'none'} />
      {/* Nó inferior-esquerdo */}
      <circle cx="4.5" cy="18.5" r="2.5" fill={filled ? 'currentColor' : 'none'} />
      {/* Nó inferior-direito */}
      <circle cx="19.5" cy="18.5" r="2.5" fill={filled ? 'currentColor' : 'none'} />
      {/* Linhas de conexão */}
      <line x1="10.8" y1="6.7" x2="5.8" y2="16.4" />
      <line x1="13.2" y1="6.7" x2="18.2" y2="16.4" />
      <line x1="7" y1="18.5" x2="17" y2="18.5" />
    </Svg>
  );
}

/** Perfil — silhueta de pessoa com cabeça e ombros */
export function IconProfile({ filled, ...p }: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="8" r="4" fill={filled ? 'currentColor' : 'none'} />
      <path
        d="M4 21c0-4.42 3.58-8 8-8s8 3.58 8 8"
        fill={filled ? 'currentColor' : 'none'}
      />
    </Svg>
  );
}

// ─── UI ICONS ─────────────────────────────────────────────────────────────────
// Ícones de interface — sem variante filled

/** Sino de notificação */
export function IconBell(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Svg>
  );
}

/** Chevron / seta esquerda — voltar */
export function IconChevronLeft(p: IconProps) {
  return (
    <Svg {...p}>
      <polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

/** Chevron direita */
export function IconChevronRight(p: IconProps) {
  return (
    <Svg {...p}>
      <polyline points="9 18 15 12 9 6" />
    </Svg>
  );
}

/** Chevron baixo */
export function IconChevronDown(p: IconProps) {
  return (
    <Svg {...p}>
      <polyline points="6 9 12 15 18 9" />
    </Svg>
  );
}

/** Mais — adicionar */
export function IconPlus(p: IconProps) {
  return (
    <Svg {...p}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}

/** Busca — lupa */
export function IconSearch(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.5" y1="15.5" x2="21" y2="21" />
    </Svg>
  );
}

/** Coração — oração / curtir */
export function IconHeart({ filled, ...p }: IconProps) {
  return (
    <Svg {...p}>
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </Svg>
  );
}

/** Casa / localização residencial */
export function IconHome({ filled, ...p }: IconProps) {
  return (
    <Svg {...p}>
      <path
        d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"
        fill={filled ? 'currentColor' : 'none'}
      />
      <path d="M9 21V12h6v9" />
    </Svg>
  );
}

/** Igreja / templo */
export function IconChurch({ filled, ...p }: IconProps) {
  return (
    <Svg {...p}>
      {/* Corpo */}
      <rect x="3" y="11" width="18" height="10" rx="1" fill={filled ? 'currentColor' : 'none'} />
      {/* Telhado */}
      <path d="M3 11L12 4l9 7" />
      {/* Cruz */}
      <line x1="12" y1="1" x2="12" y2="7" />
      <line x1="9.5" y1="4" x2="14.5" y2="4" />
    </Svg>
  );
}

/** Calendário */
export function IconCalendar(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="8" cy="15" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="15" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="16" cy="15" r="0.8" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Relógio */
export function IconClock(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 15.5" />
    </Svg>
  );
}

/** Localização / pin simples */
export function IconPin({ filled, ...p }: IconProps) {
  return (
    <Svg {...p}>
      <path
        d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"
        fill={filled ? 'currentColor' : 'none'}
      />
      <circle cx="12" cy="10" r="3" fill={filled ? 'white' : 'none'} stroke={filled ? 'none' : 'currentColor'} />
    </Svg>
  );
}

/** Editar — lápis */
export function IconEdit(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Svg>
  );
}

/** Lixeira — deletar */
export function IconTrash(p: IconProps) {
  return (
    <Svg {...p}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </Svg>
  );
}

/** Fechar — X */
export function IconX(p: IconProps) {
  return (
    <Svg {...p}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  );
}

/** Confirmar — check */
export function IconCheck(p: IconProps) {
  return (
    <Svg {...p}>
      <polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

/** Compartilhar */
export function IconShare(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </Svg>
  );
}

/** Configurações — engrenagem */
export function IconSettings(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
  );
}

/** Enviar / Seta direita */
export function IconSend(p: IconProps) {
  return (
    <Svg {...p}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </Svg>
  );
}

/** Carregando — spinner (animado via CSS) */
export function IconLoader({ className, ...p }: IconProps) {
  return (
    <Svg {...p} className={`animate-spin ${className ?? ''}`}>
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </Svg>
  );
}

/** Alerta / Aviso */
export function IconAlert(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </Svg>
  );
}

/** Usuários — grupo de pessoas */
export function IconUsers(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
    </Svg>
  );
}

/** Mensagem simples */
export function IconMessage(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

/** Livro aberto simples */
export function IconBook(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </Svg>
  );
}

/** Marcador de versículo */
export function IconBookmark({ filled, ...p }: IconProps) {
  return (
    <Svg {...p}>
      <path
        d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </Svg>
  );
}

/** Olho — visibilidade */
export function IconEye(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

/** Olho fechado */
export function IconEyeOff(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </Svg>
  );
}

/** Seta direita simples */
export function IconArrowRight(p: IconProps) {
  return (
    <Svg {...p}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </Svg>
  );
}

/** Filtro */
export function IconFilter(p: IconProps) {
  return (
    <Svg {...p}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </Svg>
  );
}

/** Wi-Fi / Sinal */
export function IconSignal(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}
