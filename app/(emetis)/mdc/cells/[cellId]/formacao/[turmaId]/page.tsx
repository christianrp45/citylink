'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Award, BookOpen } from 'lucide-react';

type Member = {
  userId: string;
  name: string;
  enrolledAt: string;
  licoesFeitas: number;
  totalLicoes: number;
  pct: number;
  quizPassed: boolean;
};

type TurmaDetail = {
  turma: { id: string; caderno: string; active: boolean; createdAt: string };
  meta: { numero: string; titulo: string; emoji: string } | null;
  members: Member[];
};

export default function TurmaDetalhe() {
  const { cellId, turmaId } = useParams<{ cellId: string; turmaId: string }>();
  const router = useRouter();
  const [data, setData] = useState<TurmaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    fetch(`/api/formacao/turma/${turmaId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [turmaId]);

  async function handleClose() {
    if (!confirm('Encerrar esta turma? Os membros não poderão mais se matricular.')) return;
    setClosing(true);
    await fetch(`/api/formacao/turma/${turmaId}`, { method: 'PATCH' });
    router.push(`/mdc/cells/${cellId}/formacao`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p className="text-slate-400 text-sm">Carregando…</p>
      </div>
    );
  }

  if (!data) return null;

  const { turma, meta, members } = data;
  const aprovados = members.filter((m) => m.quizPassed).length;

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-4 pt-4 pb-6">
        <button
          onClick={() => router.push(`/mdc/cells/${cellId}/formacao`)}
          className="flex items-center gap-1 text-white/70 text-sm mb-4 hover:text-white"
        >
          <ChevronLeft size={16} /> Turmas
        </button>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{meta?.emoji ?? '📖'}</span>
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">
              Caderno {meta?.numero}
            </p>
            <h1 className="text-white font-bold text-base leading-snug">{meta?.titulo ?? turma.caderno}</h1>
            <p className="text-white/60 text-xs mt-0.5">
              {members.length} matriculado{members.length !== 1 ? 's' : ''} · {aprovados} aprovado{aprovados !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 flex-1 space-y-3">
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
            <BookOpen size={36} className="text-slate-300" />
            <p className="text-slate-500 text-sm font-semibold">Nenhum membro matriculado ainda</p>
            <p className="text-slate-400 text-xs">Compartilhe a turma com os membros da célula.</p>
          </div>
        ) : (
          members.map((m) => (
            <div key={m.userId} className="bg-white rounded-2xl border border-slate-100 px-4 py-3.5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 font-bold text-xs">
                      {m.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 truncate">{m.name}</p>
                </div>
                {m.quizPassed && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full flex-shrink-0">
                    <Award size={10} /> Aprovado
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-indigo-500 rounded-full h-1.5 transition-all"
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0 w-14 text-right">
                  {m.licoesFeitas}/{m.totalLicoes} lições
                </span>
              </div>
            </div>
          ))
        )}

        {turma.active && (
          <button
            onClick={handleClose}
            disabled={closing}
            className="w-full border border-red-200 text-red-500 text-sm font-semibold py-3 rounded-xl mt-2 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {closing ? 'Encerrando…' : 'Encerrar turma'}
          </button>
        )}
      </div>
    </div>
  );
}
