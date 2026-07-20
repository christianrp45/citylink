'use client';

import { useEffect, useRef, useState } from 'react';
import { LogOut, Edit2, MapPin, Phone, Mail, Users, Camera, Loader2, Bell, BellOff, Check, X, Shield, ChevronDown, ChevronUp, Download, Trash2, Clock, CheckCircle, Heart, Home, Briefcase, Church, Plus, QrCode, Copy } from 'lucide-react';
import QRCode from 'react-qr-code';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
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

type FriendWithCircle = {
  id: string;
  name: string | null;
  avatar: string | null;
  profession: string | null;
  status: string;
  circle: 'family' | 'friends';
};

type SavedLocation = {
  id: string;
  label: string;
  type: 'home' | 'work' | 'church' | 'other';
  lat: string;
  lng: string;
  isActive: boolean;
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
  const { data: session } = useSession();
  const isGuest = session?.user?.type === 'guest';
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AvailabilityStatus>('mesa-posta');
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [savingBio, setSavingBio] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editInfo, setEditInfo] = useState({ name: '', phone: '', profession: '' });
  const [savingInfo, setSavingInfo] = useState(false);
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
  const [friends, setFriends] = useState<FriendWithCircle[]>([]);
  const [circlesOpen, setCirclesOpen] = useState(false);
  const [updatingCircle, setUpdatingCircle] = useState<string | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [addingLocation, setAddingLocation] = useState(false);
  const [newLocLabel, setNewLocLabel] = useState('');
  const [newLocType, setNewLocType] = useState<SavedLocation['type']>('home');
  const [savingLocation, setSavingLocation] = useState(false);
  const [togglingLocId, setTogglingLocId] = useState<string | null>(null);
  const [deletingLocId, setDeletingLocId] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [missions, setMissions] = useState<{
    total: number; level: string; weekPoints: number;
    nextLevelName: string | null; nextLevelMin: number | null;
    missions: { action: string; label: string; points: number; emoji: string; completed: boolean }[];
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const connectUrl = typeof window !== 'undefined' && profile
    ? `${window.location.origin}/connect/${profile.id}`
    : '';

  function handleCopyLink() {
    if (!connectUrl) return;
    navigator.clipboard.writeText(connectUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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

  // Carregar missões semanais
  useEffect(() => {
    if (!isGuest) {
      fetch('/api/missions').then((r) => r.json()).then(setMissions).catch(() => {});
    }
  }, [isGuest]);

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
    apiFetch('/api/friends')
      .then((data: FriendWithCircle[]) =>
        setFriends(data.filter((f) => f.status === 'accepted'))
      )
      .catch(() => {});
    apiFetch('/api/users/locations')
      .then((data: SavedLocation[]) => setSavedLocations(data))
      .catch(() => {});
  }, []);

  async function handleSaveLocation() {
    if (!newLocLabel.trim()) return;
    setSavingLocation(true);
    try {
      const pos = await new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          reject,
          { timeout: 10000 }
        );
      });
      const res = await fetch('/api/users/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: newLocLabel.trim(),
          type: newLocType,
          lat: String(pos.lat),
          lng: String(pos.lng),
          setActive: savedLocations.length === 0,
        }),
      });
      if (res.ok) {
        const created: SavedLocation = await res.json();
        setSavedLocations((prev) => [created, ...prev]);
        setNewLocLabel('');
        setNewLocType('home');
        setAddingLocation(false);
      }
    } catch {
      alert('Não foi possível obter sua localização. Verifique se o GPS está ativo.');
    } finally {
      setSavingLocation(false);
    }
  }

  async function handleToggleLocation(loc: SavedLocation) {
    setTogglingLocId(loc.id);
    const next = !loc.isActive;
    try {
      await fetch(`/api/users/locations/${loc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: next }),
      });
      setSavedLocations((prev) =>
        prev.map((l) => ({ ...l, isActive: next ? l.id === loc.id : false }))
      );
    } catch {
    } finally {
      setTogglingLocId(null);
    }
  }

  async function handleDeleteLocation(locId: string) {
    setDeletingLocId(locId);
    try {
      await fetch(`/api/users/locations/${locId}`, { method: 'DELETE' });
      setSavedLocations((prev) => prev.filter((l) => l.id !== locId));
    } catch {
    } finally {
      setDeletingLocId(null);
    }
  }

  async function handleCircleChange(friendId: string, circle: 'family' | 'friends') {
    setUpdatingCircle(friendId);
    setFriends((prev) =>
      prev.map((f) => (f.id === friendId ? { ...f, circle } : f))
    );
    try {
      await fetch(`/api/friends/${friendId}/circle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circle }),
      });
    } catch {
      // reverte
      setFriends((prev) =>
        prev.map((f) =>
          f.id === friendId
            ? { ...f, circle: circle === 'family' ? 'friends' : 'family' }
            : f
        )
      );
    } finally {
      setUpdatingCircle(null);
    }
  }

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
    a.download = 'meus-dados-emetis.json';
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

  async function handleSaveInfo() {
    setSavingInfo(true);
    try {
      const updated = await apiFetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editInfo.name.trim() || undefined,
          phone: editInfo.phone.trim() || undefined,
          profession: editInfo.profession.trim() || undefined,
        }),
      });
      setProfile((prev) => prev ? { ...prev, ...updated } : prev);
      setIsEditingInfo(false);
    } catch {
    } finally {
      setSavingInfo(false);
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

      {/* Banner visitante */}
      {isGuest && (
        <div className="bg-amber-500 px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-white text-sm font-medium leading-snug">
            Você está como <strong>visitante</strong>. Crie uma conta para salvar seus dados.
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <Link
              href="/register"
              className="bg-white text-amber-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
            >
              Criar conta
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Entrar
            </button>
          </div>
        </div>
      )}

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

          <div className="text-white flex-1 min-w-0">
            <h1 className="text-xl font-bold">{displayName}</h1>
            {profile?.profession && (
              <p className="text-blue-200 text-sm">{profile.profession}</p>
            )}
            <p className="text-blue-300 text-xs mt-0.5">{profile?.email}</p>
          </div>

          {/* Botão QR Code */}
          <button
            onClick={() => setShowQR(true)}
            className="flex-shrink-0 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
            title="Meu QR Code"
          >
            <QrCode size={20} className="text-white" />
          </button>
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

        {/* Missões Semanais */}
        {missions && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                🎯 Missões da Semana
              </h3>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
                {missions.weekPoints} pts esta semana
              </span>
            </div>

            {/* Nível */}
            <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-indigo-700 capitalize">
                  {['semente','broto','árvore','fruto','luz'].includes(missions.level)
                    ? { semente:'🌱', broto:'🌿', árvore:'🌳', fruto:'🍎', luz:'✨' }[missions.level as 'semente'|'broto'|'árvore'|'fruto'|'luz']
                    : '🌱'
                  } Nível {missions.level}
                </span>
                <span className="text-xs text-slate-500">{missions.total} pts total</span>
              </div>
              {missions.nextLevelMin && (
                <div className="w-full bg-indigo-100 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((missions.total / missions.nextLevelMin) * 100, 100)}%` }}
                  />
                </div>
              )}
              {missions.nextLevelName && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Próximo nível: <span className="capitalize font-medium">{missions.nextLevelName}</span> ({missions.nextLevelMin} pts)
                </p>
              )}
            </div>

            {/* Lista de missões */}
            <div className="space-y-2">
              {missions.missions.map((m) => (
                <div
                  key={m.action}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                    m.completed
                      ? 'bg-emerald-50 border border-emerald-100'
                      : 'bg-slate-50 border border-slate-100'
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{m.emoji}</span>
                  <p className={`flex-1 text-xs leading-tight ${m.completed ? 'text-emerald-700 line-through' : 'text-slate-600'}`}>
                    {m.label}
                  </p>
                  <span className={`text-xs font-bold flex-shrink-0 ${m.completed ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {m.completed ? '✓' : `+${m.points}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Informações</h3>
            {!isEditingInfo && (
              <button
                onClick={() => {
                  setEditInfo({
                    name: profile?.name ?? '',
                    phone: profile?.phone ?? '',
                    profession: profile?.profession ?? '',
                  });
                  setIsEditingInfo(true);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Edit2 size={15} />
              </button>
            )}
          </div>

          {isEditingInfo ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-slate-400 flex-shrink-0" />
                  <input
                    value={editInfo.name}
                    onChange={(e) => setEditInfo((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Seu nome completo"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400 flex-shrink-0" />
                  <input
                    value={editInfo.phone}
                    onChange={(e) => setEditInfo((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="WhatsApp (ex: 41 99999-9999)"
                    type="tel"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={14} className="text-slate-400 flex-shrink-0" />
                  <input
                    value={editInfo.profession}
                    onChange={(e) => setEditInfo((p) => ({ ...p, profession: e.target.value }))}
                    placeholder="Profissão ou ministério"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setIsEditingInfo(false)}
                  className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveInfo}
                  disabled={savingInfo}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                >
                  {savingInfo && <Loader2 size={13} className="animate-spin" />}
                  Salvar
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail size={15} className="text-slate-400 flex-shrink-0" />
                <span>{profile?.email}</span>
              </div>
              {profile?.phone ? (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={15} className="text-slate-400 flex-shrink-0" />
                  <span>{profile.phone}</span>
                </div>
              ) : (
                <button
                  onClick={() => { setEditInfo({ name: profile?.name ?? '', phone: '', profession: profile?.profession ?? '' }); setIsEditingInfo(true); }}
                  className="flex items-center gap-2 text-xs text-blue-500 hover:text-blue-700"
                >
                  <Phone size={13} /> Adicionar telefone
                </button>
              )}
              {profile?.profession ? (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Briefcase size={15} className="text-slate-400 flex-shrink-0" />
                  <span>{profile.profession}</span>
                </div>
              ) : (
                <button
                  onClick={() => { setEditInfo({ name: profile?.name ?? '', phone: profile?.phone ?? '', profession: '' }); setIsEditingInfo(true); }}
                  className="flex items-center gap-2 text-xs text-blue-500 hover:text-blue-700"
                >
                  <Briefcase size={13} /> Adicionar profissão
                </button>
              )}
              {(profile?.lat && profile?.lng) && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <MapPin size={15} className="text-slate-400 flex-shrink-0" />
                  <span>Localização registrada</span>
                </div>
              )}
            </>
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

        {/* Círculos de Confiança */}
        <div className="rounded-2xl border border-slate-100 overflow-hidden">
          <button
            onClick={() => setCirclesOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white"
          >
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
              <Heart size={16} className="text-rose-500" />
              Círculos de Confiança
              <span className="text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full font-semibold">
                {friends.filter(f => f.circle === 'family').length} família
              </span>
            </div>
            {circlesOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>

          {circlesOpen && (
            <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong>Família</strong> vê sua localização exata no mapa.{' '}
                <strong>Amigos</strong> veem apenas o bairro (~1 km).
              </p>

              {friends.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">
                  Nenhum amigo adicionado ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {friends.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2">
                      <img
                        src={f.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name ?? 'U')}&background=e2e8f0&color=475569&size=40`}
                        alt={f.name ?? 'Amigo'}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{f.name ?? 'Sem nome'}</p>
                        {f.profession && (
                          <p className="text-xs text-slate-400 truncate">{f.profession}</p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleCircleChange(f.id, 'family')}
                          disabled={updatingCircle === f.id}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            f.circle === 'family'
                              ? 'bg-rose-500 text-white'
                              : 'bg-white border border-slate-200 text-slate-500 hover:border-rose-300'
                          }`}
                        >
                          {updatingCircle === f.id && f.circle !== 'family' ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : '❤️ Família'}
                        </button>
                        <button
                          onClick={() => handleCircleChange(f.id, 'friends')}
                          disabled={updatingCircle === f.id}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            f.circle === 'friends'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300'
                          }`}
                        >
                          {updatingCircle === f.id && f.circle !== 'friends' ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : '👥 Amigo'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Meus Locais */}
        <div className="rounded-2xl border border-slate-100 overflow-hidden">
          <button
            onClick={() => setLocationsOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white"
          >
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
              <MapPin size={16} className="text-teal-500" />
              Meus Locais
              {savedLocations.some((l) => l.isActive) && (
                <span className="text-[10px] bg-teal-100 text-teal-600 px-1.5 py-0.5 rounded-full font-semibold">
                  {savedLocations.find((l) => l.isActive)?.label}
                </span>
              )}
            </div>
            {locationsOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>

          {locationsOpen && (
            <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Salve pontos fixos (casa, trabalho, igreja) para usar no mapa sem precisar do GPS a cada vez.
                O local <strong>ativo</strong> é usado quando você aparece disponível.
              </p>

              {/* Lista de locais salvos */}
              {savedLocations.length > 0 && (
                <div className="space-y-2">
                  {savedLocations.map((loc) => {
                    const Icon = loc.type === 'home' ? Home : loc.type === 'work' ? Briefcase : loc.type === 'church' ? Church : MapPin;
                    const isToggling = togglingLocId === loc.id;
                    const isDeleting = deletingLocId === loc.id;
                    return (
                      <div key={loc.id} className={`flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border ${loc.isActive ? 'border-teal-300' : 'border-transparent'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${loc.isActive ? 'bg-teal-100' : 'bg-slate-100'}`}>
                          <Icon size={15} className={loc.isActive ? 'text-teal-600' : 'text-slate-400'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{loc.label}</p>
                          <p className="text-xs text-slate-400">
                            {loc.isActive ? '✅ Ativo no mapa' : `${parseFloat(loc.lat).toFixed(4)}, ${parseFloat(loc.lng).toFixed(4)}`}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleToggleLocation(loc)}
                            disabled={isToggling || isDeleting}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                              loc.isActive
                                ? 'bg-teal-500 text-white'
                                : 'bg-white border border-slate-200 text-slate-500 hover:border-teal-300'
                            }`}
                          >
                            {isToggling ? <Loader2 size={10} className="animate-spin" /> : loc.isActive ? 'Ativo' : 'Usar'}
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(loc.id)}
                            disabled={isDeleting || isToggling}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Formulário para adicionar */}
              {addingLocation ? (
                <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                  <input
                    type="text"
                    value={newLocLabel}
                    onChange={(e) => setNewLocLabel(e.target.value)}
                    placeholder="Nome do local (ex: Casa, Igreja)"
                    maxLength={50}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  <div className="grid grid-cols-4 gap-1">
                    {([
                      { value: 'home', label: 'Casa', Icon: Home },
                      { value: 'work', label: 'Trabalho', Icon: Briefcase },
                      { value: 'church', label: 'Igreja', Icon: Church },
                      { value: 'other', label: 'Outro', Icon: MapPin },
                    ] as const).map(({ value, label, Icon }) => (
                      <button
                        key={value}
                        onClick={() => setNewLocType(value)}
                        className={`flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] font-semibold border transition-colors ${
                          newLocType === value ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-slate-500 border-slate-200'
                        }`}
                      >
                        <Icon size={14} />
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setAddingLocation(false); setNewLocLabel(''); }}
                      className="flex-1 py-2 border border-slate-200 rounded-lg text-xs text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveLocation}
                      disabled={savingLocation || !newLocLabel.trim()}
                      className="flex-1 py-2 bg-teal-500 text-white rounded-lg text-xs font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {savingLocation ? <Loader2 size={12} className="animate-spin" /> : null}
                      {savingLocation ? 'Capturando GPS…' : 'Salvar posição atual'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingLocation(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-teal-300 text-teal-600 rounded-xl text-xs font-semibold hover:bg-teal-50 transition-colors"
                >
                  <Plus size={14} />
                  Adicionar local
                </button>
              )}
            </div>
          )}
        </div>

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

        {/* Dashboard Pastoral (admin) */}
        <Link
          href="/admin"
          className="w-full py-3 rounded-2xl border border-indigo-200 text-indigo-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"
        >
          <Shield size={16} />
          Dashboard Pastoral
        </Link>

        {/* Sair */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full py-3 rounded-2xl border border-red-200 text-red-500 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          Sair da Conta
        </button>
      </div>

      {/* Modal QR Code */}
      {showQR && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(15,23,42,0.7)' }}
          onClick={() => setShowQR(false)}
        >
          <div
            className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-lg">Meu QR Code</h2>
              <button onClick={() => setShowQR(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <p className="text-sm text-slate-500 text-center">
              Mostre este QR para alguém escanear e se conectar com você no Emetis.
            </p>

            {/* QR */}
            <div className="flex justify-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              {connectUrl && (
                <QRCode
                  value={connectUrl}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#1e1b4b"
                />
              )}
            </div>

            <p className="text-center font-semibold text-slate-700 text-sm">{displayName}</p>

            {/* Link copiável */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <p className="flex-1 text-xs text-slate-500 truncate">{connectUrl}</p>
              <button
                onClick={handleCopyLink}
                className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
