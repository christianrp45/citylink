'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Church, Users, MapPin, ChevronRight, Loader2, Check, Copy, Share2 } from 'lucide-react';
import { EmetisIcon } from '@/components/emetis-icon';

type OrgType = 'church' | 'company' | 'neighborhood' | 'other';

const ORG_TYPES: { value: OrgType; label: string; desc: string; emoji: string }[] = [
  { value: 'church', label: 'Igreja / Ministério', desc: 'Comunidade cristã local', emoji: '⛪' },
  { value: 'company', label: 'Empresa / ONG', desc: 'Organização com propósito', emoji: '🏢' },
  { value: 'neighborhood', label: 'Vizinhança / Bairro', desc: 'Comunidade de proximidade', emoji: '🏘️' },
  { value: 'other', label: 'Outro', desc: 'Outro tipo de comunidade', emoji: '🤝' },
];

export default function InstitutionOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);

  // Step 1 — dados da instituição
  const [name, setName] = useState('');
  const [orgType, setOrgType] = useState<OrgType>('church');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');

  // Step 2 — resultado: comunidade criada + convite
  const [communityId, setCommunityId] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleCreateCommunity() {
    if (!name.trim() || !city.trim()) return;
    setSaving(true);
    try {
      // 1. Cria a comunidade
      const commRes = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type: orgType,
          city: city.trim(),
          description: description.trim() || null,
          isPublic: true,
          requireApproval: false,
        }),
      });
      if (!commRes.ok) throw new Error('Erro ao criar comunidade');
      const comm = await commRes.json();
      setCommunityId(comm.id);

      // 2. Gera o link de convite
      const invRes = await fetch('/api/invite/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'community',
          targetId: comm.id,
          role: 'member',
          expiresInDays: 365,
        }),
      });
      if (!invRes.ok) throw new Error('Erro ao gerar convite');
      const inv = await invRes.json();
      setInviteCode(inv.code);
      const link = `${window.location.origin}/entrar/${inv.code}`;
      setInviteLink(link);

      setStep(2);
    } catch (err) {
      alert('Erro ao configurar instituição. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title: `Entre na ${name}`, url: inviteLink });
    } else {
      handleCopy();
    }
  }

  function handleFinish() {
    router.push('/instituicao');
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-start pt-10 px-4 pb-10">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <EmetisIcon size={48} variant="blue" />
          <h1 className="text-2xl font-bold text-slate-800">
            {step === 1 ? 'Configure sua instituição' : step === 2 ? 'Tudo pronto!' : ''}
          </h1>
          <p className="text-sm text-slate-500">
            {step === 1
              ? 'Crie sua comunidade e comece a convidar membros'
              : 'Compartilhe o link para que as pessoas se associem'}
          </p>
        </div>

        {/* Indicador de etapas */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s <= step ? 'w-10 bg-blue-500' : 'w-6 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1 — Dados */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
            {/* Tipo */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Tipo de organização</p>
              <div className="grid grid-cols-2 gap-2">
                {ORG_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setOrgType(t.value)}
                    className={`flex flex-col items-start gap-0.5 rounded-xl border-2 px-3 py-2.5 text-left transition-colors ${
                      orgType === t.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-lg">{t.emoji}</span>
                    <span className={`text-xs font-semibold ${orgType === t.value ? 'text-blue-700' : 'text-slate-700'}`}>
                      {t.label}
                    </span>
                    <span className="text-[10px] text-slate-400">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nome */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                Nome da instituição <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Igreja Batista Central"
                maxLength={80}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Cidade */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                Cidade <span className="text-red-500">*</span>
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo"
                maxLength={60}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                Descrição <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Missão, visão e propósito da sua instituição…"
                maxLength={300}
                rows={3}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>

            <button
              onClick={handleCreateCommunity}
              disabled={saving || !name.trim() || !city.trim()}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
              {saving ? 'Criando…' : 'Criar comunidade'}
            </button>
          </div>
        )}

        {/* Step 2 — Convite */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{name}</p>
                  <p className="text-xs text-slate-500">Comunidade criada com sucesso</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-semibold text-slate-700 mb-1">Link de convite</p>
                <p className="text-xs text-slate-500 mb-3">
                  Qualquer pessoa com este link pode se associar à sua comunidade.
                </p>

                <div className="bg-slate-50 rounded-xl border border-slate-200 px-3 py-2.5 flex items-center gap-2">
                  <span className="text-xs text-slate-600 flex-1 truncate font-mono">{inviteLink}</span>
                  <button
                    onClick={handleCopy}
                    className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>

                <div className="mt-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400">Código direto</p>
                    <p className="text-lg font-bold tracking-widest text-slate-800">{inviteCode}</p>
                  </div>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Share2 size={13} />
                    Compartilhar
                  </button>
                </div>
              </div>
            </div>

            {/* Próximos passos */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 space-y-2">
              <p className="text-sm font-semibold text-blue-800">Próximos passos</p>
              <ul className="space-y-1.5 text-xs text-blue-700">
                <li className="flex items-start gap-2"><ChevronRight size={12} className="mt-0.5 flex-shrink-0" /> Crie células (grupos pequenos) no painel</li>
                <li className="flex items-start gap-2"><ChevronRight size={12} className="mt-0.5 flex-shrink-0" /> Nomeie líderes e co-líderes para cada célula</li>
                <li className="flex items-start gap-2"><ChevronRight size={12} className="mt-0.5 flex-shrink-0" /> Acompanhe o progresso dos estudos de cada membro</li>
              </ul>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm"
            >
              Ir para o painel da instituição
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
