'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2, Plus, Send, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type CommunityItem = {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  isPublic: boolean;
  requireApproval: boolean;
  adminUserId: string | null;
  createdAt: string;
};

type CommunityMemberItem = {
  userId: string;
  name: string | null;
  avatar: string | null;
  profession: string | null;
  role: string;
  joinedAt: string;
  approvedAt: string | null;
};

type TestimonialItem = {
  id: string;
  userId: string;
  authorName: string | null;
  authorAvatar: string | null;
  title: string;
  content: string;
  createdAt: string;
  likes: string[];
  comments: { id: string; userId: string; authorName: string | null; content: string; createdAt: string }[];
};

type PrayerGroupItem = {
  id: string;
  name: string;
  description: string | null;
  schedule: string | null;
  topic: string | null;
  isOnline: boolean;
  memberCount: number;
  isJoined: boolean;
};

type VolunteerItem = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  address: string | null;
  date: string;
  spots: number;
  organizerName: string | null;
  enrolled: number;
  isEnrolled: boolean;
};

function avatarSrc(name: string | null, avatar: string | null) {
  return avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? 'U')}&background=7c3aed&color=fff`;
}

// ─── Células Tab ──────────────────────────────────────────────────────────────

type Roteiro = {
  tema: string;
  versiculo: string;
  abertura: string;
  discussao: string;
  oracao: string;
  data: string;
};

const ROTEIRO_KEY = 'emetis_roteiro';

function CelulasTab() {
  const [showForm, setShowForm] = useState(false);
  const [roteiro, setRoteiro] = useState<Roteiro | null>(null);
  const [form, setForm] = useState<Roteiro>({ tema: '', versiculo: '', abertura: '', discussao: '', oracao: '', data: '' });
  const [viewRoteiro, setViewRoteiro] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ROTEIRO_KEY);
      if (saved) setRoteiro(JSON.parse(saved));
    } catch {}
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.tema) return;
    localStorage.setItem(ROTEIRO_KEY, JSON.stringify(form));
    setRoteiro(form);
    setShowForm(false);
    setViewRoteiro(true);
  }

  function handleEdit() {
    if (roteiro) setForm(roteiro);
    setViewRoteiro(false);
    setShowForm(true);
  }

  function handleDelete() {
    localStorage.removeItem(ROTEIRO_KEY);
    setRoteiro(null);
    setViewRoteiro(false);
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-indigo-200 text-xs font-medium mb-1">📖 Atos 2:42</p>
        <p className="text-sm font-semibold leading-snug">
          "Perseveravam na doutrina dos apóstolos, na comunhão, no partir do pão e nas orações."
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
        <h3 className="font-bold text-slate-800">Grupos Pequenos</h3>
        <p className="text-sm text-slate-500">
          Células são grupos de 8–15 pessoas que se reúnem semanalmente para orar, estudar a Palavra e crescer juntos.
        </p>
        <div className="flex gap-2">
          <Link href="/pib/cells" className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl text-center hover:bg-indigo-700 transition-colors">
            Ver Células
          </Link>
          <Link href="/pib/cells/new" className="flex-1 py-2.5 border border-indigo-300 text-indigo-700 text-sm font-semibold rounded-xl text-center hover:bg-indigo-50 transition-colors">
            + Criar Célula
          </Link>
        </div>
      </div>

      {/* Roteiro Manual */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800">📋 Roteiro da Célula</h3>
          {roteiro && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Salvo</span>
          )}
        </div>
        <p className="text-sm text-slate-500">
          Insira manualmente o roteiro da sua reunião de célula.
        </p>
        {roteiro ? (
          <div className="space-y-2">
            <button
              onClick={() => setViewRoteiro((v) => !v)}
              className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              {viewRoteiro ? 'Ocultar Roteiro' : '👁 Ver Roteiro'}
            </button>
            <div className="flex gap-2">
              <button onClick={handleEdit} className="flex-1 py-2 border border-indigo-300 text-indigo-700 text-sm font-semibold rounded-xl hover:bg-indigo-50 transition-colors">
                ✏️ Editar
              </button>
              <button onClick={handleDelete} className="flex-1 py-2 border border-rose-200 text-rose-500 text-sm font-semibold rounded-xl hover:bg-rose-50 transition-colors">
                🗑 Remover
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { setForm({ tema: '', versiculo: '', abertura: '', discussao: '', oracao: '', data: '' }); setShowForm(true); }}
            className="w-full py-2.5 border-2 border-dashed border-indigo-300 text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Inserir Roteiro Manual
          </button>
        )}

        {/* Visualização do roteiro */}
        {viewRoteiro && roteiro && (
          <div className="mt-2 space-y-3 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-800 text-base">{roteiro.tema}</p>
              {roteiro.data && (
                <span className="text-xs text-slate-400">
                  {new Date(roteiro.data + 'T00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
            {roteiro.versiculo && (
              <div className="bg-indigo-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-indigo-500 mb-1">📖 Versículo Base</p>
                <p className="text-sm text-indigo-800 italic">"{roteiro.versiculo}"</p>
              </div>
            )}
            {roteiro.abertura && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-500 mb-1">🎉 Abertura / Dinâmica</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{roteiro.abertura}</p>
              </div>
            )}
            {roteiro.discussao && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-500 mb-1">💬 Perguntas para Discussão</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{roteiro.discussao}</p>
              </div>
            )}
            {roteiro.oracao && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-500 mb-1">🙏 Momento de Oração</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{roteiro.oracao}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
        <h3 className="font-bold text-slate-800">Guia de Estudo IA</h3>
        <p className="text-sm text-slate-500">
          Gere roteiros personalizados para sua célula com inteligência artificial.
        </p>
        <Link href="/pib/cells/guide" className="block w-full py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl text-center hover:bg-amber-600 transition-colors">
          Gerar Roteiro ✨
        </Link>
      </div>

      {/* Bottom sheet — formulário de roteiro */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setShowForm(false)}>
          <form
            onSubmit={handleSave}
            className="w-full bg-white rounded-t-3xl p-6 space-y-3 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-800">Roteiro da Célula</h3>
              <button type="button" onClick={() => setShowForm(false)}><X size={20} className="text-slate-400" /></button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tema *</label>
              <input
                value={form.tema}
                onChange={(e) => setForm((p) => ({ ...p, tema: e.target.value }))}
                placeholder="Ex.: A Graça de Deus"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Data da Reunião</label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Versículo Base</label>
              <textarea
                value={form.versiculo}
                onChange={(e) => setForm((p) => ({ ...p, versiculo: e.target.value }))}
                placeholder="Ex.: João 3:16 — Porque Deus amou o mundo..."
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Abertura / Dinâmica</label>
              <textarea
                value={form.abertura}
                onChange={(e) => setForm((p) => ({ ...p, abertura: e.target.value }))}
                placeholder="Descreva a dinâmica de abertura da reunião..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Perguntas para Discussão</label>
              <textarea
                value={form.discussao}
                onChange={(e) => setForm((p) => ({ ...p, discussao: e.target.value }))}
                placeholder="1. O que esse versículo significa para você?&#10;2. Como aplicar isso na sua semana?"
                rows={4}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Momento de Oração</label>
              <textarea
                value={form.oracao}
                onChange={(e) => setForm((p) => ({ ...p, oracao: e.target.value }))}
                placeholder="Direcionamentos para o tempo de oração..."
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!form.tema}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
            >
              <Plus size={16} /> Salvar Roteiro
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Comunidades Tab ──────────────────────────────────────────────────────────

const COMMUNITY_TYPES = [
  { id: '',             label: 'Todas' },
  { id: 'church',      label: '⛪ Igreja' },
  { id: 'company',     label: '🏢 Empresa' },
  { id: 'family',      label: '👨‍👩‍👧 Família' },
  { id: 'friends',     label: '👥 Amigos' },
  { id: 'neighborhood',label: '🏘️ Bairro' },
  { id: 'other',       label: '🌐 Outro' },
] as const;

const COMMUNITY_TYPE_EMOJI: Record<string, string> = {
  church: '⛪', company: '🏢', family: '👨‍👩‍👧', friends: '👥', neighborhood: '🏘️', other: '🌐',
};

const COMMUNITY_TYPE_LABEL: Record<string, string> = {
  church: 'Igreja', company: 'Empresa', family: 'Família', friends: 'Amigos', neighborhood: 'Bairro', other: 'Outro',
};

function avatarUrl(name: string | null, avatar: string | null) {
  return avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? 'U')}&background=6366f1&color=fff`;
}

function CommunitiesTab({ myId }: { myId: string }) {
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CommunityItem | null>(null);
  const [detail, setDetail] = useState<{ members: CommunityMemberItem[]; pending: CommunityMemberItem[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'church', description: '', city: '', address: '', phone: '', website: '',
    isPublic: true, requireApproval: false,
  });
  const [saving, setSaving] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  async function generateInvite() {
    if (!selected) return;
    setInviteLoading(true);
    try {
      const res = await fetch('/api/invite/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'community', targetId: selected.id, role: 'member', expiresInDays: 7 }),
      });
      if (res.ok) {
        const data = await res.json();
        setInviteCode(data.code);
      }
    } finally {
      setInviteLoading(false);
    }
  }

  function copyInviteLink() {
    if (!inviteCode) return;
    const url = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    });
  }

  useEffect(() => {
    const params = new URLSearchParams();
    if (typeFilter) params.set('type', typeFilter);
    fetch(`/api/communities?${params}`).then(r => r.json()).then(setCommunities).finally(() => setLoading(false));
  }, [typeFilter]);

  async function loadDetail(community: CommunityItem) {
    setSelected(community);
    setInviteCode(null);
    setInviteCopied(false);
    setDetailLoading(true);
    try {
      const [detRes, pendRes] = await Promise.all([
        fetch(`/api/communities/${community.id}`),
        community.adminUserId === myId ? fetch(`/api/communities/${community.id}/approve`) : Promise.resolve(null),
      ]);
      const { members } = await detRes.json();
      const pending = pendRes?.ok ? await pendRes.json() : [];
      setDetail({ members, pending });
    } finally {
      setDetailLoading(false);
    }
  }

  const isMember = detail?.members.some(m => m.userId === myId) ?? false;

  async function handleJoinLeave() {
    if (!selected) return;
    setJoining(true);
    try {
      if (isMember) {
        await fetch(`/api/communities/${selected.id}/join`, { method: 'DELETE' });
        setDetail(prev => prev ? { ...prev, members: prev.members.filter(m => m.userId !== myId) } : prev);
      } else {
        const res = await fetch(`/api/communities/${selected.id}/join`, { method: 'POST' });
        const data = await res.json();
        if (!selected.requireApproval) {
          // Recarrega membros
          const { members } = await fetch(`/api/communities/${selected.id}`).then(r => r.json());
          setDetail(prev => prev ? { ...prev, members } : prev);
        } else {
          alert(data.message);
        }
      }
    } finally {
      setJoining(false);
    }
  }

  async function handleApprove(userId: string) {
    if (!selected) return;
    setApprovingId(userId);
    try {
      await fetch(`/api/communities/${selected.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setDetail(prev => {
        if (!prev) return prev;
        const approved = prev.pending.find(m => m.userId === userId);
        return {
          members: approved ? [...prev.members, { ...approved, approvedAt: new Date().toISOString() }] : prev.members,
          pending: prev.pending.filter(m => m.userId !== userId),
        };
      });
    } finally {
      setApprovingId(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const created = await res.json();
        setCommunities(prev => [created, ...prev]);
        setShowCreate(false);
        setForm({ name: '', type: 'church', description: '', city: '', address: '', phone: '', website: '', isPublic: true, requireApproval: false });
      }
    } finally {
      setSaving(false);
    }
  }

  const filtered = communities.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.city ?? '').toLowerCase().includes(search.toLowerCase())
  );

  // ── Detalhe da comunidade ──────────────────────────────────────────────────
  if (selected) {
    const isAdmin = selected.adminUserId === myId;
    return (
      <div className="space-y-3">
        <button onClick={() => { setSelected(null); setDetail(null); }} className="text-sm text-indigo-600 font-medium">← Voltar</button>

        <div className="bg-white rounded-2xl shadow p-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              {COMMUNITY_TYPE_EMOJI[selected.type] ?? '🌐'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-800 leading-tight">{selected.name}</h3>
              <span className="inline-block mt-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                {COMMUNITY_TYPE_LABEL[selected.type] ?? selected.type}
              </span>
              {selected.city && <p className="text-xs text-slate-400 mt-1">📍 {selected.city}{selected.state ? `, ${selected.state}` : ''}</p>}
            </div>
          </div>

          {selected.description && <p className="text-sm text-slate-600 leading-relaxed">{selected.description}</p>}

          <div className="grid grid-cols-1 gap-2 text-sm">
            {selected.address && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-400 text-xs mb-0.5">Endereço</p>
                <p className="font-medium text-slate-800">{selected.address}</p>
              </div>
            )}
            {selected.phone && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-400 text-xs mb-0.5">Telefone</p>
                <p className="font-medium text-slate-800">{selected.phone}</p>
              </div>
            )}
            {selected.website && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-400 text-xs mb-0.5">Site</p>
                <p className="font-medium text-indigo-600 truncate">{selected.website}</p>
              </div>
            )}
          </div>

          {/* Botão entrar/sair */}
          {myId && (
            <button
              onClick={handleJoinLeave}
              disabled={joining}
              className={`w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                isMember
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              } disabled:opacity-60`}
            >
              {joining ? <Loader2 size={16} className="animate-spin" /> : null}
              {isMember ? 'Sair da comunidade' : selected.requireApproval ? 'Solicitar entrada' : 'Entrar na comunidade'}
            </button>
          )}

          {/* Botão Convidar — apenas para admin */}
          {isAdmin && (
            <div className="space-y-2">
              {!inviteCode ? (
                <button
                  onClick={generateInvite}
                  disabled={inviteLoading}
                  className="w-full py-2.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-60"
                >
                  {inviteLoading ? <Loader2 size={14} className="animate-spin" /> : '🔗'}
                  {inviteLoading ? 'Gerando...' : 'Gerar link de convite'}
                </button>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-emerald-700">Link de convite (7 dias)</p>
                  <p className="text-xs font-mono text-emerald-800 bg-white rounded-lg px-2 py-1.5 border border-emerald-100 truncate">
                    {typeof window !== 'undefined' ? `${window.location.origin}/join/${inviteCode}` : `/join/${inviteCode}`}
                  </p>
                  <button
                    onClick={copyInviteLink}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    {inviteCopied ? '✓ Copiado!' : 'Copiar link'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Membros */}
        {detailLoading ? (
          <div className="flex justify-center py-6"><Loader2 size={24} className="animate-spin text-indigo-400" /></div>
        ) : (
          <>
            {detail && detail.members.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-4">
                <h4 className="text-sm font-bold text-slate-700 mb-3">
                  Membros ({detail.members.length})
                </h4>
                <div className="space-y-2">
                  {detail.members.map(m => (
                    <div key={m.userId} className="flex items-center gap-3">
                      <img src={avatarUrl(m.name, m.avatar)} alt={m.name ?? ''} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{m.name ?? 'Membro'}</p>
                        {m.profession && <p className="text-xs text-slate-400 truncate">{m.profession}</p>}
                      </div>
                      {(m.role === 'owner' || m.role === 'admin') && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                          {m.role === 'owner' ? 'Dono' : 'Admin'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pendentes (admin only) */}
            {isAdmin && detail && detail.pending.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <h4 className="text-sm font-bold text-amber-800 mb-3">
                  Aguardando aprovação ({detail.pending.length})
                </h4>
                <div className="space-y-2">
                  {detail.pending.map(m => (
                    <div key={m.userId} className="flex items-center gap-3">
                      <img src={avatarUrl(m.name, m.avatar)} alt={m.name ?? ''} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{m.name ?? 'Usuário'}</p>
                        {m.profession && <p className="text-xs text-slate-500 truncate">{m.profession}</p>}
                      </div>
                      <button
                        onClick={() => handleApprove(m.userId)}
                        disabled={approvingId === m.userId}
                        className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1 hover:bg-green-600 disabled:opacity-60"
                      >
                        {approvingId === m.userId ? <Loader2 size={11} className="animate-spin" /> : '✓'}
                        Aprovar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ── Listagem ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Busca + botão criar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Buscar comunidades..."
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>
        <button onClick={() => setShowCreate(true)} className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700">
          <Plus size={18} />
        </button>
      </div>

      {/* Filtro de tipo */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {COMMUNITY_TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => { setTypeFilter(t.id); setLoading(true); }}
            className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
              typeFilter === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-indigo-400" /></div>}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-2">🏛️</p>
          <p className="text-sm">Nenhuma comunidade encontrada.</p>
          <p className="text-xs mt-1">Toque em + para criar a primeira!</p>
        </div>
      )}

      {filtered.map(c => (
        <button key={c.id} onClick={() => loadDetail(c)} className="w-full text-left bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              {COMMUNITY_TYPE_EMOJI[c.type] ?? '🌐'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-800 text-sm">{c.name}</h3>
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full font-semibold">
                  {COMMUNITY_TYPE_LABEL[c.type] ?? c.type}
                </span>
                {!c.isPublic && (
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">Privada</span>
                )}
              </div>
              {c.city && <p className="text-xs text-slate-500 mt-0.5">📍 {c.city}{c.state ? `, ${c.state}` : ''}</p>}
              {c.description && <p className="text-xs text-slate-600 mt-1 line-clamp-2">{c.description}</p>}
              {c.requireApproval && (
                <p className="text-[10px] text-amber-600 mt-1">🔒 Entrada por aprovação</p>
              )}
            </div>
          </div>
        </button>
      ))}

      {/* Modal de criação */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="w-full bg-white rounded-t-3xl p-6 space-y-3 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-800 text-lg">Nova Comunidade</h3>
              <button type="button" onClick={() => setShowCreate(false)}><X size={20} className="text-slate-400" /></button>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo *</label>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                <option value="church">⛪ Igreja</option>
                <option value="company">🏢 Empresa Cristã</option>
                <option value="family">👨‍👩‍👧 Família</option>
                <option value="friends">👥 Grupo de Amigos</option>
                <option value="neighborhood">🏘️ Bairro / Região</option>
                <option value="other">🌐 Outro</option>
              </select>
            </div>

            {/* Campos de texto */}
            {[
              { key: 'name', label: 'Nome *', placeholder: 'Ex.: Igreja Central' },
              { key: 'city', label: 'Cidade', placeholder: 'Ex.: Curitiba' },
              { key: 'address', label: 'Endereço', placeholder: 'Rua, número, bairro' },
              { key: 'phone', label: 'Telefone', placeholder: '(41) 99999-9999' },
              { key: 'website', label: 'Site', placeholder: 'https://...' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
                <input
                  value={(form as unknown as Record<string, string>)[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Conte sobre a comunidade..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-1">
              {[
                { key: 'isPublic', label: 'Comunidade pública', desc: 'Aparece nas buscas' },
                { key: 'requireApproval', label: 'Exige aprovação', desc: 'Admin aprova cada membro' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setForm(p => ({ ...p, [key]: !(p as unknown as Record<string, boolean>)[key] }))}
                    className={`relative w-10 h-6 rounded-full transition-colors ${(form as unknown as Record<string, boolean>)[key] ? 'bg-indigo-500' : 'bg-slate-200'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(form as unknown as Record<string, boolean>)[key] ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <button type="submit" disabled={saving || !form.name} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 mt-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {saving ? 'Criando...' : 'Criar Comunidade'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Grupos de Oração Tab ─────────────────────────────────────────────────────

function PrayerTab() {
  const [groups, setGroups] = useState<PrayerGroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', schedule: '', topic: '', isOnline: false });
  const [saving, setSaving] = useState(false);

  const fetchGroups = useCallback(async () => {
    const res = await fetch('/api/prayer-groups');
    if (res.ok) setGroups(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  async function toggleJoin(groupId: string, isJoined: boolean) {
    setToggling(groupId);
    setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, isJoined: !isJoined, memberCount: isJoined ? g.memberCount - 1 : g.memberCount + 1 } : g));
    try {
      await fetch(`/api/prayer-groups/${groupId}/join`, { method: 'POST' });
    } catch {
      setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, isJoined, memberCount: isJoined ? g.memberCount + 1 : g.memberCount - 1 } : g));
    } finally {
      setToggling(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await fetch('/api/prayer-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { await fetchGroups(); setShowCreate(false); setForm({ name: '', description: '', schedule: '', topic: '', isOnline: false }); }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <button onClick={() => setShowCreate(true)} className="w-full py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-2xl text-sm font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
        <Plus size={16} /> Criar Grupo de Oração
      </button>

      {loading && <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-indigo-400" /></div>}
      {!loading && groups.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-2">🙏</p>
          <p className="text-sm">Nenhum grupo de oração ainda.</p>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-800">{group.name}</h3>
                {group.isOnline && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Online</span>}
              </div>
              {group.description && <p className="text-sm text-slate-600 mt-1">{group.description}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                {group.schedule && <span>🕐 {group.schedule}</span>}
                {group.topic && <span>🏷️ {group.topic}</span>}
                <span>👥 {group.memberCount}</span>
              </div>
            </div>
            <button
              onClick={() => toggleJoin(group.id, group.isJoined)}
              disabled={toggling === group.id}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${
                group.isJoined ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {toggling === group.id ? <Loader2 size={14} className="animate-spin" /> : group.isJoined ? 'Participando' : 'Entrar'}
            </button>
          </div>
        </div>
      ))}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="w-full bg-white rounded-t-3xl p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Novo Grupo de Oração</h3>
              <button type="button" onClick={() => setShowCreate(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            {[
              { key: 'name', label: 'Nome *', placeholder: 'Ex.: Guerreiros da Manhã' },
              { key: 'schedule', label: 'Horário', placeholder: 'Seg a Sex, 6h' },
              { key: 'topic', label: 'Tema', placeholder: 'Intercessão, Família...' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
                <input value={(form as any)[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} placeholder={placeholder} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
              <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.isOnline} onChange={(e) => setForm((prev) => ({ ...prev, isOnline: e.target.checked }))} className="rounded" />
              Grupo Online
            </label>
            <button type="submit" disabled={saving || !form.name} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {saving ? 'Criando...' : 'Criar Grupo'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Testemunhos Tab ──────────────────────────────────────────────────────────

function TestimonialsTab({ myId }: { myId: string }) {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    fetch('/api/testimonials').then((r) => r.json()).then(setItems).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim() }),
      });
      if (res.ok) {
        const created = await res.json();
        setItems((prev) => [{ ...created, likes: [], comments: [], authorName: null, authorAvatar: null }, ...prev]);
        setNewTitle(''); setNewContent(''); setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleLike(id: string) {
    const res = await fetch(`/api/testimonials/${id}/like`, { method: 'POST' });
    if (res.ok) {
      const { liked } = await res.json();
      setItems((prev) => prev.map((t) => {
        if (t.id !== id) return t;
        return { ...t, likes: liked ? [...t.likes, myId] : t.likes.filter((uid) => uid !== myId) };
      }));
    }
  }

  async function handleComment(testimonialId: string) {
    if (!commentText.trim()) return;
    setCommenting(true);
    try {
      const res = await fetch(`/api/testimonials/${testimonialId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      if (res.ok) {
        const comment = await res.json();
        setItems((prev) => prev.map((t) => t.id === testimonialId ? { ...t, comments: [...t.comments, comment] } : t));
        setCommentText('');
      }
    } finally {
      setCommenting(false);
    }
  }

  return (
    <div className="space-y-3">
      <button onClick={() => setShowForm((v) => !v)} className="w-full py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-2xl text-sm font-medium hover:bg-purple-50 transition-colors">
        + Compartilhar Testemunho
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h4 className="font-bold text-slate-800">Novo Testemunho</h4>
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Título do testemunho" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Conte o que Deus fez em sua vida..." rows={4} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-1">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null} Compartilhar
            </button>
          </div>
        </form>
      )}

      {loading && <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-purple-400" /></div>}

      {items.map((t) => {
        const liked = t.likes.includes(myId);
        const showComments = expandedComments === t.id;
        return (
          <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <img src={avatarSrc(t.authorName, t.authorAvatar)} alt={t.authorName ?? ''} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-slate-800 text-sm">{t.authorName ?? 'Usuário'}</p>
                <p className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <h3 className="font-bold text-slate-800">🙌 {t.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{t.content}</p>
            <div className="flex items-center gap-4 pt-1">
              <button onClick={() => handleLike(t.id)} className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${liked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'}`}>
                {liked ? '❤️' : '🤍'} {t.likes.length}
              </button>
              <button onClick={() => setExpandedComments(showComments ? null : t.id)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-500 transition-colors">
                💬 {t.comments.length}
              </button>
            </div>
            {showComments && (
              <div className="space-y-2 pt-1 border-t border-slate-50">
                {t.comments.map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <img src={avatarSrc(c.authorName, null)} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-xs">
                      <p className="font-semibold text-slate-700">{c.authorName ?? 'Usuário'}</p>
                      <p className="text-slate-600 mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleComment(t.id)} placeholder="Escreva um comentário..." className="flex-1 bg-slate-100 rounded-full px-3 py-1.5 text-xs focus:outline-none" />
                  <button onClick={() => handleComment(t.id)} disabled={commenting || !commentText.trim()} className="px-3 py-1.5 bg-purple-600 text-white rounded-full text-xs font-semibold disabled:opacity-40 flex items-center gap-1">
                    {commenting ? <Loader2 size={12} className="animate-spin" /> : 'Enviar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Voluntariado Tab ─────────────────────────────────────────────────────────

function VolunteerTab() {
  const [items, setItems] = useState<VolunteerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '', address: '', date: '', spots: '10', organizerName: '' });
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    const res = await fetch('/api/volunteer');
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function toggleEnroll(id: string, isEnrolled: boolean) {
    setToggling(id);
    setItems((prev) => prev.map((o) => o.id === id ? { ...o, isEnrolled: !isEnrolled, enrolled: isEnrolled ? o.enrolled - 1 : o.enrolled + 1 } : o));
    try {
      await fetch(`/api/volunteer/${id}/enroll`, { method: 'POST' });
    } catch {
      setItems((prev) => prev.map((o) => o.id === id ? { ...o, isEnrolled, enrolled: isEnrolled ? o.enrolled + 1 : o.enrolled - 1 } : o));
    } finally {
      setToggling(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date) return;
    setSaving(true);
    try {
      const res = await fetch('/api/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, spots: Number(form.spots) }),
      });
      if (res.ok) { await fetchItems(); setShowCreate(false); setForm({ title: '', description: '', category: '', address: '', date: '', spots: '10', organizerName: '' }); }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <button onClick={() => setShowCreate(true)} className="w-full py-3 border-2 border-dashed border-amber-300 text-amber-600 rounded-2xl text-sm font-medium hover:bg-amber-50 transition-colors flex items-center justify-center gap-2">
        <Plus size={16} /> Publicar Oportunidade
      </button>

      {loading && <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-amber-400" /></div>}
      {!loading && items.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-2">🤝</p>
          <p className="text-sm">Nenhuma oportunidade disponível.</p>
        </div>
      )}

      {items.map((op) => {
        const spotsLeft = op.spots - op.enrolled;
        return (
          <div key={op.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-800">{op.title}</h3>
                {op.category && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{op.category}</span>}
              </div>
              <p className="text-xs font-semibold text-slate-700 flex-shrink-0">
                {new Date(op.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </p>
            </div>
            {op.description && <p className="text-sm text-slate-600">{op.description}</p>}
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {op.address && <span>📍 {op.address}</span>}
              {op.organizerName && <span>🏢 {op.organizerName}</span>}
              <span className={spotsLeft <= 2 ? 'text-rose-500 font-semibold' : ''}>🎟️ {spotsLeft} vagas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, (op.enrolled / op.spots) * 100)}%` }} />
              </div>
              <button
                onClick={() => toggleEnroll(op.id, op.isEnrolled)}
                disabled={toggling === op.id}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-1 ${
                  op.isEnrolled ? 'bg-green-100 text-green-700' : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                {toggling === op.id ? <Loader2 size={14} className="animate-spin" /> : op.isEnrolled ? '✓ Inscrito' : 'Inscrever-se'}
              </button>
            </div>
          </div>
        );
      })}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="w-full bg-white rounded-t-3xl p-6 space-y-3 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Publicar Oportunidade</h3>
              <button type="button" onClick={() => setShowCreate(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            {[
              { key: 'title', label: 'Título *', placeholder: 'Ex.: Distribuição de Alimentos' },
              { key: 'category', label: 'Categoria', placeholder: 'Social, Educação, Saúde...' },
              { key: 'address', label: 'Local', placeholder: 'Endereço ou nome do local' },
              { key: 'organizerName', label: 'Organizador', placeholder: 'Nome da instituição' },
              { key: 'spots', label: 'Nº de vagas', placeholder: '10' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
                <input value={(form as any)[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} placeholder={placeholder} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Data e hora *</label>
              <input type="datetime-local" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
              <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>
            <button type="submit" disabled={saving || !form.title || !form.date} className="w-full py-3 bg-amber-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-600 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {saving ? 'Publicando...' : 'Publicar'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── IA Pastoral Tab ──────────────────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  'Como posso fortalecer minha fé nos momentos difíceis?',
  'O que a Bíblia diz sobre ansiedade?',
  'Como perdoar alguém que me magoou?',
  'Ore por mim, estou passando por um momento difícil.',
];

function PastoralTab() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/teos' }),
  });
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function submit(text: string) {
    if (!text.trim() || isLoading) return;
    sendMessage({ role: 'user', parts: [{ type: 'text', text: text.trim() }] });
    setInput('');
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 180px)' }}>
      {/* messages area */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100 text-center space-y-2">
              <p className="text-3xl">🙏</p>
              <p className="font-bold text-indigo-900 text-base">Teos — Assistente Bíblico</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Estou aqui para estudar a Palavra com você, oferecer orientação espiritual e oração. Como posso ajudá-lo hoje?
              </p>
            </div>
            <p className="text-xs text-slate-400 font-medium px-1">Sugestões:</p>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => submit(q)}
                  className="w-full text-left bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <span className="text-xl mr-2 mt-1 flex-shrink-0">🙏</span>
            )}
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
              }`}
            >
              {m.parts.map((part, i) =>
                part.type === 'text' ? <span key={i}>{part.text}</span> : null
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <span className="text-xl mr-2 mt-1">🙏</span>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* input */}
      <form
        onSubmit={(e) => { e.preventDefault(); submit(input); }}
        className="flex gap-2 pt-3 border-t border-slate-200"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(input); } }}
          placeholder="Escreva sua pergunta ou pedido de oração..."
          disabled={isLoading}
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-indigo-600 text-white rounded-xl p-2.5 hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'celulas',       label: '🏠 Grupos' },
  { id: 'churches',     label: '🏛️ Comunidades' },
  { id: 'prayer',       label: '🙏 Oração' },
  { id: 'testimonials', label: '🙌 Testemunhos' },
  { id: 'volunteer',    label: '🤝 Voluntário' },
  { id: 'pastoral',     label: '🤖 Pastoral' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function ComunidadePage() {
  const { data: session } = useSession();
  const myId = session?.user?.id ?? '';
  const [activeTab, setActiveTab] = useState<TabId>('celulas');

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-24">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex gap-1 overflow-x-auto px-3 py-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-3 py-2 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {activeTab === 'celulas'       && <CelulasTab />}
        {activeTab === 'churches'      && <CommunitiesTab myId={myId} />}
        {activeTab === 'prayer'        && <PrayerTab />}
        {activeTab === 'testimonials'  && <TestimonialsTab myId={myId} />}
        {activeTab === 'volunteer'     && <VolunteerTab />}
        {activeTab === 'pastoral'      && <PastoralTab />}
      </div>

    </div>
  );
}
