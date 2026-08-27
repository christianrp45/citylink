'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Award } from 'lucide-react';
import { getCadernoMeta } from '@/lib/data/formacao';

type VerifyResult = {
  valid: boolean;
  reason?: string;
  userName?: string;
  churchName?: string | null;
  caderno?: string;
  completedAt?: string;
  score?: number;
  total?: number;
  type?: 'full';
};

function VerifyCertContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const caderno = searchParams.get('caderno') ?? 'all';
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setResult({ valid: false, reason: 'Link inválido' }); setLoading(false); return; }
    fetch(`/api/verificar/cert?userId=${userId}&caderno=${caderno}`)
      .then((r) => r.json())
      .then(setResult)
      .catch(() => setResult({ valid: false, reason: 'Erro ao verificar' }))
      .finally(() => setLoading(false));
  }, [userId, caderno]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!result?.valid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center gap-4">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle size={40} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Certificado não verificado</h1>
        <p className="text-slate-500 text-sm">{result?.reason ?? 'Este certificado não pôde ser verificado.'}</p>
      </div>
    );
  }

  const meta = caderno !== 'all' ? getCadernoMeta(caderno) : null;
  const dateStr = result.completedAt
    ? new Date(result.completedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50 to-white px-5 py-10">
      <div className="max-w-sm mx-auto w-full">
        {/* Valid badge */}
        <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 w-fit mx-auto mb-6">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span className="text-emerald-700 text-sm font-bold">Certificado Autêntico</span>
        </div>

        {/* Certificate card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award size={32} className="text-white" />
            </div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
              {result.type === 'full' ? 'Formação Batista Completa' : 'Certificado de Conclusão'}
            </p>
            <h1 className="text-white text-xl font-bold leading-tight">
              {meta ? meta.titulo : 'Série Integrar'}
            </h1>
            {meta && <p className="text-white/70 text-xs mt-1">Caderno {meta.numero}</p>}
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Participante</p>
              <p className="text-xl font-bold text-slate-800">{result.userName}</p>
              {result.churchName && <p className="text-sm text-slate-500 mt-0.5">{result.churchName}</p>}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Concluído em</span>
                <span className="font-medium text-slate-700">{dateStr}</span>
              </div>
              {result.score !== undefined && result.total !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Nota</span>
                  <span className="font-medium text-slate-700">{result.score}/{result.total}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Emitido por</span>
                <span className="font-medium text-slate-700">Emetis · PIB Curitiba</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed">
          Este certificado foi verificado automaticamente pelo sistema Emetis.
          Série Integrar — Formação Batista (PIB Curitiba).
        </p>
      </div>
    </div>
  );
}

export default function VerifyCertPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50" />}>
      <VerifyCertContent />
    </Suspense>
  );
}
