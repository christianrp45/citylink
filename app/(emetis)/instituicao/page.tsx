'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, BookOpen, ChevronRight, Plus, Copy, Share2, Check,
  Loader2, Building2, UserCheck, UserX, Crown, Star, Zap, Trash2
} from 'lucide-react';

// ── Tipos ──────────────────────────────────────────────────────────────────────
interface MemberProgress {
  userId: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: string;
  joinedAt: string;
  communityId: string;
  formacaoProgress: Record<string, number>; // caderno → nº lições concluídas
  cells: { cellId: string; cellName: string; role: string }[];
}

interface Community {
  id: string;
  name: string;
}

interface InviteInfo {
  code: string;
  link: string;
}

const CADERNO_LABELS: Record<string, { label: string; total: number }> = {
  'minha-historia': { label: 'Minha História', total: 8 },
  'minha-fe': { label: 'Minha Fé', total: 8 },
  'minha-familia': { label: 'Minha Família', total: 8 },
  'minha-comunidade': { label: 'Minha Comunidade', total: 8 },
};

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  owner: { label: 'Fundador', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  admin: { label: 'Admin', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  moderator: { label: 'Moderador', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  member: { label: 'Membro', color: 'text-slate-600 bg-slate-50 border-slate-200' },
  leader: { label: 'Líder', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  'co-leader': { label: 'Co-líder', color: 'text-violet-600 bg-violet-50 border-violet-200' },
};

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-400 w-6 text-right">{pct}%</span>
    </div>
  );
}

export default function InstituicaoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MemberProgress[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string>('all');
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'cells' | 'progress'>('members');
  const [deletingCommunity, setDeletingCommunity] = useState(false);

  useEffect(() => {
    fetch('/api/admin/members-progress')
      .then((r) => r.json())
      .then((data) => {
        setMembers(data.members ?? []);
        setCommunities(data.communities ?? []);
        if (data.communities?.length === 0) {
          router.push('/onboarding/instituicao');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const filteredMembers =
    selectedCommunity === 'all'
      ? members
      : members.filter((m) => m.communityId === selectedCommunity);

  const totalLessons = filteredMembers.reduce((sum, m) => {
    return sum + Object.values(m.formacaoProgress).reduce((a, b) => a + b, 0);
  }, 0);

  const leaders = filteredMembers.filter((m) =>
    m.cells.some((c) => ['leader', 'co-leader'].includes(c.role))
  );

  async function generateInvite(communityId: string) {
    setGeneratingInvite(true);
    try {
      const res = await fetch('/api/invite/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'community', targetId: communityId, role: 'member', expiresInDays: 365 }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const link = `${window.location.origin}/entrar/${data.code}`;
      setInvite({ code: data.code, link });
    } catch {
      alert('Erro ao gerar convite. Tente novamente.');
    } finally {
      setGeneratingInvite(false);
    }
  }

  function handleCopy() {
    if (!invite) return;
    navigator.clipboard.writeText(invite.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDeleteCommunity(communityId: string, communityName: string) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a comunidade "${communityName}"?\n\nEsta ação é irreversível. Todos os membros serão removidos e as células serão desvinculadas.`
    );
    if (!confirmed) return;
    setDeletingCommunity(true);
    try {
      const res = await fetch(`/api/communities/${communityId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      // Atualiza a lista local e redireciona se não sobrar nenhuma
      const remaining = communities.filter((c) => c.id !== communityId);
      setCommunities(remaining);
      if (remaining.length === 0) {
        router.push('/onboarding/instituicao');
      } else {
        setSelectedCommunity('all');
      }
    } catch {
      alert('Erro ao excluir comunidade. Tente novamente.');
    } finally {
      setDeletingCommunity(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 size={24} className="animate-spin text-blue-500" />
      </div>
    );
  }

  const activeCommunityId =
    selectedCommunity === 'all' ? communities[0]?.id : selectedCommunity;

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E3FA0] to-[#0B1D4E] px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-200 text-xs font-medium">Painel da Instituição</p>
            <h1 className="text-white font-bold text-lg">
              {communities[0]?.name ?? 'Minha Comunidade'}
            </h1>
          </div>
          <Link
            href="/mdc/cells/new"
            className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-white/30 transition-colors"
          >
            <Plus size={14} />
            Nova célula
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 rounded-xl p-2.5 text-center">
            <p className="text-white font-bold text-xl">{filteredMembers.length}</p>
            <p className="text-blue-200 text-[10px]">Membros</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 text-center">
            <p className="text-white font-bold text-xl">{leaders.length}</p>
            <p className="text-blue-200 text-[10px]">Líderes</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 text-center">
            <p className="text-white font-bold text-xl">{totalLessons}</p>
            <p className="text-blue-200 text-[10px]">Lições feitas</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-2 space-y-4 pt-4">
        {/* Seletor de comunidade */}
        {communities.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCommunity('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedCommunity === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              Todas
            </button>
            {communities.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCommunity(c.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedCommunity === c.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Convite */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Link de convite</p>
            <button
              onClick={() => activeCommunityId && generateInvite(activeCommunityId)}
              disabled={generatingInvite}
              className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline disabled:opacity-50"
            >
              {generatingInvite ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              Gerar novo
            </button>
          </div>

          {invite ? (
            <div className="space-y-2">
              <div className="bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 flex items-center gap-2">
                <span className="text-xs text-slate-600 flex-1 truncate font-mono">{invite.link}</span>
                <button onClick={handleCopy} className="flex-shrink-0 text-blue-600">
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-blue-50 rounded-xl border border-blue-100 px-3 py-1.5 text-center">
                  <p className="text-[10px] text-blue-400">Código</p>
                  <p className="font-bold tracking-widest text-blue-700 text-sm">{invite.code}</p>
                </div>
                <button
                  onClick={() => navigator.share?.({ title: 'Convite', url: invite.link }) ?? handleCopy()}
                  className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-4 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Share2 size={13} />
                  Compartilhar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Clique em "Gerar novo" para criar um link de convite.</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {([
            { key: 'members', label: 'Membros', Icon: Users },
            { key: 'progress', label: 'Estudos', Icon: BookOpen },
            { key: 'cells', label: 'Células', Icon: Crown },
          ] as const).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === key ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Membros */}
        {activeTab === 'members' && (
          <div className="space-y-2">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                Nenhum membro ainda. Compartilhe o link de convite!
              </div>
            ) : (
              filteredMembers.map((m) => {
                const roleInfo = ROLE_LABELS[m.role] ?? ROLE_LABELS.member;
                const totalLessonsUser = Object.values(m.formacaoProgress).reduce((a, b) => a + b, 0);
                return (
                  <div key={m.userId} className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {m.avatar
                        ? <img src={m.avatar} alt={m.name ?? ''} className="w-full h-full object-cover" />
                        : <span className="text-blue-600 font-bold text-sm">{(m.name ?? m.email)[0].toUpperCase()}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-slate-800 truncate">{m.name ?? m.email}</p>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${roleInfo.color}`}>
                          {roleInfo.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {m.cells.length > 0
                          ? m.cells.map((c) => c.cellName).join(', ')
                          : 'Sem célula'
                        } · {totalLessonsUser} lições
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab: Progresso nos estudos */}
        {activeTab === 'progress' && (
          <div className="space-y-3">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                Nenhum membro para exibir progresso.
              </div>
            ) : (
              filteredMembers.map((m) => (
                <div key={m.userId} className="bg-white rounded-xl border border-slate-100 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {m.avatar
                        ? <img src={m.avatar} alt="" className="w-full h-full object-cover" />
                        : <span className="text-blue-600 font-bold text-[10px]">{(m.name ?? m.email)[0].toUpperCase()}</span>
                      }
                    </div>
                    <p className="text-sm font-semibold text-slate-800 truncate">{m.name ?? m.email}</p>
                  </div>
                  {Object.entries(CADERNO_LABELS).map(([slug, { label, total }]) => {
                    const done = m.formacaoProgress[slug] ?? 0;
                    return (
                      <div key={slug}>
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[10px] text-slate-500">{label}</p>
                          <p className="text-[10px] text-slate-400">{done}/{total}</p>
                        </div>
                        <ProgressBar value={done} max={total} />
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        )}

        {/* Excluir comunidade */}
        <button
          onClick={() => {
            const target = selectedCommunity !== 'all'
              ? communities.find((c) => c.id === selectedCommunity)
              : communities[0];
            if (target) handleDeleteCommunity(target.id, target.name);
          }}
          disabled={deletingCommunity}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-400 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {deletingCommunity
            ? <Loader2 size={13} className="animate-spin" />
            : <Trash2 size={13} />}
          Excluir comunidade
        </button>

        {/* Tab: Células */}
        {activeTab === 'cells' && (
          <div className="space-y-3">
            {/* Líderes */}
            {leaders.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-100 p-3 space-y-2">
                <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Crown size={12} className="text-yellow-500" /> Líderes ativos
                </p>
                {leaders.map((m) => (
                  <div key={m.userId} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                      {m.avatar
                        ? <img src={m.avatar} alt="" className="w-full h-full object-cover" />
                        : <span className="text-purple-600 font-bold text-[10px]">{(m.name ?? m.email)[0].toUpperCase()}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{m.name ?? m.email}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {m.cells.filter((c) => ['leader', 'co-leader'].includes(c.role)).map((c) => `${c.cellName} (${c.role === 'leader' ? 'líder' : 'co-líder'})`).join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/mdc/cells"
              className="w-full flex items-center justify-between bg-white rounded-xl border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className="flex items-center gap-2"><Users size={15} className="text-indigo-500" />Gerenciar células</span>
              <ChevronRight size={16} className="text-slate-400" />
            </Link>
            <Link
              href="/mdc/cells/new"
              className="w-full flex items-center justify-between bg-blue-50 rounded-xl border border-blue-100 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <span className="flex items-center gap-2"><Plus size={15} />Criar nova célula</span>
              <ChevronRight size={16} className="text-blue-400" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
