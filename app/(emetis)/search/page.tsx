'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, CalendarDays, MapPin, Loader2, X } from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type UserResult     = { id: string; name: string | null; avatar: string | null; profession: string | null; availabilityStatus: string | null };
type CellResult     = { id: string; name: string; neighborhood: string | null; description: string | null; targetAudience: string; isOpen: boolean };
type CommunityResult= { id: string; name: string; description: string | null; type: string; avatar: string | null };
type EventResult    = { id: string; title: string; type: string; address: string | null; date: string; organizerName: string | null };

type SearchResults  = { users: UserResult[]; cells: CellResult[]; communities: CommunityResult[]; events: EventResult[] };

const AUDIENCE_LABEL: Record<string, string> = {
  jovens: 'Jovens', casais: 'Casais', adultos: 'Adultos',
  'terceira-idade': '3ª Idade', misto: 'Misto',
};

const EVENT_EMOJI: Record<string, string> = {
  social: '🎉', religious: '✝️', volunteer: '🤝', business: '💼',
};

function Avatar({ src, name, size = 10 }: { src?: string | null; name?: string | null; size?: number }) {
  const url = src ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? 'U')}&background=6366f1&color=fff`;
  return <img src={url} alt={name ?? ''} className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0`} />;
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) setResults(await res.json());
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce 350ms
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(query), 350);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, doSearch]);

  // Auto-focus
  useEffect(() => { inputRef.current?.focus(); }, []);

  const hasResults = results && (
    results.users.length + results.cells.length +
    results.communities.length + results.events.length > 0
  );

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Barra de busca */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <Search size={18} className="text-slate-400 flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar pessoas, grupos, eventos..."
          className="flex-1 text-sm focus:outline-none text-slate-800 placeholder:text-slate-400"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults(null); }} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
        {loading && <Loader2 size={16} className="animate-spin text-indigo-400 flex-shrink-0" />}
      </div>

      {/* Resultados */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Estado inicial */}
        {!query && (
          <div className="text-center py-16 text-slate-400">
            <Search size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Digite para buscar pessoas, grupos, comunidades e eventos</p>
          </div>
        )}

        {/* Sem resultados */}
        {query.length >= 2 && !loading && results && !hasResults && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm">Nenhum resultado para <strong>"{query}"</strong></p>
          </div>
        )}

        {results && (
          <div className="divide-y divide-slate-100">

            {/* Pessoas */}
            {results.users.length > 0 && (
              <section className="py-3">
                <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Pessoas</p>
                {results.users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => router.push(`/connect/${u.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-left"
                  >
                    <Avatar src={u.avatar} name={u.name} size={10} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{u.name ?? 'Usuário'}</p>
                      {u.profession && <p className="text-xs text-slate-500 truncate">{u.profession}</p>}
                    </div>
                    {u.availabilityStatus === 'mesa-posta' && (
                      <span className="text-xs text-green-600 font-medium flex-shrink-0">Mesa Posta</span>
                    )}
                  </button>
                ))}
              </section>
            )}

            {/* Células */}
            {results.cells.length > 0 && (
              <section className="py-3">
                <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Grupos / Células</p>
                {results.cells.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => router.push(`/mdc/cells/${c.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Users size={18} className="text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {AUDIENCE_LABEL[c.targetAudience] ?? c.targetAudience}
                        {c.neighborhood ? ` · ${c.neighborhood}` : ''}
                      </p>
                    </div>
                    {c.isOpen && (
                      <span className="text-xs text-indigo-600 font-medium flex-shrink-0">Aberta</span>
                    )}
                  </button>
                ))}
              </section>
            )}

            {/* Comunidades */}
            {results.communities.length > 0 && (
              <section className="py-3">
                <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Comunidades</p>
                {results.communities.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => router.push(`/community`)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-left"
                  >
                    <Avatar src={c.avatar} name={c.name} size={10} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                      {c.description && <p className="text-xs text-slate-500 truncate">{c.description}</p>}
                    </div>
                  </button>
                ))}
              </section>
            )}

            {/* Eventos */}
            {results.events.length > 0 && (
              <section className="py-3">
                <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Eventos</p>
                {results.events.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => router.push('/events')}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0 text-xl leading-none">
                      {EVENT_EMOJI[e.type] ?? '📅'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{e.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <CalendarDays size={11} />
                        {new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        {e.address && (
                          <>
                            <MapPin size={11} />
                            <span className="truncate">{e.address}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
