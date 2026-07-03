'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { BottomNav } from '@/components/citylink-bottom-nav';
import { mockUsers, mockSamaritanAlerts } from '@/lib/mockData';
import type { SamaritanAlert, User } from '@/lib/types';

// Haversine distance formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MapPage() {
  const store = useStore();
  const [userLocation, setUserLocation] = useState({ lat: -23.55, lng: -46.63 });
  const [selectedItem, setSelectedItem] = useState<SamaritanAlert | User | null>(null);
  const [nearbyAlerts, setNearbyAlerts] = useState<SamaritanAlert[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);

  // Initialize store
  if (store.users.length === 0) {
    store.users = mockUsers;
    store.samaritanAlerts = mockSamaritanAlerts;
    store.setCurrentUser(mockUsers[0]);
  }

  // Filter by 5km radius
  useEffect(() => {
    const activeAlerts = store.samaritanAlerts.filter((alert) => {
      if (!alert.location) return false;
      const distance = getDistance(
        userLocation.lat,
        userLocation.lng,
        alert.location.lat,
        alert.location.lng
      );
      return distance <= 5;
    });

    const nearby = store.users.filter((user) => {
      if (!user.location || user.id === store.currentUser?.id) return false;
      const distance = getDistance(
        userLocation.lat,
        userLocation.lng,
        user.location.lat,
        user.location.lng
      );
      return distance <= 5 && user.availabilityStatus !== 'offline';
    });

    setNearbyAlerts(activeAlerts);
    setNearbyUsers(nearby);
  }, [store.samaritanAlerts, store.users, userLocation, store.currentUser?.id]);

  const handleRespondToAlert = (alertId: string) => {
    if (store.currentUser) {
      store.respondToAlert(alertId, store.currentUser.id);
      alert('✅ Você respondeu ao pedido de ajuda!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-indigo-900">🗺️ Mapa da Comunidade</h1>
          <p className="text-sm text-gray-600">Raio de 5km</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Map Area - Placeholder */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="w-full h-80 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl mb-2">📍</p>
              <p className="text-gray-600 font-medium">
                Integração com Leaflet/OpenStreetMap
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Sua localização: {userLocation.lat.toFixed(3)}, {userLocation.lng.toFixed(3)}
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Legenda</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-gray-700">Mesa Posta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500"></div>
              <span className="text-sm text-gray-700">Requer Aviso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-600"></div>
              <span className="text-sm text-gray-700">Alerta Samaritano</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-400"></div>
              <span className="text-sm text-gray-700">Offline</span>
            </div>
          </div>
        </div>

        {/* Samaritan Alerts Section */}
        {nearbyAlerts.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🚨</span> Alertas Próximos ({nearbyAlerts.length})
            </h2>
            <div className="space-y-3">
              {nearbyAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white rounded-lg border-l-4 border-orange-500 p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                  onClick={() => setSelectedItem(alert)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {alert.type === 'urgency' && '🚨 '}
                        {alert.type === 'prayer' && '🙏 '}
                        {alert.type === 'practical_help' && '🤝 '}
                        {alert.description}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        por {alert.userName}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        ⏰{' '}
                        {new Date(alert.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRespondToAlert(alert.id)}
                      className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition whitespace-nowrap"
                    >
                      Ajudar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Nearby Users Section */}
        {nearbyUsers.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">👥</span> Pessoas Próximas ({nearbyUsers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearbyUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer"
                  onClick={() => setSelectedItem(user)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.profession}</p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full ${
                        user.availabilityStatus === 'mesa-posta'
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                    />
                  </div>
                  {user.helpOffer && (
                    <p className="text-sm text-indigo-600 font-medium">
                      💪 {user.helpOffer}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {user.availabilityStatus === 'mesa-posta'
                      ? '🟢 Mesa Posta'
                      : '🟡 Requer Aviso'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {nearbyAlerts.length === 0 && nearbyUsers.length === 0 && (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <p className="text-3xl mb-2">😴</p>
            <p className="text-gray-600 font-medium">Nenhuma pessoa próxima no momento</p>
            <p className="text-sm text-gray-500 mt-1">
              Volte mais tarde ou expanda o raio de busca
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {'type' in selectedItem ? '🚨 Detalhes do Alerta' : '👤 Perfil'}
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-600 hover:text-gray-900 text-2xl"
              >
                ✕
              </button>
            </div>

            {'type' in selectedItem ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-semibold text-gray-900">
                    {selectedItem.userName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo</p>
                  <p className="font-semibold text-gray-900">
                    {selectedItem.type === 'urgency' && '🚨 Urgência'}
                    {selectedItem.type === 'prayer' && '🙏 Oração'}
                    {selectedItem.type === 'practical_help' && '🤝 Ajuda Prática'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Descrição</p>
                  <p className="font-medium text-gray-900">
                    {selectedItem.description}
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleRespondToAlert(selectedItem.id);
                    setSelectedItem(null);
                  }}
                  className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition"
                >
                  Posso Ajudar! ✋
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-semibold text-gray-900">{selectedItem.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profissão</p>
                  <p className="font-medium text-gray-900">
                    {selectedItem.profession || 'N/A'}
                  </p>
                </div>
                {selectedItem.helpOffer && (
                  <div>
                    <p className="text-sm text-gray-600">Como Pode Ajudar</p>
                    <p className="font-medium text-indigo-600">
                      {selectedItem.helpOffer}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium">
                    {selectedItem.availabilityStatus === 'mesa-posta'
                      ? '🟢 Mesa Posta'
                      : '🟡 Requer Aviso'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
