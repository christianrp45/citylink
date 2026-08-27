'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getCadernoMeta, COR_CLASSES } from '@/lib/data/formacao';
import { QUIZZES, QUIZ_PASS_SCORE } from '@/lib/data/formacao-quiz';
import { ChevronLeft, CheckCircle2, XCircle, Award } from 'lucide-react';

type Phase = 'intro' | 'quiz' | 'result';

export default function QuizPage() {
  const params = useParams<{ caderno: string }>();
  const router = useRouter();
  const caderno = params.caderno;
  const meta = getCadernoMeta(caderno);
  const questoes = QUIZZES[caderno] ?? [];
  const cor = COR_CLASSES[meta?.cor ?? 'indigo'];

  const [phase, setPhase] = useState<Phase>('intro');
  const [current, setCurrent] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, 'a' | 'b' | 'c' | 'd'>>({});
  const [resultado, setResultado] = useState<{ score: number; total: number; passed: boolean; attempt: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [previousPassed, setPreviousPassed] = useState(false);

  useEffect(() => {
    fetch(`/api/formacao/quiz?caderno=${caderno}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.passed) setPreviousPassed(true); })
      .catch(() => {});
  }, [caderno]);

  async function submitQuiz() {
    setLoading(true);
    try {
      const res = await fetch('/api/formacao/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caderno, respostas }),
      });
      const data = await res.json();
      setResultado(data);
      setPhase('result');
      if (data.passed) {
        const isAllDone = data.allCompleted;
        toast.success(
          isAllDone
            ? '+300 XP 🏆 Formação Batista concluída!'
            : '+80 XP 🎓 Caderno concluído!',
          { duration: 4000 }
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(qId: number, opt: 'a' | 'b' | 'c' | 'd') {
    setRespostas((prev) => ({ ...prev, [qId]: opt }));
  }

  function goNext() {
    if (current < questoes.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      submitQuiz();
    }
  }

  if (!meta) return null;

  // ── Tela de resultado ───────────────────────────────────────────────────────
  if (phase === 'result' && resultado) {
    const pct = Math.round((resultado.score / resultado.total) * 100);
    return (
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <div className={`${cor.bg} px-4 pt-4 pb-8 text-center flex-shrink-0`}>
          <button onClick={() => router.push(`/formacao/${caderno}`)} className="flex items-center gap-1 text-white/70 text-sm mb-6 hover:text-white">
            <ChevronLeft size={16} /> {meta.titulo}
          </button>
          {resultado.passed ? (
            <>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award size={40} className="text-white" />
              </div>
              <h2 className="text-white text-xl font-bold">Parabéns! 🎉</h2>
              <p className="text-white/80 text-sm mt-1">
                Você acertou {resultado.score} de {resultado.total} questões ({pct}%)
              </p>
              <p className="text-white/60 text-xs mt-1">Caderno concluído com aprovação!</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={40} className="text-white/80" />
              </div>
              <h2 className="text-white text-lg font-bold">Quase lá…</h2>
              <p className="text-white/80 text-sm mt-1">
                Você acertou {resultado.score} de {resultado.total} questões ({pct}%)
              </p>
              <p className="text-white/60 text-xs mt-1">
                Mínimo para aprovação: {QUIZ_PASS_SCORE} acertos. Revise o caderno e tente novamente.
              </p>
            </>
          )}
        </div>

        {/* Revisão por questão */}
        <div className="px-4 pt-5 pb-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Revisão das questões</p>
          <div className="space-y-4">
            {questoes.map((q, idx) => {
              const chosen = respostas[q.id];
              const isCorrect = chosen === q.correta;
              return (
                <div key={q.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  {/* Question bar */}
                  <div className={`flex items-start gap-2.5 px-4 py-3 ${isCorrect ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${isCorrect ? 'bg-emerald-500' : 'bg-red-400'}`}>
                      {isCorrect
                        ? <CheckCircle2 size={13} className="text-white" />
                        : <XCircle size={13} className="text-white" />}
                    </div>
                    <p className="text-slate-800 text-xs font-semibold leading-snug flex-1">
                      <span className={`text-[10px] font-bold mr-1 ${isCorrect ? 'text-emerald-600' : 'text-red-400'}`}>{idx + 1}.</span>
                      {q.enunciado}
                    </p>
                  </div>
                  {/* Options */}
                  <div className="px-4 py-3 space-y-1.5">
                    {q.opcoes.map((opt) => {
                      const isChosen = chosen === opt.id;
                      const isRight = opt.id === q.correta;
                      let cls = 'text-slate-500 bg-slate-50';
                      if (isRight) cls = 'text-emerald-700 bg-emerald-50 font-semibold';
                      else if (isChosen && !isRight) cls = 'text-red-600 bg-red-50 line-through';
                      return (
                        <div key={opt.id} className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs ${cls}`}>
                          <span className="font-bold flex-shrink-0">{opt.id.toUpperCase()}.</span>
                          <span>{opt.texto}</span>
                          {isRight && <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0 ml-auto mt-0.5" />}
                          {isChosen && !isRight && <XCircle size={13} className="text-red-400 flex-shrink-0 ml-auto mt-0.5" />}
                        </div>
                      );
                    })}
                  </div>
                  {/* Explanation */}
                  {q.explicacao && (
                    <div className="px-4 pb-3">
                      <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2.5">
                        <span className="font-semibold text-slate-600">Por quê: </span>{q.explicacao}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pt-4 pb-8 space-y-3">
          {resultado.passed && (
            <button
              onClick={() => router.push(`/formacao/${caderno}/certificado`)}
              className={`w-full ${cor.bg} text-white font-bold py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2`}
            >
              <Award size={18} /> Ver meu Certificado
            </button>
          )}

          {!resultado.passed && (
            <button
              onClick={() => {
                setRespostas({});
                setCurrent(0);
                setResultado(null);
                setPhase('intro');
              }}
              className={`w-full ${cor.bg} text-white font-bold py-3.5 rounded-xl shadow-sm`}
            >
              Tentar novamente
            </button>
          )}

          <button
            onClick={() => router.push(`/formacao/${caderno}`)}
            className="w-full border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl"
          >
            Voltar ao caderno
          </button>
        </div>
      </div>
    );
  }

  // ── Tela de introdução ──────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="flex flex-col min-h-full">
        <div className={`${cor.bg} px-4 pt-4 pb-10`}>
          <button onClick={() => router.push(`/formacao/${caderno}`)} className="flex items-center gap-1 text-white/70 text-sm mb-6 hover:text-white">
            <ChevronLeft size={16} /> {meta.titulo}
          </button>
          <div className="text-center">
            <span className="text-5xl">{meta.emoji}</span>
            <h1 className="text-white text-lg font-bold mt-3">Avaliação de Fixação</h1>
            <p className="text-white/70 text-sm mt-1">{meta.titulo}</p>
          </div>
        </div>

        <div className="px-4 py-6 space-y-4 flex-1">
          {previousPassed && (
            <div className={`${cor.light} ${cor.border} border rounded-xl px-4 py-3 flex items-center gap-3`}>
              <CheckCircle2 size={18} className={cor.text} />
              <p className={`text-sm font-semibold ${cor.text}`}>Você já foi aprovado neste caderno!</p>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl px-4 py-4 space-y-2">
            <p className="text-sm font-bold text-slate-700">Como funciona:</p>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li className="flex items-start gap-2"><span className={`font-bold ${cor.text}`}>•</span> {questoes.length} questões de múltipla escolha</li>
              <li className="flex items-start gap-2"><span className={`font-bold ${cor.text}`}>•</span> Mínimo de {QUIZ_PASS_SCORE} acertos para aprovação</li>
              <li className="flex items-start gap-2"><span className={`font-bold ${cor.text}`}>•</span> Tentativas ilimitadas</li>
              <li className="flex items-start gap-2"><span className={`font-bold ${cor.text}`}>•</span> Aprovação libera seu certificado do caderno</li>
            </ul>
          </div>

          <button
            onClick={() => setPhase('quiz')}
            className={`w-full ${cor.bg} text-white font-bold py-3.5 rounded-xl shadow-sm`}
          >
            Iniciar Avaliação
          </button>
          <button
            onClick={() => router.push(`/formacao/${caderno}`)}
            className="w-full text-slate-400 text-sm py-2"
          >
            Voltar e revisar
          </button>
        </div>
      </div>
    );
  }

  // ── Tela de quiz ────────────────────────────────────────────────────────────
  const q = questoes[current];
  const answered = respostas[q.id];
  const progressPct = Math.round(((current + 1) / questoes.length) * 100);

  return (
    <div className="flex flex-col min-h-full">
      {/* Topbar */}
      <div className={`${cor.bg} px-4 pt-4 pb-4 flex-shrink-0`}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setPhase('intro')} className="text-white/70 text-sm hover:text-white">
            <ChevronLeft size={20} />
          </button>
          <span className="text-white/70 text-xs font-medium">{current + 1} / {questoes.length}</span>
        </div>
        <div className="bg-white/20 rounded-full h-1.5">
          <div className="bg-white rounded-full h-1.5 transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Questão */}
      <div className="flex-1 px-4 py-5 flex flex-col">
        <p className="text-slate-800 font-semibold text-sm leading-relaxed mb-6">
          {q.enunciado}
        </p>

        <div className="space-y-3 flex-1">
          {q.opcoes.map((opt) => {
            const selected = answered === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => selectAnswer(q.id, opt.id)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                  selected
                    ? `${cor.bg} text-white border-transparent shadow-sm`
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className={`font-bold mr-2 ${selected ? 'text-white/80' : cor.text}`}>
                  {opt.id.toUpperCase()}.
                </span>
                {opt.texto}
              </button>
            );
          })}
        </div>

        {/* Botão avançar */}
        <div className="pt-6">
          <button
            onClick={goNext}
            disabled={!answered || loading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
              answered
                ? `${cor.bg} text-white shadow-sm`
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {loading ? 'Corrigindo…' : current < questoes.length - 1 ? 'Próxima →' : 'Finalizar'}
          </button>
        </div>
      </div>
    </div>
  );
}
