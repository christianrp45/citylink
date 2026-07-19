'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CellSummary, CellTargetAudience } from '@/lib/types';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const AUDIENCE_OPTIONS: { value: CellTargetAudience | 'all'; label: string }[] = [
  { value: 'all', label: '👥 Todos' },
  { value: 'jovens', label: '🧑 Jovens' },
  { value: 'casais', label: '💑 Casais' },
  { value: 'adultos', label: '🧑‍🤝‍🧑 Adultos' },
  { value: 'terceira-idade', label: '👴 3ª Idade' },
  { value: 'misto', label: '🌐 Misto' },
];

export default function CellsDirectoryPage() {
  const [cells, setCells] = useState<CellSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [audience, setAudience] = useState<CellTargetAudience | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/mdc/cells')
      .then((r) => r.json())
      .then((data) => { setCells(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = cells.filter((c) => {
    const matchAudience = audience === 'all' || c.targetAudience === audience;
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.neighborhood ?? '').toLowerCase().includes(search.toLowerCase());
    return matchAudience && matchSearch;
  });

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/mdc" className="text-gray-500 hover:text-gray-700">←</Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-indigo-900">Grupos Pequenos</h1>
          </div>
          <Link
            href="/mdc/cells/new"
            className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            + Nova
          </Link>
        </div>
        {/* Busca */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <input
            type="text"
            placeholder="Buscar por nome ou bairro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
          />
        </div>
        {/* Filtro de público */}
        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {AUDIENCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAudience(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                audience === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500">Nenhum grupo encontrado</p>
          </div>
        ) : (
          filtered.map((c) => (
            <Link
              key={c.id}
              href={`/mdc/cells/${c.id}`}
              className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{c.name}</p>
                    {c.entryMode === "open" ? (
                      <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                        Entrada livre
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full">
                        Via convite
                      </span>
                    )}
                  </div>
                  {c.description && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{c.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {c.targetAudience && (
                      <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
                        {AUDIENCE_OPTIONS.find((o) => o.value === c.targetAudience)?.label}
                      </span>
                    )}
                    {c.neighborhood && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        📍 {c.neighborhood}
                      </span>
                    )}
                    {c.meetingDay !== undefined && c.meetingDay !== null && (
                      <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                        📅 {WEEKDAYS[c.meetingDay]}{c.meetingTime ? ` ${c.meetingTime}` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-3 text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{c.memberCount}/{c.maxMembers}</p>
                  <p className="text-xs text-gray-400">membros</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

    </div>
  );
}
