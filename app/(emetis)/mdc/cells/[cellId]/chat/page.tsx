'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Send, Loader2, MessageCircle } from 'lucide-react';

type CellChatMessage = {
  id: string;
  cellId: string;
  fromUserId: string;
  authorName: string | null;
  authorAvatar: string | null;
  content: string;
  createdAt: string;
};

function avatarSrc(name: string | null, avatar: string | null) {
  return (
    avatar ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? 'U')}&background=6366f1&color=fff&size=64`
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function CellChatPage() {
  const { cellId } = useParams<{ cellId: string }>();
  const { data: session } = useSession();
  const myId = session?.user?.id ?? '';

  const [messages, setMessages] = useState<CellChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/mdc/cells/${cellId}/chat`);
      if (res.ok) {
        const data: CellChatMessage[] = await res.json();
        setMessages(data);
      }
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }, [cellId]);

  // Carga inicial + polling a cada 5s
  useEffect(() => {
    if (!cellId) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages, cellId]);

  // Rola para o fim quando chega mensagem nova
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending || !myId) return;

    setSending(true);
    setText('');

    // Atualização otimista
    const optimistic: CellChatMessage = {
      id: `opt-${Date.now()}`,
      cellId,
      fromUserId: myId,
      authorName: session?.user?.name ?? null,
      authorAvatar: null,
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await fetch(`/api/mdc/cells/${cellId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(trimmed);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Agrupa mensagens por remetente consecutivo
  const grouped = messages.map((msg, i) => ({
    ...msg,
    isFirst: i === 0 || messages[i - 1].fromUserId !== msg.fromUserId,
    isLast: i === messages.length - 1 || messages[i + 1].fromUserId !== msg.fromUserId,
  }));

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-indigo-700 text-white px-4 py-3 flex items-center gap-3 shadow-md flex-shrink-0">
        <Link href={`/mdc/cells/${cellId}`} className="text-indigo-200 hover:text-white text-xl leading-none">
          ←
        </Link>
        <MessageCircle size={20} className="text-indigo-300" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight">Chat do Grupo</p>
          <p className="text-indigo-300 text-xs">Mensagens visíveis para todos os membros</p>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 size={24} className="animate-spin text-indigo-400" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageCircle size={40} className="text-indigo-200 mb-3" />
            <p className="text-slate-500 font-medium">Nenhuma mensagem ainda</p>
            <p className="text-slate-400 text-sm mt-1">Seja o primeiro a escrever!</p>
          </div>
        )}

        {grouped.map((msg) => {
          const isMe = msg.fromUserId === myId;
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar — só mostra no último da sequência */}
              {!isMe && (
                <div className="w-7 flex-shrink-0">
                  {msg.isLast && (
                    <img
                      src={avatarSrc(msg.authorName, msg.authorAvatar)}
                      alt={msg.authorName ?? ''}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  )}
                </div>
              )}

              <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Nome — só no primeiro da sequência */}
                {!isMe && msg.isFirst && (
                  <p className="text-xs font-semibold text-indigo-600 mb-0.5 ml-1">
                    {msg.authorName ?? 'Membro'}
                  </p>
                )}

                <div
                  className={`px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 rounded-bl-sm'
                  } ${msg.id.startsWith('opt-') ? 'opacity-70' : ''}`}
                >
                  {msg.content}
                </div>

                {/* Hora — só na última mensagem da sequência */}
                {msg.isLast && (
                  <p className={`text-xs text-slate-400 mt-0.5 ${isMe ? 'mr-1' : 'ml-1'}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-100 px-3 py-2 flex items-end gap-2 flex-shrink-0 shadow-sm">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mensagem para o grupo…"
          rows={1}
          className="flex-1 bg-slate-100 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none max-h-28 overflow-y-auto"
          style={{ lineHeight: '1.4' }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
