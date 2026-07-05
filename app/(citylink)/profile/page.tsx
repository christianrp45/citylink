'use client';

import { useEffect, useRef, useState } from 'react';
import { LogOut, Edit2, MapPin, Phone, Mail, Users, Camera, Loader2, Bell, BellOff, Check, X, Shield, ChevronDown, ChevronUp, Download, Trash2, Clock, CheckCircle } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { BottomNav } from '@/components/citylink-bottom-nav';
import { usePushNotifications } from '@/hooks/use-push-notifications';

type AvailabilityStatus = 'mesa-posta' | 'requer-aviso' | 'offline';

type ProximityConfig = {
  isActive: boolean | null;
  radiusMeters: number | null;
  activeWhen: string | null;
  locationExpiresHours: number | null;
  cooldownMinutes: number | null;
  notifyWhenFriendNear: boolean | null;
  notifyWhenCellMemberNear: boolean | null;
  notifyWhenCommunityNear: boolean | null;
};

type PrivacySettings = {
  consentDataProcessing: boolean | null;
  consentLocation: boolean | null;
  consentProximityAlerts: boolean | null;
  consentVisitRequests: boolean | null;
  consentProfileVisible: boolean | null;
};

type PendingVisit = {
  id: string;
  message: string | null;
  createdAt: string;
  fromUserId: string;
  fromUserName: string | null;
  fromUserAvatar: string | null;
  fromUserProfession: string | null;
};

type AcceptedVisit = {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  respondedAt: string | null;
  toUserId: string;
  toUserName: string | null;
  toUserAvatar: string | null;
  toUserProfession: string | null;
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
  const [acceptedVisits, setAcceptedVisits] = useState<AcceptedVisit[]>([]);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [proximity, setProximity] = useState<ProximityConfig | null>(null);
  const [proximityOpen, setProximityOpen] = useState(false);
  const [savingProximity, setSavingProximity] = useState(false);
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

  // Carregar visitas pendentes e confirmadas
  useEffect(() => {
    apiFetch('/api/visits/pending')
      .then((data: PendingVisit[]) => setPendingVisits(data))
      .catch(() => {});
    apiFetch('/api/visits/accepted')
      .then((data: AcceptedVisit[]) => setAcceptedVisits(data))
      .catch(() => {});
  }, []);

  // Carregar configurações de privacidade e proximidade
  useEffect(() => {
    apiFetch('/api/users/privacy')
      .then((data: PrivacySettings) => setPrivacy(data))
      .catch(() => {});
    apiFetch('/api/users/proximity-config')
      .then((data: ProximityConfig) => setProximity(data))
      .catch(() => {});
  }, []);

  async function handlePrivacyToggle(key: keyof PrivacySettings) {
    if (!privacy) return;
    const newValue = !privacy[key];
    setPrivacy(prev => prev ? { ...prev, [key]: newValue } : prev);
    setSavingPrivacy(true);
    try {
      await apiFetch('/api/users/privacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newValue }),
      });
    } catch {
      // reverte
      setPrivacy(prev => prev ? { ...prev, [key]: !newValue } : prev);
    } finally {
      setSavingPrivacy(false);
    }
  }

  async function handleExportData() {
    const res = await fetch('/api/users/export');
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meus-dados-citylink.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleProximityChange(patch: Partial<ProximityConfig>) {
    setProximity(prev => prev ? { ...prev, ...patch } : prev);
    setSavingProximity(true);
    try {
      const updated = await apiFetch('/api/users/proximity-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      setProximity(updated);
    } catch {
      // reverte
      setProximity(prev => prev ? { ...prev, ...Object.fromEntries(Object.keys(patch).map(k => [k, (proximity as Record<string, unknown>)?.[k]])) } : prev);
    } finally {
      setSavingProximity(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Tem certeza? Esta ação é irreversível. Todos os seus dados serão apagados permanentemente.'
    );
    if (!confirmed) return;
    setDeletingAccount(true);
    try {
      await apiFetch('/api/users/delete-account', { method: 'DELETE' });
      await signOut({ callbackUrl: '/login' });
    } catch {
      setDeletingAccount(false);
    }
  }

  async function handleRespond(requestId: string, decision: 'accepted' | 'declined' | 'postponed') {
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
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <button
                        onClick={() => handleRespond(visit.id, 'accepted')}
                        disabled={isResponding}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {isResponding ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                        Aceitar
                      </button>
                      <button
                        onClick={() => handleRespond(visit.id, 'postponed')}
                        disabled={isResponding}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50"
                      >
                        <Clock size={11} />
                        30 min
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

        {/* Visitas confirmadas (enviadas por mim e aceitas) */}
        {acceptedVisits.length > 0 && (
          <div className="bg-white rounded-2xl border border-green-100 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle size={15} className="text-green-500" />
              <h3 className="font-bold text-slate-800">
                Visitas confirmadas ({acceptedVisits.length})
              </h3>
            </div>
            {acceptedVisits.map((visit) => {
              const name = visit.toUserName ?? 'Alguém';
              const avatar =
                visit.toUserAvatar ??
                `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`;
              return (
                <div key={visit.id} className="flex items-center gap-3 py-2 border-t border-slate-50 first:border-0 first:pt-0">
                  <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{name}</p>
                    {visit.toUserProfession && (
                      <p className="text-xs text-slate-400">{visit.toUserProfession}</p>
                    )}
                    <p className="text-xs text-green-600 font-medium mt-0.5">✅ Visita aceita — pode ir!</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Notificações Push */}
        <PushToggle />

        {/* Alertas de Proximidade */}
        <div className="rounded-2xl border border-slate-100 overflow-hidden">
          <button
            onClick={() => setProximityOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white"
          >
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
              <MapPin size={16} className="text-purple-500" />
              Alertas de Proximidade
              {savingProximity && <Loader2 size={12} className="animate-spin text-slate-400" />}
              {proximity?.isActive && (
                <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-semibold">Ativo</span>
              )}
            </div>
            {proximityOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>

          {proximityOpen && (
            <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 space-y-4">
              {/* Toggle principal */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Ativar módulo</p>
                  <p className="text-xs text-slate-400">Receber alertas quando amigos estiverem perto</p>
                </div>
                <button
                  onClick={() => handleProximityChange({ isActive: !proximity?.isActive })}
                  disabled={savingProximity}
                  className={`relative w-12 h-7 rounded-full transition-colors disabled:opacity-50 ${proximity?.isActive ? 'bg-purple-500' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${proximity?.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {proximity?.isActive && (
                <>
                  {/* Raio */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Raio de alerta</p>
                    <div className="grid grid-cols-5 gap-1">
                      {[100, 300, 500, 1000, 5000].map(r => (
                        <button
                          key={r}
                          onClick={() => handleProximityChange({ radiusMeters: r })}
                          disabled={savingProximity}
                          className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${proximity.radiusMeters === r ? 'bg-purple-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                        >
                          {r < 1000 ? `${r}m` : `${r / 1000}km`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cooldown */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Intervalo mínimo entre alertas</p>
                    <div className="grid grid-cols-4 gap-1">
                      {[15, 30, 60, 120].map(m => (
                        <button
                          key={m}
                          onClick={() => handleProximityChange({ cooldownMinutes: m })}
                          disabled={savingProximity}
                          className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${proximity.cooldownMinutes === m ? 'bg-purple-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                        >
                          {m < 60 ? `${m}min` : `${m / 60}h`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expiração de localização */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Dados de localização expiram após</p>
                    <div className="grid grid-cols-3 gap-1">
                      {[1, 6, 24].map(h => (
                        <button
                          key={h}
                          onClick={() => handleProximityChange({ locationExpiresHours: h })}
                          disabled={savingProximity}
                          className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${proximity.locationExpiresHours === h ? 'bg-purple-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                        >
                          {h === 1 ? '1 hora' : `${h}h`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notificar quando */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Notificar quando estiver perto de</p>
                    {[
                      { key: 'notifyWhenFriendNear' as keyof ProximityConfig, label: 'Amigos' },
                      { key: 'notifyWhenCellMemberNear' as keyof ProximityConfig, label: 'Membros da célula' },
                      { key: 'notifyWhenCommunityNear' as keyof ProximityConfig, label: 'Membros da comunidade' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-slate-600">{label}</span>
                        <button
                          onClick={() => handleProximityChange({ [key]: !proximity[key] })}
                          disabled={savingProximity}
                          className={`relative w-9 h-5 rounded-full transition-colors disabled:opacity-50 ${proximity[key] ? 'bg-purple-500' : 'bg-slate-200'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${proximity[key] ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Privacidade e Dados */}
        <div className="rounded-2xl border border-slate-100 overflow-hidden">
          <button
            onClick={() => setPrivacyOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white"
          >
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
              <Shield size={16} className="text-blue-500" />
              Privacidade e Dados
              {savingPrivacy && <Loader2 size={12} className="animate-spin text-slate-400" />}
            </div>
            {privacyOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>

          {privacyOpen && (
            <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 space-y-3">
              {/* Consentimentos */}
              {[
                { key: 'consentLocation' as keyof PrivacySettings, label: 'Apareço no mapa' },
                { key: 'consentProximityAlerts' as keyof PrivacySettings, label: 'Alertas de proximidade' },
                { key: 'consentVisitRequests' as keyof PrivacySettings, label: 'Receber pedidos de visita' },
                { key: 'consentProfileVisible' as keyof PrivacySettings, label: 'Perfil visível na comunidade' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{label}</span>
                  <button
                    onClick={() => handlePrivacyToggle(key)}
                    disabled={savingPrivacy}
                    className={`relative w-10 h-6 rounded-full transition-colors disabled:opacity-50 ${
                      privacy?.[key] ? 'bg-blue-500' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        privacy?.[key] ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}

              <div className="pt-2 space-y-2">
                {/* Exportar dados */}
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center gap-2 py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  <Download size={14} className="text-blue-500" />
                  Exportar meus dados (LGPD art. 18)
                </button>

                {/* Deletar conta */}
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="w-full flex items-center gap-2 py-2 px-3 rounded-xl bg-white border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deletingAccount
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Trash2 size={14} />
                  }
                  Excluir minha conta e dados
                </button>
              </div>
            </div>
          )}
        </div>

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
