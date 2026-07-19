'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Navigation, Users, AlertTriangle, X, Loader2, MessageCircle, Zap, HandHeart, CheckCircle, Home, Clock, Plus, Calendar } from 'lucide-react';
import Link from 'next/link';
import VisitRequestModal from '@/components/visit-request-modal';
import { WelcomeModal } from '@/components/welcome-modal';
import { TeoNewUserSheet } from '@/components/teo-new-user-sheet';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false });

const CURITIBA = { lat: -25.4284, lng: -49.2733 };
const NEARBY_RADIUS = 2000;

function formatDistance(m: number) {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

type NearbyUser = {
  id: string;
  name: string | null;
  avatar: string | null;
  profession: string | null;
  availabilityStatus: 'mesa-posta' | 'requer-aviso' | 'offline' | null;
  lat: string;
  lng: string;
  distance: number;
};

// Adapta NearbyUser para o formato esperado pelo VisitRequestModal
function toModalUser(u: NearbyUser) {
  return {
    id: u.id,
    name: u.name ?? 'Usuário',
    avatar: u.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name ?? 'U')}&background=3b82f6&color=fff`,
    profession: u.profession ?? '',
    openToVisits: u.availabilityStatus === 'mesa-posta',
    homeLocation: {
      lat: parseFloat(u.lat),
      lng: parseFloat(u.lng),
      address: '',
    },
  };
}

type HospitalityWindow = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  radiusMeters: number;
  userId: string;
  hostName: string | null;
  hostAvatar: string | null;
  hostProfession: string | null;
  hostLat: string | null;
  hostLng: string | null;
};

type CommunityAlert = {
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
  urgency: '#ef4444',
  prayer: '#8b5cf6',
  practical_help: '#f59e0b',
};

export default function MapPage() {
  const router = useRouter();

  // Onboarding de novo usuário
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTeoIntro, setShowTeoIntro] = useState(false);
  const [showTeoSheet, setShowTeoSheet] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('emetis_welcomed')) {
      setShowWelcome(true);
    } else if (localStorage.getItem('emetis_show_teo_intro')) {
      setShowTeoIntro(true);
    }
  }, []);

  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [center, setCenter] = useState<[number, number]>([CURITIBA.lat, CURITIBA.lng]);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ReturnType<typeof toModalUser> | null>(null);
  const [alerts, setAlerts] = useState<CommunityAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<CommunityAlert | null>(null);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [alertForm, setAlertForm] = useState({ type: 'urgency' as CommunityAlert['type'], description: '' });
  const [savingAlert, setSavingAlert] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [leaflet, setLeaflet] = useState<any>(null);
  const [available, setAvailable] = useState(false);
  const [settingAvailable, setSettingAvailable] = useState(false);
  const [acceptedVisit, setAcceptedVisit] = useState<{ toUserName: string | null } | null>(null);
  const [hospitalityWindows, setHospitalityWindows] = useState<HospitalityWindow[]>([]);
  const [selectedWindow, setSelectedWindow] = useState<HospitalityWindow | null>(null);
  const [myWindow, setMyWindow] = useState<HospitalityWindow | null>(null);
  const [showCreateWindow, setShowCreateWindow] = useState(false);
  const [windowForm, setWindowForm] = useState({ title: '', description: '', hours: 3 });
  const [savingWindow, setSavingWindow] = useState(false);
  const locationSaved = useRef(false);
  const [activeSavedLoc, setActiveSavedLoc] = useState<{ lat: number; lng: number } | null>(null);
  const seenAcceptedIds = useRef<Set<string>>(new Set());

  // Salvar localização no banco e buscar usuários próximos
  const onLocationObtained = useCallback(async (loc: { lat: number; lng: number }) => {
    setUserLoc(loc);
    setCenter([loc.lat, loc.lng]);

    // Salvar no banco (uma vez por sessão)
    if (!locationSaved.current) {
      locationSaved.current = true;
      fetch('/api/users/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loc),
      }).catch(() => {});
    }

    // Buscar usuários próximos
    setLoadingUsers(true);
    try {
      const res = await fetch(
        `/api/users/nearby?lat=${loc.lat}&lng=${loc.lng}&radius=${NEARBY_RADIUS}`
      );
      if (res.ok) {
        const data: NearbyUser[] = await res.json();
        setNearbyUsers(data);
      }
    } catch {
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const handleSetAvailable = useCallback(async () => {
    if (settingAvailable) return;
    const next = !available;
    setAvailable(next);
    setSettingAvailable(true);
    try {
      await Promise.all([
        fetch('/api/users/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ availabilityStatus: next ? 'mesa-posta' : 'requer-aviso' }),
        }),
        fetch('/api/users/proximity-config', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: next }),
        }),
      ]);

      if (next) {
        // Broadcast: usa local salvo ativo (se configurado), senão usa GPS
        const broadcastLoc = activeSavedLoc ?? userLoc;
        if (broadcastLoc) {
          fetch('/api/users/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(broadcastLoc),
          }).catch(() => {});
        }
        // Criar janela de hospitalidade automaticamente (se ainda não houver)
        if (!myWindow) {
          const now = new Date();
          const endsAt = new Date(now.getTime() + 3 * 60 * 60 * 1000);
          const res = await fetch('/api/hospitality', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'Estou disponível agora 🏠',
              startsAt: now.toISOString(),
              endsAt: endsAt.toISOString(),
            }),
          });
          if (res.ok) {
            const created: HospitalityWindow = await res.json();
            setMyWindow(created);
            setHospitalityWindows((prev) => [...prev, created]);
          }
        }
      } else {
        // Ao desligar, cancelar a janela ativa automaticamente
        if (myWindow) {
          await fetch(`/api/hospitality/${myWindow.id}`, { method: 'DELETE' });
          setMyWindow(null);
          setHospitalityWindows((prev) => prev.filter((w) => w.id !== myWindow.id));
        }
      }
    } catch {
      setAvailable(!next); // rollback on error
    } finally {
      setSettingAvailable(false);
    }
  }, [available, settingAvailable, userLoc, myWindow, activeSavedLoc]);

  // Centralizar no usuário atual (sem novo fetch de geoloc)
  const centerOnMe = useCallback(() => {
    if (userLoc) {
      setCenter([userLoc.lat, userLoc.lng]);
      return;
    }
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => onLocationObtained({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, [userLoc, onLocationObtained]);

  useEffect(() => {
    import('leaflet').then((m) => {
      setLeaflet(m.default);
      setMapReady(true);
    });

    // GPS sempre roda para posição real em tempo real
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => onLocationObtained({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }

    // Carregar local salvo ativo (usado só no broadcast "Estou disponível", não no mapa)
    fetch('/api/users/locations')
      .then((r) => r.ok ? r.json() : [])
      .then((locs: Array<{ lat: string; lng: string; isActive: boolean }>) => {
        const active = locs.find((l) => l.isActive);
        if (active) setActiveSavedLoc({ lat: parseFloat(active.lat), lng: parseFloat(active.lng) });
      })
      .catch(() => {});

    // Buscar janelas de hospitalidade ativas
    function loadWindows() {
      fetch('/api/hospitality/active')
        .then((r) => r.json())
        .then((list: HospitalityWindow[]) => setHospitalityWindows(Array.isArray(list) ? list : []))
        .catch(() => {});
    }
    // Buscar minha janela ativa
    function loadMyWindow() {
      fetch('/api/hospitality')
        .then((r) => r.json())
        .then((w: HospitalityWindow | null) => setMyWindow(w))
        .catch(() => {});
    }
    loadWindows();
    loadMyWindow();
    const windowInterval = setInterval(loadWindows, 60_000);

    // Buscar alertas comunitários
    function loadAlerts() {
      fetch('/api/alerts')
        .then((r) => r.ok ? r.json() : [])
        .then((list: CommunityAlert[]) => setAlerts(Array.isArray(list) ? list : []))
        .catch(() => {});
    }
    loadAlerts();
    const alertInterval = setInterval(loadAlerts, 60_000);

    // Poll visitas aceitas a cada 30s para mostrar banner

    function checkAccepted() {
      fetch('/api/visits/accepted')
        .then((r) => r.json())
        .then((list: Array<{ id: string; toUserName: string | null }>) => {
          const newest = list.find((v) => !seenAcceptedIds.current.has(v.id));
          if (newest) {
            seenAcceptedIds.current.add(newest.id);
            setAcceptedVisit({ toUserName: newest.toUserName });
          }
        })
        .catch(() => {});
    }
    checkAccepted();
    const interval = setInterval(checkAccepted, 30_000);
    return () => {
      clearInterval(interval);
      clearInterval(windowInterval);
      clearInterval(alertInterval);
    };
  }, [onLocationObtained]);

  async function handleCreateWindow() {
    if (!windowForm.title.trim()) return;
    setSavingWindow(true);
    const now = new Date();
    const endsAt = new Date(now.getTime() + windowForm.hours * 60 * 60 * 1000);
    try {
      const res = await fetch('/api/hospitality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: windowForm.title,
          description: windowForm.description || undefined,
          startsAt: now.toISOString(),
          endsAt: endsAt.toISOString(),
        }),
      });
      if (res.ok) {
        const created: HospitalityWindow = await res.json();
        setMyWindow(created);
        setHospitalityWindows((prev) => [...prev, created]);
        setShowCreateWindow(false);
        setWindowForm({ title: '', description: '', hours: 3 });
      }
    } finally {
      setSavingWindow(false);
    }
  }

  async function handleCancelWindow() {
    if (!myWindow) return;
    await fetch(`/api/hospitality/${myWindow.id}`, { method: 'DELETE' });
    setMyWindow(null);
    setHospitalityWindows((prev) => prev.filter((w) => w.id !== myWindow.id));
  }

  async function handleCreateAlert() {
    if (!alertForm.description.trim()) return;
    setSavingAlert(true);
    try {
      const body: Record<string, unknown> = {
        type: alertForm.type,
        description: alertForm.description,
      };
      if (userLoc) {
        body.lat = String(userLoc.lat);
        body.lng = String(userLoc.lng);
      }
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const created: CommunityAlert = await res.json();
        setAlerts((prev) => [created, ...prev]);
        setAlertForm({ type: 'urgency', description: '' });
        setShowCreateAlert(false);
      }
    } finally {
      setSavingAlert(false);
    }
  }

  function hospitalityIcon(w: HospitalityWindow) {
    if (!leaflet) return undefined;
    const avatarSrc =
      w.hostAvatar ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(w.hostName ?? 'H')}&background=6366f1&color=fff&size=40`;
    return leaflet.divIcon({
      className: '',
      html: `<div style="position:relative;width:52px;height:52px">
        <div style="position:absolute;inset:0;border-radius:50%;background:rgba(99,102,241,0.25);animation:pulse 1.5s ease-out infinite"></div>
        <img src="${avatarSrc}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:3px solid #6366f1;position:absolute;top:6px;left:6px"/>
        <div style="position:absolute;top:2px;right:2px;width:16px;height:16px;border-radius:50%;background:#6366f1;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:9px">🏠</div>
        <style>@keyframes pulse{0%{transform:scale(1);opacity:.6}70%{transform:scale(1.6);opacity:0}100%{transform:scale(1.6);opacity:0}}</style>
      </div>`,
      iconSize: [52, 52],
      iconAnchor: [26, 26],
    });
  }

  function userIcon(u: NearbyUser) {
    if (!leaflet) return undefined;
    const border = u.availabilityStatus === 'mesa-posta' ? '#10b981' : '#f59e0b';
    const avatarSrc =
      u.avatar ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name ?? 'U')}&background=3b82f6&color=fff&size=40`;
    return leaflet.divIcon({
      className: '',
      html: `<div style="position:relative;width:44px;height:44px">
        <img src="${avatarSrc}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:3px solid ${border};position:absolute;top:2px;left:2px"/>
        <div style="position:absolute;bottom:2px;right:2px;width:10px;height:10px;border-radius:50%;background:${border};border:2px solid white"></div>
      </div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  }

  function alertIcon(type: CommunityAlert['type'] = 'urgency') {
    if (!leaflet) return undefined;
    const color = ALERT_COLOR[type] ?? '#f59e0b';
    const label = type === 'urgency' ? 'SOS' : type === 'prayer' ? '🙏' : '🤝';
    return leaflet.divIcon({
      className: '',
      html: `<div style="width:36px;height:36px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px ${color}66;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;color:white">${label}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  }

  function meIcon() {
    if (!leaflet) return undefined;
    return leaflet.divIcon({
      className: '',
      html: '<div style="width:24px;height:24px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3)"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <div className="flex-1 relative min-h-0">
        {mapReady && (
          <MapContainer
            center={center}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="OpenStreetMap"
            />
            {userLoc && leaflet && (
              <>
                <Marker position={[userLoc.lat, userLoc.lng]} icon={meIcon()}>
                  <Popup>
                    <strong>Você está aqui</strong>
                  </Popup>
                </Marker>
                <Circle
                  center={[userLoc.lat, userLoc.lng]}
                  radius={NEARBY_RADIUS}
                  pathOptions={{
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.05,
                    weight: 1,
                    dashArray: '6',
                  }}
                />
              </>
            )}
            {leaflet &&
              hospitalityWindows
                .filter((w) => w.hostLat && w.hostLng)
                .map((w) => (
                  <Marker
                    key={w.id}
                    position={[parseFloat(w.hostLat!), parseFloat(w.hostLng!)]}
                    icon={hospitalityIcon(w)}
                    eventHandlers={{ click: () => setSelectedWindow(w) }}
                  />
                ))}
            {leaflet &&
              alerts.filter((a) => a.lat && a.lng).map((a) => (
                <Marker
                  key={a.id}
                  position={[parseFloat(a.lat!), parseFloat(a.lng!)]}
                  icon={alertIcon(a.type)}
                  eventHandlers={{ click: () => setSelectedAlert(a) }}
                />
              ))}
            {leaflet &&
              nearbyUsers.map((u) => (
                <Marker
                  key={u.id}
                  position={[parseFloat(u.lat), parseFloat(u.lng)]}
                  icon={userIcon(u)}
                  eventHandlers={{ click: () => setSelectedUser(toModalUser(u)) }}
                >
                  <Popup>
                    <div style={{ textAlign: 'center', minWidth: 140 }}>
                      <img
                        src={u.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name ?? 'U')}&background=3b82f6&color=fff`}
                        alt={u.name ?? 'Usuário'}
                        style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 4px', objectFit: 'cover' }}
                      />
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{u.name ?? 'Usuário'}</p>
                      {u.profession && (
                        <p style={{ fontSize: 12, color: '#6b7280' }}>{u.profession}</p>
                      )}
                      <p style={{ fontSize: 11, color: u.availabilityStatus === 'mesa-posta' ? '#10b981' : '#f59e0b', marginTop: 2 }}>
                        {u.availabilityStatus === 'mesa-posta' ? '🟢 Mesa Posta' : '🟡 Requer Aviso'}
                      </p>
                      <button
                        onClick={() => setSelectedUser(toModalUser(u))}
                        style={{ marginTop: 8, width: '100%', fontSize: 12, background: '#2563eb', color: 'white', padding: '6px', borderRadius: 8, border: 'none', cursor: 'pointer' }}
                      >
                        Solicitar Visita
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        )}
        <button
          onClick={centerOnMe}
          className="absolute bottom-4 right-4 z-[1000] bg-white rounded-full p-3 shadow-lg border border-slate-200"
        >
          <Navigation size={20} className="text-blue-600" />
        </button>
      </div>

      {/* Painel inferior */}
      <div className="bg-white border-t border-slate-200 px-4 pt-3 pb-20 flex-shrink-0">
        {/* Botão disponibilidade + janela de hospitalidade unificados */}
        {available ? (
          <div className="mb-3">
            <div className="w-full flex items-center gap-2 bg-green-500 rounded-t-xl px-4 py-2.5">
              <Zap size={16} className="fill-white text-white flex-shrink-0" />
              <p className="text-white font-semibold text-sm flex-1">Mesa Posta — você está disponível</p>
              <button
                onClick={handleSetAvailable}
                disabled={settingAvailable}
                className="text-white/80 hover:text-white text-xs font-medium"
              >
                {settingAvailable ? <Loader2 size={12} className="animate-spin" /> : 'Desligar'}
              </button>
            </div>
            {myWindow && (
              <div className="w-full flex items-center gap-2 bg-green-50 border border-green-200 border-t-0 rounded-b-xl px-3 py-1.5">
                <Home size={12} className="text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700 flex-1 truncate">{myWindow.title}</p>
                <p className="text-[10px] text-green-500">
                  até {new Date(myWindow.endsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleSetAvailable}
            disabled={settingAvailable}
            className="w-full flex items-center justify-center gap-2 mb-3 py-2.5 rounded-xl font-semibold text-sm bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
          >
            {settingAvailable ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Zap size={16} />
            )}
            Estou disponível agora
          </button>
        )}

        {/* Botão janela de hospitalidade personalizada (apenas quando não disponível) */}
        {!available && (
          myWindow ? (
            <div className="w-full flex items-center gap-2 mb-3 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2">
              <Home size={14} className="text-indigo-600 flex-shrink-0" />
              <p className="text-xs font-semibold text-indigo-700 flex-1 truncate">🏠 {myWindow.title}</p>
              <button
                onClick={handleCancelWindow}
                className="text-xs text-red-400 hover:text-red-600 font-medium"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateWindow(true)}
              className="w-full flex items-center justify-center gap-2 mb-3 py-2 rounded-xl text-sm font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
            >
              <Home size={16} />
              Criar Janela de Hospitalidade
            </button>
          )
        )}

        {/* Botões: Pedir Ajuda + Eventos + Alertas */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setShowCreateAlert(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
          >
            <Plus size={13} />
            Pedir Ajuda
          </button>
          <Link
            href="/events"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <Calendar size={13} />
            Eventos
          </Link>
          {alerts.length > 0 && (
            <button
              onClick={() => setSelectedAlert(alerts[0])}
              className="flex-1 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2"
            >
              <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
              <p className="text-xs font-semibold text-amber-700">
                {alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}
              </p>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Users size={14} className="text-indigo-600" />
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Pessoas próximas ({nearbyUsers.length})
          </p>
          {loadingUsers && <Loader2 size={12} className="animate-spin text-blue-500" />}
        </div>

        {nearbyUsers.length === 0 && !loadingUsers && (
          <p className="text-xs text-slate-400 py-2">
            {userLoc
              ? 'Nenhuma pessoa encontrada num raio de 2km.'
              : 'Permitindo localização para encontrar pessoas próximas…'}
          </p>
        )}

        <div className="flex gap-3 overflow-x-auto pb-1">
          {nearbyUsers.map((u) => (
            <div key={u.id} className="flex-shrink-0 flex flex-col items-center gap-1">
              <button onClick={() => setSelectedUser(toModalUser(u))}>
                <div className="relative">
                  <img
                    src={u.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name ?? 'U')}&background=3b82f6&color=fff`}
                    alt={u.name ?? 'Usuário'}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-300"
                  />
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
                      u.availabilityStatus === 'mesa-posta' ? 'bg-green-500' : 'bg-amber-400'
                    }`}
                  />
                </div>
              </button>
              <span className="text-xs text-slate-600 max-w-[52px] truncate">
                {(u.name ?? 'Usuário').split(' ')[0]}
              </span>
              <span className="text-[10px] text-blue-500">
                {formatDistance(u.distance)}
              </span>
              <button
                onClick={() => router.push(`/chat?with=${u.id}`)}
                className="flex items-center gap-0.5 text-[10px] text-indigo-500 hover:text-indigo-700"
              >
                <MessageCircle size={10} />
                Msg
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Banner: visita aceita */}
      {acceptedVisit && (
        <div className="absolute top-4 left-4 right-4 z-[1500] bg-green-500 text-white rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
          <CheckCircle size={20} className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight">Visita aceita! ✅</p>
            <p className="text-xs opacity-90">
              {acceptedVisit.toUserName ?? 'Alguém'} confirmou sua visita. Pode ir!
            </p>
          </div>
          <button onClick={() => setAcceptedVisit(null)} className="opacity-70 hover:opacity-100">
            <X size={18} />
          </button>
        </div>
      )}

      {selectedUser && (
        <VisitRequestModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {selectedAlert && (
        <div
          className="absolute inset-0 z-[2000] flex items-end"
          onClick={() => setSelectedAlert(null)}
        >
          <div
            className="w-full bg-white rounded-t-3xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                {ALERT_LABEL[selectedAlert.type]}
              </span>
              <button onClick={() => setSelectedAlert(null)} className="text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <img
                src={selectedAlert.userAvatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAlert.userName ?? 'U')}&background=ef4444&color=fff`}
                alt={selectedAlert.userName ?? 'Usuário'}
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-300"
              />
              <div>
                <p className="font-bold text-slate-800">{selectedAlert.userName ?? 'Usuário'}</p>
                <p className="text-xs text-slate-400">
                  {new Date(selectedAlert.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              {selectedAlert.description}
            </p>
            <button
              onClick={() => setSelectedAlert(null)}
              className="w-full py-3 bg-amber-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-600"
            >
              <HandHeart size={18} /> Posso Ajudar!
            </button>
          </div>
        </div>
      )}

      {/* Bottom sheet: janela de hospitalidade selecionada */}
      {selectedWindow && (
        <div className="absolute inset-0 z-[2000] flex items-end" onClick={() => setSelectedWindow(null)}>
          <div className="w-full bg-white rounded-t-3xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full flex items-center gap-1">
                <Home size={12} /> Janela de Hospitalidade
              </span>
              <button onClick={() => setSelectedWindow(null)} className="text-slate-400"><X size={20} /></button>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <img
                src={selectedWindow.hostAvatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedWindow.hostName ?? 'H')}&background=6366f1&color=fff`}
                alt={selectedWindow.hostName ?? 'Host'}
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-300"
              />
              <div>
                <p className="font-bold text-slate-800">{selectedWindow.hostName ?? 'Alguém'}</p>
                {selectedWindow.hostProfession && (
                  <p className="text-xs text-slate-400">{selectedWindow.hostProfession}</p>
                )}
              </div>
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">{selectedWindow.title}</h3>
            {selectedWindow.description && (
              <p className="text-sm text-slate-600 mb-2">{selectedWindow.description}</p>
            )}
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-5">
              <Clock size={11} />
              até {new Date(selectedWindow.endsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <button
              onClick={() => { setSelectedUser(null); setSelectedWindow(null); router.push(`/chat?with=${selectedWindow.userId}`); }}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700"
            >
              <MessageCircle size={18} /> Estou indo!
            </button>
          </div>
        </div>
      )}

      {/* Bottom sheet: criar janela de hospitalidade */}
      {showCreateWindow && (
        <div className="absolute inset-0 z-[2000] flex items-end" onClick={() => setShowCreateWindow(false)}>
          <div className="w-full bg-white rounded-t-3xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Home size={18} className="text-indigo-600" /> Janela de Hospitalidade
              </h3>
              <button onClick={() => setShowCreateWindow(false)} className="text-slate-400"><X size={20} /></button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Avise seus amigos que estão bem-vindos agora.</p>
            <input
              value={windowForm.title}
              onChange={(e) => setWindowForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Churrasco hoje 🍖 — todos bem-vindos!"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm mb-3 outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <textarea
              value={windowForm.description}
              onChange={(e) => setWindowForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Detalhes opcionais…"
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm mb-3 outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2">Duração da janela</p>
              <div className="flex gap-2">
                {[1, 2, 3, 6].map((h) => (
                  <button
                    key={h}
                    onClick={() => setWindowForm((f) => ({ ...f, hours: h }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      windowForm.hours === h
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleCreateWindow}
              disabled={savingWindow || !windowForm.title.trim()}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
            >
              {savingWindow ? <Loader2 size={16} className="animate-spin" /> : <Home size={16} />}
              Abrir Janela
            </button>
          </div>
        </div>
      )}

      {/* Bottom sheet: criar alerta comunitário */}
      {showCreateAlert && (
        <div className="absolute inset-0 z-[2000] flex items-end" onClick={() => setShowCreateAlert(false)}>
          <div className="w-full bg-white rounded-t-3xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" /> Pedir Ajuda
              </h3>
              <button onClick={() => setShowCreateAlert(false)} className="text-slate-400"><X size={20} /></button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Avise a comunidade que você precisa de ajuda agora.</p>

            {/* Tipo */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {([
                { value: 'urgency',       label: 'Urgência',   emoji: '🚨' },
                { value: 'prayer',        label: 'Oração',     emoji: '🙏' },
                { value: 'practical_help',label: 'Ajuda',      emoji: '🤝' },
              ] as const).map(({ value, label, emoji }) => (
                <button
                  key={value}
                  onClick={() => setAlertForm((f) => ({ ...f, type: value }))}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                    alertForm.type === value
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-red-300'
                  }`}
                >
                  <span className="text-base">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>

            {/* Descrição */}
            <textarea
              value={alertForm.description}
              onChange={(e) => setAlertForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Descreva brevemente o que aconteceu ou o que precisa..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm mb-4 outline-none focus:ring-2 focus:ring-red-300 resize-none"
            />

            <button
              onClick={handleCreateAlert}
              disabled={savingAlert || !alertForm.description.trim()}
              className="w-full py-3 bg-red-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-600 disabled:opacity-50"
            >
              {savingAlert ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
              Enviar Alerta
            </button>
          </div>
        </div>
      )}

      {/* Botão Teo para novo usuário — aparece após fechar o modal de boas-vindas */}
      {showTeoIntro && (
        <div className="fixed bottom-20 left-4 right-4 z-[100]">
          <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              τ
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm">Olá! Sou o Teo</p>
              <p className="text-slate-500 text-xs leading-snug">Posso te ajudar a dar os primeiros passos no Emetis.</p>
            </div>
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button
                onClick={() => { localStorage.removeItem('emetis_show_teo_intro'); setShowTeoIntro(false); setShowTeoSheet(true); }}
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all whitespace-nowrap"
              >
                Falar com Teo
              </button>
              <button
                onClick={() => { localStorage.removeItem('emetis_show_teo_intro'); setShowTeoIntro(false); }}
                className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs rounded-xl hover:bg-slate-200 active:scale-95 transition-all"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modais de novo usuário */}
      {showWelcome && (
        <WelcomeModal onDismiss={() => {
          setShowWelcome(false);
          setShowTeoIntro(true);
        }} />
      )}
      {showTeoSheet && (
        <TeoNewUserSheet onDismiss={() => setShowTeoSheet(false)} />
      )}

    </div>
  );
}
