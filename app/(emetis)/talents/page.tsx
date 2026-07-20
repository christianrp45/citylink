'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, X, Loader2, MessageCircle, Handshake, Share2 } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  'Culinária', 'Tecnologia', 'Saúde', 'Educação',
  'Construção', 'Arte', 'Música', 'Idiomas', 'Finanças', 'Outros',
];

const CATEGORY_EMOJI: Record<string, string> = {
  Culinária: '🍽️', Tecnologia: '💻', Saúde: '🏥', Educação: '📚',
  Construção: '🔨', Arte: '🎨', Música: '🎵', Idiomas: '🌍', Finanças: '💰', Outros: '✨',
};

type Talent = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  createdAt: string;
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  userProfession: string | null;
};

export default function TalentsPage() {
  const { data: session } = useSession();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/talents')
      .then((r) => r.json())
      .then((data) => { setTalents(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'Todos'
    ? talents
    : talents.filter((t) => t.category === activeCategory);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.category) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/talents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erro ao cadastrar');
        return;
      }
      const newTalent = await res.json();
      setTalents((prev) => [{ ...newTalent, userName: session?.user?.name ?? null, userAvatar: session?.user?.image ?? null, userProfession: null }, ...prev]);
      setForm({ title: '', description: '', category: '' });
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/talents/${id}`, { method: 'DELETE' });
    setTalents((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-4 pt-5 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Handshake size={22} className="text-white" />
            <h1 className="text-white font-bold text-lg">Troca de Talentos</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-2 rounded-full transition-colors"
          >
            <Plus size={16} /> Oferecer
          </button>
        </div>
        <p className="text-emerald-100 text-xs mt-1">
          Ofereça suas habilidades e encontre ajuda na comunidade
        </p>
      </div>

      {/* Filtro de categorias */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {['Todos', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              activeCategory === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
            }`}
          >
            {cat !== 'Todos' && CATEGORY_EMOJI[cat]} {cat}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="px-4 pb-24 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin text-emerald-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-4xl">🤝</p>
            <p className="text-slate-500 text-sm">
              {activeCategory === 'Todos'
                ? 'Nenhum talento cadastrado ainda. Seja o primeiro!'
                : `Nenhum talento em "${activeCategory}" ainda.`}
            </p>
          </div>
        ) : (
          filtered.map((talent) => (
            <div key={talent.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0 overflow-hidden">
                    {talent.userAvatar ? (
                      <img src={talent.userAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-white font-bold text-base">
                        {talent.userName?.[0]?.toUpperCase() ?? '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                        {CATEGORY_EMOJI[talent.category]} {talent.category}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800 text-sm mt-1 leading-tight">{talent.title}</p>
                    {talent.description && (
                      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{talent.description}</p>
                    )}
                    <p className="text-slate-400 text-[11px] mt-1.5">
                      {talent.userName ?? 'Membro'}{talent.userProfession ? ` · ${talent.userProfession}` : ''}
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link
                    href={`/talents/${talent.id}`}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    title="Ver e compartilhar"
                  >
                    <Share2 size={14} />
                  </Link>
                  {talent.userId === session?.user?.id ? (
                    <button
                      onClick={() => handleDelete(talent.id)}
                      className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  ) : (
                    <Link
                      href={`/chat?with=${talent.userId}`}
                      className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
                    >
                      <MessageCircle size={13} /> Contato
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de cadastro */}
      {showForm && (
        <div
          className="fixed inset-0 z-[200] flex items-end"
          style={{ background: 'rgba(15,23,42,0.5)' }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-slate-800">Oferecer talento</p>
              <button onClick={() => setShowForm(false)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Título */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  O que você oferece? *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder='Ex: "Conserto computadores", "Dou aulas de violão"'
                  maxLength={100}
                  className="w-full bg-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Categoria *</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, category: cat }))}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                        form.category === cat
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {CATEGORY_EMOJI[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Descrição (opcional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Mais detalhes sobre o que você oferece..."
                  rows={3}
                  className="w-full bg-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
                />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={submitting || !form.title.trim() || !form.category}
                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-2xl text-sm disabled:opacity-40 active:scale-95 transition-all"
              >
                {submitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Publicar talento'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
