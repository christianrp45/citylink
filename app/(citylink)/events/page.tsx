'use client';

import { useState } from 'react';
import { Calendar, MapPin, Users, CheckCircle } from 'lucide-react';
import { BottomNav } from '@/components/citylink-bottom-nav';

type EventType = 'social' | 'religious' | 'volunteer' | 'business';

const TYPE_MAP: Record<EventType, { label: string; color: string; emoji: string }> = {
  social: { label: 'Social', color: 'bg-blue-100 text-blue-600', emoji: '🎉' },
  religious: { label: 'Religioso', color: 'bg-purple-100 text-purple-600', emoji: '✝️' },
  volunteer: { label: 'Voluntariado', color: 'bg-green-100 text-green-600', emoji: '🤝' },
  business: { label: 'Negócios', color: 'bg-amber-100 text-amber-600', emoji: '💼' },
};

const mockEvents = [
  {
    id: '1', title: 'Culto de Celebração', type: 'religious' as EventType,
    description: 'Culto especial com louvor e adoração para toda a família.',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    location: { address: 'Igreja Central, Rua das Flores, 123' },
    attendees: ['u1', 'u2', 'u3'],
    organizerId: 'u1',
  },
  {
    id: '2', title: 'Mutirão de Limpeza', type: 'volunteer' as EventType,
    description: 'Vamos juntos limpar o parque do bairro e cuidar do meio ambiente.',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    location: { address: 'Parque Municipal, Av. Central' },
    attendees: ['u2', 'u3'],
    organizerId: 'u2',
  },
  {
    id: '3', title: 'Feira de Negócios Cristãos', type: 'business' as EventType,
    description: 'Encontro de empreendedores cristãos para networking e parcerias.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    location: { address: 'Centro de Convenções, Sala A' },
    attendees: ['u1'],
    organizerId: 'u3',
  },
  {
    id: '4', title: 'Churrasco da Comunidade', type: 'social' as EventType,
    description: 'Momento de confraternização e integração entre famílias da comunidade.',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    location: { address: 'Área de lazer do condomínio Jardim Verde' },
    attendees: ['u1', 'u2', 'u3', 'u4'],
    organizerId: 'u1',
  },
];

function formatDate(d: Date) {
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}

export default function EventsPage() {
  const [filter, setFilter] = useState<EventType | 'all'>('all');
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  const filtered = filter === 'all' ? mockEvents : mockEvents.filter(e => e.type === filter);
  const sorted = [...filtered].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-20">
      <div className="bg-white px-4 py-3 border-b border-slate-100 sticky top-0 z-10">
        <div className="flex gap-2 overflow-x-auto">
          {(['all', 'social', 'religious', 'volunteer', 'business'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'all' ? '📅 Todos' : `${TYPE_MAP[t].emoji} ${TYPE_MAP[t].label}`}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {sorted.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-4xl mb-2">📅</p>
            <p className="text-sm">Nenhum evento encontrado</p>
          </div>
        )}
        {sorted.map(event => {
          const typeInfo = TYPE_MAP[event.type];
          const isJoined = joined[event.id];

          return (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className={`px-4 py-2 flex items-center gap-2 ${typeInfo.color}`}>
                <Calendar size={14} />
                <span className="text-xs font-semibold uppercase">{formatDate(event.date)}</span>
                <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-white/60">
                  {typeInfo.emoji} {typeInfo.label}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-slate-800">{event.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{event.description}</p>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={12} className="text-blue-500" />
                    {event.location.address}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users size={12} className="text-blue-500" />
                    <span>{event.attendees.length} participante{event.attendees.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <button
                  onClick={() => setJoined(prev => ({ ...prev, [event.id]: !prev[event.id] }))}
                  className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                    isJoined
                      ? 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isJoined ? <><CheckCircle size={14} /> Confirmado</> : 'Participar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
