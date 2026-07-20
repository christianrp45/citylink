'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Trophy } from 'lucide-react';
import Link from 'next/link';

type RankEntry = {
  userId: string;
  name: string | null;
  avatar: string | null;
  total: number;
  level: string;
};

const LEVEL_EMOJI: Record<string, string> = {
  semente: '🌱',
  broto:   '🌿',
  árvore:  '🌳',
  fruto:   '🍎',
  luz:     '✨',
};

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function avatarSrc(name: string | null, avatar: string | null) {
  return (
    avatar ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? 'U')}&background=6366f1&color=fff&size=64`
  );
}

export default function RankingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const myId = session?.user?.id ?? '';

  const cellId = searchParams.get('cellId');
  const [tab, setTab] = useState<'geral' | 'celula'>(cellId ? 'celula' : 'geral');
  const [geral, setGeral] = useState<RankEntry[]>([]);
  const [celula, setCelula] = useState<RankEntry[]>([]);
  const [loadingGeral, setLoadingGeral] = useState(false);
  const [loadingCelula, setLoadingCelula] = useState(false);

  // Busca ranking geral
  useEffect(() => {
    setLoadingGeral(true);
    fetch('/api/ranking')
      .then((r) => r.json())
      .then(setGeral)
      .catch(() => {})
      .finally(() => setLoadingGeral(false));
  }, []);

  // Busca ranking da célula (se cellId disponível)
  useEffect(() => {
    if (!cellId) return;
    setLoadingCelula(true);
    fetch(`/api/ranking?cellId=${cellId}`)
      .then((r) => r.json())
      .then(setCelula)
      .catch(() => {})
      .finally(() => setLoadingCelula(false));
  }, [cellId]);

  const entries = tab === 'celula' ? celula : geral;
  const loading = tab === 'celula' ? loadingCelula : loadingGeral;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-slate-50 pb-24">
      {/* Header */}
      <div className="bg-indigo-700 text-white px-4 pt-12 pb-6 shadow-md">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="text-indigo-200 hover:text-white text-xl leading-none">←</button>
          <Trophy size={22} className="text-yellow-300" />
          <h1 className="text-xl font-bold">Ranking</h1>
        </div>
        <p className="text-indigo-300 text-sm ml-9">Quem está servindo mais essa semana?</p>

        {/* Abas */}
        <div className="flex gap-2 mt-4 ml-1">
          <button
            onClick={() => setTab('geral')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              tab === 'geral' ? 'bg-white text-indigo-700' : 'text-indigo-200 hover:text-white'
            }`}
          >
            🌍 Geral
          </button>
          {cellId && (
            <button
              onClick={() => setTab('celula')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                tab === 'celula' ? 'bg-white text-indigo-700' : 'text-indigo-200 hover:text-white'
              }`}
            >
              ⛪ Minha Célula
            </button>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin text-indigo-400" />
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-slate-500 font-medium">Ainda sem pontos registrados</p>
            <p className="text-slate-400 text-sm mt-1">Comece a participar para aparecer aqui!</p>
          </div>
        )}

        {/* Top 3 — destaque especial */}
        {!loading && entries.length > 0 && (
          <>
            {entries.slice(0, 3).map((e, i) => {
              const rank = i + 1;
              const isMe = e.userId === myId;
              return (
                <div
                  key={e.userId}
                  className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 shadow-sm border transition-all ${
                    isMe
                      ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400'
                      : rank === 1
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
                      : rank === 2
                      ? 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200'
                      : 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100'
                  }`}
                >
                  <span className="text-2xl w-8 text-center">{MEDAL[rank]}</span>
                  <img
                    src={avatarSrc(e.name, e.avatar)}
                    alt={e.name ?? ''}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${isMe ? 'text-indigo-700' : 'text-slate-800'}`}>
                      {e.name ?? 'Usuário'} {isMe && <span className="text-xs font-normal text-indigo-500">(você)</span>}
                    </p>
                    <p className="text-xs text-slate-500">
                      {LEVEL_EMOJI[e.level] ?? '🌱'} {e.level}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-lg text-indigo-700">{e.total}</p>
                    <p className="text-xs text-slate-400">pts</p>
                  </div>
                </div>
              );
            })}

            {/* Demais posições */}
            {entries.length > 3 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50">
                {entries.slice(3).map((e, i) => {
                  const rank = i + 4;
                  const isMe = e.userId === myId;
                  return (
                    <div
                      key={e.userId}
                      className={`flex items-center gap-3 px-4 py-3 ${isMe ? 'bg-indigo-50' : ''}`}
                    >
                      <span className="w-7 text-center text-sm font-bold text-slate-400">{rank}</span>
                      <img
                        src={avatarSrc(e.name, e.avatar)}
                        alt={e.name ?? ''}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isMe ? 'text-indigo-700' : 'text-slate-700'}`}>
                          {e.name ?? 'Usuário'} {isMe && <span className="text-xs font-normal text-indigo-500">(você)</span>}
                        </p>
                        <p className="text-xs text-slate-400">{LEVEL_EMOJI[e.level] ?? '🌱'} {e.level}</p>
                      </div>
                      <span className="text-sm font-bold text-indigo-600 flex-shrink-0">{e.total} pts</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* CTA — ir para missões */}
        <Link
          href="/profile"
          className="block w-full py-3 text-center text-sm text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
        >
          Ver minhas missões →
        </Link>
      </div>
    </div>
  );
}
