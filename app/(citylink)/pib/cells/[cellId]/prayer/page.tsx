'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BottomNav } from '@/components/citylink-bottom-nav';
import type { PrayerRequestDetail } from '@/lib/types';

export default function PrayerPage() {
  const { cellId } = useParams<{ cellId: string }>();
  const [requests, setRequests] = useState<PrayerRequestDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    fetch(`/api/pib/prayer?cellId=${cellId}`)
      .then((r) => r.json())
      .then((data) => { setRequests(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { if (cellId) load(); }, [cellId]);

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    await fetch('/api/pib/prayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cellId, content, isAnonymous }),
    });
    setContent('');
    setIsAnonymous(false);
    setShowForm(false);
    setPosting(false);
    load();
  };

  const handlePray = async (id: string) => {
    await fetch(`/api/pib/prayer/${id}/pray`, { method: 'POST' });
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              userHasPrayed: !r.userHasPrayed,
              prayerCount: r.userHasPrayed ? r.prayerCount - 1 : r.prayerCount + 1,
            }
          : r
      )
    );
  };

  const answered = requests.filter((r) => r.isAnswered);
  const active = requests.filter((r) => !r.isAnswered);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href={`/pib/cells/${cellId}`} className="text-gray-500 hover:text-gray-700">←</Link>
          <h1 className="text-xl font-bold text-indigo-900 flex-1">🙏 Pedidos de Oração</h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            + Pedir oração
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Formulário */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3 border border-indigo-100">
            <h3 className="font-semibold text-gray-900">Compartilhar pedido</h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Compartilhe sua necessidade com o grupo..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600"
              />
              <span className="text-sm text-gray-600">Publicar anonimamente</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handlePost}
                disabled={posting || !content.trim()}
                className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {posting ? 'Enviando...' : 'Compartilhar 🙏'}
              </button>
            </div>
          </div>
        )}

        {/* Pedidos ativos */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : active.length === 0 && !showForm ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">🕊️</p>
            <p className="text-gray-500 font-medium">Nenhum pedido ativo</p>
            <p className="text-gray-400 text-sm mt-1">Seja o primeiro a compartilhar</p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Pedidos ativos ({active.length})
                </p>
                {active.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {!r.isAnonymous && r.authorName && (
                          <p className="text-xs font-semibold text-indigo-600 mb-1">
                            {r.authorName}
                          </p>
                        )}
                        {r.isAnonymous && (
                          <p className="text-xs text-gray-400 mb-1">Anônimo</p>
                        )}
                        <p className="text-sm text-gray-800 leading-relaxed">{r.content}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(r.createdAt).toLocaleDateString('pt-BR', {
                            day: 'numeric', month: 'short',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => handlePray(r.id)}
                        className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition flex-shrink-0 ${
                          r.userHasPrayed
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
                        }`}
                      >
                        <span className="text-lg">🙏</span>
                        <span className="text-xs font-semibold">{r.prayerCount}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Orações respondidas */}
            {answered.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                  🎉 Respondidas ({answered.length})
                </p>
                {answered.map((r) => (
                  <div key={r.id} className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <p className="text-sm text-gray-700 leading-relaxed">{r.content}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-2">✓ Oração respondida!</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
