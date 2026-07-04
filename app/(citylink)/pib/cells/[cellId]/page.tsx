'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BottomNav } from '@/components/citylink-bottom-nav';

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

type CellDetail = {
  id: string;
  name: string;
  description?: string;
  leaderId: string;
  leaderName: string;
  neighborhood?: string;
  address?: string;
  meetingDay?: number;
  meetingTime?: string;
  targetAudience: string;
  maxMembers: number;
  memberCount: number;
  isOpen: boolean;
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
  const [cell, setCell] = useState<CellDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState('');

  useEffect(() => {
    if (!cellId) return;
    fetch(`/api/pib/cells/${cellId}`)
      .then((r) => r.json())
      .then((data) => { setCell(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [cellId]);

  const handleJoin = async () => {
    setJoining(true);
    const res = await fetch(`/api/pib/cells/${cellId}/join`, { method: 'POST' });
    const data = await res.json();
    setJoinMsg(data.message ?? data.error ?? '');
    setJoining(false);
  };

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
          <Link href="/pib/cells" className="text-indigo-200 text-sm hover:text-white">
            ← Células
          </Link>
          <h1 className="text-2xl font-bold mt-3">{cell.name}</h1>
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
                href={`/pib/cells/${cellId}/meeting/${nextMeeting.id}`}
                className="flex-1 text-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
              >
                Ver encontro
              </Link>
              <Link
                href={`/pib/cells/${cellId}/meeting/${nextMeeting.id}/guide`}
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
              href={`/pib/cells/${cellId}/meeting/new`}
              className="inline-block mt-2 text-sm text-indigo-600 font-medium hover:underline"
            >
              + Agendar encontro
            </Link>
          </div>
        )}

        {/* Ações rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/pib/cells/${cellId}/prayer`}
            className="bg-white rounded-xl p-4 shadow-sm text-center hover:shadow-md transition"
          >
            <p className="text-2xl">🙏</p>
            <p className="font-medium text-gray-800 mt-1 text-sm">Pedidos de Oração</p>
          </Link>
          <Link
            href={`/pib/cells/${cellId}/meeting/new`}
            className="bg-white rounded-xl p-4 shadow-sm text-center hover:shadow-md transition"
          >
            <p className="text-2xl">📅</p>
            <p className="font-medium text-gray-800 mt-1 text-sm">Agendar Encontro</p>
          </Link>
        </div>

        {/* Participar */}
        {cell.isOpen && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-3">
              Quer participar desta célula?
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

      <BottomNav />
    </div>
  );
}
