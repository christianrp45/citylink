'use client';

import { useState } from 'react';
import { Search, Send, ArrowLeft } from 'lucide-react';
import { BottomNav } from '@/components/citylink-bottom-nav';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CURRENT_USER = { id: 'u1', name: 'João Silva', avatar: 'https://i.pravatar.cc/150?img=1' };

const MOCK_CONVERSATIONS = [
  {
    id: 'conv1',
    userId: 'u2',
    name: 'Maria Santos',
    avatar: 'https://i.pravatar.cc/150?img=5',
    profession: 'Educadora',
    online: true,
    lastMessage: 'Obrigada pela visita! Foi uma bênção 🙏',
    lastTime: '14:32',
    unread: 2,
    messages: [
      { id: 'm1', from: 'u2', text: 'Olá João! Tudo bem?', time: '14:10' },
      { id: 'm2', from: 'u1', text: 'Tudo ótimo! E você?', time: '14:15' },
      { id: 'm3', from: 'u2', text: 'Bem também! Estava pensando em visitar você essa semana.', time: '14:20' },
      { id: 'm4', from: 'u1', text: 'Claro! Pode vir quando quiser, estou com mesa posta 😊', time: '14:25' },
      { id: 'm5', from: 'u2', text: 'Obrigada pela visita! Foi uma bênção 🙏', time: '14:32' },
    ],
  },
  {
    id: 'conv2',
    userId: 'u3',
    name: 'Pedro Oliveira',
    avatar: 'https://i.pravatar.cc/150?img=8',
    profession: 'Engenheiro',
    online: false,
    lastMessage: 'Vejo você no culto de domingo!',
    lastTime: 'Ontem',
    unread: 0,
    messages: [
      { id: 'm1', from: 'u3', text: 'João, vai ao culto domingo?', time: '18:00' },
      { id: 'm2', from: 'u1', text: 'Com certeza! Às 9h certo?', time: '18:05' },
      { id: 'm3', from: 'u3', text: 'Isso! Vejo você no culto de domingo!', time: '18:06' },
    ],
  },
  {
    id: 'conv3',
    userId: 'u4',
    name: 'Ana Costa',
    avatar: 'https://i.pravatar.cc/150?img=9',
    profession: 'Médica',
    online: true,
    lastMessage: 'Preciso de oração por uma situação difícil',
    lastTime: 'Seg',
    unread: 1,
    messages: [
      { id: 'm1', from: 'u4', text: 'Olá! Tudo bem com você?', time: '09:00' },
      { id: 'm2', from: 'u1', text: 'Tudo bem sim! E você?', time: '09:15' },
      { id: 'm3', from: 'u4', text: 'Preciso de oração por uma situação difícil', time: '09:20' },
    ],
  },
];

type Conversation = typeof MOCK_CONVERSATIONS[number];
type Message = Conversation['messages'][number];

// ─── Conversation View ────────────────────────────────────────────────────────
function ConversationView({
  conv,
  onBack,
}: {
  conv: Conversation;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>(conv.messages);
  const [text, setText] = useState('');

  function handleSend() {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        from: CURRENT_USER.id,
        text: text.trim(),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setText('');
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-700 p-1">
          <ArrowLeft size={20} />
        </button>
        <div className="relative">
          <img src={conv.avatar} alt={conv.name} className="w-10 h-10 rounded-full object-cover" />
          {conv.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm">{conv.name}</p>
          <p className="text-xs text-slate-500">{conv.online ? 'Online agora' : conv.profession}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-20">
        {messages.map((msg) => {
          const isMe = msg.from === CURRENT_USER.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2`}>
              {!isMe && (
                <img src={conv.avatar} alt={conv.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0 self-end" />
              )}
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-md'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 px-1">{msg.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Digite uma mensagem..."
          className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [search, setSearch] = useState('');
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);

  if (activeConv) {
    return (
      <>
        <ConversationView conv={activeConv} onBack={() => setActiveConv(null)} />
        <BottomNav />
      </>
    );
  }

  const filtered = MOCK_CONVERSATIONS.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Search */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm px-4 py-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversa..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="divide-y divide-slate-100">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-2">💬</p>
            <p className="text-sm">Nenhuma conversa encontrada</p>
          </div>
        )}
        {filtered.map((conv) => (
          <button
            key={conv.id}
            onClick={() => setActiveConv(conv)}
            className="w-full bg-white px-4 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="relative flex-shrink-0">
              <img src={conv.avatar} alt={conv.name} className="w-14 h-14 rounded-full object-cover" />
              {conv.online && (
                <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="font-semibold text-slate-800 text-sm">{conv.name}</p>
                <span className="text-xs text-slate-400 flex-shrink-0">{conv.lastTime}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                {conv.unread > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
