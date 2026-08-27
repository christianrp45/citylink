'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  HandHeart,
  Handshake,
  Heart,
  Loader2,
  MessageCircle,
  Search,
  UserMinus,
  UserPlus,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import VisitRequestModal from '@/components/visit-request-modal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Friend = {
  id: string;
  name: string | null;
  avatar: string | null;
  profession: string | null;
  availabilityStatus: string | null;
  circle?: string | null;
};

type PendingRequest = {
  senderId: string;
  senderName: string | null;
  senderAvatar: string | null;
  senderProfession: string | null;
  createdAt: string;
};

type DiscoverUser = {
  id: string;
  name: string | null;
  avatar: string | null;
  profession: string | null;
  availabilityStatus: string | null;
  lat: string;
  lng: string;
  distance: number;
};

type AlertItem = {
  id: string;
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  type: 'urgency' | 'prayer' | 'practical_help';
  description: string;
  lat: string | null;
  lng: string | null;
  status: string;
  createdAt: string;
};

const ALERT_LABEL: Record<string, string> = {
  urgency: 'Urgência',
  prayer: 'Oração',
  practical_help: 'Ajuda Prática',
};

const ALERT_COLOR: Record<string, string> = {
  urgency: 'bg-red-100 text-red-600 border-red-200',
  prayer: 'bg-purple-100 text-purple-600 border-purple-200',
  practical_help: 'bg-amber-100 text-amber-600 border-amber-200',
};

function avatarSrc(u: { name: string | null; avatar: string | null }) {
  return (
    u.avatar ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name ?? 'U')}&background=3b82f6&color=fff`
  );
}

// ─── Cards ────────────────────────────────────────────────────────────────────

function PendingRequestCard({
  req,
  onAccept,
  onReject,
}: {
  req: PendingRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [status, setStatus] = useState<'idle' | 'accepting' | 'rejecting'>('idle');

  async function handleAccept() {
    setStatus('accepting');
    try {
      await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: req.senderId }),
      });
      onAccept(req.senderId);
    } finally {
      setStatus('idle');
    }
  }

  async function handleReject() {
    setStatus('rejecting');
    try {
      await fetch('/api/friends/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: req.senderId }),
      });
      onReject(req.senderId);
    } finally {
      setStatus('idle');
    }
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <img
          src={req.senderAvatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(req.senderName ?? 'U')}&background=6366f1&color=fff`}
          alt={req.senderName ?? 'Usuário'}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate">{req.senderName ?? 'Usuário'}</p>
          {req.senderProfession && (
            <p className="text-xs text-slate-500 mt-0.5">{req.senderProfession}</p>
          )}
          <p className="text-[11px] text-indigo-500 mt-0.5">Quer se conectar com você</p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={handleAccept}
            disabled={status !== 'idle'}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {status === 'accepting' ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Aceitar
          </button>
          <button
            onClick={handleReject}
            disabled={status !== 'idle'}
            className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50"
          >
            {status === 'rejecting' ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function FriendCard({
  user,
  onVisit,
  onChat,
  onRemove,
  onCircleChange,
}: {
  user: Friend;
  onVisit: (u: Friend) => void;
  onChat: (id: string) => void;
  onRemove: (id: string) => void;
  onCircleChange: (id: string, circle: 'family' | 'friends') => void;
}) {
  const [removing, setRemoving] = useState(false);
  const [updatingCircle, setUpdatingCircle] = useState(false);
  const isFamily = user.circle === 'family';

  async function handleRemove() {
    setRemoving(true);
    try {
      await fetch('/api/friends', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: user.id }),
      });
      onRemove(user.id);
    } finally {
      setRemoving(false);
    }
  }

  async function toggleFamily() {
    setUpdatingCircle(true);
    const newCircle = isFamily ? 'friends' : 'family';
    try {
      await fetch(`/api/friends/${user.id}/circle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circle: newCircle }),
      });
      onCircleChange(user.id, newCircle);
    } finally {
      setUpdatingCircle(false);
    }
  }

  const isOnline = user.availabilityStatus !== 'offline';

  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-4 ${isFamily ? 'border-rose-200' : 'border-slate-100'}`}>
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={avatarSrc(user)}
            alt={user.name ?? 'Usuário'}
            className="w-14 h-14 rounded-full object-cover"
          />
          {isOnline && (
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-800 text-sm truncate">
              {user.name ?? 'Usuário'}
            </p>
            {isFamily && (
              <span className="text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                <Heart size={8} className="fill-rose-500 text-rose-500" /> Família
              </span>
            )}
            {user.availabilityStatus === 'mesa-posta' && (
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
                Mesa Posta
              </span>
            )}
          </div>
          {user.profession && (
            <p className="text-xs text-slate-500 mt-0.5">{user.profession}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <button
            onClick={() => onVisit(user)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Visitar
          </button>
          <div className="flex gap-1.5">
            <button
              onClick={() => onChat(user.id)}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <MessageCircle size={14} />
            </button>
            <button
              onClick={toggleFamily}
              disabled={updatingCircle}
              title={isFamily ? 'Remover da família' : 'Marcar como família'}
              className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                isFamily
                  ? 'bg-rose-100 text-rose-500 hover:bg-rose-200'
                  : 'bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-400'
              }`}
            >
              {updatingCircle ? <Loader2 size={14} className="animate-spin" /> : <Heart size={14} className={isFamily ? 'fill-rose-500' : ''} />}
            </button>
            <button
              onClick={handleRemove}
              disabled={removing}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors disabled:opacity-40"
            >
              {removing ? <Loader2 size={14} className="animate-spin" /> : <UserMinus size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiscoverCard({
  user,
  onAdded,
}: {
  user: DiscoverUser;
  onAdded: (id: string) => void;
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  async function handleAdd() {
    setStatus('sending');
    try {
      await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: user.id }),
      });
      setStatus('sent');
      onAdded(user.id);
    } catch {
      setStatus('idle');
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={avatarSrc(user)}
            alt={user.name ?? 'Usuário'}
            className="w-14 h-14 rounded-full object-cover"
          />
          {user.availabilityStatus !== 'offline' && (
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate">
            {user.name ?? 'Usuário'}
          </p>
          {user.profession && (
            <p className="text-xs text-slate-500 mt-0.5">{user.profession}</p>
          )}
          <p className="text-xs text-blue-500 mt-0.5">
            {user.distance < 1000
              ? `${Math.round(user.distance)}m`
              : `${(user.distance / 1000).toFixed(1)}km`}{' '}
            de você
          </p>
        </div>

        <button
          onClick={handleAdd}
          disabled={status !== 'idle'}
          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-60 ${
            status === 'sent'
              ? 'bg-green-100 text-green-600'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          {status === 'sending' ? (
            <Loader2 size={14} className="animate-spin" />
          ) : status === 'sent' ? (
            'Enviado'
          ) : (
            <UserPlus size={14} />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Alert detail modal ───────────────────────────────────────────────────────

function AlertModal({
  alert,
  onClose,
}: {
  alert: AlertItem;
  onClose: () => void;
}) {
  const [responding, setResponding] = useState(false);
  const [done, setDone] = useState(false);

  async function handleRespond() {
    setResponding(true);
    try {
      await fetch(`/api/alerts/${alert.id}/respond`, { method: 'POST' });
      setDone(true);
    } finally {
      setResponding(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-3xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <span
            className={`text-sm font-bold px-3 py-1 rounded-full border ${
              ALERT_COLOR[alert.type]
            }`}
          >
            {ALERT_LABEL[alert.type]}
          </span>
          <button onClick={onClose} className="text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <img
            src={
              alert.userAvatar ??
              `https://ui-avatars.com/api/?name=${encodeURIComponent(alert.userName ?? 'U')}&background=ef4444&color=fff`
            }
            alt={alert.userName ?? ''}
            className="w-12 h-12 rounded-full object-cover border-2 border-amber-300"
          />
          <div>
            <p className="font-bold text-slate-800">{alert.userName ?? 'Usuário'}</p>
            <p className="text-xs text-slate-400">
              {new Date(alert.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-5">{alert.description}</p>

        {done ? (
          <div className="w-full py-3 bg-green-50 text-green-600 font-bold rounded-2xl text-center text-sm">
            Resposta enviada! 🙏
          </div>
        ) : (
          <button
            onClick={handleRespond}
            disabled={responding}
            className="w-full py-3 bg-amber-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-600 disabled:opacity-60"
          >
            {responding ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <HandHeart size={18} />
            )}
            Posso Ajudar!
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function CommunityPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'friends' | 'discover' | 'alerts'>('friends');
  const [search, setSearch] = useState('');

  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [discover, setDiscover] = useState<DiscoverUser[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  const [visitTarget, setVisitTarget] = useState<{
    id: string;
    name: string;
    avatar: string;
    profession: string;
    openToVisits: boolean;
    homeLocation: { lat: number; lng: number; address: string };
  } | null>(null);

  const fetchFriends = useCallback(async () => {
    try {
      const [friendsRes, pendingRes] = await Promise.all([
        fetch('/api/friends'),
        fetch('/api/friends/pending'),
      ]);
      if (friendsRes.ok) setFriends(await friendsRes.json());
      if (pendingRes.ok) setPendingRequests(await pendingRes.json());
    } catch {
      toast.error('Não foi possível carregar seus amigos.');
    }
  }, []);

  const fetchDiscover = useCallback(async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude: lat, longitude: lng } = pos.coords;
        const res = await fetch(
          `/api/users/nearby?lat=${lat}&lng=${lng}&radius=5000`
        );
        if (res.ok) {
          const nearby: DiscoverUser[] = await res.json();
          const friendIds = new Set(friends.map((f) => f.id));
          setDiscover(nearby.filter((u) => !friendIds.has(u.id)));
        }
      } catch {}
    }, () => {});
  }, [friends]);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) setAlerts(await res.json());
    } catch {
      toast.error('Não foi possível carregar os alertas.');
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchFriends(), fetchAlerts()]).finally(() =>
      setLoading(false)
    );
  }, [fetchFriends, fetchAlerts]);

  useEffect(() => {
    if (tab === 'discover') fetchDiscover();
  }, [tab, fetchDiscover]);

  function handleRemoveFriend(id: string) {
    setFriends((prev) => prev.filter((f) => f.id !== id));
  }

  function handleAdded(id: string) {
    setDiscover((prev) => prev.filter((u) => u.id !== id));
  }

  function handleAcceptRequest(senderId: string) {
    // Move da lista de pendentes para amigos
    const req = pendingRequests.find((r) => r.senderId === senderId);
    setPendingRequests((prev) => prev.filter((r) => r.senderId !== senderId));
    if (req) {
      setFriends((prev) => [
        ...prev,
        {
          id: req.senderId,
          name: req.senderName,
          avatar: req.senderAvatar,
          profession: req.senderProfession,
          availabilityStatus: null,
          circle: 'friends',
        },
      ]);
    }
  }

  function handleRejectRequest(senderId: string) {
    setPendingRequests((prev) => prev.filter((r) => r.senderId !== senderId));
  }

  function handleCircleChange(id: string, circle: 'family' | 'friends') {
    setFriends((prev) => prev.map((f) => (f.id === id ? { ...f, circle } : f)));
  }

  const filteredFriends = friends.filter(
    (u) =>
      !search ||
      (u.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (u.profession ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredDiscover = discover.filter(
    (u) =>
      !search ||
      (u.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (u.profession ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-24">
      {/* Cards de acesso rápido */}
      <div className="px-4 pt-4 pb-1 flex flex-col gap-2">
        <Link
          href="/talents"
          className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl px-4 py-3.5 shadow-sm active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Handshake size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm">Troca de Talentos</p>
            <p className="text-emerald-100 text-xs leading-tight">
              Ofereça e encontre habilidades na comunidade
            </p>
          </div>
          <span className="text-white/70 text-lg">›</span>
        </Link>

        <Link
          href="/events"
          className="flex items-center gap-3 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl px-4 py-3.5 shadow-sm active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <CalendarDays size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm">Eventos</p>
            <p className="text-violet-100 text-xs leading-tight">
              Encontros sociais, religiosos e de voluntariado
            </p>
          </div>
          <span className="text-white/70 text-lg">›</span>
        </Link>
      </div>

      {/* Barra de busca + tabs */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm px-4 py-3 space-y-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pessoas..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(['friends', 'discover', 'alerts'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                tab === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'friends'
                ? `Amigos${pendingRequests.length > 0 ? ` · ${pendingRequests.length} pedido${pendingRequests.length > 1 ? 's' : ''}` : ` (${friends.length})`}`
                : t === 'discover'
                ? 'Descobrir'
                : `Alertas ${alerts.length > 0 ? `(${alerts.length})` : ''}`}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-blue-400" />
          </div>
        )}

        {/* Amigos */}
        {!loading && tab === 'friends' && (
          <>
            {/* Pedidos de amizade pendentes */}
            {pendingRequests.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide px-1">
                  Pedidos de amizade ({pendingRequests.length})
                </p>
                {pendingRequests.map((req) => (
                  <PendingRequestCard
                    key={req.senderId}
                    req={req}
                    onAccept={handleAcceptRequest}
                    onReject={handleRejectRequest}
                  />
                ))}
              </div>
            )}

            {filteredFriends.length === 0 && pendingRequests.length === 0 && (
              <div className="text-center py-14 px-6">
                <p className="text-5xl mb-3">🤝</p>
                <p className="text-base font-semibold text-slate-700">Sua rede está vazia</p>
                <p className="text-sm text-slate-400 mt-1 mb-4">Conecte-se com membros da sua célula ou explore pessoas próximas</p>
                <button
                  onClick={() => setTab('discover')}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-indigo-700 transition-colors"
                >
                  Descobrir pessoas próximas →
                </button>
              </div>
            )}
            {filteredFriends.map((u) => (
              <FriendCard
                key={u.id}
                user={u}
                onVisit={(friend) =>
                  setVisitTarget({
                    id: friend.id,
                    name: friend.name ?? 'Usuário',
                    avatar: avatarSrc(friend),
                    profession: friend.profession ?? '',
                    openToVisits: friend.availabilityStatus === 'mesa-posta',
                    homeLocation: { lat: 0, lng: 0, address: '' },
                  })
                }
                onChat={(id) => router.push(`/chat?with=${id}`)}
                onRemove={handleRemoveFriend}
                onCircleChange={handleCircleChange}
              />
            ))}
          </>
        )}

        {/* Descobrir */}
        {!loading && tab === 'discover' && (
          <>
            {filteredDiscover.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <p className="text-4xl mb-2">🔍</p>
                <p className="text-sm">Ninguém próximo encontrado.</p>
                <p className="text-xs mt-1">Permita localização para ver sugestões.</p>
              </div>
            )}
            {filteredDiscover.map((u) => (
              <DiscoverCard key={u.id} user={u} onAdded={handleAdded} />
            ))}
          </>
        )}

        {/* Alertas */}
        {!loading && tab === 'alerts' && (
          <>
            {alerts.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <AlertTriangle size={40} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">Nenhum alerta samaritano ativo.</p>
              </div>
            )}
            {alerts.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAlert(a)}
                className={`w-full text-left bg-white rounded-2xl border p-4 shadow-sm ${
                  ALERT_COLOR[a.type]
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={
                      a.userAvatar ??
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(a.userName ?? 'U')}&background=ef4444&color=fff`
                    }
                    alt={a.userName ?? ''}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm truncate">{a.userName ?? 'Usuário'}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/60 flex-shrink-0">
                        {ALERT_LABEL[a.type]}
                      </span>
                    </div>
                    <p className="text-xs mt-1 line-clamp-2 text-slate-600">{a.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </>
        )}
      </div>

      {visitTarget && (
        <VisitRequestModal user={visitTarget} onClose={() => setVisitTarget(null)} />
      )}

      {selectedAlert && (
        <AlertModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}

    </div>
  );
}
