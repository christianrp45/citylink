'use client';

import { useEffect, useState } from 'react';
import { MapPin, Phone, Globe, Building2, Plus, Loader2, ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useSession } from 'next-auth/react';

type Recommender = {
  id: string;
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  userProfession: string | null;
  comment: string | null;
  createdAt: string;
};

type Business = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  avatar: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  website: string | null;
  isPublic: boolean;
  requireApproval: boolean;
  createdAt: string;
  // carregado on-demand
  recommenders?: Recommender[];
  myRecommendation?: boolean;
  loadingRecs?: boolean;
  showRecs?: boolean;
};

export default function BusinessPage() {
  const { data: session } = useSession();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', address: '', city: '', phone: '', website: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/communities?type=company&isPublic=true')
      .then((r) => r.json())
      .then((data: Business[]) => setBusinesses(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!form.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'company', isPublic: true }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? 'Erro ao cadastrar');
        return;
      }
      const created: Business = await res.json();
      setBusinesses((prev) => [created, ...prev]);
      setForm({ name: '', description: '', address: '', city: '', phone: '', website: '' });
      setShowForm(false);
    } catch {
      setError('Erro de conexão');
    } finally {
      setSaving(false);
    }
  }

  async function loadRecommenders(id: string) {
    setBusinesses((prev) =>
      prev.map((b) => b.id === id ? { ...b, loadingRecs: true, showRecs: true } : b)
    );
    try {
      const res = await fetch(`/api/communities/${id}/recommend`);
      const recs: Recommender[] = res.ok ? await res.json() : [];
      const myRec = recs.some((r) => r.userId === session?.user?.id);
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, recommenders: recs, myRecommendation: myRec, loadingRecs: false } : b
        )
      );
    } catch {
      setBusinesses((prev) =>
        prev.map((b) => b.id === id ? { ...b, loadingRecs: false } : b)
      );
    }
  }

  function toggleShowRecs(b: Business) {
    if (b.showRecs) {
      setBusinesses((prev) => prev.map((x) => x.id === b.id ? { ...x, showRecs: false } : x));
    } else if (b.recommenders !== undefined) {
      setBusinesses((prev) => prev.map((x) => x.id === b.id ? { ...x, showRecs: true } : x));
    } else {
      loadRecommenders(b.id);
    }
  }

  async function handleRecommend(b: Business) {
    if (!b.recommenders) await loadRecommenders(b.id);

    // optimistic toggle
    const wasRec = b.myRecommendation;
    setBusinesses((prev) =>
      prev.map((x) =>
        x.id === b.id
          ? {
              ...x,
              myRecommendation: !wasRec,
              recommenders: wasRec
                ? (x.recommenders ?? []).filter((r) => r.userId !== session?.user?.id)
                : [
                    {
                      id: 'tmp',
                      userId: session?.user?.id ?? '',
                      userName: session?.user?.name ?? null,
                      userAvatar: session?.user?.image ?? null,
                      userProfession: null,
                      comment: null,
                      createdAt: new Date().toISOString(),
                    },
                    ...(x.recommenders ?? []),
                  ],
            }
          : x
      )
    );

    try {
      await fetch(`/api/communities/${b.id}/recommend`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    } catch {
      // reverte se falhar
      setBusinesses((prev) =>
        prev.map((x) =>
          x.id === b.id ? { ...x, myRecommendation: wasRec } : x
        )
      );
    }
  }

  return (
    <div className="h-full overflow-y-auto pb-20" style={{ background: 'var(--em-bg)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between"
        style={{ boxShadow: 'var(--em-shadow-sm)' }}
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800">Negócios & Serviços</h1>
          <p className="text-xs text-slate-500 mt-0.5">Empresas da comunidade cristã</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ background: 'var(--em-600)' }}
        >
          <Plus size={16} />
          Cadastrar
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Formulário de cadastro */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Novo negócio</h3>
            <input
              type="text"
              placeholder="Nome da empresa *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
            />
            <textarea
              placeholder="Descrição (o que oferece)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 resize-none"
            />
            <input
              type="text"
              placeholder="Endereço"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
            />
            <input
              type="text"
              placeholder="Cidade"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
            />
            <input
              type="tel"
              placeholder="Telefone / WhatsApp"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
            />
            <input
              type="url"
              placeholder="Site (https://...)"
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowForm(false); setError(''); }}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !form.name.trim()}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1 disabled:opacity-50"
                style={{ background: 'var(--em-600)' }}
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Cadastrar
              </button>
            </div>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-slate-400" />
          </div>
        ) : businesses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
            <Building2 size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600">Nenhum negócio cadastrado ainda</p>
            <p className="text-xs text-slate-400 mt-1">Seja o primeiro a cadastrar</p>
          </div>
        ) : (
          businesses.map((b) => {
            const recCount = b.recommenders?.length ?? 0;
            const showRecList = b.showRecs && (b.recommenders?.length ?? 0) > 0;

            return (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                  {b.avatar ? (
                    <img src={b.avatar} alt={b.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                      style={{ background: 'var(--em-600)' }}
                    >
                      {b.name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 leading-tight">{b.name}</h3>
                    {(b.city || b.state) && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {[b.city, b.state].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Descrição */}
                {b.description && (
                  <p className="text-sm text-slate-600 leading-relaxed">{b.description}</p>
                )}

                {/* Contato */}
                <div className="space-y-1.5">
                  {b.address && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={12} className="flex-shrink-0" />
                      <span>{b.address}</span>
                    </div>
                  )}
                  {b.phone && (
                    <a
                      href={`https://wa.me/${b.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-green-600 font-medium"
                    >
                      <Phone size={12} className="flex-shrink-0" />
                      <span>{b.phone}</span>
                    </a>
                  )}
                  {b.website && (
                    <a
                      href={b.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-blue-500 font-medium"
                    >
                      <Globe size={12} className="flex-shrink-0" />
                      <span className="truncate">{b.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                </div>

                {/* Irmão Indica Irmão */}
                <div className="border-t border-slate-100 pt-3 flex items-center gap-2">
                  {/* Botão de recomendar */}
                  <button
                    onClick={() => handleRecommend(b)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      b.myRecommendation
                        ? 'text-white'
                        : 'border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600'
                    }`}
                    style={b.myRecommendation ? { background: 'var(--em-600)' } : undefined}
                  >
                    <ThumbsUp size={13} />
                    {b.myRecommendation ? 'Recomendado' : 'Indicar'}
                  </button>

                  {/* Contagem + expandir */}
                  <button
                    onClick={() => toggleShowRecs(b)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                  >
                    {b.loadingRecs ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <>
                        <span className="font-medium text-emerald-600">
                          {b.recommenders !== undefined ? recCount : ''}
                        </span>
                        {b.recommenders !== undefined && recCount > 0 && (
                          <>
                            <span className="ml-0.5">
                              {recCount === 1 ? 'irmão indica' : 'irmãos indicam'}
                            </span>
                            {b.showRecs ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </>
                        )}
                        {b.recommenders !== undefined && recCount === 0 && (
                          <span>Nenhuma indicação ainda</span>
                        )}
                        {b.recommenders === undefined && (
                          <span>Ver indicações</span>
                        )}
                      </>
                    )}
                  </button>
                </div>

                {/* Lista de recomendadores */}
                {showRecList && (
                  <div className="bg-emerald-50 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-bold text-emerald-800 mb-1">✅ Irmão Indica Irmão</p>
                    {b.recommenders!.slice(0, 5).map((r) => (
                      <div key={r.id} className="flex items-center gap-2">
                        <img
                          src={r.userAvatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userName ?? 'U')}&size=28&background=d1fae5&color=065f46`}
                          alt={r.userName ?? 'Usuário'}
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-emerald-900 leading-tight">{r.userName ?? 'Membro'}</p>
                          {r.userProfession && (
                            <p className="text-[10px] text-emerald-700 leading-tight">{r.userProfession}</p>
                          )}
                          {r.comment && (
                            <p className="text-[10px] text-emerald-600 italic mt-0.5">"{r.comment}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {b.recommenders!.length > 5 && (
                      <p className="text-xs text-emerald-600 font-medium">
                        +{b.recommenders!.length - 5} mais
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
