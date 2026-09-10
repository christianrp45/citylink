'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Search, UserPlus, Trash2, Loader2, ChevronLeft, Church, Users, X } from 'lucide-react';

interface Member {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  profession: string | null;
}

interface ChurchInfo {
  id: string;
  name: string;
  denomination: string | null;
}

interface SearchUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  profession: string | null;
}

function Avatar({ user, size = 36 }: { user: { name?: string | null; avatar?: string | null }; size?: number }) {
  const url = user.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name ?? 'U')}&background=e2e8f0&color=475569&size=${size * 2}`;
  return <img src={url} alt={user.name ?? ''} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
}

export default function ChurchAdminPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [church, setChurch] = useState<ChurchInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [adding, setAdding] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/church/${id}/members`);
      if (res.status === 403) { setError('Sem permissão de administrador'); return; }
      if (!res.ok) throw new Error('Erro ao carregar');
      const data = await res.json();
      setChurch(data.church);
      setMembers(data.members);
    } catch {
      setError('Erro ao carregar membros');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  useEffect(() => {
    if (query.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        // Filtra quem já é membro
        const memberIds = new Set(members.map((m) => m.id));
        setSearchResults((data as SearchUser[]).filter((u) => !memberIds.has(u.id)));
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, members]);

  async function handleAdd(userId: string) {
    setAdding(userId);
    try {
      await fetch(`/api/admin/church/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setQuery('');
      setSearchResults([]);
      await loadMembers();
    } finally {
      setAdding(null);
    }
  }

  async function handleRemove(userId: string) {
    if (!confirm('Remover este membro da igreja?')) return;
    setRemoving(userId);
    try {
      await fetch(`/api/admin/church/${id}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setMembers((prev) => prev.filter((m) => m.id !== userId));
    } finally {
      setRemoving(null);
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

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 to-blue-600 pt-10 pb-12 px-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-indigo-200 text-sm mb-4 hover:text-white transition-colors">
          <ChevronLeft size={16} /> Voltar
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Church size={24} className="text-white" />
          </div>
          <div>
            <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide">Gestão de Membros</p>
            <h1 className="text-white text-xl font-bold">{church?.name}</h1>
            {church?.denomination && <p className="text-indigo-200 text-sm">{church.denomination}</p>}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Busca para adicionar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <UserPlus size={16} className="text-indigo-500" /> Adicionar membro
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

        {/* Lista de membros */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Users size={16} className="text-indigo-500" /> Membros
            </p>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">{members.length}</span>
          </div>

          {members.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhum membro ainda.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <Avatar user={m} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{m.name ?? 'Sem nome'}</p>
                    <p className="text-xs text-slate-400 truncate">{m.profession ?? m.email}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(m.id)}
                    disabled={removing === m.id}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                    title="Remover membro"
                  >
                    {removing === m.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
