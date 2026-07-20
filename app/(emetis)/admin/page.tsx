'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  HandHeart,
  TrendingUp,
  AlertCircle,
  CalendarDays,
  ChevronRight,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type CommunityInfo = {
  id: string;
  name: string;
  type: string;
};

type RecentMeeting = {
  id: string;
  scheduledAt: string;
  attendedCount: number;
  totalRsvp: number;
  attendanceRate: number;
};

type CellStat = {
  cell: {
    id: string;
    name: string;
    neighborhood: string | null;
    meetingDay: number | null;
    meetingTime: string | null;
  };
  leader: { name: string | null; avatar: string | null } | null;
  memberCount: number;
  avgAttendance: number | null;
  activePrayerCount: number;
  inactiveCount: number;
  nextMeeting: { scheduledAt: string } | null;
  recentMeetings: RecentMeeting[];
};

type DashboardData = {
  communities: CommunityInfo[];
  cells: CellStat[];
  totals: {
    totalCells: number;
    totalMembers: number;
    totalPrayerRequests: number;
    totalInactive: number;
    avgAttendance: number | null;
  } | null;
};

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function attendanceColor(rate: number) {
  if (rate >= 70) return 'text-green-600 bg-green-50';
  if (rate >= 40) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AdminPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [activeCommunity, setActiveCommunity] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin');
        if (res.status === 403) { setForbidden(true); return; }
        if (res.ok) {
          const json: DashboardData = await res.json();
          setData(json);
          if (json.communities.length > 0) setActiveCommunity(json.communities[0].id);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  if (forbidden || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-4">
        <ShieldCheck size={48} className="text-slate-300" />
        <h2 className="font-bold text-slate-700">Acesso restrito</h2>
        <p className="text-sm text-slate-500">
          Esta área é exclusiva para administradores de comunidades.
          Se você é pastor ou líder, peça acesso ao suporte Emetis.
        </p>
        <Link href="/mdc" className="text-sm text-indigo-600 font-semibold">
          Ir para Grupos →
        </Link>
      </div>
    );
  }

  const { communities, cells, totals } = data;

  // Filtrar células pela comunidade ativa
  const filteredCells = activeCommunity
    ? cells.filter((cs) => cs.cell.id !== undefined) // todas (não há filtro por comunidade no stat)
    : cells;

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 to-purple-800 px-4 pt-10 pb-6">
        <p className="text-indigo-300 text-xs uppercase tracking-widest mb-1">Emetis</p>
        <h1 className="text-white font-bold text-xl">Dashboard Pastoral</h1>

        {/* Tabs de comunidade */}
        {communities.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {communities.map((com) => (
              <button
                key={com.id}
                onClick={() => setActiveCommunity(com.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeCommunity === com.id
                    ? 'bg-white text-indigo-700'
                    : 'bg-white/20 text-white'
                }`}
              >
                {com.name}
              </button>
            ))}
          </div>
        )}
        {communities.length === 1 && (
          <p className="text-indigo-200 text-sm mt-1">{communities[0].name}</p>
        )}
      </div>

      {/* Cards de totais */}
      {totals && (
        <div className="px-4 -mt-4 grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Membros</p>
              <p className="text-xl font-bold text-slate-800">{totals.totalMembers}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Presença média</p>
              <p className="text-xl font-bold text-slate-800">
                {totals.avgAttendance !== null ? `${totals.avgAttendance}%` : '—'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <HandHeart size={18} className="text-rose-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Pedidos de oração</p>
              <p className="text-xl font-bold text-slate-800">{totals.totalPrayerRequests}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertCircle size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Inativos</p>
              <p className="text-xl font-bold text-slate-800">{totals.totalInactive}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de células */}
      <div className="px-4 space-y-3">
        <h2 className="font-bold text-slate-700 text-sm">
          {cells.length} célula{cells.length !== 1 ? 's' : ''}
        </h2>

        {cells.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <p className="text-sm">Nenhuma célula vinculada a esta comunidade.</p>
          </div>
        )}

        {filteredCells.map(({ cell: c, leader, memberCount, avgAttendance, activePrayerCount, inactiveCount, nextMeeting, recentMeetings }) => (
          <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Cabeçalho da célula */}
            <div className="px-4 py-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-slate-800 truncate">{c.name}</p>
                <p className="text-xs text-slate-500">
                  {leader?.name ?? 'Líder não definido'}
                  {c.neighborhood ? ` · ${c.neighborhood}` : ''}
                </p>
              </div>
              {avgAttendance !== null && (
                <span className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full ${attendanceColor(avgAttendance)}`}>
                  {avgAttendance}%
                </span>
              )}
            </div>

            {/* Stats linha */}
            <div className="px-4 pb-3 flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Users size={12} className="text-blue-400" /> {memberCount} membros
              </span>
              {activePrayerCount > 0 && (
                <span className="flex items-center gap-1">
                  <HandHeart size={12} className="text-rose-400" /> {activePrayerCount} orações
                </span>
              )}
              {inactiveCount > 0 && (
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <AlertCircle size={12} /> {inactiveCount} inativos
                </span>
              )}
            </div>

            {/* Mini gráfico de presença */}
            {recentMeetings.length > 0 && (
              <div className="px-4 pb-3">
                <p className="text-[10px] text-slate-400 mb-1">Últimas reuniões</p>
                <div className="flex gap-1 items-end h-8">
                  {recentMeetings.map((m) => (
                    <div
                      key={m.id}
                      title={`${m.attendanceRate}%`}
                      className={`flex-1 rounded-sm ${
                        m.attendanceRate >= 70
                          ? 'bg-green-400'
                          : m.attendanceRate >= 40
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                      }`}
                      style={{ height: `${Math.max(4, (m.attendanceRate / 100) * 32)}px` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Próxima reunião + link */}
            <div className="border-t border-slate-50 px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <CalendarDays size={12} />
                {nextMeeting
                  ? new Date(nextMeeting.scheduledAt).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })
                  : c.meetingDay !== null
                  ? `${DAY_NAMES[c.meetingDay]}${c.meetingTime ? ` às ${c.meetingTime}` : ''}`
                  : 'Sem reunião agendada'}
              </span>
              <Link
                href={`/mdc/cells/${c.id}`}
                className="text-xs text-indigo-600 font-semibold flex items-center gap-0.5"
              >
                Abrir <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
