'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

type AttendanceRow = {
  userId: string;
  userEmail: string | null;
  rsvpStatus: string | null;
  attended: boolean | null;
};

const RSVP_LABELS: Record<string, string> = {
  going: '✅ Vou',
  'not-going': '❌ Não vou',
  maybe: '🤔 Talvez',
  'no-response': '—',
};

export default function MeetingDetailPage() {
  const { cellId, meetingId } = useParams<{ cellId: string; meetingId: string }>();
  const { data: session } = useSession();
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [rsvp, setRsvp] = useState<string>('no-response');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLeader, setIsLeader] = useState(false);
  const [meetingStatus, setMeetingStatus] = useState<string>('scheduled');
  const [closingMeeting, setClosingMeeting] = useState(false);

  useEffect(() => {
    if (!meetingId || !cellId) return;
    Promise.all([
      fetch(`/api/mdc/meetings/${meetingId}/attendance`).then((r) => r.json()),
      fetch(`/api/mdc/cells/${cellId}`).then((r) => r.ok ? r.json() : null),
    ]).then(([attendanceData, cellData]) => {
      const rows: AttendanceRow[] = Array.isArray(attendanceData) ? attendanceData : [];
      setAttendance(rows);
      const myRow = rows.find((r) => r.userId === session?.user?.id);
      if (myRow?.rsvpStatus) setRsvp(myRow.rsvpStatus);
      if (cellData) {
        setIsLeader(
          cellData.leaderId === session?.user?.id ||
          cellData.coLeaderId === session?.user?.id
        );
        const thisMeeting = cellData.meetings?.find((m: { id: string; status: string }) => m.id === meetingId);
        if (thisMeeting) setMeetingStatus(thisMeeting.status);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [meetingId, cellId, session?.user?.id]);

  async function handleRsvp(status: string) {
    setSaving(true);
    await fetch(`/api/mdc/meetings/${meetingId}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setRsvp(status);
    setSaving(false);
    // Recarrega para atualizar contagens
    fetch(`/api/mdc/meetings/${meetingId}/attendance`)
      .then((r) => r.json())
      .then((data) => setAttendance(Array.isArray(data) ? data : []));
  }

  const going = attendance.filter((a) => a.rsvpStatus === 'going').length;
  const notGoing = attendance.filter((a) => a.rsvpStatus === 'not-going').length;
  const maybe = attendance.filter((a) => a.rsvpStatus === 'maybe').length;

  const handleCloseMeeting = async () => {
    if (!confirm('Encerrar este encontro? Ele será arquivado no histórico da célula.')) return;
    setClosingMeeting(true);
    try {
      const res = await fetch(`/api/mdc/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (res.ok) setMeetingStatus('completed');
    } finally {
      setClosingMeeting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href={`/mdc/cells/${cellId}`} className="text-gray-500 hover:text-gray-700 text-lg">←</Link>
          <h1 className="text-base font-bold text-indigo-900 flex-1">Detalhes do Encontro</h1>
          <Link
            href={`/mdc/cells/${cellId}/meeting/${meetingId}/guide`}
            className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition"
          >
            📖 Roteiro
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* RSVP */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <p className="text-sm font-bold text-gray-700">Sua confirmação</p>
          <div className="grid grid-cols-3 gap-2">
            {(['going', 'maybe', 'not-going'] as const).map((s) => (
              <button
                key={s}
                disabled={saving}
                onClick={() => handleRsvp(s)}
                className={`py-2 rounded-xl text-xs font-semibold transition ${
                  rsvp === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {RSVP_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{going}</p>
            <p className="text-xs text-gray-500 mt-1">Confirmados</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-yellow-500">{maybe}</p>
            <p className="text-xs text-gray-500 mt-1">Talvez</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{notGoing}</p>
            <p className="text-xs text-gray-500 mt-1">Não vão</p>
          </div>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm font-bold text-gray-700 mb-3">Lista de presença</p>
          {loading ? (
            <p className="text-sm text-gray-400">Carregando...</p>
          ) : attendance.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum RSVP ainda.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {attendance.map((row) => (
                <div key={row.userId} className="py-2.5 flex items-center justify-between">
                  <p className="text-sm text-gray-700">{row.userEmail ?? row.userId.slice(0, 8)}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    row.rsvpStatus === 'going' ? 'bg-emerald-100 text-emerald-700' :
                    row.rsvpStatus === 'not-going' ? 'bg-red-100 text-red-600' :
                    row.rsvpStatus === 'maybe' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {RSVP_LABELS[row.rsvpStatus ?? 'no-response']}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Encerrar encontro — apenas líder, apenas se ainda "scheduled" */}
        {isLeader && meetingStatus === 'scheduled' && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-800 mb-1">Encerrar encontro</p>
            <p className="text-xs text-gray-500 mb-3">
              Marque como concluído para arquivar no histórico. O roteiro continuará acessível para todos os membros.
            </p>
            <button
              onClick={handleCloseMeeting}
              disabled={closingMeeting}
              className="w-full py-2.5 bg-gray-700 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              {closingMeeting ? 'Encerrando...' : '✓ Encerrar este encontro'}
            </button>
          </div>
        )}

        {meetingStatus === 'completed' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-emerald-700">Encontro encerrado</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Este encontro foi concluído e está disponível no{' '}
              <a href={`/mdc/cells/${cellId}/history`} className="underline font-medium">histórico da célula</a>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
