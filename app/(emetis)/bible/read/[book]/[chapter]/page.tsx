'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2, BookmarkPlus, X, Send, Moon, Sun } from 'lucide-react';
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

type FontSize = 'sm' | 'base' | 'lg';

const FONT_SIZE_CLASS: Record<FontSize, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
};

const FONT_SIZE_LABEL: Record<FontSize, string> = {
  sm: 'A',
  base: 'A',
  lg: 'A',
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
  const [showTeo, setShowTeo] = useState(false);
  const [teoInput, setTeoInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('sm');
  const [selectedText, setSelectedText] = useState('');
  const teoBottomRef = useRef<HTMLDivElement>(null);

  // Carregar preferências do localStorage
  useEffect(() => {
    const savedDark = localStorage.getItem('bible-dark-mode');
    const savedFont = localStorage.getItem('bible-font-size') as FontSize | null;
    if (savedDark === 'true') setDarkMode(true);
    if (savedFont && ['sm', 'base', 'lg'].includes(savedFont)) setFontSize(savedFont);
  }, []);

  function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('bible-dark-mode', String(next));
  }

  function changeFontSize(size: FontSize) {
    setFontSize(size);
    localStorage.setItem('bible-font-size', size);
  }

  // Ref para sempre ter o contexto mais recente ao enviar mensagens
  const teoContextRef = useRef<{ bookName: string; chapter: number } | null>(null);
  useEffect(() => {
    if (data) teoContextRef.current = { bookName: data.bookName, chapter: data.chapter };
  }, [data]);

  const { messages: teoMessages, sendMessage: teoSend, status: teoStatus } = useChat({
    transport: new DefaultChatTransport({ api: '/api/teo' }),
  });

  function submitTeoWithContext(text: string) {
    if (!text.trim() || teoLoading) return;
    // Injeta o contexto da passagem diretamente no body de cada mensagem
    teoSend(
      { role: 'user', parts: [{ type: 'text', text: text.trim() }] },
      { body: teoContextRef.current ? { context: teoContextRef.current } : undefined }
    );
    setTeoInput('');
  }

  const teoLoading = teoStatus === 'streaming' || teoStatus === 'submitted';

  function submitTeo(text: string) {
    submitTeoWithContext(text);
  }

  useEffect(() => {
    teoBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [teoMessages]);

  // Detecta seleção de texto para acionar o Teo
  useEffect(() => {
    function onSelectionChange() {
      const sel = window.getSelection();
      const text = sel?.toString().trim() ?? '';
      setSelectedText(text);
    }
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, []);

  function askTeoWithSelection() {
    if (!selectedText) return;
    const ctx = teoContextRef.current;
    const prefix = ctx ? `[${ctx.bookName} ${ctx.chapter}] ` : '';
    window.dispatchEvent(
      new CustomEvent('teo:ask', { detail: { text: `${prefix}"${selectedText}"` } })
    );
    window.getSelection()?.removeAllRanges();
    setSelectedText('');
  }

  function askTeoWithVerse(verse: number) {
    const verseData = data?.verses.find((v) => v.verse === verse);
    if (!verseData || !data) return;
    window.dispatchEvent(
      new CustomEvent('teo:ask', {
        detail: { text: `[${data.bookName} ${data.chapter}:${verse}] "${verseData.text}"` },
      })
    );
    setSelectedVerse(null);
  }

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

  // Classes condicionais de tema
  const dm = darkMode;
  const hlLight: Record<string, string> = {
    yellow: 'bg-yellow-200',
    green: 'bg-green-200',
    pink: 'bg-pink-200',
    blue: 'bg-blue-200',
  };
  const hlDark: Record<string, string> = {
    yellow: 'bg-yellow-900/50',
    green: 'bg-green-900/50',
    pink: 'bg-pink-900/50',
    blue: 'bg-blue-900/50',
  };
  const COLOR_CLASS = dm ? hlDark : hlLight;
  const COLOR_LABEL: Record<string, string> = {
    yellow: '🟡',
    green: '🟢',
    pink: '🩷',
    blue: '🔵',
  };

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
      <div className={`flex items-center justify-center h-64 ${dm ? 'bg-gray-950' : ''}`}>
        <Loader2 size={28} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 gap-3 px-6 text-center ${dm ? 'bg-gray-950' : ''}`}>
        <p className={`text-sm ${dm ? 'text-gray-400' : 'text-slate-500'}`}>{error || 'Erro desconhecido'}</p>
        <button onClick={loadChapter} className="text-indigo-400 text-sm font-medium">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen ${dm ? 'bg-gray-950' : 'bg-white'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 border-b px-4 py-3 flex items-center justify-between ${dm ? 'bg-gray-900 border-gray-700' : 'bg-white border-slate-200'}`}>
        <Link href="/bible" className={`p-1 -ml-1 ${dm ? 'text-gray-400' : 'text-slate-500'}`}>
          <ChevronLeft size={22} />
        </Link>
        <div className="text-center">
          <p className={`text-sm font-bold ${dm ? 'text-gray-100' : 'text-slate-800'}`}>
            {data.bookName} {data.chapter}
          </p>
          <p className={`text-[10px] ${dm ? 'text-gray-500' : 'text-slate-400'}`}>NVI</p>
        </div>
        <div className="flex items-center gap-1">
          {/* Botão configurações de leitura */}
          <div className="relative">
            <button
              onClick={() => setShowSettings((v) => !v)}
              className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-1.5 rounded-full border transition-colors ${
                showSettings
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : dm
                  ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
              aria-label="Configurações de leitura"
            >
              Aa
            </button>

            {/* Painel de configurações */}
            {showSettings && (
              <div
                className={`absolute right-0 top-10 z-20 rounded-2xl shadow-xl border p-4 w-56 ${
                  dm ? 'bg-gray-900 border-gray-700' : 'bg-white border-slate-200'
                }`}
              >
                {/* Modo noturno */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {dm ? <Moon size={15} className="text-indigo-400" /> : <Sun size={15} className="text-amber-500" />}
                    <span className={`text-xs font-semibold ${dm ? 'text-gray-300' : 'text-slate-700'}`}>
                      Modo noturno
                    </span>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      dm ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                        dm ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Tamanho da fonte */}
                <div>
                  <p className={`text-xs font-semibold mb-2 ${dm ? 'text-gray-300' : 'text-slate-700'}`}>
                    Tamanho da fonte
                  </p>
                  <div className="flex gap-2">
                    {(['sm', 'base', 'lg'] as FontSize[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => changeFontSize(size)}
                        className={`flex-1 rounded-xl py-2 font-bold transition-colors ${
                          FONT_SIZE_CLASS[size]
                        } ${
                          fontSize === size
                            ? 'bg-indigo-600 text-white'
                            : dm
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {FONT_SIZE_LABEL[size]}
                      </button>
                    ))}
                  </div>
                  <div className={`flex justify-between px-1 mt-1 ${dm ? 'text-gray-500' : 'text-slate-400'}`}>
                    <span className="text-[9px]">P</span>
                    <span className="text-[9px]">M</span>
                    <span className="text-[9px]">G</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => { setShowTeo(true); setShowSettings(false); }}
            className="flex items-center gap-1 bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-full hover:bg-indigo-700 transition-colors"
          >
            🌿 Teo
          </button>
          <button
            onClick={() => navChapter(-1)}
            disabled={chapterNum <= 1}
            className={`p-1 disabled:opacity-30 ${dm ? 'text-gray-400' : 'text-slate-400'}`}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => navChapter(1)}
            disabled={chapterNum >= data.totalChapters}
            className={`p-1 disabled:opacity-30 ${dm ? 'text-gray-400' : 'text-slate-400'}`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Overlay para fechar settings ao clicar fora */}
      {showSettings && (
        <div className="fixed inset-0 z-[9]" onClick={() => setShowSettings(false)} />
      )}

      {/* Chapter navigation bar */}
      <div className={`flex gap-1 px-4 py-2 overflow-x-auto border-b ${dm ? 'bg-gray-900 border-gray-700' : 'bg-slate-50 border-slate-100'}`}>
        {Array.from({ length: data.totalChapters }, (_, i) => i + 1).map((c) => (
          <Link
            key={c}
            href={`/bible/read/${book}/${c}`}
            className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              c === chapterNum
                ? 'bg-indigo-600 text-white'
                : dm
                ? 'text-gray-400 hover:bg-gray-700'
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
              onClick={() => { setSelectedVerse(isSelected ? null : verse); setShowSettings(false); }}
              className={`w-full text-left rounded-lg px-2 py-1.5 transition-colors ${
                isSelected
                  ? 'ring-2 ring-indigo-400 bg-indigo-900/20'
                  : hl
                  ? COLOR_CLASS[hl.color]
                  : dm
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-slate-100'
              }`}
            >
              <span className={`text-[11px] font-bold mr-1.5 select-none ${dm ? 'text-indigo-300' : 'text-indigo-400'}`}>
                {verse}
              </span>
              <span className={`${FONT_SIZE_CLASS[fontSize]} leading-relaxed select-text ${dm ? 'text-gray-100' : 'text-slate-800'}`}>
                {text}
              </span>
              {hl?.note && (
                <span className={`block text-[10px] italic mt-0.5 ml-4 ${dm ? 'text-gray-400' : 'text-slate-500'}`}>
                  📝 {hl.note}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Chapter nav bottom */}
      <div className={`flex justify-between px-4 py-4 border-t ${dm ? 'border-gray-700' : 'border-slate-100'}`}>
        <button
          onClick={() => navChapter(-1)}
          disabled={chapterNum <= 1}
          className="flex items-center gap-1 text-sm text-indigo-500 disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Capítulo anterior
        </button>
        <button
          onClick={() => navChapter(1)}
          disabled={chapterNum >= data.totalChapters}
          className="flex items-center gap-1 text-sm text-indigo-500 disabled:opacity-30"
        >
          Próximo capítulo <ChevronRight size={16} />
        </button>
      </div>

      {/* Teo — bottom sheet */}
      {showTeo && (
        <div className="fixed inset-0 z-[110] flex flex-col" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowTeo(false)}>
          <div
            className={`mt-auto rounded-t-3xl shadow-2xl flex flex-col ${dm ? 'bg-gray-900' : 'bg-white'}`}
            style={{ height: '70dvh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-5 pt-4 pb-3 border-b ${dm ? 'border-gray-700' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">🌿</span>
                <div>
                  <p className={`font-bold text-sm ${dm ? 'text-gray-100' : 'text-slate-800'}`}>Teo</p>
                  <p className={`text-[10px] ${dm ? 'text-gray-500' : 'text-slate-400'}`}>{data.bookName} {data.chapter}</p>
                </div>
              </div>
              <button onClick={() => setShowTeo(false)}>
                <X size={18} className={dm ? 'text-gray-500' : 'text-slate-400'} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {teoMessages.length === 0 && (
                <div className="text-center py-6 space-y-2">
                  <p className={`text-sm ${dm ? 'text-gray-400' : 'text-slate-500'}`}>
                    Pergunte sobre <strong>{data.bookName} {data.chapter}</strong> ou qualquer passagem bíblica.
                  </p>
                  {[
                    `Explique o contexto histórico de ${data.bookName} ${data.chapter}`,
                    'Quais versículos deste capítulo se conectam com o NT?',
                    'Gere uma reflexão para célula baseada neste capítulo',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => submitTeo(q)}
                      className={`block w-full text-left text-xs rounded-xl px-3 py-2 transition-colors ${
                        dm
                          ? 'bg-indigo-900/40 border border-indigo-800 text-indigo-300 hover:bg-indigo-900/60'
                          : 'bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              {teoMessages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && <span className="text-lg mr-1.5 mt-0.5 flex-shrink-0">🌿</span>}
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : dm
                      ? 'bg-gray-800 text-gray-100 rounded-bl-sm'
                      : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                  }`}>
                    {m.parts.map((p, i) => p.type === 'text' ? <span key={i}>{p.text}</span> : null)}
                  </div>
                </div>
              ))}
              {teoLoading && (
                <div className="flex justify-start">
                  <span className="text-lg mr-1.5">🌿</span>
                  <div className={`rounded-2xl rounded-bl-sm px-3 py-2 ${dm ? 'bg-gray-800' : 'bg-slate-100'}`}>
                    <div className="flex gap-1">
                      {[0, 150, 300].map((d) => (
                        <span key={d} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={teoBottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); submitTeo(teoInput); }}
              className={`flex gap-2 px-4 py-3 border-t ${dm ? 'border-gray-700' : 'border-slate-100'}`}
            >
              <input
                value={teoInput}
                onChange={(e) => setTeoInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitTeo(teoInput); } }}
                placeholder="Pergunte sobre esta passagem..."
                disabled={teoLoading}
                className={`flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 disabled:opacity-50 ${
                  dm
                    ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
              <button type="submit" disabled={teoLoading || !teoInput.trim()} className="bg-indigo-600 text-white rounded-xl p-2 disabled:opacity-40">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Barra flutuante de seleção de texto → Teo */}
      {selectedText.length > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9980] flex items-center gap-2 bg-slate-900 text-white rounded-full shadow-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap">
          <span className="text-indigo-300 font-bold" style={{ fontFamily: 'serif' }}>τ</span>
          <span className="max-w-[180px] truncate text-slate-300 text-xs">
            "{selectedText}"
          </span>
          <button
            onClick={askTeoWithSelection}
            className="ml-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full transition-colors"
          >
            Perguntar ao Teo
          </button>
          <button
            onClick={() => { window.getSelection()?.removeAllRanges(); setSelectedText(''); }}
            className="text-slate-400 hover:text-white ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Highlight action sheet */}
      {selectedVerse !== null && (
        <div className="fixed inset-0 z-[100] flex items-end" onClick={() => { setSelectedVerse(null); setShowNoteInput(false); }}>
          <div
            className={`w-full rounded-t-3xl shadow-2xl p-5 ${dm ? 'bg-gray-900' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-bold flex items-center gap-1.5 ${dm ? 'text-gray-200' : 'text-slate-700'}`}>
                <BookmarkPlus size={16} className="text-indigo-500" />
                Versículo {selectedVerse}
              </p>
              <button onClick={() => { setSelectedVerse(null); setShowNoteInput(false); }}>
                <X size={18} className={dm ? 'text-gray-500' : 'text-slate-400'} />
              </button>
            </div>

            {/* Color palette */}
            <div className="flex gap-3 mb-4">
              {(['yellow', 'green', 'pink', 'blue'] as const).map((color) => (
                <button
                  key={color}
                  onClick={() => handleHighlight(color)}
                  disabled={savingHighlight}
                  className={`flex-1 py-3 rounded-xl text-lg font-bold ${hlLight[color]} hover:opacity-80 transition-opacity`}
                >
                  {COLOR_LABEL[color]}
                </button>
              ))}
            </div>

            {/* Note toggle */}
            {!showNoteInput ? (
              <button
                onClick={() => setShowNoteInput(true)}
                className={`w-full text-sm border border-dashed rounded-xl py-2.5 mb-3 ${
                  dm ? 'text-gray-400 border-gray-600' : 'text-slate-500 border-slate-300'
                }`}
              >
                + Adicionar nota
              </button>
            ) : (
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Sua anotação…"
                rows={3}
                className={`w-full text-sm border rounded-xl px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-indigo-300 resize-none ${
                  dm ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500' : 'border-slate-200'
                }`}
              />
            )}

            {/* Perguntar ao Teo */}
            <button
              onClick={() => askTeoWithVerse(selectedVerse)}
              className={`w-full text-sm font-medium py-2.5 rounded-xl mb-2 flex items-center justify-center gap-2 transition-colors ${
                dm
                  ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-800 hover:bg-indigo-900/60'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100'
              }`}
            >
              <span className="font-bold" style={{ fontFamily: 'serif' }}>τ</span>
              Perguntar ao Teo sobre este versículo
            </button>

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
