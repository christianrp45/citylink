'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CADERNOS, COR_CLASSES } from '@/lib/data/formacao';
import { ChevronRight, BookOpen, Trophy, GraduationCap } from 'lucide-react';

type MinhasTurmas = {
  turmaId: string;
  caderno: string;
  cellId: string;
  cellName: string;
  meta: { numero: string; titulo: string; emoji: string; cor: string } | null;
}[];

function useFormacaoProgress() {
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    // 1. Lê localStorage imediatamente (exibição instantânea)
    const local: Record<string, number> = {};
    for (const caderno of CADERNOS) {
      local[caderno.slug] = Object.keys(localStorage).filter((k) =>
        k.startsWith(`formacao:${caderno.slug}:`),
      ).length;
    }
    setProgress(local);

    // 2. Busca progresso do servidor e faz merge (sync cross-device)
    fetch('/api/formacao/progress')
      .then((r) => r.ok ? r.json() : null)
      .then((serverData: Record<string, string[]> | null) => {
        if (!serverData) return;
        const merged = { ...local };
        for (const [caderno, licoes] of Object.entries(serverData)) {
          for (const licao of licoes) {
            localStorage.setItem(`formacao:${caderno}:${licao}`, 'done');
          }
          merged[caderno] = Math.max(merged[caderno] ?? 0, licoes.length);
        }
        setProgress(merged);
      })
      .catch(() => {});
  }, []);

  return progress;
}

type LastLesson = { caderno: string; licao: string; titulo: string; cadernoTitulo: string };

export default function FormacaoPage() {
  const progress = useFormacaoProgress();
  const [allPassed, setAllPassed] = useState(false);
  const [minhasTurmas, setMinhasTurmas] = useState<MinhasTurmas>([]);
  const [lastLesson, setLastLesson] = useState<LastLesson | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('formacao:last_lesson');
      if (saved) setLastLesson(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    fetch('/api/formacao/certificate')
      .then((r) => { if (r.ok) setAllPassed(true); })
      .catch(() => {});
    fetch('/api/formacao/minhas-turmas')
      .then((r) => r.ok ? r.json() : [])
      .then(setMinhasTurmas)
      .catch(() => toast.error('Não foi possível carregar suas turmas.'));
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

      {/* Continuar de onde parou */}
      {lastLesson && (
        <Link
          href={`/formacao/${lastLesson.caderno}/${lastLesson.licao}`}
          className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl px-4 py-3.5 shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <ChevronRight size={22} className="text-white/80 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wide">Continuar</p>
            <p className="text-white font-bold text-sm truncate">{lastLesson.titulo}</p>
            <p className="text-white/60 text-xs truncate">{lastLesson.cadernoTitulo}</p>
          </div>
          <span className="text-white/50 text-xs flex-shrink-0">→</span>
        </Link>
      )}

      {/* Minhas matrículas */}
      {minhasTurmas.length === 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-4 flex items-start gap-3">
          <span className="text-2xl mt-0.5">🎓</span>
          <div>
            <p className="text-sm font-semibold text-indigo-800">Estude com sua célula</p>
            <p className="text-xs text-indigo-600 mt-0.5">Peça ao líder para criar uma turma da Série Integrar na sua célula e se matricule para acompanhar o progresso em grupo.</p>
          </div>
        </div>
      )}
      {minhasTurmas.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <GraduationCap size={13} /> Minhas matrículas
          </p>
          {minhasTurmas.map((t) => {
            const cor = COR_CLASSES[t.meta?.cor ?? 'indigo'];
            return (
              <Link
                key={t.turmaId}
                href={`/formacao/${t.caderno}`}
                className={`flex items-center gap-3 bg-white rounded-2xl border ${cor.border} px-4 py-3 shadow-sm hover:shadow-md active:scale-[0.98] transition-all`}
              >
                <span className="text-2xl">{t.meta?.emoji ?? '📖'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-semibold">Caderno {t.meta?.numero} · {t.cellName}</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{t.meta?.titulo ?? t.caderno}</p>
                </div>
                <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}

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
