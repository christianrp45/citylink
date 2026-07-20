'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Map, BookOpen, Users, Heart, MapPin, UserPlus, ChevronRight } from 'lucide-react';

const FEATURES = [
  {
    icon: Map,
    color: 'bg-blue-100 text-blue-600',
    title: 'Mapa de Presença',
    desc: 'Veja quem está perto e ative sua disponibilidade para visitas.',
  },
  {
    icon: BookOpen,
    color: 'bg-indigo-100 text-indigo-600',
    title: 'Bíblia + Teo',
    desc: 'Leia a Palavra, faça highlights e converse com o Teo, seu guia bíblico.',
  },
  {
    icon: Users,
    color: 'bg-purple-100 text-purple-600',
    title: 'Grupos e Células',
    desc: 'Participe de células, reuniões, orações e roteiros gerados por IA.',
  },
  {
    icon: Heart,
    color: 'bg-rose-100 text-rose-600',
    title: 'Comunidade',
    desc: 'Compartilhe testemunhos, peça ajuda e encontre profissionais cristãos.',
  },
];

const STEPS = [
  {
    icon: MapPin,
    color: 'bg-blue-100 text-blue-600',
    title: 'Defina seu ponto de encontro',
    desc: 'Adicione Casa, Trabalho ou Igreja para aparecer no mapa perto de quem você conhece.',
    href: '/profile',
    cta: 'Ir para Meus Locais',
  },
  {
    icon: Users,
    color: 'bg-purple-100 text-purple-600',
    title: 'Entre numa célula',
    desc: 'Encontre ou crie um grupo pequeno para vivenciar a comunhão semanal.',
    href: '/mdc/cells',
    cta: 'Ver Grupos',
  },
  {
    icon: UserPlus,
    color: 'bg-emerald-100 text-emerald-600',
    title: 'Convide um amigo',
    desc: 'Compartilhe seu QR Code pessoal ou copie o link de convite no seu Perfil.',
    href: '/profile',
    cta: 'Ver meu QR Code',
  },
];

interface WelcomeModalProps {
  onDismiss: () => void;
}

export function WelcomeModal({ onDismiss }: WelcomeModalProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [screen, setScreen] = useState<'welcome' | 'steps'>('welcome');

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  function finish() {
    localStorage.setItem('emetis_welcomed', 'true');
    localStorage.setItem('emetis_show_teo_intro', 'true');
    onDismiss();
  }

  function goTo(href: string) {
    finish();
    router.push(href);
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'rgba(15,23,42,0.75)' }}
    >
      <div
        className={`w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden transition-transform duration-300 ${
          visible ? 'translate-y-0' : 'translate-y-8'
        }`}
      >
        {screen === 'welcome' ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 pt-8 pb-6 text-center">
              <div className="text-4xl mb-2">🕊️</div>
              <h1 className="text-2xl font-bold text-white">Bem-vindo ao Emetis</h1>
              <p className="text-indigo-200 text-sm mt-2 leading-relaxed">
                "Perseveravam na comunhão, no partir do pão e nas orações."
              </p>
              <p className="text-indigo-300 text-xs mt-1">Atos 2:42</p>
            </div>

            {/* Missão */}
            <div className="px-6 pt-5 pb-2">
              <p className="text-slate-600 text-sm text-center leading-relaxed">
                O Emetis reconecta pessoas de forma real e presencial — para cristãos e para todos que desejam vínculos humanos genuínos.
              </p>
            </div>

            {/* Feature cards */}
            <div className="px-6 py-4 grid grid-cols-2 gap-3">
              {FEATURES.map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="bg-slate-50 rounded-2xl p-3 space-y-1.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={16} />
                  </div>
                  <p className="font-semibold text-slate-800 text-xs leading-tight">{title}</p>
                  <p className="text-slate-500 text-xs leading-tight">{desc}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="px-6 pb-8 pt-2">
              <button
                onClick={() => setScreen('steps')}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl text-base hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Começar <ChevronRight size={18} />
              </button>
              <p className="text-center text-xs text-slate-400 mt-3">
                Aberto a todos que buscam conexão humana real
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Header passos */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 pt-6 pb-5 text-center">
              <p className="text-indigo-200 text-xs uppercase tracking-widest mb-1">Para começar</p>
              <h2 className="text-xl font-bold text-white">3 primeiros passos</h2>
            </div>

            {/* Steps */}
            <div className="px-6 py-5 space-y-3">
              {STEPS.map(({ icon: Icon, color, title, desc, href, cta }, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-2xl p-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{desc}</p>
                    <button
                      onClick={() => goTo(href)}
                      className="mt-2 text-xs font-semibold text-indigo-600 flex items-center gap-0.5 hover:text-indigo-800"
                    >
                      {cta} <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pular */}
            <div className="px-6 pb-8 pt-1">
              <button
                onClick={finish}
                className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-2xl text-sm hover:bg-indigo-700 active:scale-95 transition-all"
              >
                Explorar o app por conta própria
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
