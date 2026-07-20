'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import QRCode from 'react-qr-code';
import { Share2, QrCode, X } from 'lucide-react';

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

type CellDetail = {
  id: string;
  name: string;
  description?: string;
  leaderId: string;
  coLeaderId?: string;
  leaderName: string;
  neighborhood?: string;
  address?: string;
  meetingDay?: number;
  meetingTime?: string;
  targetAudience: string;
  maxMembers: number;
  memberCount: number;
  isOpen: boolean;
  entryMode: "open" | "invite_only";
  members: { userId: string; userEmail: string; role: string }[];
  meetings: {
    id: string;
    scheduledAt: string;
    status: string;
    address?: string;
  }[];
};

export default function CellDetailPage() {
  const { cellId } = useParams<{ cellId: string }>();
  const { data: session } = useSession();
  const [cell, setCell] = useState<CellDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState('');

  // Estado do modal de convite
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Toggle de entryMode (líder)
  const [entryModeLoading, setEntryModeLoading] = useState(false);

  useEffect(() => {
    if (!cellId) return;
    fetch(`/api/mdc/cells/${cellId}`)
      .then((r) => r.json())
      .then((data) => { setCell(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [cellId]);

  const handleJoin = async () => {
    setJoining(true);
    const res = await fetch(`/api/mdc/cells/${cellId}/join`, { method: 'POST' });
    const data = await res.json();
    setJoinMsg(data.message ?? data.error ?? '');
    setJoining(false);
  };

  const handleGenerateInvite = async () => {
    setInviteLoading(true);
    try {
      const res = await fetch('/api/invite/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'cell', targetId: cellId }),
      });
      const data = await res.json();
      if (data.code) {
        setInviteCode(data.code);
      }
    } catch {
      // silencioso — o líder verá o botão ainda ativo
    } finally {
      setInviteLoading(false);
    }
  };

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  const handleRenameSave = async () => {
    if (!nameInput.trim() || !cell) return;
    setNameSaving(true);
    try {
      const res = await fetch(`/api/mdc/cells/${cellId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      if (res.ok) {
        setCell((prev) => prev ? { ...prev, name: nameInput.trim() } : prev);
        setEditingName(false);
      }
    } finally {
      setNameSaving(false);
    }
  };

  const handleToggleEntryMode = async () => {
    if (!cell) return;
    const next = cell.entryMode === "open" ? "invite_only" : "open";
    setEntryModeLoading(true);
    try {
      const res = await fetch(`/api/mdc/cells/${cellId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryMode: next }),
      });
      if (res.ok) {
        setCell((prev) => prev ? { ...prev, entryMode: next } : prev);
      }
    } finally {
      setEntryModeLoading(false);
    }
  };

  const handleCopyInvite = () => {
    if (!inviteCode) return;
    const url = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(url);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const isLeader =
    session?.user?.id &&
    cell &&
    (cell.leaderId === session.user.id || cell.coLeaderId === session.user.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando célula...</p>
      </div>
    );
  }

  if (!cell) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Célula não encontrada.</p>
      </div>
    );
  }

  const nextMeeting = cell.meetings.find((m) => m.status === 'scheduled');

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white px-4 pt-6 pb-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/mdc/cells" className="text-indigo-200 text-sm hover:text-white">
            ← Células
          </Link>
          {editingName ? (
            <div className="flex items-center gap-2 mt-3">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg text-gray-900 text-lg font-bold focus:outline-none"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSave(); if (e.key === 'Escape') setEditingName(false); }}
              />
              <button onClick={handleRenameSave} disabled={nameSaving} className="px-3 py-1.5 bg-white text-indigo-700 rounded-lg text-sm font-bold">
                {nameSaving ? '...' : '✓'}
              </button>
              <button onClick={() => setEditingName(false)} className="px-3 py-1.5 bg-white/20 text-white rounded-lg text-sm">✕</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-3">
              <h1 className="text-2xl font-bold">{cell.name}</h1>
              {isLeader && (
                <button onClick={() => { setNameInput(cell.name); setEditingName(true); }} className="text-indigo-300 hover:text-white text-sm" title="Renomear">✏️</button>
              )}
            </div>
          )}
          {cell.description && (
            <p className="text-indigo-200 mt-1 text-sm">{cell.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {cell.neighborhood && (
              <span className="text-xs px-2 py-1 bg-white/20 rounded-full">
                📍 {cell.neighborhood}
              </span>
            )}
            {cell.meetingDay !== undefined && cell.meetingDay !== null && (
              <span className="text-xs px-2 py-1 bg-white/20 rounded-full">
                📅 {WEEKDAYS[cell.meetingDay]}{cell.meetingTime ? ` às ${cell.meetingTime}` : ''}
              </span>
            )}
            <span className="text-xs px-2 py-1 bg-white/20 rounded-full">
              👥 {cell.memberCount}/{cell.maxMembers} membros
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 space-y-4">
        {/* Próximo encontro */}
        {nextMeeting ? (
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-indigo-500">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              Próximo encontro
            </p>
            <p className="font-semibold text-gray-900">
              {new Date(nextMeeting.scheduledAt).toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
              {' às '}
              {new Date(nextMeeting.scheduledAt).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {nextMeeting.address && (
              <p className="text-sm text-gray-500 mt-1">📍 {nextMeeting.address}</p>
            )}
            <div className="flex gap-2 mt-3">
              <Link
                href={`/mdc/cells/${cellId}/meeting/${nextMeeting.id}`}
                className="flex-1 text-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
              >
                Ver encontro
              </Link>
              <Link
                href={`/mdc/cells/${cellId}/meeting/${nextMeeting.id}/guide`}
                className="flex-1 text-center px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition"
              >
                📖 Roteiro
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-gray-500 text-sm">Nenhum encontro agendado.</p>
            <Link
              href={`/mdc/cells/${cellId}/meeting/new`}
              className="inline-block mt-2 text-sm text-indigo-600 font-medium hover:underline"
            >
              + Agendar encontro
            </Link>
          </div>
        )}

        {/* Ações rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/mdc/cells/${cellId}/prayer`}
            className="bg-white rounded-xl p-4 shadow-sm text-center hover:shadow-md transition"
          >
            <p className="text-2xl">🙏</p>
            <p className="font-medium text-gray-800 mt-1 text-sm">Oração</p>
          </Link>
          <Link
            href={`/mdc/cells/${cellId}/chat`}
            className="bg-white rounded-xl p-4 shadow-sm text-center hover:shadow-md transition"
          >
            <p className="text-2xl">💬</p>
            <p className="font-medium text-gray-800 mt-1 text-sm">Chat</p>
          </Link>
          <Link
            href={`/mdc/cells/${cellId}/meeting/new`}
            className="bg-white rounded-xl p-4 shadow-sm text-center hover:shadow-md transition"
          >
            <p className="text-2xl">📅</p>
            <p className="font-medium text-gray-800 mt-1 text-sm">Agendar</p>
          </Link>
          <Link
            href={`/mdc/cells/${cellId}/history`}
            className="bg-white rounded-xl p-4 shadow-sm text-center hover:shadow-md transition"
          >
            <p className="text-2xl">📚</p>
            <p className="font-medium text-gray-800 mt-1 text-sm">Histórico</p>
          </Link>
        </div>

        {/* Ranking da Célula */}
        <Link
          href={`/ranking?cellId=${cellId}`}
          className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-slate-100 hover:shadow-md transition"
        >
          <span className="text-2xl">🏆</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 text-sm">Ranking da Célula</p>
            <p className="text-slate-500 text-xs">Top membros por pontos esta semana</p>
          </div>
          <span className="text-slate-400 text-lg">›</span>
        </Link>

        {/* Dashboard do Líder */}
        {isLeader && (
          <Link
            href="/mdc/dashboard"
            className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl px-4 py-3.5 shadow-sm active:scale-95 transition-transform"
          >
            <span className="text-2xl">📊</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">Dashboard do Líder</p>
              <p className="text-indigo-200 text-xs leading-tight">
                Presença, membros inativos e pedidos de oração
              </p>
            </div>
            <span className="text-white/70 text-lg">›</span>
          </Link>
        )}

        {/* Botão Convidar — visível apenas para líder / co-líder */}
        {isLeader && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-800 mb-2">Convidar pessoas</p>
            <p className="text-xs text-gray-500 mb-3">
              Gere um link de convite para compartilhar via WhatsApp, Instagram ou onde preferir.
            </p>
            {!inviteCode ? (
              <button
                onClick={handleGenerateInvite}
                disabled={inviteLoading}
                className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {inviteLoading ? 'Gerando...' : '🔗 Gerar link de convite'}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                  <span className="font-mono text-sm text-slate-700 flex-1 truncate">
                    {typeof window !== 'undefined' ? `${window.location.origin}/join/${inviteCode}` : `/join/${inviteCode}`}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyInvite}
                    className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                  >
                    {inviteCopied ? '✓ Copiado!' : 'Copiar link'}
                  </button>
                  <button
                    onClick={() => setShowQR(true)}
                    className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                    title="Ver QR Code"
                  >
                    <QrCode size={16} />
                  </button>
                  <button
                    onClick={async () => {
                      const url = `${window.location.origin}/join/${inviteCode}`;
                      if (navigator.share) {
                        await navigator.share({ title: cell?.name ?? 'Célula', text: 'Entre na minha célula no Emetis!', url });
                      }
                    }}
                    className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                    title="Compartilhar"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    onClick={() => { setInviteCode(null); setInviteCopied(false); }}
                    className="px-3 py-2 text-gray-500 text-sm rounded-lg hover:bg-gray-100 transition"
                  >
                    Novo
                  </button>
                </div>
                <p className="text-xs text-gray-400">Expira em 7 dias</p>
              </div>
            )}
          </div>
        )}

        {/* Participar */}
        {cell.entryMode === "open" ? (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-3">
              Este grupo está com entrada livre.
            </p>
            {joinMsg ? (
              <p className="text-sm font-medium text-emerald-600">{joinMsg}</p>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {joining ? 'Entrando...' : '👋 Quero participar desta célula'}
              </button>
            )}
          </div>
        ) : (
          <div className="bg-amber-50 rounded-xl shadow-sm p-4 border border-amber-100">
            <p className="text-sm font-medium text-amber-800 mb-1">Acesso via convite</p>
            <p className="text-xs text-amber-700">
              Este grupo só aceita novos membros por meio de um link de convite.
              Peça a alguém que já participa para te enviar o link.
            </p>
          </div>
        )}

        {/* Toggle entryMode — apenas para líder */}
        {isLeader && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Modo de entrada</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {cell.entryMode === "open"
                    ? "Qualquer pessoa pode entrar diretamente"
                    : "Somente via link de convite"}
                </p>
              </div>
              <button
                onClick={handleToggleEntryMode}
                disabled={entryModeLoading}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                  cell.entryMode === "open" ? "bg-emerald-500" : "bg-gray-300"
                } disabled:opacity-50`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    cell.entryMode === "open" ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Membros */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="font-semibold text-gray-900 mb-3">
            Membros ({cell.memberCount})
          </p>
          <div className="space-y-2">
            {cell.members.slice(0, 8).map((m) => (
              <div key={m.userId} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                  {m.userEmail?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{m.userEmail}</p>
                </div>
                {m.role === 'leader' && (
                  <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                    Líder
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal QR Code do convite */}
      {showQR && inviteCode && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(15,23,42,0.7)' }}
          onClick={() => setShowQR(false)}
        >
          <div
            className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-lg">QR Code do Grupo</h2>
              <button onClick={() => setShowQR(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <p className="text-sm text-slate-500 text-center">
              Mostre este código para alguém entrar em <strong>{cell?.name}</strong>
            </p>
            <div className="flex justify-center p-4 bg-white rounded-2xl border border-slate-100">
              <QRCode
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/join/${inviteCode}`}
                size={200}
              />
            </div>
            <p className="text-xs text-slate-400 text-center">Expira em 7 dias</p>
            <button
              onClick={() => setShowQR(false)}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-2xl"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
