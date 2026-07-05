/**
 * Emetis Logo Mark — "The Signal Tower"
 *
 * Conceito: fusão de três símbolos
 *  • Letra E  → pilar vertical = barra do E; arcos = barras curvas do E
 *  • Torre de sinal → beacon de fé irradiando comunidade
 *  • 3 esferas → arco pequeno (fé pessoal), médio (célula), grande (Igreja)
 *  • Ponto na base → o indivíduo, o ponto de partida
 *
 * Variante "white": para usar sobre fundos azuis (header)
 * Variante "blue":  para usar sobre fundos claros (splash, ícone)
 */

interface EmetisIconProps {
  size?: number;
  variant?: 'white' | 'blue';
  className?: string;
}

export function EmetisIcon({ size = 32, variant = 'blue', className }: EmetisIconProps) {
  const height = Math.round(size * (90 / 64));

  const pillar = variant === 'white' ? 'white' : '#1E40AF';
  const dot    = variant === 'white' ? 'white' : '#1E40AF';
  const arc1   = variant === 'white' ? 'rgba(255,255,255,0.95)' : '#2563EB';
  const arc2   = variant === 'white' ? 'rgba(255,255,255,0.68)' : '#3B82F6';
  const arc3   = variant === 'white' ? 'rgba(255,255,255,0.38)' : '#93C5FD';

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 64 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Emetis"
    >
      {/* ── Pilar / Torre ────────────────────────────────── */}
      <rect x="8" y="6" width="11" height="64" rx="5.5" fill={pillar} />

      {/* ── Ponto na base (o indivíduo, a fundação) ──────── */}
      <circle cx="13.5" cy="76" r="5" fill={dot} />

      {/* ── Arco 1 — fé pessoal (mais próximo) ──────────── */}
      {/* de (19,42) a (19,58) — curva para a direita */}
      <path
        d="M 19 42 A 12 12 0 0 1 19 58"
        stroke={arc1}
        strokeWidth="7.5"
        strokeLinecap="round"
      />

      {/* ── Arco 2 — célula / grupo pequeno ─────────────── */}
      {/* de (19,30) a (19,70) */}
      <path
        d="M 19 30 A 22 22 0 0 1 19 70"
        stroke={arc2}
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* ── Arco 3 — Igreja / comunidade ampla ───────────── */}
      {/* de (19,16) a (19,84) — semicírculo perfeito */}
      <path
        d="M 19 16 A 34 34 0 0 1 19 84"
        stroke={arc3}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Wordmark completo: ícone + texto "emetis" */
interface EmetisLogoProps {
  iconSize?: number;
  variant?: 'white' | 'blue';
  className?: string;
}

export function EmetisLogo({ iconSize = 28, variant = 'blue', className }: EmetisLogoProps) {
  const textColor = variant === 'white' ? 'text-white' : 'text-slate-900';
  const accentColor = variant === 'white' ? 'text-white' : 'text-blue-700';

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <EmetisIcon size={iconSize} variant={variant} />
      <span className={`font-extrabold tracking-tight leading-none select-none ${textColor}`}
            style={{ fontSize: iconSize * 0.85 }}>
        <span className={accentColor}>e</span>metis
      </span>
    </div>
  );
}
