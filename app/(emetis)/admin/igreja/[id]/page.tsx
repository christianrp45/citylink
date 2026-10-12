'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Search, UserPlus, Trash2, Loader2, ChevronLeft, Church, Users, X, Plus, Shield, Crown } from 'lucide-react';

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

interface CellInfo {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string | null;
  coLeaderId: string | null;
  memberCount: number;
}

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
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

  // Células da igreja
  const [cells, setCells] = useState<CellInfo[]>([]);
  const [showCreateCell, setShowCreateCell] = useState(false);
  const [newCellName, setNewCellName] = useState('');
  const [newCellLeaderId, setNewCellLeaderId] = useState('');
  const [newCellCoLeaderId, setNewCellCoLeaderId] = useState('');
  const [creatingCell, setCreatingCell] = useState(false);
  const [editingLeadershipOf, setEditingLeadershipOf] = useState<string | null>(null);

  // Administradores da igreja
  const [owner, setOwner] = useState<AdminUser | null>(null);
  const [coAdmins, setCoAdmins] = useState<AdminUser[]>([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [addingAdmin, setAddingAdmin] = useState<string | null>(null);
  const [removingAdmin, setRemovingAdmin] = useState<string | null>(null);

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

  const loadCells = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/church/${id}/cells`);
      if (!res.ok) return;
      setCells(await res.json());
    } catch {
      // silencioso — seção secundária
    }
  }, [id]);

  const loadAdmins = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/church/${id}/admins`);
      if (!res.ok) return;
      const data = await res.json();
      setOwner(data.owner);
      setCoAdmins(data.coAdmins);
    } catch {
      // silencioso — seção secundária
    }
  }, [id]);

  useEffect(() => { loadMembers(); loadCells(); loadAdmins(); }, [loadMembers, loadCells, loadAdmins]);

  async function handleCreateCell() {
    if (!newCellName.trim() || !newCellLeaderId) return;
    setCreatingCell(true);
    try {
      const res = await fetch(`/api/admin/church/${id}/cells`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCellName.trim(),
          leaderId: newCellLeaderId,
          coLeaderId: newCellCoLeaderId || undefined,
        }),
      });
      if (res.ok) {
        setNewCellName('');
        setNewCellLeaderId('');
        setNewCellCoLeaderId('');
        setShowCreateCell(false);
        await loadCells();
      }
    } finally {
      setCreatingCell(false);
    }
  }

  async function handleSetLeadership(cellId: string, field: 'leaderId' | 'coLeaderId', userId: string) {
    await fetch(`/api/admin/church/${id}/cells/${cellId}/leadership`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: userId }),
    });
    setEditingLeadershipOf(null);
    await loadCells();
  }

  async function handleAddAdmin(userId: string) {
    setAddingAdmin(userId);
    try {
      await fetch(`/api/admin/church/${id}/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setShowAddAdmin(false);
      await loadAdmins();
    } finally {
      setAddingAdmin(null);
    }
  }

  async function handleRemoveAdmin(userId: string) {
    if (!confirm('Remover este administrador?')) return;
    setRemovingAdmin(userId);
    try {
      await fetch(`/api/admin/church/${id}/admins/${userId}`, { method: 'DELETE' });
      await loadAdmins();
    } finally {
      setRemovingAdmin(null);
    }
  }

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

        {/* Administradores */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Shield size={16} className="text-indigo-500" /> Administradores
            </p>
            <button
              onClick={() => setShowAddAdmin((v) => !v)}
              className="text-xs font-semibold text-indigo-600 flex items-center gap-1"
            >
              <Plus size={14} /> Adicionar
            </button>
          </div>

          {showAddAdmin && (
            <div className="px-4 py-3 border-b border-slate-100 space-y-1.5 max-h-48 overflow-y-auto">
              {members.filter((m) => m.id !== owner?.id && !coAdmins.some((a) => a.id === m.id)).map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 border border-slate-100">
                  <Avatar user={m} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{m.name ?? 'Sem nome'}</p>
                  </div>
                  <button
                    onClick={() => handleAddAdmin(m.id)}
                    disabled={addingAdmin === m.id}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {addingAdmin === m.id ? <Loader2 size={12} className="animate-spin" /> : 'Tornar admin'}
                  </button>
                </div>
              ))}
              {members.filter((m) => m.id !== owner?.id && !coAdmins.some((a) => a.id === m.id)).length === 0 && (
                <p className="text-xs text-slate-400 text-center py-1">Todos os membros já são admins</p>
              )}
            </div>
          )}

          <div className="divide-y divide-slate-50">
            {owner && (
              <div className="flex items-center gap-3 px-4 py-3">
                <Avatar user={owner} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{owner.name ?? owner.email}</p>
                  <p className="text-xs text-slate-400">Admin original</p>
                </div>
              </div>
            )}
            {coAdmins.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                <Avatar user={a} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{a.name ?? a.email}</p>
                  <p className="text-xs text-slate-400">Co-admin</p>
                </div>
                <button
                  onClick={() => handleRemoveAdmin(a.id)}
                  disabled={removingAdmin === a.id}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                  title="Remover admin"
                >
                  {removingAdmin === a.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Células da igreja */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Crown size={16} className="text-indigo-500" /> Células da igreja
            </p>
            <button
              onClick={() => setShowCreateCell((v) => !v)}
              className="text-xs font-semibold text-indigo-600 flex items-center gap-1"
            >
              <Plus size={14} /> Criar célula
            </button>
          </div>

          {showCreateCell && (
            <div className="px-4 py-3 border-b border-slate-100 space-y-2">
              <input
                type="text"
                value={newCellName}
                onChange={(e) => setNewCellName(e.target.value)}
                placeholder="Nome da célula"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-slate-50"
              />
              <select
                value={newCellLeaderId}
                onChange={(e) => setNewCellLeaderId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50"
              >
                <option value="">Escolha o líder...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name ?? m.email}</option>
                ))}
              </select>
              <select
                value={newCellCoLeaderId}
                onChange={(e) => setNewCellCoLeaderId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50"
              >
                <option value="">Co-líder (opcional)</option>
                {members.filter((m) => m.id !== newCellLeaderId).map((m) => (
                  <option key={m.id} value={m.id}>{m.name ?? m.email}</option>
                ))}
              </select>
              <button
                onClick={handleCreateCell}
                disabled={creatingCell || !newCellName.trim() || !newCellLeaderId}
                className="w-full px-3 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {creatingCell ? <Loader2 size={14} className="animate-spin" /> : 'Criar'}
              </button>
            </div>
          )}

          {cells.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhuma célula vinculada ainda.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {cells.map((c) => (
                <div key={c.id} className="px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.memberCount} membro{c.memberCount !== 1 ? 's' : ''} · líder: {c.leaderName ?? '—'}</p>
                    </div>
                    <button
                      onClick={() => setEditingLeadershipOf(editingLeadershipOf === c.id ? null : c.id)}
                      className="text-xs font-semibold text-indigo-600"
                    >
                      Liderança
                    </button>
                  </div>

                  {editingLeadershipOf === c.id && (
                    <div className="space-y-1.5 bg-slate-50 rounded-xl p-2">
                      <p className="text-xs text-slate-500 font-semibold px-1">Trocar líder</p>
                      <select
                        defaultValue=""
                        onChange={(e) => e.target.value && handleSetLeadership(c.id, 'leaderId', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white"
                      >
                        <option value="">Selecione...</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>{m.name ?? m.email}</option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500 font-semibold px-1">Definir co-líder</p>
                      <select
                        defaultValue=""
                        onChange={(e) => e.target.value && handleSetLeadership(c.id, 'coLeaderId', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white"
                      >
                        <option value="">Selecione...</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>{m.name ?? m.email}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
