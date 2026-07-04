'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Navigation, Users, AlertTriangle, HandHeart, X } from 'lucide-react';
import { BottomNav } from '@/components/citylink-bottom-nav';
import VisitRequestModal from '@/components/visit-request-modal';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false });

const GOIANIA = { lat: -16.6864, lng: -49.2643 };
const NEARBY_RADIUS = 2000;

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function formatDistance(m: number) {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

const MOCK_USERS = [
  { id: 'u1', name: 'Joao Silva', avatar: 'https://i.pravatar.cc/150?img=1', profession: 'Engenheiro', isOnline: true, openToVisits: true, location: { lat: -16.6864, lng: -49.2643 }, homeLocation: { lat: -16.6864, lng: -49.2643, address: 'Setor Bueno, Goiania' } },
  { id: 'u2', name: 'Maria Santos', avatar: 'https://i.pravatar.cc/150?img=5', profession: 'Medica', isOnline: true, openToVisits: false, location: { lat: -16.678, lng: -49.253 }, homeLocation: { lat: -16.678, lng: -49.253, address: 'Jardim Goias, Goiania' } },
  { id: 'u3', name: 'Pedro Oliveira', avatar: 'https://i.pravatar.cc/150?img=8', profession: 'Pastor', isOnline: false, openToVisits: true, location: { lat: -16.691, lng: -49.271 }, homeLocation: { lat: -16.691, lng: -49.271, address: 'Setor Oeste, Goiania' } },
  { id: 'u4', name: 'Ana Costa', avatar: 'https://i.pravatar.cc/150?img=9', profession: 'Professora', isOnline: true, openToVisits: true, location: { lat: -16.682, lng: -49.259 }, homeLocation: { lat: -16.682, lng: -49.259, address: 'Setor Sul, Goiania' } },
];

const MOCK_ALERTS = [
  { id: 'a1', userName: 'Carlos Mendes', userAvatar: 'https://i.pravatar.cc/150?img=3', type: 'urgency' as const, description: 'Idosa vizinha passou mal, precisa de ajuda para ir ao hospital.', location: { lat: -16.684, lng: -49.261, address: 'Rua 10, Setor Sul' } },
];

const ALERT_LABEL: Record<string, string> = { urgency: 'Urgencia', prayer: 'Oracao', practical_help: 'Ajuda Pratica' };

type MockUser = typeof MOCK_USERS[0];
type MockAlert = typeof MOCK_ALERTS[0];

export default function MapPage() {
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [center, setCenter] = useState<[number, number]>([GOIANIA.lat, GOIANIA.lng]);
  const [openToVisits, setOpenToVisits] = useState(true);
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<MockAlert | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [leaflet, setLeaflet] = useState<any>(null);

  const simulate = useCallback(() => {
    const loc = { lat: GOIANIA.lat + (Math.random() - 0.5) * 0.02, lng: GOIANIA.lng + (Math.random() - 0.5) * 0.02 };
    setUserLoc(loc);
    setCenter([loc.lat, loc.lng]);
  }, []);

  useEffect(() => {
    import('leaflet').then(m => { setLeaflet(m.default); setMapReady(true); });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { const l = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setUserLoc(l); setCenter([l.lat, l.lng]); },
        () => simulate()
      );
    } else {
      simulate();
    }
  }, [simulate]);

  const nearbyFriends = userLoc ? MOCK_USERS.filter(u => haversine(userLoc, u.location) <= NEARBY_RADIUS) : MOCK_USERS;

  function userIcon(u: MockUser) {
    if (!leaflet) return undefined;
    const border = u.openToVisits ? '#10b981' : u.isOnline ? '#6366f1' : '#94a3b8';
    return leaflet.divIcon({
      className: '',
      html: `<div style="position:relative;width:44px;height:44px"><img src="${u.avatar}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:3px solid ${border};position:absolute;top:2px;left:2px"/>${u.isOnline ? `<div style="position:absolute;bottom:2px;right:2px;width:10px;height:10px;border-radius:50%;background:${u.openToVisits ? '#10b981' : '#6366f1'};border:2px solid white"></div>` : ''}</div>`,
      iconSize: [44, 44], iconAnchor: [22, 22],
    });
  }

  function alertIcon() {
    if (!leaflet) return undefined;
    return leaflet.divIcon({
      className: '',
      html: '<div style="width:36px;height:36px;background:#f59e0b;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px rgba(245,158,11,0.4);display:flex;align-items:center;justify-content:center;font-size:16px">SOS</div>',
      iconSize: [36, 36], iconAnchor: [18, 18],
    });
  }

  function meIcon() {
    if (!leaflet) return undefined;
    return leaflet.divIcon({
      className: '',
      html: '<div style="width:24px;height:24px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3)"></div>',
      iconSize: [24, 24], iconAnchor: [12, 12],
    });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <div className="flex-1 relative min-h-0">
        {mapReady && (
          <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OpenStreetMap" />
            {userLoc && leaflet && (
              <>
                <Marker position={[userLoc.lat, userLoc.lng]} icon={meIcon()}>
                  <Popup><strong>Voce esta aqui</strong></Popup>
                </Marker>
                <Circle center={[userLoc.lat, userLoc.lng]} radius={NEARBY_RADIUS}
                  pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.05, weight: 1, dashArray: '6' }} />
              </>
            )}
            {leaflet && MOCK_ALERTS.map(a => (
              <Marker key={a.id} position={[a.location.lat, a.location.lng]} icon={alertIcon()}
                eventHandlers={{ click: () => setSelectedAlert(a) }} />
            ))}
            {leaflet && MOCK_USERS.map(u => (
              <Marker key={u.id} position={[u.location.lat, u.location.lng]} icon={userIcon(u)}
                eventHandlers={{ click: () => setSelectedUser(u) }}>
                <Popup>
                  <div style={{ textAlign: 'center', minWidth: 140 }}>
                    <img src={u.avatar} alt={u.name} style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 4px', objectFit: 'cover' }} />
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</p>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>{u.profession}</p>
                    <button onClick={() => setSelectedUser(u)} style={{ marginTop: 8, width: '100%', fontSize: 12, background: '#2563eb', color: 'white', padding: '6px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                      Solicitar Visita
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
        <button onClick={simulate} className="absolute bottom-4 right-4 z-[1000] bg-white rounded-full p-3 shadow-lg border border-slate-200">
          <Navigation size={20} className="text-blue-600" />
        </button>
      </div>

      <div className="bg-white border-t border-slate-200 px-4 pt-3 pb-20 flex-shrink-0">
        <button onClick={() => setOpenToVisits(v => !v)}
          className={`w-full flex items-center justify-between mb-3 rounded-xl px-3 py-2 ${openToVisits ? 'bg-emerald-50' : 'bg-amber-50'}`}>
          <div className="text-left">
            <p className={`text-sm font-bold ${openToVisits ? 'text-emerald-700' : 'text-amber-700'}`}>
              {openToVisits ? 'Mesa Posta' : 'Requer Aviso'}
            </p>
            <p className="text-xs text-slate-400">{openToVisits ? 'Portas abertas para visitas' : 'Solicite antes de visitar'}</p>
          </div>
          <div className={`w-10 h-5 rounded-full relative flex-shrink-0 ${openToVisits ? 'bg-emerald-400' : 'bg-slate-300'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${openToVisits ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </button>

        {MOCK_ALERTS.length > 0 && (
          <button onClick={() => setSelectedAlert(MOCK_ALERTS[0])} className="w-full flex items-center gap-2 mb-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
            <p className="text-xs font-semibold text-amber-700">{MOCK_ALERTS.length} alerta proximo</p>
          </button>
        )}

        <div className="flex items-center gap-2 mb-2">
          <Users size={14} className="text-indigo-600" />
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Amigos proximos ({nearbyFriends.length})</p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {nearbyFriends.map(u => (
            <button key={u.id} onClick={() => setSelectedUser(u)} className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className="relative">
                <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-300" />
                {u.openToVisits && <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />}
              </div>
              <span className="text-xs text-slate-600 max-w-[52px] truncate">{u.name.split(' ')[0]}</span>
              {userLoc && <span className="text-[10px] text-blue-500">{formatDistance(haversine(userLoc, u.location))}</span>}
            </button>
          ))}
        </div>
      </div>

      {selectedUser && <VisitRequestModal user={selectedUser} onClose={() => setSelectedUser(null)} />}

      {selectedAlert && (
        <div className="absolute inset-0 z-[2000] flex items-end" onClick={() => setSelectedAlert(null)}>
          <div className="w-full bg-white rounded-t-3xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">{ALERT_LABEL[selectedAlert.type]}</span>
              <button onClick={() => setSelectedAlert(null)} className="text-slate-400"><X size={20} /></button>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <img src={selectedAlert.userAvatar} alt={selectedAlert.userName} className="w-12 h-12 rounded-full object-cover border-2 border-amber-300" />
              <div>
                <p className="font-bold text-slate-800">{selectedAlert.userName}</p>
                <p className="text-xs text-slate-400">{selectedAlert.location.address}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">{selectedAlert.description}</p>
            <button onClick={() => setSelectedAlert(null)} className="w-full py-3 bg-amber-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-600">
              <HandHeart size={18} /> Posso Ajudar!
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
