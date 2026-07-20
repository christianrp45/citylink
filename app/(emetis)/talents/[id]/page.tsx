'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, MessageCircle, Share2, ArrowLeft, Handshake } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_EMOJI: Record<string, string> = {
  Culinária: '🍽️', Tecnologia: '💻', Saúde: '🏥', Educação: '📚',
  Construção: '🔨', Arte: '🎨', Música: '🎵', Idiomas: '🌍', Finanças: '💰', Outros: '✨',
};

type TalentDetail = {
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

function avatarSrc(name: string | null, avatar: string | null) {
  return (
    avatar ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? 'U')}&background=10b981&color=fff&size=128`
  );
}

export default function TalentPublicPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [talent, setTalent] = useState<TalentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/talents/${id}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setTalent(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleShare() {
    const url = `${window.location.origin}/talents/${id}`;
    const text = talent
      ? `${talent.userName ?? 'Alguém'} oferece "${talent.title}" na Emetis 🤝`
      : 'Confira este talento na Emetis';

    if (navigator.share) {
      await navigator.share({ title: talent?.title ?? 'Talento', text, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 size={28} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  if (notFound || !talent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <p className="font-bold text-slate-700 text-lg">Talento não encontrado</p>
        <p className="text-slate-500 text-sm mt-1 mb-6">Este talento pode ter sido removido ou não existe.</p>
        <Link href="/talents" className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition">
          Ver todos os talentos
        </Link>
      </div>
    );
  }

  const emoji = CATEGORY_EMOJI[talent.category] ?? '✨';
  const isMe = session?.user?.id === talent.userId;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-slate-50 pb-24">
      {/* Header */}
      <div className="bg-emerald-700 text-white px-4 pt-12 pb-8 shadow-md">
        <button onClick={() => router.back()} className="text-emerald-200 hover:text-white text-sm flex items-center gap-1 mb-4">
          <ArrowLeft size={16} /> Voltar
        </button>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            {emoji} {talent.category}
          </span>
        </div>
        <h1 className="text-2xl font-black leading-tight">{talent.title}</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Card do autor */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-4">
          <img
            src={avatarSrc(talent.userName, talent.userAvatar)}
            alt={talent.userName ?? ''}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-100"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800">{talent.userName ?? 'Membro Emetis'}</p>
            {talent.userProfession && (
              <p className="text-slate-500 text-sm">{talent.userProfession}</p>
            )}
            <p className="text-slate-400 text-xs mt-0.5">
              Publicado em {new Date(talent.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Descrição */}
        {talent.description && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Sobre o talento</p>
            <p className="text-slate-700 text-sm leading-relaxed">{talent.description}</p>
          </div>
        )}

        {/* Ações */}
        <div className="space-y-3">
          {!isMe && (
            <Link
              href={session ? `/chat?with=${talent.userId}` : '/login'}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition shadow-sm"
            >
              <MessageCircle size={18} /> Entrar em contato
            </Link>
          )}

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-emerald-300 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition"
          >
            <Share2 size={18} />
            {copied ? 'Link copiado! ✓' : 'Compartilhar este talento'}
          </button>
        </div>

        {/* CTA para não logados */}
        {!session && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
            <Handshake size={28} className="text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-emerald-800 text-sm">Faça parte da Emetis</p>
            <p className="text-emerald-600 text-xs mt-1 mb-3">
              Conecte cristãos, troque talentos e cresça junto com sua comunidade.
            </p>
            <Link
              href="/register"
              className="inline-block px-5 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition"
            >
              Criar conta gratuita
            </Link>
          </div>
        )}

        <Link href="/talents" className="block text-center text-sm text-slate-400 hover:text-slate-600 transition">
          Ver todos os talentos →
        </Link>
      </div>
    </div>
  );
}
