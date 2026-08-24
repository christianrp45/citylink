'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, Star, Search, CheckCircle2 } from 'lucide-react';
import type { ReadingPlan, PlanDay } from '@/lib/reading-plans';

type VerseOfDay = {
  ref: string;
  text: string;
  book: string;
  chapter: number;
  verse: number;
};

// Livros mais acessados no app (atalhos rápidos)
const QUICK_BOOKS = [
  { abbrev: 'sl',  name: 'Salmos',      chapters: 150, emoji: '🎵' },
  { abbrev: 'pv',  name: 'Provérbios',  chapters: 31,  emoji: '💡' },
  { abbrev: 'mt',  name: 'Mateus',      chapters: 28,  emoji: '✝️' },
  { abbrev: 'lc',  name: 'Lucas',       chapters: 24,  emoji: '✝️' },
  { abbrev: 'jo',  name: 'João',        chapters: 21,  emoji: '❤️' },
  { abbrev: 'rm',  name: 'Romanos',     chapters: 16,  emoji: '📖' },
  { abbrev: 'fp',  name: 'Filipenses',  chapters: 4,   emoji: '🙌' },
  { abbrev: 'ef',  name: 'Efésios',     chapters: 6,   emoji: '🛡️' },
  { abbrev: 'is',  name: 'Isaías',      chapters: 66,  emoji: '🕊️' },
  { abbrev: 'jr',  name: 'Jeremias',    chapters: 52,  emoji: '📜' },
  { abbrev: 'gn',  name: 'Gênesis',     chapters: 50,  emoji: '🌱' },
  { abbrev: 'ap',  name: 'Apocalipse',  chapters: 22,  emoji: '🔥' },
];

const ALL_BOOKS = [
  // Antigo Testamento
  { abbrev: 'gn',   name: 'Gênesis',          chapters: 50,  testament: 'AT' },
  { abbrev: 'ex',   name: 'Êxodo',            chapters: 40,  testament: 'AT' },
  { abbrev: 'lv',   name: 'Levítico',          chapters: 27,  testament: 'AT' },
  { abbrev: 'nm',   name: 'Números',           chapters: 36,  testament: 'AT' },
  { abbrev: 'dt',   name: 'Deuteronômio',      chapters: 34,  testament: 'AT' },
  { abbrev: 'js',   name: 'Josué',             chapters: 24,  testament: 'AT' },
  { abbrev: 'jz',   name: 'Juízes',            chapters: 21,  testament: 'AT' },
  { abbrev: 'rt',   name: 'Rute',              chapters: 4,   testament: 'AT' },
  { abbrev: '1sm',  name: '1 Samuel',          chapters: 31,  testament: 'AT' },
  { abbrev: '2sm',  name: '2 Samuel',          chapters: 24,  testament: 'AT' },
  { abbrev: '1rs',  name: '1 Reis',            chapters: 22,  testament: 'AT' },
  { abbrev: '2rs',  name: '2 Reis',            chapters: 25,  testament: 'AT' },
  { abbrev: '1cr',  name: '1 Crônicas',        chapters: 29,  testament: 'AT' },
  { abbrev: '2cr',  name: '2 Crônicas',        chapters: 36,  testament: 'AT' },
  { abbrev: 'ed',   name: 'Esdras',            chapters: 10,  testament: 'AT' },
  { abbrev: 'ne',   name: 'Neemias',           chapters: 13,  testament: 'AT' },
  { abbrev: 'et',   name: 'Ester',             chapters: 10,  testament: 'AT' },
  { abbrev: 'jó',   name: 'Jó',               chapters: 42,  testament: 'AT' },
  { abbrev: 'sl',   name: 'Salmos',            chapters: 150, testament: 'AT' },
  { abbrev: 'pv',   name: 'Provérbios',        chapters: 31,  testament: 'AT' },
  { abbrev: 'ec',   name: 'Eclesiastes',       chapters: 12,  testament: 'AT' },
  { abbrev: 'ct',   name: 'Cânticos',          chapters: 8,   testament: 'AT' },
  { abbrev: 'is',   name: 'Isaías',            chapters: 66,  testament: 'AT' },
  { abbrev: 'jr',   name: 'Jeremias',          chapters: 52,  testament: 'AT' },
  { abbrev: 'lm',   name: 'Lamentações',       chapters: 5,   testament: 'AT' },
  { abbrev: 'ez',   name: 'Ezequiel',          chapters: 48,  testament: 'AT' },
  { abbrev: 'dn',   name: 'Daniel',            chapters: 12,  testament: 'AT' },
  { abbrev: 'os',   name: 'Oséias',            chapters: 14,  testament: 'AT' },
  { abbrev: 'jl',   name: 'Joel',              chapters: 3,   testament: 'AT' },
  { abbrev: 'am',   name: 'Amós',              chapters: 9,   testament: 'AT' },
  { abbrev: 'ob',   name: 'Obadias',           chapters: 1,   testament: 'AT' },
  { abbrev: 'jn',   name: 'Jonas',             chapters: 4,   testament: 'AT' },
  { abbrev: 'mq',   name: 'Miquéias',          chapters: 7,   testament: 'AT' },
  { abbrev: 'na',   name: 'Naum',              chapters: 3,   testament: 'AT' },
  { abbrev: 'hc',   name: 'Habacuque',         chapters: 3,   testament: 'AT' },
  { abbrev: 'sf',   name: 'Sofonias',          chapters: 3,   testament: 'AT' },
  { abbrev: 'ag',   name: 'Ageu',              chapters: 2,   testament: 'AT' },
  { abbrev: 'zc',   name: 'Zacarias',          chapters: 14,  testament: 'AT' },
  { abbrev: 'ml',   name: 'Malaquias',         chapters: 4,   testament: 'AT' },
  // Novo Testamento
  { abbrev: 'mt',   name: 'Mateus',            chapters: 28,  testament: 'NT' },
  { abbrev: 'mc',   name: 'Marcos',            chapters: 16,  testament: 'NT' },
  { abbrev: 'lc',   name: 'Lucas',             chapters: 24,  testament: 'NT' },
  { abbrev: 'jo',   name: 'João',              chapters: 21,  testament: 'NT' },
  { abbrev: 'at',   name: 'Atos',              chapters: 28,  testament: 'NT' },
  { abbrev: 'rm',   name: 'Romanos',           chapters: 16,  testament: 'NT' },
  { abbrev: '1co',  name: '1 Coríntios',       chapters: 16,  testament: 'NT' },
  { abbrev: '2co',  name: '2 Coríntios',       chapters: 13,  testament: 'NT' },
  { abbrev: 'gl',   name: 'Gálatas',           chapters: 6,   testament: 'NT' },
  { abbrev: 'ef',   name: 'Efésios',           chapters: 6,   testament: 'NT' },
  { abbrev: 'fp',   name: 'Filipenses',        chapters: 4,   testament: 'NT' },
  { abbrev: 'cl',   name: 'Colossenses',       chapters: 4,   testament: 'NT' },
  { abbrev: '1ts',  name: '1 Tessalonicenses', chapters: 5,   testament: 'NT' },
  { abbrev: '2ts',  name: '2 Tessalonicenses', chapters: 3,   testament: 'NT' },
  { abbrev: '1tm',  name: '1 Timóteo',         chapters: 6,   testament: 'NT' },
  { abbrev: '2tm',  name: '2 Timóteo',         chapters: 4,   testament: 'NT' },
  { abbrev: 'tt',   name: 'Tito',              chapters: 3,   testament: 'NT' },
  { abbrev: 'fm',   name: 'Filemom',           chapters: 1,   testament: 'NT' },
  { abbrev: 'hb',   name: 'Hebreus',           chapters: 13,  testament: 'NT' },
  { abbrev: 'tg',   name: 'Tiago',             chapters: 5,   testament: 'NT' },
  { abbrev: '1pe',  name: '1 Pedro',           chapters: 5,   testament: 'NT' },
  { abbrev: '2pe',  name: '2 Pedro',           chapters: 3,   testament: 'NT' },
  { abbrev: '1jo',  name: '1 João',            chapters: 5,   testament: 'NT' },
  { abbrev: '2jo',  name: '2 João',            chapters: 1,   testament: 'NT' },
  { abbrev: '3jo',  name: '3 João',            chapters: 1,   testament: 'NT' },
  { abbrev: 'jd',   name: 'Judas',             chapters: 1,   testament: 'NT' },
  { abbrev: 'ap',   name: 'Apocalipse',        chapters: 22,  testament: 'NT' },
];

type PlanWithProgress = Omit<ReadingPlan, 'days'> & {
  enrolled: boolean;
  completedDays: number[];
  percentComplete: number;
  currentDay: number;
  todayDay: PlanDay | null;
};

export default function BiblePage() {
  const [verseOfDay, setVerseOfDay] = useState<VerseOfDay | null>(null);
  const [search, setSearch] = useState('');
  const [testament, setTestament] = useState<'AT' | 'NT' | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [plans, setPlans] = useState<PlanWithProgress[]>([]);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/bible/verse-of-day')
      .then((r) => r.json())
      .then(setVerseOfDay)
      .catch(() => {});
    fetch('/api/bible/plans')
      .then((r) => r.ok ? r.json() : [])
      .then(setPlans)
      .catch(() => {});
  }, []);

  async function handleEnroll(slug: string) {
    setEnrolling(slug);
    await fetch('/api/bible/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    });
    const updated = await fetch('/api/bible/plans').then((r) => r.json());
    setPlans(updated);
    setEnrolling(null);
  }

  async function handleMarkDay(slug: string, day: number) {
    await fetch('/api/bible/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, markDay: day }),
    });
    const updated = await fetch('/api/bible/plans').then((r) => r.json());
    setPlans(updated);
  }

  const filtered = ALL_BOOKS.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchTestament = !testament || b.testament === testament;
    return matchSearch && matchTestament;
  });

  return (
    <div className="px-4 pt-4 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen size={22} className="text-indigo-600" />
          Bíblia
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Nova Versão Internacional (NVI)</p>
      </div>

      {/* Versículo do dia */}
      {verseOfDay && (
        <Link
          href={`/bible/read/${verseOfDay.book}/${verseOfDay.chapter}`}
          className="block bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-4 text-white shadow-md"
        >
          <div className="flex items-center gap-1.5 mb-2 opacity-80">
            <Star size={12} className="fill-white" />
            <span className="text-xs font-semibold uppercase tracking-wide">Versículo do Dia</span>
          </div>
          <p className="text-sm leading-relaxed mb-2 font-medium">
            "{verseOfDay.text}"
          </p>
          <p className="text-xs opacity-70 font-semibold">{verseOfDay.ref}</p>
        </Link>
      )}

      {/* Formação Batista */}
      <Link
        href="/formacao"
        className="flex items-center gap-4 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-4 shadow-md"
      >
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">📚</span>
        </div>
        <div className="flex-1">
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-wide">Série Integrar</p>
          <p className="text-white font-bold text-sm">Formação Batista</p>
          <p className="text-white/70 text-xs mt-0.5">8 cadernos · PIB Curitiba</p>
        </div>
        <ChevronRight size={18} className="text-white/60 flex-shrink-0" />
      </Link>

      {/* Planos de Leitura */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          📚 Planos de Leitura
        </p>
        <div className="space-y-3">
          {plans.map((plan) => {
            const todayRef = plan.enrolled ? plan.todayDay : null;
            return (
              <div key={plan.slug} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{plan.emoji}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{plan.title}</p>
                        <p className="text-xs text-slate-400">{plan.description}</p>
                      </div>
                    </div>
                    {!plan.enrolled ? (
                      <button
                        onClick={() => handleEnroll(plan.slug)}
                        disabled={enrolling === plan.slug}
                        className="flex-shrink-0 bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        {enrolling === plan.slug ? '...' : 'Iniciar'}
                      </button>
                    ) : (
                      <span className="flex-shrink-0 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
                        {plan.percentComplete}%
                      </span>
                    )}
                  </div>

                  {plan.enrolled && (
                    <>
                      {/* Barra de progresso */}
                      <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${plan.percentComplete}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {plan.completedDays.length} de {plan.totalDays} dias concluídos
                      </p>

                      {/* Leitura de hoje */}
                      {todayRef && plan.currentDay <= plan.totalDays && (
                        <div className="mt-3 bg-indigo-50 rounded-xl px-3 py-2.5 space-y-2">
                          {/* Cabeçalho do dia */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-indigo-500 font-semibold">
                                Dia {plan.currentDay}
                                {todayRef.theme ? ` · ${todayRef.theme}` : ''}
                              </p>
                              <p className="text-xs text-slate-700 font-medium">{todayRef.passage}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Link
                                href={`/bible/read/${todayRef.book}/${todayRef.chapter}`}
                                className="text-xs text-indigo-600 font-semibold bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 hover:bg-indigo-50"
                              >
                                Ler
                              </Link>
                              <button
                                onClick={() => handleMarkDay(plan.slug, plan.currentDay)}
                                className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 hover:bg-emerald-50"
                              >
                                <CheckCircle2 size={12} /> Feito
                              </button>
                            </div>
                          </div>

                          {/* Contexto histórico/literário */}
                          {todayRef.context && (
                            <p className="text-[11px] text-slate-500 leading-relaxed italic border-t border-indigo-100 pt-2">
                              {todayRef.context}
                            </p>
                          )}

                          {/* Perguntas reflexivas */}
                          {todayRef.reflection && todayRef.reflection.length > 0 && (
                            <div className="border-t border-indigo-100 pt-2 space-y-1">
                              <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wide">Para refletir</p>
                              {todayRef.reflection.map((q, i) => (
                                <p key={i} className="text-[11px] text-slate-600 leading-relaxed">
                                  {i + 1}. {q}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {plan.currentDay > plan.totalDays && (
                        <p className="mt-2 text-xs text-emerald-600 font-semibold text-center">🎉 Plano concluído!</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Atalhos rápidos */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Leitura rápida
        </p>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_BOOKS.map((b) => (
            <Link
              key={b.abbrev}
              href={`/bible/read/${b.abbrev}/1`}
              className="flex flex-col items-center justify-center bg-white rounded-xl py-3 px-1 border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors"
            >
              <span className="text-lg mb-1">{b.emoji}</span>
              <span className="text-[10px] font-semibold text-slate-700 text-center leading-tight">
                {b.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Todos os livros */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Todos os livros
          </p>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-indigo-600 font-medium"
          >
            {showAll ? 'Recolher' : 'Expandir'}
          </button>
        </div>

        {showAll && (
          <>
            {/* Search + filter */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                <Search size={14} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar livro…"
                  className="flex-1 text-sm outline-none bg-transparent"
                />
              </div>
              <button
                onClick={() => setTestament(testament === 'AT' ? null : 'AT')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  testament === 'AT'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                AT
              </button>
              <button
                onClick={() => setTestament(testament === 'NT' ? null : 'NT')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  testament === 'NT'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                NT
              </button>
            </div>

            <div className="space-y-1">
              {filtered.map((b) => (
                <Link
                  key={b.abbrev}
                  href={`/bible/read/${b.abbrev}/1`}
                  className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-slate-100 hover:border-indigo-200 transition-colors"
                >
                  <div>
                    <span className="text-sm font-medium text-slate-800">{b.name}</span>
                    <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      b.testament === 'AT'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {b.testament}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <span className="text-[10px]">{b.chapters} cap.</span>
                    <ChevronRight size={14} />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
