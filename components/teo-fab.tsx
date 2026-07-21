'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { X, Send } from 'lucide-react';

export function TeoFAB() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [visible, setVisible] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/teo' }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => {
        setVisible(true);
        inputRef.current?.focus();
      }, 30);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function submit(text: string) {
    if (!text.trim() || isLoading) return;
    sendMessage({ role: 'user', parts: [{ type: 'text', text: text.trim() }] });
    setInput('');
  }

  // Expõe método para abrir com texto pré-preenchido (usado pela seleção bíblica)
  useEffect(() => {
    function onTeoRequest(e: CustomEvent<{ text: string }>) {
      setOpen(true);
      // Pequeno delay para o sheet abrir antes de enviar
      setTimeout(() => {
        sendMessage({
          role: 'user',
          parts: [{ type: 'text', text: e.detail.text }],
        });
      }, 300);
    }
    window.addEventListener('teo:ask', onTeoRequest as EventListener);
    return () => window.removeEventListener('teo:ask', onTeoRequest as EventListener);
  }, [sendMessage]);

  return (
    <>
      {/* Botão flutuante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed right-4 z-[9990] bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-all"
          style={{ width: 52, height: 52, bottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))' }}
          aria-label="Abrir Teo"
        >
          <span className="text-xl font-bold" style={{ fontFamily: 'serif' }}>τ</span>
        </button>
      )}

      {/* Bottom sheet */}
      {open && (
        <div
          className={`fixed inset-0 z-[9995] flex flex-col justify-end transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'rgba(15,23,42,0.5)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className={`bg-white rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
            style={{ maxHeight: '78dvh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base" style={{ fontFamily: 'serif' }}>
                  τ
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Teo</p>
                  <p className="text-xs text-slate-400">Assistente teólogo do Emetis</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X size={15} />
              </button>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-3 pt-2">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 text-center space-y-1.5 border border-indigo-100">
                    <p className="font-bold text-indigo-900 text-sm">Olá! Sou o Teo</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Estou aqui para estudo bíblico, orientação espiritual e oração. Como posso ajudá-lo?
                    </p>
                  </div>
                  {['O que significa graça?', 'Me explique João 3:16', 'Ore por mim'].map((q) => (
                    <button
                      key={q}
                      onClick={() => submit(q)}
                      className="w-full text-left bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 flex-shrink-0" style={{ fontFamily: 'serif' }}>
                      τ
                    </div>
                  )}
                  <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                  }`}>
                    {m.parts.map((part, i) => part.type === 'text' ? <span key={i}>{part.text}</span> : null)}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 flex-shrink-0" style={{ fontFamily: 'serif' }}>τ</div>
                  <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 150, 300].map((d) => (
                        <span key={d} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); submit(input); }}
              className="flex gap-2 px-4 py-4 border-t border-slate-100"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(input); } }}
                placeholder="Pergunte ao Teo..."
                disabled={isLoading}
                className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
