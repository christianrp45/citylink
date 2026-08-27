'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCadernoMeta, COR_CLASSES } from '@/lib/data/formacao';
import { ChevronLeft, Download, Share2, Award } from 'lucide-react';
import QRCode from 'react-qr-code';

type CertData = {
  userId: string;
  userName: string;
  churchName: string | null;
  completedAt: string;
  score: number;
  total: number;
};

export default function CertificadoPage() {
  const params = useParams<{ caderno: string }>();
  const router = useRouter();
  const caderno = params.caderno;
  const meta = getCadernoMeta(caderno);
  const cor = COR_CLASSES[meta?.cor ?? 'indigo'];
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [certData, setCertData] = useState<CertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/formacao/certificate?caderno=${caderno}`)
      .then((r) => {
        if (!r.ok) throw new Error('Certificado não disponível');
        return r.json();
      })
      .then(setCertData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [caderno]);

  useEffect(() => {
    if (!certData || !canvasRef.current || !meta) return;
    drawCertificate(canvasRef.current, certData, meta.titulo, meta.numero);
  }, [certData, meta]);

  function downloadCertificate() {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `certificado-${caderno}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }

  async function shareCertificate() {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `certificado-${caderno}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Meu Certificado — Série Integrar' });
      } else {
        downloadCertificate();
      }
    });
  }

  if (!meta) return null;

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* Header */}
      <div className={`${cor.bg} px-4 pt-4 pb-6`}>
        <button onClick={() => router.push(`/formacao/${caderno}`)} className="flex items-center gap-1 text-white/70 text-sm mb-4 hover:text-white">
          <ChevronLeft size={16} /> {meta.titulo}
        </button>
        <div className="flex items-center gap-3">
          <Award size={28} className="text-white" />
          <div>
            <h1 className="text-white font-bold text-lg">Certificado</h1>
            <p className="text-white/70 text-xs">Caderno {meta.numero} — {meta.titulo}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 flex-1 flex flex-col items-center gap-4">
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-400 text-sm">Carregando certificado…</p>
          </div>
        )}

        {error && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-4">
            <p className="text-slate-500 text-sm">{error}</p>
            <button onClick={() => router.push(`/formacao/${caderno}/quiz`)} className={`${cor.bg} text-white text-sm font-semibold px-6 py-2.5 rounded-xl`}>
              Fazer a avaliação
            </button>
          </div>
        )}

        {certData && (
          <>
            {/* Canvas do certificado */}
            <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <canvas
                ref={canvasRef}
                width={900}
                height={636}
                className="w-full h-auto"
              />
            </div>

            {/* QR de Verificação */}
            <div className="w-full flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">QR de Verificação</p>
              <QRCode
                value={`${window.location.origin}/verificar/cert?userId=${certData.userId}&caderno=${caderno}`}
                size={100}
              />
              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                Escaneie para verificar a autenticidade deste certificado
              </p>
            </div>

            {/* Ações */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button
                onClick={downloadCertificate}
                className={`flex items-center justify-center gap-2 ${cor.bg} text-white font-semibold py-3 rounded-xl text-sm`}
              >
                <Download size={16} /> Baixar PNG
              </button>
              <button
                onClick={shareCertificate}
                className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl text-sm"
              >
                <Share2 size={16} /> Compartilhar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Desenho do certificado em Canvas ────────────────────────────────────────

function drawCertificate(
  canvas: HTMLCanvasElement,
  data: CertData,
  cadernoTitulo: string,
  cadernoNumero: string,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = 900;
  const H = 636;
  ctx.clearRect(0, 0, W, H);

  // Fundo branco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Borda externa
  ctx.strokeStyle = '#3730a3';
  ctx.lineWidth = 12;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // Borda interna decorativa
  ctx.strokeStyle = '#e0e7ff';
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, W - 72, H - 72);

  // Faixa superior
  ctx.fillStyle = '#3730a3';
  ctx.fillRect(20, 20, W - 40, 70);

  // Texto da faixa
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('SÉRIE INTEGRAR — FORMAÇÃO BATISTA', W / 2, 63);

  // Logo / ícone central decorativo
  ctx.fillStyle = '#e0e7ff';
  ctx.beginPath();
  ctx.arc(W / 2, 170, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3730a3';
  ctx.font = 'bold 42px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(cadernoNumero, W / 2, 184);

  // Título principal
  ctx.fillStyle = '#1e1b4b';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('CERTIFICADO DE CONCLUSÃO', W / 2, 258);

  // Linha decorativa
  ctx.strokeStyle = '#818cf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(160, 272);
  ctx.lineTo(W - 160, 272);
  ctx.stroke();

  // Texto "Certificamos que"
  ctx.fillStyle = '#64748b';
  ctx.font = '16px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Certificamos que', W / 2, 308);

  // Nome do participante
  ctx.fillStyle = '#1e1b4b';
  ctx.font = 'bold 34px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.userName, W / 2, 356);

  // Linha sob o nome
  ctx.strokeStyle = '#c7d2fe';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(200, 370);
  ctx.lineTo(W - 200, 370);
  ctx.stroke();

  // Texto do caderno
  ctx.fillStyle = '#475569';
  ctx.font = '15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`concluiu com aprovação o Caderno ${cadernoNumero}:`, W / 2, 402);

  ctx.fillStyle = '#3730a3';
  ctx.font = 'bold 19px Georgia, serif';
  ctx.textAlign = 'center';
  // Quebra o título se for muito longo
  const maxW = W - 160;
  wrapText(ctx, cadernoTitulo, W / 2, 430, maxW, 26);

  // Oferecimento
  const churchText = data.churchName
    ? `Em oferta de: ${data.churchName}`
    : 'Série Integrar — Formação Batista';
  ctx.fillStyle = '#64748b';
  ctx.font = '14px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(churchText, W / 2, 490);

  // Fonte do material
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Material: Primeira Igreja Batista de Curitiba (PIB Curitiba)', W / 2, 512);

  // Data
  const date = new Date(data.completedAt);
  const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  ctx.fillStyle = '#475569';
  ctx.font = '13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(dateStr, W / 2, 548);

  // Rodapé
  ctx.fillStyle = '#3730a3';
  ctx.fillRect(20, H - 90, W - 40, 70);
  ctx.fillStyle = '#c7d2fe';
  ctx.font = '12px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Este certificado confirma a conclusão do programa de formação discipular Série Integrar.', W / 2, H - 58);
  ctx.fillText(`Nota: ${data.score}/${data.total} na avaliação de fixação.`, W / 2, H - 38);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
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
  ctx.fillText(line, x, currentY);
}
