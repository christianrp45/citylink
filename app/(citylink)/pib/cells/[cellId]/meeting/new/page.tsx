'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function NewMeetingPage() {
  const { cellId } = useParams<{ cellId: string }>();
  const router = useRouter();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!date || !time) { setError('Data e horário são obrigatórios'); return; }
    setSaving(true);
    setError('');
    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    const res = await fetch('/api/pib/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cellId, scheduledAt, address }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(`/pib/cells/${cellId}/meeting/${data.id}/guide`);
    } else {
      setError(data.error ?? 'Erro ao agendar encontro');
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href={`/pib/cells/${cellId}`} className="text-gray-500 hover:text-gray-700">←</Link>
          <h1 className="text-xl font-bold text-indigo-900">📅 Agendar Encontro</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Data *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Horário *
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Local (opcional)
            </label>
            <input
              type="text"
              placeholder="Endereço do encontro"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving || !date || !time}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-40"
          >
            {saving ? 'Agendando...' : 'Agendar e criar roteiro →'}
          </button>
        </div>
      </div>

    </div>
  );
}
