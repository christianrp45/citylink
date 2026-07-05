'use client';

import { useEffect, useState } from 'react';
import { MapPin, Phone, Globe, Users, Building2, Plus, Loader2 } from 'lucide-react';

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
};

export default function BusinessPage() {
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
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                style={{ background: 'var(--em-600)' }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
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
            <p className="text-xs text-slate-400 mt-1">
              Seja o primeiro a cadastrar um negócio da comunidade
            </p>
          </div>
        ) : (
          businesses.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start gap-3">
                {b.avatar ? (
                  <img src={b.avatar} alt={b.name} className="w-12 h-12 rounded-xl object-cover" />
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
