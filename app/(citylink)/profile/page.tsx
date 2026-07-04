'use client';

import { useEffect, useRef, useState } from 'react';
import { LogOut, Edit2, MapPin, Phone, Mail, Users, Camera, Loader2, Bell, BellOff, Check, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { BottomNav } from '@/components/citylink-bottom-nav';
import { usePushNotifications } from '@/hooks/use-push-notifications';

type AvailabilityStatus = 'mesa-posta' | 'requer-aviso' | 'offline';

type PendingVisit = {
  id: string;
  message: string | null;
  createdAt: string;
  fromUserId: string;
  fromUserName: string | null;
  fromUserAvatar: string | null;
  fromUserProfession: string | null;
};

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  profession: string | null;
  avatar: string | null;
  bio: string | null;
  availabilityStatus: AvailabilityStatus | null;
  lat: string | null;
  lng: string | null;
};

const STATUS_CONFIG: Record<
  AvailabilityStatus,
  { label: string; desc: string; color: string; dot: string }
> = {
  'mesa-posta': {
    label: 'Mesa Posta',
    desc: 'Aceito visitas sem aviso prévio',
    color: 'bg-green-50 border-green-200',
    dot: 'bg-green-500',
  },
  'requer-aviso': {
    label: 'Requer Aviso',
    desc: 'Prefiro ser avisado antes',
    color: 'bg-amber-50 border-amber-200',
    dot: 'bg-amber-500',
  },
  offline: {
    label: 'Offline',
    desc: 'Não disponível para visitas',
    color: 'bg-slate-50 border-slate-200',
    dot: 'bg-slate-400',
  },
};

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Toggle de notificações push ──────────────────────────────────────────────

function PushToggle() {
  const { state, subscribe, unsubscribe } = usePushNotifications();

  if (state === 'unsupported') return null;

  const isLoading = state === 'loading';

  return (
    <button
      onClick={state === 'subscribed' ? unsubscribe : subscribe}
      disabled={isLoading}
      className={`w-full py-3 rounded-2xl border font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
        state === 'subscribed'
          ? 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100'
          : state === 'denied'
          ? 'border-slate-200 text-slate-400 cursor-not-allowed'
          : 'border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100'
      }`}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : state === 'subscribed' ? (
        <BellOff size={16} />
      ) : (
        <Bell size={16} />
      )}
      {state === 'subscribed'
        ? 'Notificações ativadas (toque para desativar)'
        : state === 'denied'
        ? 'Notificações bloqueadas no navegador'
        : 'Ativar Notificações Push'}
    </button>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AvailabilityStatus>('mesa-posta');
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [savingBio, setSavingBio] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [pendingVisits, setPendingVisits] = useState<PendingVisit[]>([]);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Carregar perfil do banco
  useEffect(() => {
    apiFetch('/api/users/me')
      .then((data: UserProfile) => {
        setProfile(data);
        setStatus(data.availabilityStatus ?? 'mesa-posta');
        setEditBio(data.bio ?? '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Carregar visitas pendentes
  useEffect(() => {
    apiFetch('/api/visits/pending')
      .then((data: PendingVisit[]) => setPendingVisits(data))
      .catch(() => {});
  }, []);

  async function handleRespond(requestId: string, decision: 'accepted' | 'declined') {
    setRespondingId(requestId);
    try {
      await apiFetch('/api/visits/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: decision }),
      });
      setPendingVisits((prev) => prev.filter((v) => v.id !== requestId));
    } catch {
    } finally {
      setRespondingId(null);
    }
  }

  async function handleStatusChange(newStatus: AvailabilityStatus) {
    setStatus(newStatus);
    setSavingStatus(true);
    try {
      const updated = await apiFetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availabilityStatus: newStatus }),
      });
      setProfile((prev) => prev ? { ...prev, ...updated } : prev);
    } catch {
      // reverte
      setStatus(status);
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleSaveBio() {
    setSavingBio(true);
    try {
      const updated = await apiFetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: editBio }),
      });
      setProfile((prev) => prev ? { ...prev, ...updated } : prev);
      setIsEditing(false);
    } catch {
    } finally {
      setSavingBio(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/files/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error();
      const { url } = await res.json();

      const updated = await apiFetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: url }),
      });
      setProfile((prev) => prev ? { ...prev, ...updated } : prev);
    } catch {
    } finally {
      setUploadingAvatar(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[status];
  const displayName = profile?.name ?? profile?.email ?? 'Usuário';

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-blue-600 pt-6 pb-16 px-4">
        <div className="flex items-center gap-4">
          {/* Avatar com upload */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-blue-400 flex items-center justify-center">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              {uploadingAvatar ? (
                <Loader2 size={11} className="animate-spin text-blue-500" />
              ) : (
                <Camera size={11} className="text-slate-600" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="text-white">
            <h1 className="text-xl font-bold">{displayName}</h1>
            {profile?.profession && (
              <p className="text-blue-200 text-sm">{profile.profession}</p>
            )}
            <p className="text-blue-300 text-xs mt-0.5">{profile?.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-4 -mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
        <div className="py-4 text-center">
          <p className="text-2xl font-bold text-blue-600">0</p>
          <p className="text-xs text-slate-500 mt-0.5">Amigos</p>
        </div>
        <div className="py-4 text-center">
          <p className="text-2xl font-bold text-green-500">✓</p>
          <p className="text-xs text-slate-500 mt-0.5">Ativo</p>
        </div>
        <div className="py-4 text-center">
          <p className="text-2xl font-bold text-amber-500">⭐</p>
          <p className="text-xs text-slate-500 mt-0.5">Membro</p>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Mesa Posta */}
        <div className={`bg-white rounded-2xl border p-4 ${statusInfo.color}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800">Mesa Posta</h3>
            <div className={`w-3 h-3 rounded-full ${statusInfo.dot} ${savingStatus ? 'animate-pulse' : ''}`} />
          </div>
          <p className="text-sm text-slate-600 mb-3">{statusInfo.desc}</p>
          <div className="flex gap-2">
            {(
              Object.entries(STATUS_CONFIG) as [
                AvailabilityStatus,
                (typeof STATUS_CONFIG)[AvailabilityStatus],
              ][]
            ).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => handleStatusChange(key)}
                disabled={savingStatus}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  status === key
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-1 ${cfg.dot}`}
                />
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bio / Como posso ajudar */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800">Como posso ajudar</h3>
            {!isEditing && (
              <button
                onClick={() => {
                  setEditBio(profile?.bio ?? '');
                  setIsEditing(true);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Edit2 size={15} />
              </button>
            )}
          </div>
          {isEditing ? (
            <>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={4}
                placeholder="Descreva como você pode ajudar a comunidade..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveBio}
                  disabled={savingBio}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                >
                  {savingBio && <Loader2 size={13} className="animate-spin" />}
                  Salvar
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed">
              {profile?.bio || 'Nenhum talento registrado ainda'}
            </p>
          )}
        </div>

        {/* Informações */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
          <h3 className="font-bold text-slate-800">Informações</h3>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Mail size={15} className="text-slate-400 flex-shrink-0" />
            <span>{profile?.email}</span>
          </div>
          {profile?.phone && (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Phone size={15} className="text-slate-400 flex-shrink-0" />
              <span>{profile.phone}</span>
            </div>
          )}
          {profile?.profession && (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Users size={15} className="text-slate-400 flex-shrink-0" />
              <span>{profile.profession}</span>
            </div>
          )}
          {(profile?.lat && profile?.lng) && (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <MapPin size={15} className="text-slate-400 flex-shrink-0" />
              <span>Localização registrada</span>
            </div>
          )}
        </div>

        {/* Visitas pendentes */}
        {pendingVisits.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-blue-500" />
              <h3 className="font-bold text-slate-800">
                Visitas pendentes ({pendingVisits.length})
              </h3>
            </div>
            {pendingVisits.map((visit) => {
              const name = visit.fromUserName ?? 'Alguém';
              const avatar =
                visit.fromUserAvatar ??
                `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`;
              const isResponding = respondingId === visit.id;
              return (
                <div key={visit.id} className="flex items-start gap-3 py-2 border-t border-slate-50 first:border-0 first:pt-0">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{name}</p>
                    {visit.fromUserProfession && (
                      <p className="text-xs text-slate-400">{visit.fromUserProfession}</p>
                    )}
                    {visit.message && (
                      <p className="text-xs text-slate-500 mt-0.5 italic">"{visit.message}"</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleRespond(visit.id, 'accepted')}
                        disabled={isResponding}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {isResponding ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                        Aceitar
                      </button>
                      <button
                        onClick={() => handleRespond(visit.id, 'declined')}
                        disabled={isResponding}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                      >
                        <X size={11} />
                        Recusar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Notificações Push */}
        <PushToggle />

        {/* Sair */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full py-3 rounded-2xl border border-red-200 text-red-500 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          Sair da Conta
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
