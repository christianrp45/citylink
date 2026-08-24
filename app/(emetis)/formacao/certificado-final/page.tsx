'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Download, Share2, Trophy } from 'lucide-react';

type CertData = {
  userName: string;
  churchName: string | null;
  completedAt: string;
  type: 'full';
};

export default function CertificadoFinalPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [certData, setCertData] = useState<CertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/formacao/certificate')
      .then((r) => {
        if (!r.ok) throw new Error('Formação não concluída ainda');
        return r.json();
      })
      .then(setCertData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!certData || !canvasRef.current) return;
    drawFinalCertificate(canvasRef.current, certData);
  }, [certData]);

  function downloadCertificate() {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'certificado-formacao-batista.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }

  async function shareCertificate() {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'certificado-formacao-batista.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Certificado de Formação Batista — Série Integrar' });
      } else {
        downloadCertificate();
      }
    });
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* Header dourado */}
      <div className="bg-gradient-to-br from-amber-500 to-yellow-600 px-4 pt-4 pb-6">
        <button onClick={() => router.push('/formacao')} className="flex items-center gap-1 text-white/70 text-sm mb-4 hover:text-white">
          <ChevronLeft size={16} /> Formação
        </button>
        <div className="flex items-center gap-3">
          <Trophy size={28} className="text-white" />
          <div>
            <h1 className="text-white font-bold text-lg">Certificado Final</h1>
            <p className="text-white/70 text-xs">Série Integrar — 8 Cadernos Completos</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 flex-1 flex flex-col items-center gap-4">
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-400 text-sm">Verificando sua formação…</p>
          </div>
        )}

        {error && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-4">
            <Trophy size={48} className="text-slate-300" />
            <p className="text-slate-600 font-semibold">Formação ainda não concluída</p>
            <p className="text-slate-400 text-sm">{error}</p>
            <button
              onClick={() => router.push('/formacao')}
              className="bg-amber-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm mt-2"
            >
              Ver meu progresso
            </button>
          </div>
        )}

        {certData && (
          <>
            <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-amber-200">
              <canvas ref={canvasRef} width={900} height={636} className="w-full h-auto" />
            </div>
            <div className="w-full grid grid-cols-2 gap-3">
              <button
                onClick={downloadCertificate}
                className="flex items-center justify-center gap-2 bg-amber-500 text-white font-semibold py-3 rounded-xl text-sm"
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

// ─── Canvas do certificado final (ouro) ───────────────────────────────────────

function drawFinalCertificate(canvas: HTMLCanvasElement, data: CertData) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = 900;
  const H = 636;
  ctx.clearRect(0, 0, W, H);

  // Fundo creme
  ctx.fillStyle = '#fffbeb';
  ctx.fillRect(0, 0, W, H);

  // Borda dourada dupla
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 14;
  ctx.strokeRect(18, 18, W - 36, H - 36);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  // Faixa superior dourada
  const grad = ctx.createLinearGradient(0, 18, 0, 88);
  grad.addColorStop(0, '#b45309');
  grad.addColorStop(1, '#d97706');
  ctx.fillStyle = grad;
  ctx.fillRect(18, 18, W - 36, 70);

  // Texto faixa
  ctx.fillStyle = '#fef3c7';
  ctx.font = 'bold 17px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('SÉRIE INTEGRAR — FORMAÇÃO BATISTA COMPLETA', W / 2, 62);

  // Troféu
  ctx.fillStyle = '#fef3c7';
  ctx.font = '60px serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏆', W / 2, 178);

  // Título
  ctx.fillStyle = '#78350f';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('CERTIFICADO DE FORMAÇÃO COMPLETA', W / 2, 228);

  // Linha
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 244);
  ctx.lineTo(W - 120, 244);
  ctx.stroke();

  // Texto certificamos
  ctx.fillStyle = '#92400e';
  ctx.font = '16px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Certificamos que', W / 2, 280);

  // Nome
  ctx.fillStyle = '#78350f';
  ctx.font = 'bold 36px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.userName, W / 2, 330);

  // Linha sob nome
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(160, 344);
  ctx.lineTo(W - 160, 344);
  ctx.stroke();

  // Descrição
  ctx.fillStyle = '#92400e';
  ctx.font = '15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('concluiu com aprovação todos os 8 cadernos da', W / 2, 378);
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillStyle = '#b45309';
  ctx.fillText('Série Integrar — Formação Batista', W / 2, 406);

  // Oferecimento
  const churchText = data.churchName
    ? `Em oferta de: ${data.churchName}`
    : 'Série Integrar — Formação Batista';
  ctx.fillStyle = '#92400e';
  ctx.font = '14px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(churchText, W / 2, 450);

  ctx.fillStyle = '#b45309';
  ctx.font = '12px Georgia, serif';
  ctx.fillText('Material: Primeira Igreja Batista de Curitiba (PIB Curitiba)', W / 2, 472);

  // Data
  const date = new Date(data.completedAt);
  const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  ctx.fillStyle = '#92400e';
  ctx.font = '13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(dateStr, W / 2, 510);

  // Rodapé dourado
  const gradFoot = ctx.createLinearGradient(0, H - 88, 0, H - 18);
  gradFoot.addColorStop(0, '#d97706');
  gradFoot.addColorStop(1, '#b45309');
  ctx.fillStyle = gradFoot;
  ctx.fillRect(18, H - 90, W - 36, 72);
  ctx.fillStyle = '#fef3c7';
  ctx.font = '12px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Este certificado confirma a conclusão integral do programa de formação discipular Série Integrar.', W / 2, H - 58);
  ctx.fillText('Cadernos I ao VIII aprovados com avaliação de fixação.', W / 2, H - 38);
}
