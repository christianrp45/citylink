'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Share2, Download } from 'lucide-react';

interface ShareVerseModalProps {
  verse: number;
  text: string;
  bookName: string;
  chapter: number;
  onClose: () => void;
}

const THEMES = [
  { label: 'Índigo', from: '#4338ca', to: '#7c3aed', accent: 'rgba(167,139,250,0.25)' },
  { label: 'Aurora', from: '#0f766e', to: '#0369a1', accent: 'rgba(52,211,153,0.2)' },
  { label: 'Pôr do Sol', from: '#b45309', to: '#b91c1c', accent: 'rgba(251,191,36,0.2)' },
  { label: 'Noite', from: '#1e1b4b', to: '#0f172a', accent: 'rgba(99,102,241,0.2)' },
];

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

function drawVerseCard(
  canvas: HTMLCanvasElement,
  verse: number,
  text: string,
  bookName: string,
  chapter: number,
  theme: (typeof THEMES)[number]
) {
  const SIZE = 1080;
  const PAD = 90;
  canvas.width = SIZE;
  canvas.height = SIZE;

  const ctx = canvas.getContext('2d')!;

  // Gradiente de fundo diagonal
  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, theme.from);
  grad.addColorStop(0.6, theme.to);
  grad.addColorStop(1, theme.from);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Overlay radial central
  const radial = ctx.createRadialGradient(SIZE / 2, SIZE / 2, SIZE * 0.1, SIZE / 2, SIZE / 2, SIZE * 0.75);
  radial.addColorStop(0, 'rgba(255,255,255,0.08)');
  radial.addColorStop(1, 'rgba(0,0,0,0.15)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Círculo decorativo superior direito
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.arc(SIZE * 0.85, SIZE * 0.12, SIZE * 0.38, 0, Math.PI * 2);
  ctx.fill();

  // Círculo decorativo inferior esquerdo
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.arc(SIZE * 0.1, SIZE * 0.9, SIZE * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Linha superior decorativa
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(PAD, PAD * 0.6, 60, 4);
  ctx.fillRect(PAD + 72, PAD * 0.6, 20, 4);

  // Aspas decorativas grandes
  ctx.font = `bold ${SIZE * 0.22}px Georgia, serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.textBaseline = 'top';
  ctx.fillText('\u201C', PAD - 20, PAD * 0.3);

  // Texto do versículo
  const fontSize = text.length > 220 ? 40 : text.length > 150 ? 48 : text.length > 80 ? 56 : 64;
  ctx.font = `italic ${fontSize}px Georgia, serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 12;

  const textEndY = wrapText(
    ctx,
    `\u201C${text}\u201D`,
    PAD,
    PAD * 1.1,
    SIZE - PAD * 2,
    fontSize * 1.55
  );

  ctx.shadowBlur = 0;

  // Linha separadora com gradiente
  const linGrad = ctx.createLinearGradient(PAD, 0, PAD + 120, 0);
  linGrad.addColorStop(0, 'rgba(255,255,255,0.7)');
  linGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = linGrad;
  ctx.fillRect(PAD, textEndY + 28, 120, 3);

  // Referência bíblica
  ctx.font = `bold 46px -apple-system, "Helvetica Neue", sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 8;
  ctx.fillText(`${bookName} ${chapter}:${verse}`, PAD, textEndY + 52);
  ctx.shadowBlur = 0;

  // Versão da Bíblia
  ctx.font = `300 28px -apple-system, "Helvetica Neue", sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('NVI — Nova Versão Internacional', PAD, textEndY + 112);

  // Rodapé — branding Emetis
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.font = `bold 30px -apple-system, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('Emetis', SIZE - PAD, SIZE - PAD * 0.55);

  ctx.font = `bold 36px Georgia, serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('\u03C4', SIZE - PAD - 80, SIZE - PAD * 0.5);

  ctx.textAlign = 'left';
}

export function ShareVerseModal({ verse, text, bookName, chapter, onClose }: ShareVerseModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTheme, setActiveTheme] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(
      typeof navigator !== 'undefined' &&
        'share' in navigator &&
        'canShare' in navigator
    );
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      drawVerseCard(canvasRef.current, verse, text, bookName, chapter, THEMES[activeTheme]);
    }
  }, [activeTheme, verse, text, bookName, chapter]);

  async function getBlob(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvasRef.current?.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas vazio'));
      }, 'image/png');
    });
  }

  async function handleShare() {
    setSharing(true);
    try {
      const blob = await getBlob();
      const file = new File([blob], `${bookName}-${chapter}-${verse}.png`, { type: 'image/png' });
      if (canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${bookName} ${chapter}:${verse}`,
          text: `"${text}" — ${bookName} ${chapter}:${verse} (NVI)`,
        });
      } else {
        handleDownload(blob);
      }
    } catch {
      // usuário cancelou ou erro
    } finally {
      setSharing(false);
    }
  }

  function handleDownload(blob?: Blob) {
    const doDownload = (b: Blob) => {
      const url = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${bookName}-${chapter}-${verse}.png`;
      a.click();
      URL.revokeObjectURL(url);
    };

    if (blob) {
      doDownload(blob);
    } else {
      canvasRef.current?.toBlob((b) => { if (b) doDownload(b); }, 'image/png');
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9992] flex flex-col justify-end"
      style={{ background: 'rgba(15,23,42,0.8)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl shadow-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-slate-800">Compartilhar versículo</p>
          <button onClick={onClose}>
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Preview do canvas (reduzido para caber na tela) */}
        <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 shadow-lg">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ imageRendering: 'auto' }}
          />
        </div>

        {/* Seletor de tema */}
        <div className="flex gap-2 mb-4">
          {THEMES.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setActiveTheme(i)}
              title={t.label}
              className={`flex-1 h-8 rounded-xl transition-all ${
                activeTheme === i ? 'ring-2 ring-offset-2 ring-slate-400 scale-105' : ''
              }`}
              style={{
                background: `linear-gradient(135deg, ${t.from}, ${t.to})`,
              }}
            />
          ))}
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <button
            onClick={() => handleDownload()}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download size={16} /> Baixar
          </button>
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-semibold disabled:opacity-50 hover:bg-indigo-700 transition-colors"
          >
            <Share2 size={16} /> {sharing ? 'Aguarde...' : 'Compartilhar'}
          </button>
        </div>
      </div>
    </div>
  );
}
