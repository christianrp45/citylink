'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, CalendarDays, HandHeart, AlertTriangle,
  ChevronLeft, Loader2, TrendingUp, UserX,
} from 'lucide-react';

type MeetingHistory = {
  id: string;
  scheduledAt: string;
  attendedCount: number;
  totalRsvp: number;
  attendanceRate: number;
};

type InactiveMember = {
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  role: string;
  joinedAt: string;
};

type CellData = {
  cell: {
    id: string;
    name: string;
    neighborhood: string | null;
    meetingDay: string | null;
    meetingTime: string | null;
  };
  memberCount: number;
  activePrayerCount: number;
  nextMeeting: { id: string; scheduledAt: string; address: string | null } | null;
  meetingsHistory: MeetingHistory[];
  inactiveMembers: InactiveMember[];
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short',
  });
}

function avgRate(history: MeetingHistory[]) {
  if (!history.length) return 0;
  return Math.round(history.reduce((s, m) => s + m.attendanceRate, 0) / history.length);
}

function CellDashboard({ data }: { data: CellData }) {
  const avg = avgRate(data.meetingsHistory);
  const maxRate = Math.max(...data.meetingsHistory.map((m) => m.attendanceRate), 1);

  return (
    <div className="space-y-4">
      {/* Nome da célula */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-800 text-base">{data.cell.name}</h2>
          {data.cell.neighborhood && (
            <p className="text-xs text-slate-400">{data.cell.neighborhood}</p>
          )}
        </div>
        <Link
          href={`/mdc/cells/${data.cell.id}`}
          className="text-xs text-indigo-600 font-semibold hover:underline"
        >
          Ver célula →
        </Link>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center mb-2">
            <Users size={16} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{data.memberCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Membros ativos</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center mb-2">
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{avg}%</p>
          <p className="text-xs text-slate-500 mt-0.5">Presença média</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center mb-2">
            <HandHeart size={16} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{data.activePrayerCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Pedidos de oração</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center mb-2">
            <CalendarDays size={16} className="text-amber-600" />
          </div>
          <p className="text-sm font-bold text-slate-800 leading-tight">
            {data.nextMeeting
              ? formatDate(data.nextMeeting.scheduledAt)
              : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Próxima reunião</p>
        </div>
      </div>

      {/* Histórico de presença */}
      {data.meetingsHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-500" />
            Histórico de presença
          </p>
          <div className="space-y-2">
            {data.meetingsHistory.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-16 flex-shrink-0">
                  {formatDate(m.scheduledAt)}
                </span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${(m.attendanceRate / maxRate) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-bold w-10 text-right flex-shrink-0 ${
                  m.attendanceRate >= 70
                    ? 'text-emerald-600'
                    : m.attendanceRate >= 40
                    ? 'text-amber-600'
                    : 'text-red-500'
                }`}>
                  {m.attendanceRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Membros inativos */}
      {data.inactiveMembers.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-1.5">
            <UserX size={14} className="text-red-400" />
            Membros ausentes (últimas {Math.min(3, data.meetingsHistory.length)} reuniões)
          </p>
          <div className="space-y-2">
            {data.inactiveMembers.map((m) => (
              <div key={m.userId} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex-shrink-0 overflow-hidden">
                  {m.userAvatar ? (
                    <img src={m.userAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                      {m.userName?.[0]?.toUpperCase() ?? '?'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {m.userName ?? 'Membro'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Desde {formatDate(m.joinedAt)}
                  </p>
                </div>
                <Link
                  href={`/messages/${m.userId}`}
                  className="text-xs text-indigo-600 font-semibold hover:underline flex-shrink-0"
                >
                  Contato
                </Link>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
            💡 Considere entrar em contato para entender o que aconteceu e encorajar a volta.
          </p>
        </div>
      )}

      {data.meetingsHistory.length === 0 && (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
          <AlertTriangle size={24} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Nenhuma reunião concluída ainda.</p>
          <p className="text-xs text-slate-400 mt-1">
            Encerre reuniões para ver o histórico de presença aqui.
          </p>
        </div>
      )}
    </div>
  );
}

export default function LeaderDashboardPage() {
  const [data, setData] = useState<CellData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCellIdx, setActiveCellIdx] = useState(0);

  useEffect(() => {
    fetch('/api/mdc/dashboard')
      .then((r) => {
        if (!r.ok) throw new Error('Você não lidera nenhuma célula');
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 to-purple-800 px-4 pt-5 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/mdc" className="text-white/70 hover:text-white">
            <ChevronLeft size={22} />
          </Link>
          <div>
            <h1 className="text-white font-bold text-lg">Dashboard do Líder</h1>
            <p className="text-indigo-200 text-xs">Visão geral das suas células</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 pb-24 space-y-4">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-indigo-500" />
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16 space-y-2">
            <p className="text-4xl">🏠</p>
            <p className="text-slate-500 text-sm">{error}</p>
            <Link href="/mdc" className="text-indigo-600 text-sm font-semibold">
              Voltar para MDC
            </Link>
          </div>
        )}

        {!loading && data && data.length > 0 && (
          <>
            {/* Tabs de células (se mais de uma) */}
            {data.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {data.map((d, i) => (
                  <button
                    key={d.cell.id}
                    onClick={() => setActiveCellIdx(i)}
                    className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                      activeCellIdx === i
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    {d.cell.name}
                  </button>
                ))}
              </div>
            )}

            <CellDashboard data={data[activeCellIdx]} />
          </>
        )}
      </div>
    </div>
  );
}
