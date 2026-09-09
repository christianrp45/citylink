'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserCheck, MessageCircle, MapPin, Loader2, UserPlus, Users, Heart } from 'lucide-react';

interface CellInfo { id: string; name: string; neighborhood: string | null; }
interface LevelInfo { name: string; emoji: string; total: number; }

interface PublicProfile {
  id: string;
  name: string | null;
  avatar: string | null;
  profession: string | null;
  bio: string | null;
  availabilityStatus: 'mesa-posta' | 'requer-aviso' | 'offline' | null;
  lastTestimonial: { id: string; title: string; excerpt: string; createdAt: string } | null;
  cells: CellInfo[];
  level: LevelInfo | null;
}

type CircleType = 'family' | 'friends' | 'members';
type FriendStatus = 'none' | 'pending' | 'accepted';

const CIRCLES: { value: CircleType; label: string; emoji: string; color: string; active: string }[] = [
  { value: 'family',  label: 'Família', emoji: '❤️', color: 'border-rose-200 text-rose-600 hover:border-rose-400',   active: 'bg-rose-500 text-white border-rose-500' },
  { value: 'friends', label: 'Amigo',   emoji: '👥', color: 'border-blue-200 text-blue-600 hover:border-blue-400',   active: 'bg-blue-500 text-white border-blue-500' },
  { value: 'members', label: 'Membro',  emoji: '⛪', color: 'border-green-200 text-green-700 hover:border-green-400', active: 'bg-green-600 text-white border-green-600' },
];

const CIRCLE_DESC: Record<CircleType, string> = {
  family:  'Vê sua localização exata no mapa',
  friends: 'Vê apenas seu bairro (~1 km)',
  members: 'Vê apenas seu bairro (~1 km)',
};

const STATUS_LABEL: Record<string, { label: string; color: string; dot: string }> = {
  'mesa-posta':   { label: 'Mesa Posta',   color: 'text-green-600',  dot: 'bg-green-500' },
  'requer-aviso': { label: 'Requer Aviso', color: 'text-amber-600',  dot: 'bg-amber-400' },
  'offline':      { label: 'Offline',      color: 'text-slate-400',  dot: 'bg-slate-300' },
};

export default function ConnectPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // estado de amizade
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');
  const [currentCircle, setCurrentCircle] = useState<CircleType>('friends');
  const [selectedCircle, setSelectedCircle] = useState<CircleType>('friends');

  // ações
  const [sendingRequest, setSendingRequest] = useState(false);
  const [updatingCircle, setUpdatingCircle] = useState(false);
  const [circleSuccess, setCircleSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${userId}`).then((r) => {
        if (!r.ok) throw new Error('Usuário não encontrado');
        return r.json() as Promise<PublicProfile>;
      }),
      fetch(`/api/friends/${userId}/circle`).then((r) => r.json() as Promise<{ status: string; circle: string | null }>),
    ])
      .then(([prof, friendship]) => {
        setProfile(prof);
        const status = (friendship.status ?? 'none') as FriendStatus;
        const circle = (friendship.circle ?? 'friends') as CircleType;
        setFriendStatus(status);
        setCurrentCircle(circle);
        setSelectedCircle(circle);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  async function handleAddFriend() {
    setSendingRequest(true);
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: userId }),
      });
      if (res.ok) setFriendStatus('pending');
    } finally {
      setSendingRequest(false);
    }
  }

  async function handleSaveCircle() {
    setUpdatingCircle(true);
    setCircleSuccess(false);
    try {
      await fetch(`/api/friends/${userId}/circle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circle: selectedCircle }),
      });
      setCurrentCircle(selectedCircle);
      setCircleSuccess(true);
      setTimeout(() => setCircleSuccess(false), 2500);
    } finally {
      setUpdatingCircle(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-4xl">😔</p>
        <p className="font-semibold text-slate-700">Usuário não encontrado</p>
        <p className="text-sm text-slate-500">Este QR Code pode ter expirado ou o usuário não existe.</p>
        <button onClick={() => router.push('/map')} className="mt-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
          Ir para o Mapa
        </button>
      </div>
    );
  }

  const avatarUrl = profile.avatar
    ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name ?? 'U')}&background=6366f1&color=fff&size=128`;

  const statusInfo = STATUS_LABEL[profile.availabilityStatus ?? 'offline'];
  const circleChanged = selectedCircle !== currentCircle;

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 pt-10 pb-16 px-4 text-center">
        <p className="text-indigo-200 text-sm mb-4">
          {friendStatus === 'accepted' ? 'Seu vínculo com' : 'Você escaneou o QR Code de'}
        </p>
        <div className="relative w-24 h-24 mx-auto">
          <img
            src={avatarUrl}
            alt={profile.name ?? ''}
            className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover"
          />
          {profile.level && (
            <span className="absolute -bottom-1 -right-1 text-xl leading-none">
              {profile.level.emoji}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-white mt-3">{profile.name ?? 'Usuário'}</h1>
        {profile.profession && (
          <p className="text-indigo-200 text-sm mt-1">{profile.profession}</p>
        )}
        {profile.level && (
          <p className="text-indigo-300 text-xs mt-1">
            {profile.level.emoji} {profile.level.name.charAt(0).toUpperCase() + profile.level.name.slice(1)} · {profile.level.total} pts
          </p>
        )}
      </div>

      {/* Card principal */}
      <div className="mx-4 -mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.dot}`} />
          <span className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-slate-600 text-sm leading-relaxed">{profile.bio}</p>
        )}

        {/* ── Seletor de círculo ── */}
        <div className="space-y-2.5 pt-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {friendStatus === 'accepted' ? 'Tipo de vínculo' : 'Como você o conhece?'}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {CIRCLES.map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedCircle(c.value)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  selectedCircle === c.value ? c.active : `bg-white ${c.color}`
                }`}
              >
                <span className="text-lg leading-none">{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 text-center leading-snug">
            {CIRCLE_DESC[selectedCircle]}
          </p>
        </div>

        {/* ── Ações ── */}
        <div className="space-y-3 pt-1">
          {friendStatus === 'accepted' ? (
            <>
              {circleSuccess && (
                <div className="flex items-center gap-2 justify-center py-2.5 bg-green-50 rounded-xl text-green-700 text-sm font-semibold">
                  <UserCheck size={16} /> Vínculo atualizado!
                </div>
              )}
              {circleChanged && !circleSuccess && (
                <button
                  onClick={handleSaveCircle}
                  disabled={updatingCircle}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {updatingCircle ? <Loader2 size={18} className="animate-spin" /> : <UserCheck size={18} />}
                  Salvar vínculo
                </button>
              )}
              {!circleChanged && !circleSuccess && (
                <div className="flex items-center gap-2 justify-center py-2.5 bg-slate-50 rounded-xl text-slate-500 text-sm">
                  <UserCheck size={16} className="text-indigo-400" /> Já conectados
                </div>
              )}
            </>
          ) : friendStatus === 'pending' ? (
            <div className="flex items-center gap-2 justify-center py-3 bg-green-50 rounded-xl text-green-700 text-sm font-semibold">
              <UserCheck size={18} />
              Pedido de amizade enviado!
            </div>
          ) : (
            <button
              onClick={handleAddFriend}
              disabled={sendingRequest}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 active:scale-95 transition-all"
            >
              {sendingRequest ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              Adicionar como {CIRCLES.find(c => c.value === selectedCircle)?.label.toLowerCase()}
            </button>
          )}

          {profile.availabilityStatus === 'mesa-posta' && (
            <button
              onClick={() => router.push(`/map?visit=${userId}`)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 active:scale-95 transition-all"
            >
              <MapPin size={18} />
              Solicitar visita
            </button>
          )}

          <button
            onClick={() => router.push(`/chat?with=${userId}`)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 active:scale-95 transition-all"
          >
            <MessageCircle size={18} />
            Enviar mensagem
          </button>
        </div>
      </div>

      {/* Células */}
      {profile.cells.length > 0 && (
        <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Grupos</p>
          <div className="space-y-2">
            {profile.cells.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Users size={15} className="text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                  {c.neighborhood && (
                    <p className="text-xs text-slate-400 truncate">{c.neighborhood}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Último testemunho */}
      {profile.lastTestimonial && (
        <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Heart size={12} className="text-rose-400" /> Último testemunho
          </p>
          <p className="text-sm font-semibold text-slate-800 mb-1">{profile.lastTestimonial.title}</p>
          <p className="text-xs text-slate-500 leading-relaxed">{profile.lastTestimonial.excerpt}</p>
          <p className="text-[10px] text-slate-400 mt-2">
            {new Date(profile.lastTestimonial.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          </p>
        </div>
      )}

      <p className="text-center text-xs text-slate-400 mt-6 mb-4 px-4">
        Conectado pelo Emetis — reconexão humana real
      </p>
    </div>
  );
}
