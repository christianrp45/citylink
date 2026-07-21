'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Send, ArrowLeft, Loader2, MessageCircle, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';

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

type Friend = {
  id: string;
  name: string | null;
  avatar: string | null;
  profession: string | null;
  availabilityStatus: string | null;
};

function avatarSrc(u: { name: string | null; avatar: string | null }) {
  return (
    u.avatar ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name ?? 'U')}&background=3b82f6&color=fff`
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return d.toLocaleDateString('pt-BR', { weekday: 'short' });
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

// ─── Tela de conversa (overlay full-screen) ───────────────────────────────────

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
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/${partner.id}`);
      if (res.ok) setMessages(await res.json());
    } catch {
    } finally {
      setLoading(false);
    }
  }, [partner.id]);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText('');

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
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(trimmed);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  const isOnline = partner.availabilityStatus !== 'offline';

  return (
    // Overlay full-screen — cobre o EmetisHeader e o BottomNav
    <div
      className="fixed inset-0 z-[900] bg-white flex flex-col"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Header da conversa */}
      <div
        className="flex-shrink-0 bg-white border-b border-slate-100 px-4 flex items-center gap-3 shadow-sm"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)', paddingBottom: '12px' }}
      >
        <button
          onClick={onBack}
          className="text-slate-500 hover:text-slate-700 p-1 -ml-1 flex-shrink-0"
          aria-label="Voltar"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="relative flex-shrink-0">
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
          <p className="font-bold text-slate-800 text-base truncate leading-tight">
            {partner.name ?? 'Usuário'}
          </p>
          <p className="text-xs text-slate-400 leading-tight">
            {partner.profession ?? (isOnline ? 'Disponível' : 'Offline')}
          </p>
        </div>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-blue-400" />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <img src={avatarSrc(partner)} alt="" className="w-12 h-12 rounded-full object-cover" />
            </div>
            <p className="text-sm font-medium text-slate-600">{partner.name ?? 'Usuário'}</p>
            {partner.profession && (
              <p className="text-xs text-slate-400 mt-0.5">{partner.profession}</p>
            )}
            <p className="text-xs mt-3 text-slate-400">Nenhuma mensagem ainda. Diga olá! 👋</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.fromUserId === myId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2`}>
              {!isMe && (
                <img
                  src={avatarSrc(partner)}
                  alt={partner.name ?? ''}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0 self-end"
                />
              )}
              <div className={`max-w-[78%] flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
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
                  {isMe && msg.readAt && <span className="ml-1 text-blue-400">✓✓</span>}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input de mensagem */}
      <div className="flex-shrink-0 bg-white border-t border-slate-100 px-4 py-3 flex items-center gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Digite uma mensagem..."
          className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}

// ─── Modal: escolher contato para nova conversa ────────────────────────────────

function NewChatModal({
  friends,
  existingPartnerIds,
  onSelect,
  onClose,
}: {
  friends: Friend[];
  existingPartnerIds: Set<string>;
  onSelect: (f: Friend) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = friends.filter((f) =>
    !search || (f.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[950] flex flex-col bg-white" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Header */}
      <div
        className="flex-shrink-0 bg-white border-b border-slate-100 px-4 flex items-center gap-3 shadow-sm"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)', paddingBottom: '12px' }}
      >
        <button onClick={onClose} className="text-slate-500 p-1 -ml-1 flex-shrink-0">
          <ArrowLeft size={22} />
        </button>
        <p className="font-bold text-slate-800 text-base flex-1">Nova conversa</p>
      </div>

      {/* Busca */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar amigos..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Lista de amigos */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm">Nenhum amigo encontrado.</p>
          </div>
        )}
        {filtered.map((f) => (
          <button
            key={f.id}
            onClick={() => onSelect(f)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="relative flex-shrink-0">
              <img src={avatarSrc(f)} alt={f.name ?? ''} className="w-12 h-12 rounded-full object-cover" />
              {f.availabilityStatus !== 'offline' && f.availabilityStatus !== null && (
                <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">{f.name ?? 'Usuário'}</p>
              {f.profession && <p className="text-xs text-slate-400 mt-0.5 truncate">{f.profession}</p>}
            </div>
            {existingPartnerIds.has(f.id) && (
              <span className="text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full flex-shrink-0">
                Conversa ativa
              </span>
            )}
          </button>
        ))}
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
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activePartner, setActivePartner] = useState<Partner | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) setConversations(await res.json());
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFriends = useCallback(async () => {
    try {
      const res = await fetch('/api/friends');
      if (res.ok) setFriends(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchFriends();
    const interval = setInterval(fetchConversations, 10_000);
    return () => clearInterval(interval);
  }, [fetchConversations, fetchFriends]);

  // Auto-abre conversa quando vem de ?with=<userId>
  useEffect(() => {
    const withId = searchParams.get('with');
    if (!withId || activePartner) return;

    // 1. Tenta achar em conversas existentes
    const existingConv = conversations.find((c) => c.partner.id === withId);
    if (existingConv) { setActivePartner(existingConv.partner); return; }

    // 2. Tenta achar nos amigos
    const friendMatch = friends.find((f) => f.id === withId);
    if (friendMatch) { setActivePartner(friendMatch); return; }

    // 3. Busca dados do usuário na API
    if (conversations.length > 0 || friends.length > 0) {
      fetch(`/api/users/${withId}`)
        .then((r) => r.ok ? r.json() : null)
        .then((u) => {
          if (u) setActivePartner({ id: u.id, name: u.name, avatar: u.avatar, profession: u.profession, availabilityStatus: u.availabilityStatus });
          else setActivePartner({ id: withId, name: null, avatar: null, profession: null, availabilityStatus: null });
        })
        .catch(() => setActivePartner({ id: withId, name: null, avatar: null, profession: null, availabilityStatus: null }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, conversations, friends]);

  const existingPartnerIds = new Set(conversations.map((c) => c.partner.id));

  // Amigos sem conversa ainda — aparecerão na seção de contatos
  const friendsWithoutConv = friends.filter((f) => !existingPartnerIds.has(f.id));

  const filtered = conversations.filter(
    (c) => !search || (c.partner.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  // Amigos que batem com a busca
  const filteredFriendsWithoutConv = friendsWithoutConv.filter(
    (f) => !search || (f.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="h-full overflow-y-auto bg-slate-50 pb-24">
        {/* Barra de busca + botão nova conversa */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm px-4 py-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversa ou amigo..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-colors"
            />
          </div>
          {friends.length > 0 && (
            <button
              onClick={() => setShowNewChat(true)}
              className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors"
              aria-label="Nova conversa"
            >
              <Plus size={18} />
            </button>
          )}
        </div>

        {/* Amigos sem conversa — barra de avatares horizontais */}
        {!search && friendsWithoutConv.length > 0 && (
          <div className="bg-white border-b border-slate-100 px-4 py-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">
              Contatos
            </p>
            <div className="flex gap-4 overflow-x-auto pb-1 no-scrollbar">
              {friendsWithoutConv.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActivePartner(f)}
                  className="flex flex-col items-center gap-1 flex-shrink-0"
                >
                  <div className="relative">
                    <img
                      src={avatarSrc(f)}
                      alt={f.name ?? ''}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-100"
                    />
                    {f.availabilityStatus !== 'offline' && f.availabilityStatus !== null && (
                      <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-600 max-w-[56px] truncate text-center leading-tight">
                    {(f.name ?? 'Usuário').split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lista de conversas */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-blue-400" />
          </div>
        )}

        {!loading && filtered.length === 0 && filteredFriendsWithoutConv.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <MessageCircle size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">
              {search ? 'Nenhum resultado encontrado' : 'Nenhuma mensagem ainda'}
            </p>
            {!search && friends.length > 0 && (
              <button
                onClick={() => setShowNewChat(true)}
                className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Iniciar conversa
              </button>
            )}
            {!search && friends.length === 0 && (
              <p className="text-xs mt-1">Adicione amigos para começar a conversar.</p>
            )}
          </div>
        )}

        {/* Seção: amigos sem conversa (quando buscando) */}
        {search && filteredFriendsWithoutConv.length > 0 && (
          <div className="divide-y divide-slate-100">
            {filteredFriendsWithoutConv.map((f) => (
              <button
                key={f.id}
                onClick={() => setActivePartner(f)}
                className="w-full bg-white px-4 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="relative flex-shrink-0">
                  <img src={avatarSrc(f)} alt={f.name ?? ''} className="w-14 h-14 rounded-full object-cover" />
                  {f.availabilityStatus !== 'offline' && f.availabilityStatus !== null && (
                    <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{f.name ?? 'Usuário'}</p>
                  {f.profession && <p className="text-xs text-slate-500 mt-0.5">{f.profession}</p>}
                  <p className="text-xs text-blue-500 mt-0.5">Iniciar conversa</p>
                </div>
              </button>
            ))}
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
                  <img src={avatarSrc(p)} alt={p.name ?? ''} className="w-14 h-14 rounded-full object-cover" />
                  {p.availabilityStatus !== 'offline' && (
                    <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-semibold text-slate-800 text-sm truncate">{p.name ?? 'Usuário'}</p>
                    <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                      {formatTime(conv.lastMessage.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-500 truncate">
                      {isMe && <span className="text-slate-400">Você: </span>}
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
      </div>

      {/* Overlay: tela de conversa */}
      {activePartner && (
        <ConversationView
          partner={activePartner}
          myId={myId}
          onBack={() => {
            setActivePartner(null);
            fetchConversations();
          }}
        />
      )}

      {/* Overlay: selecionar contato para nova conversa */}
      {showNewChat && (
        <NewChatModal
          friends={friends}
          existingPartnerIds={existingPartnerIds}
          onSelect={(f) => { setShowNewChat(false); setActivePartner(f); }}
          onClose={() => setShowNewChat(false)}
        />
      )}
    </>
  );
}
