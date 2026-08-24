'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChevronLeft, Plus, BookOpen, CheckCircle2, Users } from 'lucide-react';

type TurmaMeta = {
  numero: string;
  titulo: string;
  emoji: string;
  cor: string;
};

type Turma = {
  id: string;
  caderno: string;
  createdBy: string;
  createdAt: string;
  active: boolean;
  enrolled: boolean;
  meta: TurmaMeta | null;
};

export default function CelulaFormacaoPage() {
  const { cellId } = useParams<{ cellId: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLeader, setIsLeader] = useState(false);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/formacao/turma?cellId=${cellId}`).then((r) => r.json()),
      fetch(`/api/mdc/cells/${cellId}`).then((r) => r.json()),
    ])
      .then(([turmasData, cellData]) => {
        setTurmas(Array.isArray(turmasData) ? turmasData : []);
        if (session?.user?.id && cellData) {
          setIsLeader(
            cellData.leaderId === session.user.id ||
            cellData.coLeaderId === session.user.id,
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cellId, session?.user?.id]);

  async function toggleEnroll(turma: Turma) {
    setEnrolling(turma.id);
    const method = turma.enrolled ? 'DELETE' : 'POST';
    await fetch(`/api/formacao/turma/${turma.id}/enroll`, { method });
    setTurmas((prev) =>
      prev.map((t) => (t.id === turma.id ? { ...t, enrolled: !t.enrolled } : t)),
    );
    setEnrolling(null);
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-4 pt-4 pb-6">
        <button
          onClick={() => router.push(`/mdc/cells/${cellId}`)}
          className="flex items-center gap-1 text-white/70 text-sm mb-4 hover:text-white"
        >
          <ChevronLeft size={16} /> Célula
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={24} className="text-white" />
            <div>
              <h1 className="text-white font-bold text-lg">Formação Batista</h1>
              <p className="text-white/70 text-xs">Série Integrar — turmas ativas</p>
            </div>
          </div>
          {isLeader && (
            <Link
              href={`/mdc/cells/${cellId}/formacao/nova`}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
            >
              <Plus size={14} /> Nova turma
            </Link>
          )}
        </div>
      </div>

      <div className="px-4 py-5 flex-1 space-y-3">
        {loading && (
          <p className="text-center text-slate-400 text-sm py-8">Carregando turmas…</p>
        )}

        {!loading && turmas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <BookOpen size={40} className="text-slate-300" />
            <p className="text-slate-500 font-semibold text-sm">Nenhuma turma ativa</p>
            {isLeader ? (
              <Link
                href={`/mdc/cells/${cellId}/formacao/nova`}
                className="bg-indigo-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl mt-1"
              >
                + Criar primeira turma
              </Link>
            ) : (
              <p className="text-slate-400 text-xs">O líder ainda não criou nenhuma turma.</p>
            )}
          </div>
        )}

        {turmas.map((turma) => (
          <div
            key={turma.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-4">
              <span className="text-3xl">{turma.meta?.emoji ?? '📖'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                  Caderno {turma.meta?.numero}
                </p>
                <p className="text-slate-800 font-bold text-sm leading-snug">
                  {turma.meta?.titulo ?? turma.caderno}
                </p>
                {turma.enrolled && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-0.5">
                    <CheckCircle2 size={10} /> Matriculado
                  </span>
                )}
              </div>

              {isLeader && (
                <Link
                  href={`/mdc/cells/${cellId}/formacao/${turma.id}`}
                  className="flex items-center gap-1 text-xs text-indigo-600 font-semibold border border-indigo-200 px-2.5 py-1.5 rounded-lg"
                >
                  <Users size={12} /> Membros
                </Link>
              )}
            </div>

            <div className="border-t border-slate-50 px-4 py-3 flex gap-2">
              {turma.enrolled ? (
                <>
                  <Link
                    href={`/formacao/${turma.caderno}`}
                    className="flex-1 text-center bg-indigo-600 text-white text-xs font-semibold py-2.5 rounded-xl"
                  >
                    Continuar estudo
                  </Link>
                  <button
                    onClick={() => toggleEnroll(turma)}
                    disabled={enrolling === turma.id}
                    className="px-3 py-2.5 text-xs text-slate-400 border border-slate-200 rounded-xl hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEnroll(turma)}
                  disabled={enrolling === turma.id}
                  className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl disabled:opacity-60"
                >
                  {enrolling === turma.id ? 'Matriculando…' : '+ Matricular-se'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
