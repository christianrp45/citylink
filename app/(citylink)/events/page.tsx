'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Loader2,
  MapPin,
  Plus,
  Users,
  X,
} from 'lucide-react';
import { BottomNav } from '@/components/citylink-bottom-nav';

type EventType = 'social' | 'religious' | 'volunteer' | 'business';

const TYPE_MAP: Record<EventType, { label: string; color: string; emoji: string }> = {
  social:    { label: 'Social',       color: 'bg-blue-100 text-blue-600',   emoji: '🎉' },
  religious: { label: 'Religioso',    color: 'bg-purple-100 text-purple-600', emoji: '✝️' },
  volunteer: { label: 'Voluntariado', color: 'bg-green-100 text-green-600', emoji: '🤝' },
  business:  { label: 'Negócios',     color: 'bg-amber-100 text-amber-600', emoji: '💼' },
};

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  type: EventType;
  address: string | null;
  date: string;
  organizerId: string;
  organizerName: string | null;
  isJoined: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Modal criar evento ────────────────────────────────────────────────────────

function CreateEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>('social');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !date) { setError('Título e data são obrigatórios'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, type, address, date }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Erro ao criar evento');
        return;
      }
      onCreated();
      onClose();
    } catch {
      setError('Erro ao criar evento');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        className="w-full bg-white rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-slate-800">Novo Evento</h2>
          <button type="button" onClick={onClose} className="text-slate-400">
            <X size={20} />
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Título *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Culto de Celebração"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo</label>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(TYPE_MAP) as EventType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  type === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {TYPE_MAP[t].emoji} {TYPE_MAP[t].label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes do evento..."
            rows={3}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Local</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Endereço ou nome do local"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Data e hora *</label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {saving ? 'Criando...' : 'Criar Evento'}
        </button>
      </form>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function EventsPage() {
  const [filter, setFilter] = useState<EventType | 'all'>('all');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data: EventItem[] = await res.json();
        setEvents(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  async function toggleJoin(eventId: string, isJoined: boolean) {
    setToggling(eventId);
    // Optimistic
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, isJoined: !isJoined } : e))
    );
    try {
      await fetch(`/api/events/${eventId}/join`, { method: 'POST' });
    } catch {
      // Revert on error
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, isJoined } : e))
      );
    } finally {
      setToggling(null);
    }
  }

  const filtered =
    filter === 'all' ? events : events.filter((e) => e.type === filter);
  const sorted = [...filtered].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-20">
      {/* Header com filtros + botão criar */}
      <div className="bg-white px-4 py-3 border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-2 overflow-x-auto flex-1">
            {(['all', 'social', 'religious', 'volunteer', 'business'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filter === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t === 'all' ? '📅 Todos' : `${TYPE_MAP[t].emoji} ${TYPE_MAP[t].label}`}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex-shrink-0 w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
            title="Criar evento"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="p-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-blue-400" />
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-4xl mb-2">📅</p>
            <p className="text-sm font-medium">Nenhum evento encontrado</p>
            <p className="text-xs mt-1">Toque em + para criar o primeiro!</p>
          </div>
        )}

        {sorted.map((ev) => {
          const typeInfo = TYPE_MAP[ev.type];
          return (
            <div
              key={ev.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className={`px-4 py-2 flex items-center gap-2 ${typeInfo.color}`}>
                <Calendar size={14} />
                <span className="text-xs font-semibold">{formatDate(ev.date)}</span>
                <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-white/60">
                  {typeInfo.emoji} {typeInfo.label}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-slate-800">{ev.title}</h3>
                {ev.description && (
                  <p className="text-sm text-slate-500 mt-1">{ev.description}</p>
                )}

                <div className="mt-3 space-y-1.5">
                  {ev.address && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={12} className="text-blue-500" />
                      {ev.address}
                    </div>
                  )}
                  {ev.organizerName && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Users size={12} className="text-blue-500" />
                      Organizado por {ev.organizerName}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => toggleJoin(ev.id, ev.isJoined)}
                  disabled={toggling === ev.id}
                  className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 ${
                    ev.isJoined
                      ? 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {toggling === ev.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : ev.isJoined ? (
                    <>
                      <CheckCircle size={14} /> Confirmado
                    </>
                  ) : (
                    'Participar'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchEvents}
        />
      )}

      <BottomNav />
    </div>
  );
}
