'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Send, ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { BottomNav } from '@/components/citylink-bottom-nav';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Partner = {
  id: string;
  name: string | null;
  avatar: string | null;
  profession: string | null;
  availabilityStatus: string | null;
};

type ConvMessage = {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
};

type Conversation = {
  lastMessage: ConvMessage;
  unreadCount: number;
  partner: Partner;
};

function avatarSrc(partner: Partner) {
  return (
    partner.avatar ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name ?? 'U')}&background=3b82f6&color=fff`
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7)
    return d.toLocaleDateString('pt-BR', { weekday: 'short' });
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

// ─── Tela de conversa ─────────────────────────────────────────────────────────

function ConversationView({
  partner,
  myId,
  onBack,
}: {
  partner: Partner;
  myId: string;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<ConvMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/${partner.id}`);
      if (res.ok) {
        const data: ConvMessage[] = await res.json();
        setMessages(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [partner.id]);

  // Carga inicial + polling a cada 5s
  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  // Rola para o fim quando chega mensagem nova
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setText('');

    // Otimista — adiciona localmente antes de confirmar
    const optimistic: ConvMessage = {
      id: `opt-${Date.now()}`,
      fromUserId: myId,
      toUserId: partner.id,
      content: trimmed,
      createdAt: new Date().toISOString(),
      readAt: null,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await fetch(`/api/messages/${partner.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });
      // Próximo polling substitui o otimista pelo real
    } catch {
      // Remove mensagem otimista em caso de erro
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }

  const isOnline = partner.availabilityStatus !== 'offline';

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm flex-shrink-0">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-700 p-1">
          <ArrowLeft size={20} />
        </button>
        <div className="relative">
          <img
            src={avatarSrc(partner)}
            alt={partner.name ?? 'Usuário'}
            className="w-10 h-10 rounded-full object-cover"
          />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate">
            {partner.name ?? 'Usuário'}
          </p>
          <p className="text-xs text-slate-500">
            {isOnline ? 'Disponível' : partner.profession ?? 'Offline'}
          </p>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-blue-400" />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <MessageCircle size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma mensagem ainda.</p>
            <p className="text-xs mt-1">Diga olá! 👋</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.fromUserId === myId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2`}
            >
              {!isMe && (
                <img
                  src={avatarSrc(partner)}
                  alt={partner.name ?? ''}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0 self-end"
                />
              )}
              <div
                className={`max-w-[75%] flex flex-col gap-0.5 ${
                  isMe ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-slate-400 px-1">
                  {formatTime(msg.createdAt)}
                  {isMe && msg.readAt && (
                    <span className="ml-1 text-blue-400">✓✓</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Digite uma mensagem..."
          className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ChatPage() {
  const { data: session } = useSession();
  const myId = session?.user?.id ?? '';
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activePartner, setActivePartner] = useState<Partner | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data: Conversation[] = await res.json();
        setConversations(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10_000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Auto-abre conversa quando vem do mapa via ?with=<userId>
  useEffect(() => {
    const withId = searchParams.get('with');
    if (!withId || activePartner) return;

    // Tenta achar nos dados já carregados
    const existing = conversations.find((c) => c.partner.id === withId);
    if (existing) {
      setActivePartner(existing.partner);
      return;
    }

    // Se não tem histórico ainda, busca dados do usuário e abre conversa nova
    fetch(`/api/users/me`) // não temos rota GET /api/users/[id] ainda, usa fallback
      .then(() => {
        setActivePartner({
          id: withId,
          name: null,
          avatar: null,
          profession: null,
          availabilityStatus: null,
        });
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, conversations]);

  if (activePartner) {
    return (
      <>
        <ConversationView
          partner={activePartner}
          myId={myId}
          onBack={() => {
            setActivePartner(null);
            fetchConversations(); // atualiza badges ao voltar
          }}
        />
        <BottomNav />
      </>
    );
  }

  const filtered = conversations.filter(
    (c) =>
      !search ||
      (c.partner.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-24">
      {/* Busca */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm px-4 py-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversa..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Lista de conversas */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-blue-400" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <MessageCircle size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">
            {search ? 'Nenhuma conversa encontrada' : 'Nenhuma mensagem ainda'}
          </p>
          <p className="text-xs mt-1">
            {!search && 'Toque em alguém no mapa para iniciar uma conversa.'}
          </p>
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {filtered.map((conv) => {
          const p = conv.partner;
          const isMe = conv.lastMessage.fromUserId === myId;
          return (
            <button
              key={p.id}
              onClick={() => setActivePartner(p)}
              className="w-full bg-white px-4 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={avatarSrc(p)}
                  alt={p.name ?? 'Usuário'}
                  className="w-14 h-14 rounded-full object-cover"
                />
                {p.availabilityStatus !== 'offline' && (
                  <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-semibold text-slate-800 text-sm truncate">
                    {p.name ?? 'Usuário'}
                  </p>
                  <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                    {formatTime(conv.lastMessage.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-500 truncate">
                    {isMe && (
                      <span className="text-slate-400">Você: </span>
                    )}
                    {conv.lastMessage.content}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="flex-shrink-0 min-w-[20px] h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
