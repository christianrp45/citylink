'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Navigation, Users, AlertTriangle, HandHeart, X, Loader2, MessageCircle } from 'lucide-react';
import { BottomNav } from '@/components/citylink-bottom-nav';
import VisitRequestModal from '@/components/visit-request-modal';

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

const MOCK_ALERTS = [
  {
    id: 'a1',
    userName: 'Carlos Mendes',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    type: 'urgency' as const,
    description: 'Idosa vizinha passou mal, precisa de ajuda para ir ao hospital.',
    location: { lat: -25.4300, lng: -49.2750, address: 'Bairro Batel, Curitiba' },
  },
];

const ALERT_LABEL: Record<string, string> = {
  urgency: 'Urgência',
  prayer: 'Oração',
  practical_help: 'Ajuda Prática',
};

export default function MapPage() {
  const router = useRouter();
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [center, setCenter] = useState<[number, number]>([CURITIBA.lat, CURITIBA.lng]);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ReturnType<typeof toModalUser> | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<typeof MOCK_ALERTS[0] | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [leaflet, setLeaflet] = useState<any>(null);
  const locationSaved = useRef(false);

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

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => onLocationObtained({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // sem localização: só mostra o mapa vazio
      );
    }
  }, [onLocationObtained]);

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

  function alertIcon() {
    if (!leaflet) return undefined;
    return leaflet.divIcon({
      className: '',
      html: '<div style="width:36px;height:36px;background:#f59e0b;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px rgba(245,158,11,0.4);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;color:white">SOS</div>',
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
              MOCK_ALERTS.map((a) => (
                <Marker
                  key={a.id}
                  position={[a.location.lat, a.location.lng]}
                  icon={alertIcon()}
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
        {MOCK_ALERTS.length > 0 && (
          <button
            onClick={() => setSelectedAlert(MOCK_ALERTS[0])}
            className="w-full flex items-center gap-2 mb-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2"
          >
            <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
            <p className="text-xs font-semibold text-amber-700">
              {MOCK_ALERTS.length} alerta próximo
            </p>
          </button>
        )}

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
                src={selectedAlert.userAvatar}
                alt={selectedAlert.userName}
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-300"
              />
              <div>
                <p className="font-bold text-slate-800">{selectedAlert.userName}</p>
                <p className="text-xs text-slate-400">{selectedAlert.location.address}</p>
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

      <BottomNav />
    </div>
  );
}
