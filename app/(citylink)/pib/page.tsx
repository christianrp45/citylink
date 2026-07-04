'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Plus, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { BottomNav } from '@/components/citylink-bottom-nav';

// ─── Versículo do Dia ─────────────────────────────────────────────────────────

const DAILY_VERSES = [
  { reference: 'Filipenses 4:13', text: 'Tudo posso naquele que me fortalece.', theme: 'Força' },
  { reference: 'Salmos 23:1', text: 'O Senhor é meu pastor; nada me faltará.', theme: 'Provisão' },
  { reference: 'João 3:16', text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.', theme: 'Amor' },
  { reference: 'Jeremias 29:11', text: 'Porque eu bem sei os planos que tenho para vós, diz o Senhor; planos de paz e não de mal, para vos dar um futuro e uma esperança.', theme: 'Esperança' },
  { reference: 'Romanos 8:28', text: 'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.', theme: 'Propósito' },
  { reference: 'Provérbios 3:5-6', text: 'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.', theme: 'Confiança' },
  { reference: 'Isaías 40:31', text: 'Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias.', theme: 'Renovação' },
];

const BIBLE_BOOKS = [
  { name: 'Gênesis', chapters: 50, testament: 'AT' }, { name: 'Êxodo', chapters: 40, testament: 'AT' },
  { name: 'Levítico', chapters: 27, testament: 'AT' }, { name: 'Números', chapters: 36, testament: 'AT' },
  { name: 'Deuteronômio', chapters: 34, testament: 'AT' }, { name: 'Josué', chapters: 24, testament: 'AT' },
  { name: 'Juízes', chapters: 21, testament: 'AT' }, { name: 'Rute', chapters: 4, testament: 'AT' },
  { name: '1 Samuel', chapters: 31, testament: 'AT' }, { name: '2 Samuel', chapters: 24, testament: 'AT' },
  { name: '1 Reis', chapters: 22, testament: 'AT' }, { name: '2 Reis', chapters: 25, testament: 'AT' },
  { name: '1 Crônicas', chapters: 29, testament: 'AT' }, { name: '2 Crônicas', chapters: 36, testament: 'AT' },
  { name: 'Esdras', chapters: 10, testament: 'AT' }, { name: 'Neemias', chapters: 13, testament: 'AT' },
  { name: 'Ester', chapters: 10, testament: 'AT' }, { name: 'Jó', chapters: 42, testament: 'AT' },
  { name: 'Salmos', chapters: 150, testament: 'AT' }, { name: 'Provérbios', chapters: 31, testament: 'AT' },
  { name: 'Eclesiastes', chapters: 12, testament: 'AT' }, { name: 'Cântico dos Cânticos', chapters: 8, testament: 'AT' },
  { name: 'Isaías', chapters: 66, testament: 'AT' }, { name: 'Jeremias', chapters: 52, testament: 'AT' },
  { name: 'Lamentações', chapters: 5, testament: 'AT' }, { name: 'Ezequiel', chapters: 48, testament: 'AT' },
  { name: 'Daniel', chapters: 12, testament: 'AT' }, { name: 'Oséias', chapters: 14, testament: 'AT' },
  { name: 'Joel', chapters: 3, testament: 'AT' }, { name: 'Amós', chapters: 9, testament: 'AT' },
  { name: 'Obadias', chapters: 1, testament: 'AT' }, { name: 'Jonas', chapters: 4, testament: 'AT' },
  { name: 'Miquéias', chapters: 7, testament: 'AT' }, { name: 'Naum', chapters: 3, testament: 'AT' },
  { name: 'Habacuque', chapters: 3, testament: 'AT' }, { name: 'Sofonias', chapters: 3, testament: 'AT' },
  { name: 'Ageu', chapters: 2, testament: 'AT' }, { name: 'Zacarias', chapters: 14, testament: 'AT' },
  { name: 'Malaquias', chapters: 4, testament: 'AT' },
  { name: 'Mateus', chapters: 28, testament: 'NT' }, { name: 'Marcos', chapters: 16, testament: 'NT' },
  { name: 'Lucas', chapters: 24, testament: 'NT' }, { name: 'João', chapters: 21, testament: 'NT' },
  { name: 'Atos', chapters: 28, testament: 'NT' }, { name: 'Romanos', chapters: 16, testament: 'NT' },
  { name: '1 Coríntios', chapters: 16, testament: 'NT' }, { name: '2 Coríntios', chapters: 13, testament: 'NT' },
  { name: 'Gálatas', chapters: 6, testament: 'NT' }, { name: 'Efésios', chapters: 6, testament: 'NT' },
  { name: 'Filipenses', chapters: 4, testament: 'NT' }, { name: 'Colossenses', chapters: 4, testament: 'NT' },
  { name: '1 Tessalonicenses', chapters: 5, testament: 'NT' }, { name: '2 Tessalonicenses', chapters: 3, testament: 'NT' },
  { name: '1 Timóteo', chapters: 6, testament: 'NT' }, { name: '2 Timóteo', chapters: 4, testament: 'NT' },
  { name: 'Tito', chapters: 3, testament: 'NT' }, { name: 'Filemom', chapters: 1, testament: 'NT' },
  { name: 'Hebreus', chapters: 13, testament: 'NT' }, { name: 'Tiago', chapters: 5, testament: 'NT' },
  { name: '1 Pedro', chapters: 5, testament: 'NT' }, { name: '2 Pedro', chapters: 3, testament: 'NT' },
  { name: '1 João', chapters: 5, testament: 'NT' }, { name: '2 João', chapters: 1, testament: 'NT' },
  { name: '3 João', chapters: 1, testament: 'NT' }, { name: 'Judas', chapters: 1, testament: 'NT' },
  { name: 'Apocalipse', chapters: 22, testament: 'NT' },
];

const BIBLE_VERSIONS = [
  { id: 'ARC', name: 'Almeida Revista e Corrigida' },
  { id: 'NVI', name: 'Nova Versão Internacional' },
  { id: 'ACF', name: 'Almeida Corrigida Fiel' },
  { id: 'NAA', name: 'Nova Almeida Atualizada' },
  { id: 'NTLH', name: 'Nova Tradução na Linguagem de Hoje' },
];

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ChurchItem = {
  id: string;
  name: string;
  denomination: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  schedule: string | null;
  pastor: string | null;
  members: number | null;
};

type TestimonialItem = {
  id: string;
  userId: string;
  authorName: string | null;
  authorAvatar: string | null;
  title: string;
  content: string;
  createdAt: string;
  likes: string[];
  comments: { id: string; userId: string; authorName: string | null; content: string; createdAt: string }[];
};

type PrayerGroupItem = {
  id: string;
  name: string;
  description: string | null;
  schedule: string | null;
  topic: string | null;
  isOnline: boolean;
  memberCount: number;
  isJoined: boolean;
};

type VolunteerItem = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  address: string | null;
  date: string;
  spots: number;
  organizerName: string | null;
  enrolled: number;
  isEnrolled: boolean;
};

function avatarSrc(name: string | null, avatar: string | null) {
  return avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? 'U')}&background=7c3aed&color=fff`;
}

// ─── Células Tab (sem mudanças) ────────────────────────────────────────────────

function CelulasTab() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-indigo-200 text-xs font-medium mb-1">📖 Atos 2:42</p>
        <p className="text-sm font-semibold leading-snug">
          "Perseveravam na doutrina dos apóstolos, na comunhão, no partir do pão e nas orações."
        </p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
        <h3 className="font-bold text-slate-800">Grupos Pequenos</h3>
        <p className="text-sm text-slate-500">
          Células são grupos de 8–15 pessoas que se reúnem semanalmente para orar, estudar a Palavra e crescer juntos.
        </p>
        <div className="flex gap-2">
          <Link href="/pib/cells" className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl text-center hover:bg-indigo-700 transition-colors">
            Ver Células
          </Link>
          <Link href="/pib/cells/new" className="flex-1 py-2.5 border border-indigo-300 text-indigo-700 text-sm font-semibold rounded-xl text-center hover:bg-indigo-50 transition-colors">
            + Criar Célula
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
        <h3 className="font-bold text-slate-800">Guia de Estudo IA</h3>
        <p className="text-sm text-slate-500">
          Gere roteiros personalizados para sua célula com inteligência artificial.
        </p>
        <Link href="/pib/cells/guide" className="block w-full py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl text-center hover:bg-amber-600 transition-colors">
          Gerar Roteiro ✨
        </Link>
      </div>
    </div>
  );
}

// ─── Igrejas Tab ──────────────────────────────────────────────────────────────

function ChurchesTab() {
  const [churches, setChurches] = useState<ChurchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ChurchItem | null>(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', denomination: '', description: '', address: '', phone: '', schedule: '', pastor: '', members: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/churches').then((r) => r.json()).then(setChurches).finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await fetch('/api/churches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const created = await res.json();
        setChurches((prev) => [...prev, created]);
        setShowCreate(false);
        setForm({ name: '', denomination: '', description: '', address: '', phone: '', schedule: '', pastor: '', members: '' });
      }
    } finally {
      setSaving(false);
    }
  }

  const filtered = churches.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.denomination ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <div className="space-y-3">
        <button onClick={() => setSelected(null)} className="text-sm text-indigo-600 font-medium">← Voltar</button>
        <div className="bg-white rounded-2xl shadow p-5 space-y-3">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center text-3xl">⛪</div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{selected.name}</h3>
              {selected.denomination && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{selected.denomination}</span>
              )}
            </div>
          </div>
          {selected.description && <p className="text-slate-600 text-sm">{selected.description}</p>}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {selected.pastor && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-400 text-xs mb-1">Pastor</p>
                <p className="font-semibold text-slate-800">{selected.pastor}</p>
              </div>
            )}
            {selected.members != null && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-400 text-xs mb-1">Membros</p>
                <p className="font-semibold text-slate-800">{selected.members}</p>
              </div>
            )}
          </div>
          {selected.address && (
            <div className="bg-slate-50 rounded-xl p-3 text-sm">
              <p className="text-slate-400 text-xs mb-1">📍 Endereço</p>
              <p className="font-medium text-slate-800">{selected.address}</p>
            </div>
          )}
          {selected.schedule && (
            <div className="bg-slate-50 rounded-xl p-3 text-sm">
              <p className="text-slate-400 text-xs mb-1">🕐 Cultos</p>
              <p className="font-medium text-slate-800">{selected.schedule}</p>
            </div>
          )}
          {selected.phone && (
            <div className="bg-slate-50 rounded-xl p-3 text-sm">
              <p className="text-slate-400 text-xs mb-1">📞 Telefone</p>
              <p className="font-medium text-slate-800">{selected.phone}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Buscar igrejas..."
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700"
        >
          <Plus size={18} />
        </button>
      </div>

      {loading && <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-indigo-400" /></div>}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-2">⛪</p>
          <p className="text-sm">Nenhuma igreja cadastrada ainda.</p>
          <p className="text-xs mt-1">Toque em + para adicionar a primeira!</p>
        </div>
      )}

      {filtered.map((church) => (
        <button key={church.id} onClick={() => setSelected(church)} className="w-full text-left bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">⛪</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-800 text-sm">{church.name}</h3>
                {church.denomination && (
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{church.denomination}</span>
                )}
              </div>
              {church.address && <p className="text-xs text-slate-500 mt-0.5">📍 {church.address}</p>}
              {church.description && <p className="text-xs text-slate-600 mt-1 line-clamp-2">{church.description}</p>}
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                {church.pastor && <span>👤 {church.pastor}</span>}
                {church.members != null && <span>👥 {church.members} membros</span>}
              </div>
            </div>
          </div>
        </button>
      ))}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="w-full bg-white rounded-t-3xl p-6 space-y-3 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Cadastrar Igreja</h3>
              <button type="button" onClick={() => setShowCreate(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            {[
              { key: 'name', label: 'Nome *', placeholder: 'Ex.: PIB Curitiba' },
              { key: 'denomination', label: 'Denominação', placeholder: 'Batista, Presbiteriana...' },
              { key: 'pastor', label: 'Pastor', placeholder: 'Nome do pastor' },
              { key: 'address', label: 'Endereço', placeholder: 'Rua, número, bairro' },
              { key: 'phone', label: 'Telefone', placeholder: '(41) 99999-9999' },
              { key: 'schedule', label: 'Horários', placeholder: 'Domingos 9h e 18h' },
              { key: 'members', label: 'Nº de membros', placeholder: '350' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
                <input
                  value={(form as any)[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Conte sobre a igreja..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>
            <button type="submit" disabled={saving || !form.name} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {saving ? 'Salvando...' : 'Cadastrar Igreja'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Grupos de Oração Tab ─────────────────────────────────────────────────────

function PrayerTab() {
  const [groups, setGroups] = useState<PrayerGroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', schedule: '', topic: '', isOnline: false });
  const [saving, setSaving] = useState(false);

  const fetchGroups = useCallback(async () => {
    const res = await fetch('/api/prayer-groups');
    if (res.ok) setGroups(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  async function toggleJoin(groupId: string, isJoined: boolean) {
    setToggling(groupId);
    setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, isJoined: !isJoined, memberCount: isJoined ? g.memberCount - 1 : g.memberCount + 1 } : g));
    try {
      await fetch(`/api/prayer-groups/${groupId}/join`, { method: 'POST' });
    } catch {
      setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, isJoined, memberCount: isJoined ? g.memberCount + 1 : g.memberCount - 1 } : g));
    } finally {
      setToggling(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await fetch('/api/prayer-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { await fetchGroups(); setShowCreate(false); setForm({ name: '', description: '', schedule: '', topic: '', isOnline: false }); }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <button onClick={() => setShowCreate(true)} className="w-full py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-2xl text-sm font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
        <Plus size={16} /> Criar Grupo de Oração
      </button>

      {loading && <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-indigo-400" /></div>}
      {!loading && groups.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-2">🙏</p>
          <p className="text-sm">Nenhum grupo de oração ainda.</p>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-800">{group.name}</h3>
                {group.isOnline && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Online</span>}
              </div>
              {group.description && <p className="text-sm text-slate-600 mt-1">{group.description}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                {group.schedule && <span>🕐 {group.schedule}</span>}
                {group.topic && <span>🏷️ {group.topic}</span>}
                <span>👥 {group.memberCount}</span>
              </div>
            </div>
            <button
              onClick={() => toggleJoin(group.id, group.isJoined)}
              disabled={toggling === group.id}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${
                group.isJoined ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {toggling === group.id ? <Loader2 size={14} className="animate-spin" /> : group.isJoined ? 'Participando' : 'Entrar'}
            </button>
          </div>
        </div>
      ))}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="w-full bg-white rounded-t-3xl p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Novo Grupo de Oração</h3>
              <button type="button" onClick={() => setShowCreate(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            {[
              { key: 'name', label: 'Nome *', placeholder: 'Ex.: Guerreiros da Manhã' },
              { key: 'schedule', label: 'Horário', placeholder: 'Seg a Sex, 6h' },
              { key: 'topic', label: 'Tema', placeholder: 'Intercessão, Família...' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
                <input value={(form as any)[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} placeholder={placeholder} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
              <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.isOnline} onChange={(e) => setForm((prev) => ({ ...prev, isOnline: e.target.checked }))} className="rounded" />
              Grupo Online
            </label>
            <button type="submit" disabled={saving || !form.name} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {saving ? 'Criando...' : 'Criar Grupo'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Testemunhos Tab ──────────────────────────────────────────────────────────

function TestimonialsTab({ myId }: { myId: string }) {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    fetch('/api/testimonials').then((r) => r.json()).then(setItems).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim() }),
      });
      if (res.ok) {
        const created = await res.json();
        setItems((prev) => [{ ...created, likes: [], comments: [], authorName: null, authorAvatar: null }, ...prev]);
        setNewTitle(''); setNewContent(''); setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleLike(id: string) {
    const res = await fetch(`/api/testimonials/${id}/like`, { method: 'POST' });
    if (res.ok) {
      const { liked } = await res.json();
      setItems((prev) => prev.map((t) => {
        if (t.id !== id) return t;
        return { ...t, likes: liked ? [...t.likes, myId] : t.likes.filter((uid) => uid !== myId) };
      }));
    }
  }

  async function handleComment(testimonialId: string) {
    if (!commentText.trim()) return;
    setCommenting(true);
    try {
      const res = await fetch(`/api/testimonials/${testimonialId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      if (res.ok) {
        const comment = await res.json();
        setItems((prev) => prev.map((t) => t.id === testimonialId ? { ...t, comments: [...t.comments, comment] } : t));
        setCommentText('');
      }
    } finally {
      setCommenting(false);
    }
  }

  return (
    <div className="space-y-3">
      <button onClick={() => setShowForm((v) => !v)} className="w-full py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-2xl text-sm font-medium hover:bg-purple-50 transition-colors">
        + Compartilhar Testemunho
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h4 className="font-bold text-slate-800">Novo Testemunho</h4>
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Título do testemunho" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Conte o que Deus fez em sua vida..." rows={4} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-1">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null} Compartilhar
            </button>
          </div>
        </form>
      )}

      {loading && <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-purple-400" /></div>}

      {items.map((t) => {
        const liked = t.likes.includes(myId);
        const showComments = expandedComments === t.id;
        return (
          <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <img src={avatarSrc(t.authorName, t.authorAvatar)} alt={t.authorName ?? ''} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-slate-800 text-sm">{t.authorName ?? 'Usuário'}</p>
                <p className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <h3 className="font-bold text-slate-800">🙌 {t.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{t.content}</p>
            <div className="flex items-center gap-4 pt-1">
              <button onClick={() => handleLike(t.id)} className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${liked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'}`}>
                {liked ? '❤️' : '🤍'} {t.likes.length}
              </button>
              <button onClick={() => setExpandedComments(showComments ? null : t.id)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-500 transition-colors">
                💬 {t.comments.length}
              </button>
            </div>
            {showComments && (
              <div className="space-y-2 pt-1 border-t border-slate-50">
                {t.comments.map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <img src={avatarSrc(c.authorName, null)} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-xs">
                      <p className="font-semibold text-slate-700">{c.authorName ?? 'Usuário'}</p>
                      <p className="text-slate-600 mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleComment(t.id)} placeholder="Escreva um comentário..." className="flex-1 bg-slate-100 rounded-full px-3 py-1.5 text-xs focus:outline-none" />
                  <button onClick={() => handleComment(t.id)} disabled={commenting || !commentText.trim()} className="px-3 py-1.5 bg-purple-600 text-white rounded-full text-xs font-semibold disabled:opacity-40 flex items-center gap-1">
                    {commenting ? <Loader2 size={12} className="animate-spin" /> : 'Enviar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Voluntariado Tab ─────────────────────────────────────────────────────────

function VolunteerTab() {
  const [items, setItems] = useState<VolunteerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '', address: '', date: '', spots: '10', organizerName: '' });
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    const res = await fetch('/api/volunteer');
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function toggleEnroll(id: string, isEnrolled: boolean) {
    setToggling(id);
    setItems((prev) => prev.map((o) => o.id === id ? { ...o, isEnrolled: !isEnrolled, enrolled: isEnrolled ? o.enrolled - 1 : o.enrolled + 1 } : o));
    try {
      await fetch(`/api/volunteer/${id}/enroll`, { method: 'POST' });
    } catch {
      setItems((prev) => prev.map((o) => o.id === id ? { ...o, isEnrolled, enrolled: isEnrolled ? o.enrolled + 1 : o.enrolled - 1 } : o));
    } finally {
      setToggling(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date) return;
    setSaving(true);
    try {
      const res = await fetch('/api/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, spots: Number(form.spots) }),
      });
      if (res.ok) { await fetchItems(); setShowCreate(false); setForm({ title: '', description: '', category: '', address: '', date: '', spots: '10', organizerName: '' }); }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <button onClick={() => setShowCreate(true)} className="w-full py-3 border-2 border-dashed border-amber-300 text-amber-600 rounded-2xl text-sm font-medium hover:bg-amber-50 transition-colors flex items-center justify-center gap-2">
        <Plus size={16} /> Publicar Oportunidade
      </button>

      {loading && <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-amber-400" /></div>}
      {!loading && items.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-2">🤝</p>
          <p className="text-sm">Nenhuma oportunidade disponível.</p>
        </div>
      )}

      {items.map((op) => {
        const spotsLeft = op.spots - op.enrolled;
        return (
          <div key={op.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-800">{op.title}</h3>
                {op.category && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{op.category}</span>}
              </div>
              <p className="text-xs font-semibold text-slate-700 flex-shrink-0">
                {new Date(op.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </p>
            </div>
            {op.description && <p className="text-sm text-slate-600">{op.description}</p>}
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {op.address && <span>📍 {op.address}</span>}
              {op.organizerName && <span>🏢 {op.organizerName}</span>}
              <span className={spotsLeft <= 2 ? 'text-rose-500 font-semibold' : ''}>🎟️ {spotsLeft} vagas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, (op.enrolled / op.spots) * 100)}%` }} />
              </div>
              <button
                onClick={() => toggleEnroll(op.id, op.isEnrolled)}
                disabled={toggling === op.id}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-1 ${
                  op.isEnrolled ? 'bg-green-100 text-green-700' : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                {toggling === op.id ? <Loader2 size={14} className="animate-spin" /> : op.isEnrolled ? '✓ Inscrito' : 'Inscrever-se'}
              </button>
            </div>
          </div>
        );
      })}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="w-full bg-white rounded-t-3xl p-6 space-y-3 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Publicar Oportunidade</h3>
              <button type="button" onClick={() => setShowCreate(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            {[
              { key: 'title', label: 'Título *', placeholder: 'Ex.: Distribuição de Alimentos' },
              { key: 'category', label: 'Categoria', placeholder: 'Social, Educação, Saúde...' },
              { key: 'address', label: 'Local', placeholder: 'Endereço ou nome do local' },
              { key: 'organizerName', label: 'Organizador', placeholder: 'Nome da instituição' },
              { key: 'spots', label: 'Nº de vagas', placeholder: '10' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
                <input value={(form as any)[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} placeholder={placeholder} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Data e hora *</label>
              <input type="datetime-local" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
              <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>
            <button type="submit" disabled={saving || !form.title || !form.date} className="w-full py-3 bg-amber-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-600 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {saving ? 'Publicando...' : 'Publicar'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Bíblia Tab (sem mudanças) ─────────────────────────────────────────────────

function BibleTab() {
  const todayIndex = new Date().getDay();
  const dailyVerse = DAILY_VERSES[todayIndex % DAILY_VERSES.length];
  const [selectedVersion, setSelectedVersion] = useState('ARC');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<'verse' | 'books' | 'version'>('verse');
  const currentBook = BIBLE_BOOKS.find((b) => b.name === selectedBook);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {([{ id: 'verse', label: '📖 Versículo' }, { id: 'books', label: '📚 Livros' }, { id: 'version', label: '🔄 Versão' }] as const).map((s) => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeSection === s.id ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'verse' && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☀️</span>
            <div>
              <p className="font-bold text-amber-800 text-sm">Versículo do Dia</p>
              <p className="text-xs text-amber-600">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
            </div>
          </div>
          <blockquote className="text-slate-800 text-base leading-relaxed italic">"{dailyVerse.text}"</blockquote>
          <p className="text-amber-700 font-bold text-sm">— {dailyVerse.reference}</p>
          <span className="inline-block text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">{dailyVerse.theme}</span>
        </div>
      )}

      {activeSection === 'books' && (
        <div className="space-y-3">
          {selectedBook && currentBook ? (
            <div className="space-y-3">
              <button onClick={() => { setSelectedBook(null); setSelectedChapter(null); }} className="text-sm text-indigo-600 font-medium">← Voltar aos Livros</button>
              {selectedChapter ? (
                <div className="bg-white rounded-2xl shadow p-5 space-y-3">
                  <button onClick={() => setSelectedChapter(null)} className="text-sm text-indigo-600 font-medium">← Capítulos de {selectedBook}</button>
                  <h3 className="font-bold text-slate-800">{selectedBook} — Capítulo {selectedChapter}</h3>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-sm text-slate-700 leading-relaxed italic">"{selectedBook} {selectedChapter}:1 — No princípio era o Verbo, e o Verbo estava com Deus..."</p>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-slate-800">{selectedBook} — {currentBook.chapters} capítulos</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: currentBook.chapters }, (_, i) => i + 1).map((ch) => (
                      <button key={ch} onClick={() => setSelectedChapter(ch)} className="py-2 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg text-sm font-medium transition-colors">{ch}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <h4 className="font-bold text-slate-600 text-sm">Antigo Testamento</h4>
              <div className="grid grid-cols-2 gap-2">
                {BIBLE_BOOKS.filter((b) => b.testament === 'AT').map((book) => (
                  <button key={book.name} onClick={() => setSelectedBook(book.name)} className="text-left bg-white border border-slate-100 rounded-xl px-3 py-2 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <p className="text-sm font-medium text-slate-800">{book.name}</p>
                    <p className="text-xs text-slate-400">{book.chapters} cap.</p>
                  </button>
                ))}
              </div>
              <h4 className="font-bold text-slate-600 text-sm mt-2">Novo Testamento</h4>
              <div className="grid grid-cols-2 gap-2">
                {BIBLE_BOOKS.filter((b) => b.testament === 'NT').map((book) => (
                  <button key={book.name} onClick={() => setSelectedBook(book.name)} className="text-left bg-white border border-slate-100 rounded-xl px-3 py-2 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <p className="text-sm font-medium text-slate-800">{book.name}</p>
                    <p className="text-xs text-slate-400">{book.chapters} cap.</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeSection === 'version' && (
        <div className="space-y-2">
          <p className="text-sm text-slate-600 font-medium mb-3">Versão da Bíblia:</p>
          {BIBLE_VERSIONS.map((v) => (
            <button key={v.id} onClick={() => setSelectedVersion(v.id)} className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${selectedVersion === v.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'}`}>
              <div>
                <p className="font-bold text-slate-800 text-sm">{v.id}</p>
                <p className="text-xs text-slate-500">{v.name}</p>
              </div>
              {selectedVersion === v.id && <span className="text-indigo-600 text-lg">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'celulas',       label: '🏠 Células' },
  { id: 'churches',     label: '⛪ Igrejas' },
  { id: 'prayer',       label: '🙏 Oração' },
  { id: 'testimonials', label: '🙌 Testemunhos' },
  { id: 'volunteer',    label: '🤝 Voluntário' },
  { id: 'bible',        label: '📖 Bíblia' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function IgrejaPage() {
  const { data: session } = useSession();
  const myId = session?.user?.id ?? '';
  const [activeTab, setActiveTab] = useState<TabId>('celulas');

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-24">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex gap-1 overflow-x-auto px-3 py-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-3 py-2 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {activeTab === 'celulas'       && <CelulasTab />}
        {activeTab === 'churches'      && <ChurchesTab />}
        {activeTab === 'prayer'        && <PrayerTab />}
        {activeTab === 'testimonials'  && <TestimonialsTab myId={myId} />}
        {activeTab === 'volunteer'     && <VolunteerTab />}
        {activeTab === 'bible'         && <BibleTab />}
      </div>

      <BottomNav />
    </div>
  );
}
