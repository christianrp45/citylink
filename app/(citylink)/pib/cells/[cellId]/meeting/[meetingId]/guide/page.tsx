'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BottomNav } from '@/components/citylink-bottom-nav';
import type { CellGuideDetail, YoutubeLink } from '@/lib/types';

type GuideForm = {
  title: string;
  biblePassage: string;
  theme: string;
  icebreaker: string;
  studyQuestions: string[];
  application: string;
  prayer: string;
  youtubeLinks: YoutubeLink[];
};

const EMPTY_FORM: GuideForm = {
  title: '',
  biblePassage: '',
  theme: '',
  icebreaker: '',
  studyQuestions: ['', '', '', ''],
  application: '',
  prayer: '',
  youtubeLinks: [],
};

export default function GuidePage() {
  const { cellId, meetingId } = useParams<{ cellId: string; meetingId: string }>();
  const [guide, setGuide] = useState<CellGuideDetail | null>(null);
  const [form, setForm] = useState<GuideForm>(EMPTY_FORM);
  const [editing, setEditing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newYtTitle, setNewYtTitle] = useState('');
  const [newYtUrl, setNewYtUrl] = useState('');

  useEffect(() => {
    if (!meetingId) return;
    fetch(`/api/pib/meetings/${meetingId}/guide`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setGuide(data);
          setForm({
            title: data.title ?? '',
            biblePassage: data.biblePassage ?? '',
            theme: data.theme ?? '',
            icebreaker: data.icebreaker ?? '',
            studyQuestions: data.studyQuestions?.length ? data.studyQuestions : ['', '', '', ''],
            application: data.application ?? '',
            prayer: data.prayer ?? '',
            youtubeLinks: data.youtubeLinks ?? [],
          });
        } else {
          setEditing(true); // sem roteiro, abre editor
        }
      });
  }, [meetingId]);

  const handleGenerate = async () => {
    if (!form.biblePassage) {
      alert('Informe a passagem bíblica antes de gerar com IA');
      return;
    }
    setGenerating(true);
    const res = await fetch('/api/pib/ai/generate-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ biblePassage: form.biblePassage, theme: form.theme }),
    });
    const data = await res.json();
    if (res.ok) {
      setForm((f) => ({
        ...f,
        title: data.title ?? f.title,
        theme: data.theme ?? f.theme,
        icebreaker: data.icebreaker ?? f.icebreaker,
        studyQuestions: data.studyQuestions ?? f.studyQuestions,
        application: data.application ?? f.application,
        prayer: data.prayer ?? f.prayer,
      }));
    } else {
      alert(data.error ?? 'Erro ao gerar roteiro');
    }
    setGenerating(false);
  };

  const handleSave = async (publish = false) => {
    setSaving(true);
    const res = await fetch(`/api/pib/meetings/${meetingId}/guide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, isPublished: publish }),
    });
    const data = await res.json();
    if (res.ok) {
      setGuide(data);
      setEditing(false);
    } else {
      alert(data.error ?? 'Erro ao salvar roteiro');
    }
    setSaving(false);
  };

  const addYoutubeLink = () => {
    if (!newYtUrl) return;
    setForm((f) => ({
      ...f,
      youtubeLinks: [...f.youtubeLinks, { title: newYtTitle || newYtUrl, url: newYtUrl }],
    }));
    setNewYtTitle('');
    setNewYtUrl('');
  };

  const removeYoutubeLink = (i: number) => {
    setForm((f) => ({ ...f, youtubeLinks: f.youtubeLinks.filter((_, idx) => idx !== i) }));
  };

  // ── VISUALIZAÇÃO ──────────────────────────────────────────────
  if (guide && !editing) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href={`/pib/cells/${cellId}`} className="text-gray-500 hover:text-gray-700">←</Link>
            <h1 className="text-lg font-bold text-indigo-900 flex-1 text-center">📖 Roteiro</h1>
            <button onClick={() => setEditing(true)} className="text-sm text-indigo-600 font-medium hover:underline">
              Editar
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          {/* Cabeçalho do roteiro */}
          <div className="bg-indigo-700 text-white rounded-2xl p-5">
            <p className="text-indigo-200 text-sm">{guide.biblePassage}</p>
            <h2 className="text-xl font-bold mt-1">{guide.title}</h2>
            {guide.theme && <p className="text-indigo-200 text-sm mt-1">{guide.theme}</p>}
            {guide.generatedByAI && (
              <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-white/20 rounded-full">
                ✨ Gerado com IA
              </span>
            )}
          </div>

          {/* Músicas */}
          {guide.youtubeLinks && guide.youtubeLinks.length > 0 && (
            <section className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">🎵 Louvor</h3>
              <div className="space-y-2">
                {guide.youtubeLinks.map((yt, i) => (
                  <a
                    key={i}
                    href={yt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition group"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 text-lg">▶</span>
                    </div>
                    <span className="text-sm text-indigo-600 group-hover:underline truncate">{yt.title}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Quebra-gelo */}
          {guide.icebreaker && (
            <section className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-amber-400">
              <h3 className="font-semibold text-gray-900 mb-2">🎲 Quebra-gelo</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{guide.icebreaker}</p>
            </section>
          )}

          {/* Estudo */}
          {guide.studyQuestions && guide.studyQuestions.length > 0 && (
            <section className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-indigo-400">
              <h3 className="font-semibold text-gray-900 mb-3">📚 Estudo</h3>
              <div className="space-y-3">
                {guide.studyQuestions.filter(Boolean).map((q, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-gray-700 text-sm leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Aplicação */}
          {guide.application && (
            <section className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-emerald-400">
              <h3 className="font-semibold text-gray-900 mb-2">✅ Desafio da Semana</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{guide.application}</p>
            </section>
          )}

          {/* Oração */}
          {guide.prayer && (
            <section className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-violet-400">
              <h3 className="font-semibold text-gray-900 mb-2">🙏 Oração Final</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{guide.prayer}</p>
            </section>
          )}

          {!guide.isPublished && (
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition disabled:opacity-50"
            >
              {saving ? 'Publicando...' : '📢 Publicar roteiro para o grupo'}
            </button>
          )}
        </div>

        <BottomNav />
      </div>
    );
  }

  // ── EDITOR ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => guide && setEditing(false)} className="text-gray-500 hover:text-gray-700">←</button>
          <h1 className="text-lg font-bold text-indigo-900 flex-1 text-center">
            {guide ? 'Editar Roteiro' : 'Novo Roteiro'}
          </h1>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="text-sm text-indigo-600 font-medium hover:underline disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Passagem + geração por IA */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Passagem Bíblica *
            </label>
            <input
              type="text"
              placeholder="Ex: João 15:1-17"
              value={form.biblePassage}
              onChange={(e) => setForm((f) => ({ ...f, biblePassage: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Tema (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Permanecer em Cristo"
              value={form.theme}
              onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || !form.biblePassage}
            className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-40"
          >
            {generating ? '✨ Gerando roteiro com IA...' : '✨ Gerar roteiro com IA'}
          </button>
        </div>

        {/* Título */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Título do Encontro
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Músicas YouTube */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">🎵 Músicas (links do YouTube)</h3>
          {form.youtubeLinks.map((yt, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="flex-1 text-indigo-600 truncate">{yt.title}</span>
              <button onClick={() => removeYoutubeLink(i)} className="text-red-400 hover:text-red-600 text-xs">
                Remover
              </button>
            </div>
          ))}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Nome da música"
              value={newYtTitle}
              onChange={(e) => setNewYtTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={newYtUrl}
                onChange={(e) => setNewYtUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={addYoutubeLink}
                disabled={!newYtUrl}
                className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition disabled:opacity-40"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Quebra-gelo */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            🎲 Quebra-gelo
          </label>
          <textarea
            value={form.icebreaker}
            onChange={(e) => setForm((f) => ({ ...f, icebreaker: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        {/* Perguntas */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">📚 Perguntas de Estudo</h3>
          {form.studyQuestions.map((q, i) => (
            <div key={i} className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-1.5">
                {i + 1}
              </span>
              <textarea
                value={q}
                onChange={(e) => {
                  const qs = [...form.studyQuestions];
                  qs[i] = e.target.value;
                  setForm((f) => ({ ...f, studyQuestions: qs }));
                }}
                rows={2}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>
          ))}
        </div>

        {/* Aplicação */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            ✅ Desafio da Semana
          </label>
          <textarea
            value={form.application}
            onChange={(e) => setForm((f) => ({ ...f, application: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        {/* Oração */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            🙏 Sugestão de Oração Final
          </label>
          <textarea
            value={form.prayer}
            onChange={(e) => setForm((f) => ({ ...f, prayer: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving || !form.title}
            className="flex-1 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition disabled:opacity-40"
          >
            Salvar rascunho
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || !form.title}
            className="flex-1 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition disabled:opacity-40"
          >
            📢 Publicar
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
