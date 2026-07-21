'use client';

import { useEffect, useState } from 'react';
import { Share2, Copy, Check, Loader2 } from 'lucide-react';

export function ShareInviteButton() {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/users/my-invite')
      .then((r) => r.json())
      .then((d) => { if (d.code) setCode(d.code); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const inviteUrl = code
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://app.emetis.com.br'}/ref/${code}`
    : '';

  async function handleShare() {
    if (!inviteUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emetis — Conexão real, presença que transforma',
          text: `Olá! Entrei no Emetis, um app de conexão comunitária cristã. Venha também! Use meu link: ${inviteUrl}`,
          url: inviteUrl,
        });
      } catch {
        // usuário cancelou
      }
      return;
    }

    // Fallback: copiar
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-50 text-indigo-400">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Gerando link...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {/* Link copiável */}
      {code && (
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <span className="flex-1 text-xs text-slate-500 truncate font-mono">/ref/{code}</span>
          <button
            onClick={handleShare}
            className="text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
            title="Copiar link"
          >
            {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
          </button>
        </div>
      )}

      {/* Botão principal de compartilhar */}
      <button
        onClick={handleShare}
        disabled={!code}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {copied
          ? <><Check size={16} /> Link copiado!</>
          : <><Share2 size={16} /> Convidar amigos</>
        }
      </button>

      <p className="text-center text-[11px] text-slate-400">
        Quem entrar pelo seu link te dá +50 pontos
      </p>
    </div>
  );
}
