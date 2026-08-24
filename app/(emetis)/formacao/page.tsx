'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CADERNOS, COR_CLASSES } from '@/lib/data/formacao';
import { ChevronRight, BookOpen, Trophy } from 'lucide-react';

function useFormacaoProgress() {
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const result: Record<string, number> = {};
    for (const caderno of CADERNOS) {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith(`formacao:${caderno.slug}:`),
      );
      result[caderno.slug] = keys.length;
    }
    setProgress(result);
  }, []);

  return progress;
}

export default function FormacaoPage() {
  const progress = useFormacaoProgress();
  const [allPassed, setAllPassed] = useState(false);

  useEffect(() => {
    fetch('/api/formacao/certificate')
      .then((r) => { if (r.ok) setAllPassed(true); })
      .catch(() => {});
  }, []);

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen size={22} className="text-indigo-600" />
          Série Integrar
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Formação Batista — 8 cadernos</p>
      </div>

      {/* Crédito da fonte */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
        <p className="text-[11px] text-amber-700 leading-relaxed">
          📖 Material elaborado pela <strong>Primeira Igreja Batista de Curitiba (PIB Curitiba)</strong>, disponibilizado para igrejas e instituições parceiras.
        </p>
      </div>

      {/* Banner certificado final */}
      {allPassed && (
        <Link
          href="/formacao/certificado-final"
          className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl px-4 py-3.5 shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <Trophy size={24} className="text-white flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">Formação Completa! 🎉</p>
            <p className="text-white/80 text-xs mt-0.5">Ver seu Certificado Final</p>
          </div>
          <ChevronRight size={16} className="text-white/70 flex-shrink-0" />
        </Link>
      )}

      {/* Lista de cadernos */}
      <div className="space-y-3">
        {CADERNOS.map((caderno) => {
          const cor = COR_CLASSES[caderno.cor];
          const concluidos = progress[caderno.slug] ?? 0;

          return (
            <Link
              key={caderno.slug}
              href={`/formacao/${caderno.slug}`}
              className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:border-slate-200 active:scale-[0.98] transition-all"
            >
              {/* Número romano com cor */}
              <div
                className={`w-12 h-12 rounded-xl ${cor.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}
              >
                <span className="text-white font-black text-sm">{caderno.numero}</span>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base">{caderno.emoji}</span>
                  <p className="text-sm font-bold text-slate-800 truncate">{caderno.titulo}</p>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                  {caderno.descricao}
                </p>
                {concluidos > 0 && (
                  <p className={`text-[10px] font-semibold mt-1 ${cor.text}`}>
                    {concluidos} {caderno.unidade.toLowerCase()}
                    {concluidos !== 1 ? 's' : ''} concluído{concluidos !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
            </Link>
          );
        })}
      </div>

      {/* Rodapé */}
      <p className="text-center text-[10px] text-slate-300 pt-2">
        Série Integrar · PIB Curitiba · 2019–2024
      </p>
    </div>
  );
}
