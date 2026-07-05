'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2, BookmarkPlus, X, Send } from 'lucide-react';
import Link from 'next/link';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

type Verse = { verse: number; text: string };

type ChapterData = {
  book: string;
  bookName: string;
  chapter: number;
  totalChapters: number;
  verses: Verse[];
};

type Highlight = {
  id: string;
  verse: number;
  color: 'yellow' | 'green' | 'pink' | 'blue';
  note?: string | null;
};

const COLOR_CLASS: Record<string, string> = {
  yellow: 'bg-yellow-200',
  green: 'bg-green-200',
  pink: 'bg-pink-200',
  blue: 'bg-blue-200',
};

const COLOR_LABEL: Record<string, string> = {
  yellow: '🟡',
  green: '🟢',
  pink: '🩷',
  blue: '🔵',
};

export default function ChapterPage() {
  const params = useParams<{ book: string; chapter: string }>();
  const router = useRouter();
  const book = params.book;
  const chapterNum = parseInt(params.chapter, 10);

  const [data, setData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [savingHighlight, setSavingHighlight] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showTeos, setShowTeos] = useState(false);
  const [teosInput, setTeosInput] = useState('');
  const teosBottomRef = useRef<HTMLDivElement>(null);

  const { messages: teosMessages, sendMessage: teosSend, status: teosStatus } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/teos',
      body: data ? { context: { bookName: data.bookName, chapter: data.chapter } } : {},
    }),
  });

  const teosLoading = teosStatus === 'streaming' || teosStatus === 'submitted';

  function submitTeos(text: string) {
    if (!text.trim() || teosLoading) return;
    teosSend({ role: 'user', parts: [{ type: 'text', text: text.trim() }] });
    setTeosInput('');
  }

  useEffect(() => {
    teosBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [teosMessages]);

  const loadChapter = useCallback(async () => {
    setLoading(true);
    setError('');
    setSelectedVerse(null);
    try {
      const [chRes, hlRes] = await Promise.all([
        fetch(`/api/bible/chapter?book=${book}&chapter=${chapterNum}`),
        fetch(`/api/bible/highlights?book=${book}&chapter=${chapterNum}`),
      ]);
      if (!chRes.ok) throw new Error('Capítulo não encontrado');
      setData(await chRes.json());
      if (hlRes.ok) setHighlights(await hlRes.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar capítulo');
    } finally {
      setLoading(false);
    }
  }, [book, chapterNum]);

  useEffect(() => {
    loadChapter();
  }, [loadChapter]);

  function getHighlight(verse: number) {
    return highlights.find((h) => h.verse === verse);
  }

  async function handleHighlight(color: 'yellow' | 'green' | 'pink' | 'blue') {
    if (selectedVerse === null) return;
    setSavingHighlight(true);
    try {
      const res = await fetch('/api/bible/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book,
          chapter: chapterNum,
          verse: selectedVerse,
          color,
          note: noteText || undefined,
        }),
      });
      if (res.ok) {
        const hl: Highlight = await res.json();
        setHighlights((prev) => [
          ...prev.filter((h) => h.verse !== selectedVerse),
          hl,
        ]);
      }
    } finally {
      setSavingHighlight(false);
      setSelectedVerse(null);
      setNoteText('');
      setShowNoteInput(false);
    }
  }

  async function handleRemoveHighlight() {
    if (selectedVerse === null) return;
    const hl = getHighlight(selectedVerse);
    if (!hl) return;
    setSavingHighlight(true);
    try {
      await fetch(`/api/bible/highlights?id=${hl.id}`, { method: 'DELETE' });
      setHighlights((prev) => prev.filter((h) => h.id !== hl.id));
    } finally {
      setSavingHighlight(false);
      setSelectedVerse(null);
    }
  }

  function navChapter(delta: number) {
    if (!data) return;
    const next = chapterNum + delta;
    if (next < 1 || next > data.totalChapters) return;
    router.push(`/bible/read/${book}/${next}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 px-6 text-center">
        <p className="text-slate-500 text-sm">{error || 'Erro desconhecido'}</p>
        <button onClick={loadChapter} className="text-indigo-600 text-sm font-medium">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link href="/bible" className="p-1 -ml-1 text-slate-500">
          <ChevronLeft size={22} />
        </Link>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-800">
            {data.bookName} {data.chapter}
          </p>
          <p className="text-[10px] text-slate-400">NVI</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowTeos(true)}
            className="flex items-center gap-1 bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-full hover:bg-indigo-700 transition-colors"
          >
            🌿 Teos
          </button>
          <button
            onClick={() => navChapter(-1)}
            disabled={chapterNum <= 1}
            className="p-1 text-slate-400 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => navChapter(1)}
            disabled={chapterNum >= data.totalChapters}
            className="p-1 text-slate-400 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Chapter navigation bar */}
      <div className="flex gap-1 px-4 py-2 overflow-x-auto bg-slate-50 border-b border-slate-100">
        {Array.from({ length: data.totalChapters }, (_, i) => i + 1).map((c) => (
          <Link
            key={c}
            href={`/bible/read/${book}/${c}`}
            className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              c === chapterNum
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-slate-200'
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {/* Verses */}
      <div className="px-4 py-4 space-y-0.5">
        {data.verses.map(({ verse, text }) => {
          const hl = getHighlight(verse);
          const isSelected = selectedVerse === verse;
          return (
            <button
              key={verse}
              onClick={() =>
                setSelectedVerse(isSelected ? null : verse)
              }
              className={`w-full text-left rounded-lg px-2 py-1.5 transition-colors ${
                isSelected
                  ? 'ring-2 ring-indigo-400 bg-indigo-50'
                  : hl
                  ? COLOR_CLASS[hl.color]
                  : 'hover:bg-slate-100'
              }`}
            >
              <span className="text-[11px] font-bold text-indigo-400 mr-1.5 select-none">
                {verse}
              </span>
              <span className="text-sm text-slate-800 leading-relaxed">{text}</span>
              {hl?.note && (
                <span className="block text-[10px] italic text-slate-500 mt-0.5 ml-4">
                  📝 {hl.note}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Chapter nav bottom */}
      <div className="flex justify-between px-4 py-4 border-t border-slate-100">
        <button
          onClick={() => navChapter(-1)}
          disabled={chapterNum <= 1}
          className="flex items-center gap-1 text-sm text-indigo-600 disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Capítulo anterior
        </button>
        <button
          onClick={() => navChapter(1)}
          disabled={chapterNum >= data.totalChapters}
          className="flex items-center gap-1 text-sm text-indigo-600 disabled:opacity-30"
        >
          Próximo capítulo <ChevronRight size={16} />
        </button>
      </div>

      {/* Teos — bottom sheet */}
      {showTeos && (
        <div className="fixed inset-0 z-[110] flex flex-col" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowTeos(false)}>
          <div className="mt-auto bg-white rounded-t-3xl shadow-2xl flex flex-col" style={{ height: '70dvh' }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌿</span>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Teos</p>
                  <p className="text-[10px] text-slate-400">{data.bookName} {data.chapter}</p>
                </div>
              </div>
              <button onClick={() => setShowTeos(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {teosMessages.length === 0 && (
                <div className="text-center py-6 space-y-2">
                  <p className="text-slate-500 text-sm">Pergunte sobre <strong>{data.bookName} {data.chapter}</strong> ou qualquer passagem bíblica.</p>
                  {[
                    `Explique o contexto histórico de ${data.bookName} ${data.chapter}`,
                    'Quais versículos deste capítulo se conectam com o NT?',
                    'Gere uma reflexão para célula baseada neste capítulo',
                  ].map((q) => (
                    <button key={q} onClick={() => submitTeos(q)} className="block w-full text-left text-xs bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 text-indigo-700 hover:bg-indigo-100 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              )}
              {teosMessages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && <span className="text-lg mr-1.5 mt-0.5 flex-shrink-0">🌿</span>}
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                    {m.parts.map((p, i) => p.type === 'text' ? <span key={i}>{p.text}</span> : null)}
                  </div>
                </div>
              ))}
              {teosLoading && (
                <div className="flex justify-start">
                  <span className="text-lg mr-1.5">🌿</span>
                  <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-3 py-2">
                    <div className="flex gap-1">
                      {[0, 150, 300].map((d) => <span key={d} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={teosBottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); submitTeos(teosInput); }} className="flex gap-2 px-4 py-3 border-t border-slate-100">
              <input
                value={teosInput}
                onChange={(e) => setTeosInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitTeos(teosInput); } }}
                placeholder="Pergunte sobre esta passagem..."
                disabled={teosLoading}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 disabled:opacity-50"
              />
              <button type="submit" disabled={teosLoading || !teosInput.trim()} className="bg-indigo-600 text-white rounded-xl p-2 disabled:opacity-40">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Highlight action sheet */}
      {selectedVerse !== null && (
        <div className="fixed inset-0 z-[100] flex items-end" onClick={() => { setSelectedVerse(null); setShowNoteInput(false); }}>
          <div
            className="w-full bg-white rounded-t-3xl shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <BookmarkPlus size={16} className="text-indigo-600" />
                Versículo {selectedVerse}
              </p>
              <button onClick={() => { setSelectedVerse(null); setShowNoteInput(false); }}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Color palette */}
            <div className="flex gap-3 mb-4">
              {(['yellow', 'green', 'pink', 'blue'] as const).map((color) => (
                <button
                  key={color}
                  onClick={() => handleHighlight(color)}
                  disabled={savingHighlight}
                  className={`flex-1 py-3 rounded-xl text-lg font-bold ${COLOR_CLASS[color]} hover:opacity-80 transition-opacity`}
                >
                  {COLOR_LABEL[color]}
                </button>
              ))}
            </div>

            {/* Note toggle */}
            {!showNoteInput ? (
              <button
                onClick={() => setShowNoteInput(true)}
                className="w-full text-sm text-slate-500 border border-dashed border-slate-300 rounded-xl py-2.5 mb-3"
              >
                + Adicionar nota
              </button>
            ) : (
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Sua anotação…"
                rows={3}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            )}

            {/* Remove highlight */}
            {getHighlight(selectedVerse) && (
              <button
                onClick={handleRemoveHighlight}
                disabled={savingHighlight}
                className="w-full text-sm text-red-500 py-2"
              >
                Remover destaque
              </button>
            )}

            {savingHighlight && (
              <div className="flex justify-center mt-2">
                <Loader2 size={16} className="animate-spin text-indigo-500" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
