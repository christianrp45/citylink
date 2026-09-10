'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Search, UserPlus, UserCheck, UserX, Trash2, Loader2, ChevronLeft, Users, X, Clock } from 'lucide-react';

interface Member {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  profession: string | null;
  role: string;
  joinedAt: string;
  approvedAt: string | null;
}

interface CommunityInfo {
  id: string;
  name: string;
  type: string;
}

interface SearchUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  profession: string | null;
}

const TYPE_LABEL: Record<string, string> = {
  church: 'Igreja', family: 'Família', company: 'Empresa',
  friends: 'Amigos', neighborhood: 'Bairro', other: 'Grupo',
};

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  owner:     { label: 'Dono',       color: 'bg-purple-100 text-purple-700' },
  admin:     { label: 'Admin',      color: 'bg-blue-100 text-blue-700' },
  moderator: { label: 'Moderador',  color: 'bg-amber-100 text-amber-700' },
  member:    { label: 'Membro',     color: 'bg-slate-100 text-slate-600' },
};

function Avatar({ user, size = 36 }: { user: { name?: string | null; avatar?: string | null }; size?: number }) {
  const url = user.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name ?? 'U')}&background=e2e8f0&color=475569&size=${size * 2}`;
  return <img src={url} alt={user.name ?? ''} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
}

export default function CommunityAdminPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [community, setCommunity] = useState<CommunityInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [pending, setPending] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'members' | 'pending'>('members');

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [adding, setAdding] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [commRes, pendingRes] = await Promise.all([
        fetch(`/api/communities/${id}`),
        fetch(`/api/communities/${id}/approve`),
      ]);
      if (commRes.status === 403 || pendingRes.status === 403) {
        setError('Sem permissão de administrador'); return;
      }
      const commData = await commRes.json();
      setCommunity({ id: commData.id, name: commData.name, type: commData.type });
      setMembers(commData.members ?? []);
      setPending(pendingRes.ok ? await pendingRes.json() : []);
    } catch {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (query.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        const memberIds = new Set([...members, ...pending].map((m) => m.id));
        setSearchResults((data as SearchUser[]).filter((u) => !memberIds.has(u.id)));
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, members, pending]);

  async function handleAdd(userId: string) {
    setAdding(userId);
    try {
      await fetch(`/api/communities/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setQuery(''); setSearchResults([]);
      await loadData();
    } finally {
      setAdding(null);
    }
  }

  async function handleApprove(userId: string) {
    setActing(userId);
    try {
      await fetch(`/api/communities/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      await loadData();
    } finally {
      setActing(null);
    }
  }

  async function handleRemove(userId: string, label: string) {
    if (!confirm(`Remover ${label} desta comunidade?`)) return;
    setActing(userId);
    try {
      await fetch(`/api/communities/${id}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      await loadData();
    } finally {
      setActing(null);
    }
  }

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="animate-spin text-indigo-500" size={32} />
    </div>
  );

  if (error) return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-4xl">⛔</p>
      <p className="font-semibold text-slate-700">{error}</p>
      <button onClick={() => router.back()} className="mt-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold">Voltar</button>
    </div>
  );

  const typeLabel = TYPE_LABEL[community?.type ?? ''] ?? 'Grupo';
  const emoji = community?.type === 'family' ? '👨‍👩‍👧' : community?.type === 'church' ? '⛪' : '🏢';

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 to-blue-600 pt-10 pb-12 px-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-indigo-200 text-sm mb-4 hover:text-white transition-colors">
          <ChevronLeft size={16} /> Voltar
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
            {emoji}
          </div>
          <div>
            <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide">{typeLabel} · Gestão de Membros</p>
            <h1 className="text-white text-xl font-bold">{community?.name}</h1>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Busca para adicionar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <UserPlus size={16} className="text-indigo-500" /> Convidar / Adicionar
          </p>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-9 pr-9 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-slate-50"
            />
            {query && (
              <button onClick={() => { setQuery(''); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          {searching && <p className="text-xs text-slate-400 text-center py-1">Buscando...</p>}

          {searchResults.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {searchResults.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 border border-slate-100">
                  <Avatar user={u} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{u.name ?? 'Sem nome'}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  <button
                    onClick={() => handleAdd(u.id)}
                    disabled={adding === u.id}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    {adding === u.id ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                    Adicionar
                  </button>
                </div>
              ))}
            </div>
          )}

          {query.length >= 2 && !searching && searchResults.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-1">Nenhum usuário encontrado</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('members')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === 'members' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            Membros <span className="ml-1 text-xs opacity-70">({members.length})</span>
          </button>
          <button
            onClick={() => setTab('pending')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors relative ${tab === 'pending' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            Pendentes
            {pending.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {pending.length}
              </span>
            )}
          </button>
        </div>

        {/* Lista de membros ativos */}
        {tab === 'members' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Users size={16} className="text-indigo-500" />
              <p className="text-sm font-semibold text-slate-700">Membros ativos</p>
            </div>

            {members.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Nenhum membro ainda.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {members.map((m) => {
                  const roleInfo = ROLE_LABEL[m.role] ?? ROLE_LABEL.member;
                  return (
                    <div key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                      <Avatar user={m} size={40} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-700 truncate">{m.name ?? 'Sem nome'}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${roleInfo.color}`}>{roleInfo.label}</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{m.profession ?? m.email}</p>
                      </div>
                      {m.role !== 'owner' && (
                        <button
                          onClick={() => handleRemove(m.id, m.name ?? 'este membro')}
                          disabled={acting === m.id}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                          title="Remover membro"
                        >
                          {acting === m.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Lista de pendentes */}
        {tab === 'pending' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              <p className="text-sm font-semibold text-slate-700">Aguardando aprovação</p>
            </div>

            {pending.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Nenhum pedido pendente.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {pending.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                    <Avatar user={m} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{m.name ?? 'Sem nome'}</p>
                      <p className="text-xs text-slate-400 truncate">{m.profession ?? m.email}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(m.id)}
                        disabled={acting === m.id}
                        className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-40"
                        title="Aprovar"
                      >
                        {acting === m.id ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                      </button>
                      <button
                        onClick={() => handleRemove(m.id, m.name ?? 'este pedido')}
                        disabled={acting === m.id}
                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-40"
                        title="Recusar"
                      >
                        <UserX size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
