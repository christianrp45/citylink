'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2 } from 'lucide-react';

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const AUDIENCE_OPTIONS = [
  { value: 'misto',         label: '🌐 Misto' },
  { value: 'jovens',        label: '🧑 Jovens' },
  { value: 'casais',        label: '💑 Casais' },
  { value: 'adultos',       label: '🧑‍🤝‍🧑 Adultos' },
  { value: 'terceira-idade',label: '👴 3ª Idade' },
];

export default function NewCellPage() {
  const router = useRouter();

  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress]         = useState('');
  const [meetingDay, setMeetingDay]   = useState<number | ''>('');
  const [meetingTime, setMeetingTime] = useState('');
  const [targetAudience, setTargetAudience] = useState('misto');
  const [maxMembers, setMaxMembers]   = useState(15);
  const [entryMode, setEntryMode]     = useState<'invite_only' | 'open'>('invite_only');
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Nome do grupo é obrigatório'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/pib/cells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          neighborhood: neighborhood.trim() || undefined,
          address: address.trim() || undefined,
          meetingDay: meetingDay !== '' ? meetingDay : undefined,
          meetingTime: meetingTime || undefined,
          targetAudience,
          maxMembers,
          entryMode,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Erro ao criar grupo');
        return;
      }

      const cell = await res.json();
      router.push(`/pib/cells/${cell.id}`);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 p-1 -ml-1">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-base font-bold text-indigo-900 flex-1">Novo Grupo Pequeno</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* Nome */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <div>
            <label className={labelCls}>Nome do Grupo <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Célula Águas Vivas, Grupo Família..."
              className={inputCls}
              autoFocus
            />
          </div>
          <div>
            <label className={labelCls}>Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Conte um pouco sobre o grupo, sua visão e propósito..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        {/* Local e horário */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">📍 Local e Horário</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Bairro</label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ex: Água Verde"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Endereço</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número..."
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Dia da semana</label>
              <select
                value={meetingDay}
                onChange={(e) => setMeetingDay(e.target.value === '' ? '' : Number(e.target.value))}
                className={inputCls}
              >
                <option value="">— Selecionar —</option>
                {WEEKDAYS.map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Horário</label>
              <input
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Público e capacidade */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">👥 Público</p>
          <div>
            <label className={labelCls}>Público-alvo</label>
            <div className="flex flex-wrap gap-2">
              {AUDIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTargetAudience(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    targetAudience === opt.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Capacidade máxima</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={4}
                max={50}
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <span className="text-sm font-bold text-indigo-700 w-12 text-center">{maxMembers} pessoas</span>
            </div>
          </div>
        </div>

        {/* Modo de acesso */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">🔒 Acesso</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setEntryMode('invite_only')}
              className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition ${
                entryMode === 'invite_only'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-xl">🔗</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">Somente via convite</p>
                <p className="text-xs text-gray-500">Novos membros entram apenas com link gerado por você ou outro membro.</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('open')}
              className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition ${
                entryMode === 'open'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-xl">🌐</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">Entrada livre</p>
                <p className="text-xs text-gray-500">Qualquer pessoa pode entrar diretamente, sem precisar de convite.</p>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {saving ? (
            <><Loader2 size={18} className="animate-spin" /> Criando grupo...</>
          ) : (
            '✅ Criar Grupo Pequeno'
          )}
        </button>
      </form>
    </div>
  );
}
