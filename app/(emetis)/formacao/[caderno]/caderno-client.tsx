'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Award, ClipboardList, GraduationCap } from 'lucide-react';
import type { CadernoMeta } from '@/lib/data/formacao';
import type { FormacaoSection } from '@/lib/formacao-parser';

type CorClasses = {
  bg: string; text: string; border: string; badge: string; light: string;
};

type Turma = { id: string; caderno: string; cellId: string; cellName?: string; enrolled: boolean };

interface Props {
  meta: CadernoMeta;
  sections: FormacaoSection[];
  cor: CorClasses;
}

export function CadernoClient({ meta, sections, cor }: Props) {
  const router = useRouter();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [quizPassed, setQuizPassed] = useState(false);
  const [turma, setTurma] = useState<Turma | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const done = new Set<string>();
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(`formacao:${meta.slug}:`)) {
        done.add(key.replace(`formacao:${meta.slug}:`, ''));
      }
    }
    setCompleted(done);
  }, [meta.slug]);

  useEffect(() => {
    fetch(`/api/formacao/quiz?caderno=${meta.slug}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.passed) setQuizPassed(true); })
      .catch(() => {});
    // Busca turma ativa do usuário para este caderno
    fetch('/api/formacao/minhas-turmas')
      .then((r) => r.ok ? r.json() : [])
      .then((turmas: Turma[]) => {
        const found = turmas.find((t) => t.caderno === meta.slug);
        if (found) setTurma(found);
      })
      .catch(() => {});
  }, [meta.slug]);

  async function handleEnroll() {
    if (!turma) return;
    setEnrolling(true);
    await fetch(`/api/formacao/turma/${turma.id}/enroll`, { method: 'POST' });
    setTurma((prev) => prev ? { ...prev, enrolled: true } : prev);
    setEnrolling(false);
  }

  // Agrupa por groupTitulo
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; sections: FormacaoSection[] }>();
    for (const s of sections) {
      const key = s.groupSlug ?? '__ungrouped';
      if (!map.has(key)) {
        map.set(key, { label: s.groupTitulo ?? '', sections: [] });
      }
      map.get(key)!.sections.push(s);
    }
    return Array.from(map.values());
  }, [sections]);

  const totalConcluidos = completed.size;
  const allDone = sections.length > 0 && totalConcluidos >= sections.length;
  const pct = sections.length ? Math.round((totalConcluidos / sections.length) * 100) : 0;

  return (
    <div className="pb-6">
      {/* Header com cor */}
      <div className={`${cor.bg} px-4 pt-4 pb-6`}>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-white/80 text-sm mb-4 hover:text-white"
        >
          <ChevronLeft size={16} /> Formação
        </button>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{meta.emoji}</span>
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">
              Caderno {meta.numero}
            </p>
            <h1 className="text-white text-lg font-bold leading-tight">{meta.titulo}</h1>
            <p className="text-white/70 text-xs mt-0.5">{meta.subtitulo}</p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="bg-white/20 rounded-full h-1.5 mt-2">
          <div
            className="bg-white rounded-full h-1.5 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-white/70 text-[10px] mt-1">
          {totalConcluidos} de {sections.length} {meta.unidade.toLowerCase()}s concluídos · {pct}%
        </p>

        {/* Banner de turma / matrícula */}
        {turma && !turma.enrolled && (
          <div className="mt-3 bg-white/15 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <GraduationCap size={14} className="text-white/80 flex-shrink-0" />
            <p className="text-white/80 text-xs flex-1">Há uma turma ativa para este caderno</p>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="bg-white text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 disabled:opacity-60"
            >
              {enrolling ? '…' : 'Matricular-se'}
            </button>
          </div>
        )}
        {turma?.enrolled && (
          <div className="mt-3 bg-white/15 rounded-xl px-3 py-2 flex items-center gap-2">
            <GraduationCap size={14} className="text-white/80 flex-shrink-0" />
            <p className="text-white/80 text-xs">Matriculado neste caderno</p>
          </div>
        )}

        {/* Ações: Quiz / Certificado */}
        {(allDone || quizPassed) && (
          <div className="mt-4 flex gap-2">
            {quizPassed ? (
              <Link
                href={`/formacao/${meta.slug}/certificado`}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors"
              >
                <Award size={14} /> Ver Certificado
              </Link>
            ) : (
              <Link
                href={`/formacao/${meta.slug}/quiz`}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors"
              >
                <ClipboardList size={14} /> Fazer Avaliação
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Lista de seções */}
      <div className="px-4 pt-4 space-y-4">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className={`text-[11px] font-bold uppercase tracking-wide mb-2 ${cor.text}`}>
                {group.label}
              </p>
            )}

            <div className="space-y-2">
              {group.sections.map((section) => {
                const done = completed.has(section.slug);
                return (
                  <Link
                    key={section.slug}
                    href={`/formacao/${meta.slug}/${section.slug}`}
                    className={`flex items-center gap-3 bg-white rounded-xl border px-4 py-3 hover:border-slate-200 active:scale-[0.98] transition-all ${
                      done ? cor.border : 'border-slate-100'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 size={18} className={`${cor.text} flex-shrink-0`} />
                    ) : (
                      <Circle size={18} className="text-slate-300 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${done ? 'text-slate-500' : 'text-slate-800'}`}>
                        {section.titulo}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
