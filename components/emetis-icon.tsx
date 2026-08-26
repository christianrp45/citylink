/**
 * Emetis Brand Icon — "e" lettermark com conceito Emet (אמת)
 *
 * Anatomia:
 *  • Arco 270° anti-horário  → letra "e"
 *  • Barra horizontal        → Mem (מ) — o centro
 *  • Ponto âmbar pleno       → Alef (א) — o começo
 *  • Ponto âmbar sutil       → Tav (ת) — o fim
 *
 * Variante "blue":  ícone completo com fundo gradiente (sobre fundos claros)
 * Variante "white": marca "e" sem fundo (sobre fundos azuis/escuros)
 */

import { useId } from 'react';

interface EmetisIconProps {
  size?: number;
  variant?: 'white' | 'blue';
  className?: string;
}

export function EmetisIcon({ size = 32, variant = 'blue', className }: EmetisIconProps) {
  const uid = useId().replace(/:/g, '');

  if (variant === 'blue') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Emetis"
      >
        <defs>
          <linearGradient id={`em-bg-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E3FA0" />
            <stop offset="100%" stopColor="#0B1D4E" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="113" fill={`url(#em-bg-${uid})`} />
        <path
          d="M 336 176 A 113 113 0 1 0 336 336"
          stroke="white"
          strokeWidth="44"
          strokeLinecap="round"
          fill="none"
        />
        <line
          x1="143" y1="256"
          x2="343" y2="256"
          stroke="white"
          strokeWidth="44"
          strokeLinecap="round"
        />
        <circle cx="336" cy="176" r="34" fill="#F59E0B" />
        <circle cx="336" cy="336" r="20" fill="#F59E0B" opacity="0.45" />
      </svg>
    );
  }

  // variant="white" — marca "e" sem fundo, para usar sobre azul/escuro
  return (
    <svg
      width={size}
      height={size}
      viewBox="80 80 360 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Emetis"
    >
      <path
        d="M 336 176 A 113 113 0 1 0 336 336"
        stroke="white"
        strokeWidth="44"
        strokeLinecap="round"
        fill="none"
      />
      <line
        x1="143" y1="256"
        x2="343" y2="256"
        stroke="white"
        strokeWidth="44"
        strokeLinecap="round"
      />
      <circle cx="336" cy="176" r="34" fill="#F59E0B" />
      <circle cx="336" cy="336" r="20" fill="#F59E0B" opacity="0.45" />
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
  const textColor = variant === 'white' ? 'text-white' : 'text-[#0B1D4E]';

  return (
    <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <EmetisIcon size={iconSize} variant={variant} />
      <span
        className={`font-semibold tracking-tight leading-none select-none ${textColor}`}
        style={{ fontSize: iconSize * 0.82 }}
      >
        emetis
      </span>
    </div>
  );
}
