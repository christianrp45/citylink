'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/citylink-bottom-nav';
import type { CellSummary } from '@/lib/types';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const AUDIENCE_LABEL: Record<string, string> = {
  jovens: '🧑 Jovens',
  casais: '💑 Casais',
  adultos: '🧑‍🤝‍🧑 Adultos',
  'terceira-idade': '👴 3ª Idade',
  misto: '👥 Misto',
};

export default function PibHubPage() {
  const [cells, setCells] = useState<CellSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pib/cells')
      .then((r) => r.json())
      .then((data) => {
        setCells(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-indigo-900">✝️ Células</h1>
            <p className="text-sm text-gray-500">Grupos pequenos da comunidade</p>
          </div>
          <Link
            href="/pib/cells"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            Ver todas
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Destaque */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-indigo-200 text-sm font-medium mb-1">📖 Atos 2:42</p>
          <p className="text-lg font-semibold leading-snug">
            "Perseveravam na doutrina dos apóstolos, na comunhão, no partir do pão e nas orações."
          </p>
        </div>

        {/* Células disponíveis */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Células abertas</h2>
            <Link href="/pib/cells/new" className="text-sm text-indigo-600 font-medium hover:underline">
              + Criar célula
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : cells.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <p className="text-4xl mb-3">🏠</p>
              <p className="font-semibold text-gray-700">Nenhuma célula cadastrada ainda</p>
              <p className="text-sm text-gray-500 mt-1">Seja o primeiro a criar um grupo!</p>
              <Link
                href="/pib/cells/new"
                className="inline-block mt-4 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
              >
                Criar célula
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cells.filter((c) => c.isOpen).slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  href={`/pib/cells/${c.id}`}
                  className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{c.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {AUDIENCE_LABEL[c.targetAudience]}
                        {c.neighborhood ? ` · ${c.neighborhood}` : ''}
                      </p>
                      {c.meetingDay !== undefined && c.meetingDay !== null && (
                        <p className="text-xs text-indigo-600 mt-1 font-medium">
                          📅 {WEEKDAYS[c.meetingDay]}
                          {c.meetingTime ? ` às ${c.meetingTime}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="ml-3 text-right flex-shrink-0">
                      <span className="text-xs text-gray-400">
                        {c.memberCount}/{c.maxMembers} membros
                      </span>
                      <div className="mt-1 w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min((c.memberCount / (c.maxMembers || 15)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {cells.filter((c) => c.isOpen).length > 5 && (
                <Link
                  href="/pib/cells"
                  className="block text-center text-sm text-indigo-600 font-medium py-2 hover:underline"
                >
                  Ver todas as células →
                </Link>
              )}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
