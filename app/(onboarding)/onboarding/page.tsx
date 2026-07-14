'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  MapPin,
  Bell,
  HandHeart,
  Eye,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
} from 'lucide-react';

// ── Tipos ──────────────────────────────────────────────────────────────────
type VisibilityOption = 'nobody' | 'friends' | 'my_community' | 'all';

interface ConsentState {
  consentDataProcessing: boolean;
  consentLocation: boolean;
  consentProximityAlerts: boolean;
  consentVisitRequests: boolean;
  consentProfileVisible: boolean;
}

interface VisibilityState {
  locationVisibleTo: VisibilityOption;
  visitRequestFrom: VisibilityOption;
  chatFrom: VisibilityOption;
  profileVisibleTo: VisibilityOption;
}

const VISIBILITY_LABELS: Record<VisibilityOption, string> = {
  nobody: 'Ninguém',
  friends: 'Apenas amigos',
  my_community: 'Minha comunidade',
  all: 'Todos',
};

// ── Componente ─────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [termsScrolled, setTermsScrolled] = useState(false);

  const [consent, setConsent] = useState<ConsentState>({
    consentDataProcessing: false,
    consentLocation: false,
    consentProximityAlerts: false,
    consentVisitRequests: false,
    consentProfileVisible: true,
  });

  const [visibility, setVisibility] = useState<VisibilityState>({
    locationVisibleTo: 'friends',
    visitRequestFrom: 'friends',
    chatFrom: 'friends',
    profileVisibleTo: 'my_community',
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleTermsScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (nearBottom) setTermsScrolled(true);
  }

  function toggleConsent(key: keyof ConsentState) {
    setConsent(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function setVis(key: keyof VisibilityState, value: VisibilityOption) {
    setVisibility(prev => ({ ...prev, [key]: value }));
  }

  async function handleFinish() {
    setSaving(true);
    try {
      // 1. Salvar consentimentos (audit log automático no servidor)
      await fetch('/api/users/privacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consent),
      });

      // 2. Salvar configuração de visibilidade
      await fetch('/api/users/visibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visibility),
      });

      router.push('/map');
    } catch {
      setSaving(false);
    }
  }

  // ── Progresso ─────────────────────────────────────────────────────────────
  const progress = ((step - 1) / 3) * 100;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto">
      {/* Header */}
      <div className="px-6 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-white/20 p-2 rounded-xl">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <p className="text-blue-200 text-xs uppercase tracking-widest">Emetis</p>
            <h1 className="text-white font-bold text-lg leading-tight">
              Seus dados, seu controle
            </h1>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="bg-white/20 rounded-full h-1.5 mb-1">
          <div
            className="bg-white rounded-full h-1.5 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-blue-200 text-xs text-right">Etapa {step} de 3</p>
      </div>

      {/* Conteúdo do passo */}
      <div className="flex-1 bg-white rounded-t-3xl overflow-hidden flex flex-col">
        {step === 1 && (
          <Step1
            termsScrolled={termsScrolled}
            accepted={consent.consentDataProcessing}
            onScroll={handleTermsScroll}
            onAccept={() => setConsent(p => ({ ...p, consentDataProcessing: true }))}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2
            consent={consent}
            onToggle={toggleConsent}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3
            visibility={visibility}
            onSet={setVis}
            onBack={() => setStep(2)}
            onFinish={handleFinish}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}

// ── PASSO 1 — Termos e Privacidade ─────────────────────────────────────────
function Step1({
  termsScrolled,
  accepted,
  onScroll,
  onAccept,
  onNext,
}: {
  termsScrolled: boolean;
  accepted: boolean;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onAccept: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-slate-800 font-bold text-xl">Termos e Privacidade</h2>
        <p className="text-slate-500 text-sm mt-1">
          Leia com atenção antes de continuar.
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto px-6 py-4 text-sm text-slate-600 space-y-4"
        onScroll={onScroll}
      >
        <section>
          <h3 className="font-semibold text-slate-800 mb-1">1. Sobre o Emetis</h3>
          <p>
            O Emetis é uma plataforma de reconexão física entre pessoas de fé. Nosso
            objetivo é facilitar encontros presenciais — visitas, células, orações
            juntas — inspirados em Atos 2:42.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-800 mb-1">2. Dados que coletamos</h3>
          <ul className="list-disc pl-4 space-y-1">
            <li>Nome, e-mail e telefone (cadastro)</li>
            <li>Localização aproximada (somente com seu consentimento)</li>
            <li>Histórico de visitas e pedidos (funcionalidade do app)</li>
            <li>Logs de consentimento (exigência da LGPD)</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-slate-800 mb-1">3. Base legal (LGPD)</h3>
          <p>
            Tratamos seus dados com base no seu consentimento explícito (art. 7º, I) e
            no legítimo interesse para prestação do serviço (art. 7º, IX). Você pode
            revogar qualquer consentimento a qualquer momento em{' '}
            <strong>Perfil → Privacidade</strong>.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-800 mb-1">4. Seus direitos (art. 18)</h3>
          <ul className="list-disc pl-4 space-y-1">
            <li>Acesso aos dados que temos sobre você</li>
            <li>Correção de dados incompletos ou desatualizados</li>
            <li>Exportação dos seus dados em formato legível</li>
            <li>Exclusão completa da conta e de todos os dados</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-slate-800 mb-1">5. Retenção e segurança</h3>
          <p>
            Dados de localização expiram automaticamente conforme a configuração que
            você escolher (mínimo 1h, máximo 24h). Logs de consentimento são
            armazenados de forma imutável e com IP anonimizado.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-800 mb-1">6. Contato</h3>
          <p>
            Dúvidas ou solicitações relacionadas à privacidade:{' '}
            <strong>privacidade@emetis.com.br</strong>
          </p>
        </section>

        <div className="h-8" />
      </div>

      <div className="px-6 py-4 border-t border-slate-100 space-y-3">
        {!termsScrolled && (
          <p className="text-xs text-slate-400 text-center">
            Role até o final para aceitar
          </p>
        )}

        <button
          onClick={onAccept}
          disabled={!termsScrolled}
          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
            accepted
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : termsScrolled
              ? 'border-slate-200 text-slate-600 hover:border-blue-300'
              : 'border-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          <div
            className={`size-5 rounded flex items-center justify-center flex-shrink-0 border-2 ${
              accepted ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
            }`}
          >
            {accepted && <Check size={12} className="text-white" />}
          </div>
          <span className="text-sm font-medium text-left">
            Li e aceito os Termos de Uso e a Política de Privacidade
          </span>
        </button>

        <button
          onClick={onNext}
          disabled={!accepted}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar <ChevronRight size={18} />
        </button>
      </div>
    </>
  );
}

// ── PASSO 2 — Módulos opcionais ────────────────────────────────────────────
function Step2({
  consent,
  onToggle,
  onBack,
  onNext,
}: {
  consent: ConsentState;
  onToggle: (key: keyof ConsentState) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const modules = [
    {
      key: 'consentLocation' as keyof ConsentState,
      icon: <MapPin size={20} className="text-blue-500" />,
      title: 'Localização no mapa',
      desc: 'Apareço no mapa para pessoas próximas. Dados expiram automaticamente.',
      recommended: true,
    },
    {
      key: 'consentProximityAlerts' as keyof ConsentState,
      icon: <Bell size={20} className="text-purple-500" />,
      title: 'Alertas de proximidade',
      desc: 'Recebo notificação quando um amigo ou membro da minha célula estiver perto.',
      recommended: true,
    },
    {
      key: 'consentVisitRequests' as keyof ConsentState,
      icon: <HandHeart size={20} className="text-green-500" />,
      title: 'Pedidos de visita',
      desc: 'Outros membros podem me enviar pedidos de visita.',
      recommended: false,
    },
    {
      key: 'consentProfileVisible' as keyof ConsentState,
      icon: <Eye size={20} className="text-amber-500" />,
      title: 'Visibilidade do perfil',
      desc: 'Meu perfil aparece em buscas e na comunidade.',
      recommended: true,
    },
  ];

  return (
    <>
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-slate-800 font-bold text-xl">Escolha o que ativar</h2>
        <p className="text-slate-500 text-sm mt-1">
          Tudo é opcional. Você muda quando quiser.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {modules.map(m => (
          <button
            key={m.key}
            onClick={() => onToggle(m.key)}
            className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
              consent[m.key]
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-100 bg-slate-50 hover:border-slate-200'
            }`}
          >
            <div className="bg-white p-2 rounded-xl shadow-sm flex-shrink-0">{m.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 text-sm">{m.title}</span>
                {m.recommended && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                    recomendado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
            </div>
            <div
              className={`size-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all ${
                consent[m.key] ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
              }`}
            >
              {consent[m.key] && <Check size={11} className="text-white" />}
            </div>
          </button>
        ))}
      </div>

      <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium"
        >
          <ChevronLeft size={16} /> Voltar
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          Continuar <ChevronRight size={18} />
        </button>
      </div>
    </>
  );
}

// ── PASSO 3 — Visibilidade granular ───────────────────────────────────────
function Step3({
  visibility,
  onSet,
  onBack,
  onFinish,
  saving,
}: {
  visibility: VisibilityState;
  onSet: (key: keyof VisibilityState, value: VisibilityOption) => void;
  onBack: () => void;
  onFinish: () => void;
  saving: boolean;
}) {
  const fields: { key: keyof VisibilityState; label: string; desc: string }[] = [
    {
      key: 'profileVisibleTo',
      label: 'Quem vê meu perfil',
      desc: 'Quem pode encontrar e visualizar seu perfil',
    },
    {
      key: 'locationVisibleTo',
      label: 'Quem vê minha localização',
      desc: 'Quem me vê no mapa',
    },
    {
      key: 'visitRequestFrom',
      label: 'Quem pode me visitar',
      desc: 'Quem pode enviar pedidos de visita',
    },
    {
      key: 'chatFrom',
      label: 'Quem pode me enviar mensagens',
      desc: 'Quem inicia conversas com você',
    },
  ];

  const options: VisibilityOption[] = ['nobody', 'friends', 'my_community', 'all'];

  return (
    <>
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-slate-800 font-bold text-xl">Quem pode me ver?</h2>
        <p className="text-slate-500 text-sm mt-1">
          Configure a visibilidade de cada função. Você muda quando quiser.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        {fields.map(f => (
          <div key={f.key}>
            <p className="font-semibold text-slate-800 text-sm">{f.label}</p>
            <p className="text-xs text-slate-400 mb-2">{f.desc}</p>
            <div className="grid grid-cols-2 gap-2">
              {options.map(opt => (
                <button
                  key={opt}
                  onClick={() => onSet(f.key, opt)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border-2 transition-all ${
                    visibility[f.key] === opt
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                  }`}
                >
                  {VISIBILITY_LABELS[opt]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium"
        >
          <ChevronLeft size={16} /> Voltar
        </button>
        <button
          onClick={onFinish}
          disabled={saving}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              Entrar no Emetis <Check size={18} />
            </>
          )}
        </button>
      </div>
    </>
  );
}
