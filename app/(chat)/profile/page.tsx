'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { BottomNav } from '@/components/citylink-bottom-nav';
import { mockUsers } from '@/lib/mockData';
import type { AvailabilityStatus } from '@/lib/types';

export default function ProfilePage() {
  const store = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    helpOffer: store.currentUser?.helpOffer || '',
    availabilityStatus: store.currentUser?.availabilityStatus || ('mesa-posta' as AvailabilityStatus),
  });

  // Initialize if needed
  if (!store.currentUser && mockUsers.length > 0) {
    store.setCurrentUser(mockUsers[0]);
  }

  const user = store.currentUser;
  if (!user) return <div>Carregando...</div>;

  const handleSave = () => {
    store.updateUser({
      ...user,
      helpOffer: editForm.helpOffer,
      availabilityStatus: editForm.availabilityStatus,
    });
    setIsEditing(false);
  };

  const availabilityLabel =
    editForm.availabilityStatus === 'mesa-posta'
      ? '🟢 Mesa Posta (Portas Abertas)'
      : editForm.availabilityStatus === 'requer-aviso'
        ? '🟡 Requer Aviso (Privado)'
        : '⚫ Offline';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with Avatar */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white pt-6 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-indigo-100">{user.profession}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Help Offer Section - PROMINENT */}
        <section className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-indigo-900">
              💪 Meus Talentos / Como Posso Ajudar
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
              >
                Editar
              </button>
            )}
          </div>

          {isEditing ? (
            <textarea
              value={editForm.helpOffer}
              onChange={(e) =>
                setEditForm({ ...editForm, helpOffer: e.target.value })
              }
              placeholder="Descreva como você pode ajudar a comunidade..."
              className="w-full px-4 py-3 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-32"
            />
          ) : (
            <p className="text-lg text-gray-800 leading-relaxed">
              {user.helpOffer || 'Nenhum talento registrado ainda'}
            </p>
          )}
        </section>

        {/* Availability Status */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📍 Disponibilidade
          </h3>

          {isEditing ? (
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border-2 border-transparent rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  setEditForm({
                    ...editForm,
                    availabilityStatus: 'mesa-posta',
                  })
                }
              >
                <input
                  type="radio"
                  name="availability"
                  checked={editForm.availabilityStatus === 'mesa-posta'}
                  readOnly
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-emerald-700">
                    🟢 Mesa Posta (Portas Abertas)
                  </p>
                  <p className="text-sm text-gray-600">
                    Posso receber visitas sem aviso prévio
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-transparent rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  setEditForm({
                    ...editForm,
                    availabilityStatus: 'requer-aviso',
                  })
                }
              >
                <input
                  type="radio"
                  name="availability"
                  checked={editForm.availabilityStatus === 'requer-aviso'}
                  readOnly
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-amber-700">
                    🟡 Requer Aviso (Privado)
                  </p>
                  <p className="text-sm text-gray-600">
                    Prefiro ser avisado antes de receber visitas
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className={`flex items-center gap-3 p-4 rounded-lg ${
              user.availabilityStatus === 'mesa-posta'
                ? 'bg-emerald-50'
                : 'bg-amber-50'
            }`}>
              <span className={`text-2xl ${
                user.availabilityStatus === 'mesa-posta'
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}>
                {user.availabilityStatus === 'mesa-posta' ? '🟢' : '🟡'}
              </span>
              <div>
                <p className="font-semibold text-gray-900">
                  {availabilityLabel}
                </p>
                <p className="text-sm text-gray-600">
                  {user.availabilityStatus === 'mesa-posta'
                    ? 'Você está disponível para receber visitas espontâneas'
                    : 'Você prefere ser avisado antes de receber visitas'}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Contact Info */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📋 Informações
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
            {user.phone && (
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="font-medium text-gray-900">{user.phone}</p>
              </div>
            )}
            {user.profession && (
              <div>
                <p className="text-sm text-gray-600">Profissão</p>
                <p className="font-medium text-gray-900">{user.profession}</p>
              </div>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-indigo-600">
              {user.friends.length}
            </p>
            <p className="text-sm text-gray-600">Amigos</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-emerald-600">
              {user.isOnline ? '🟢' : '⚫'}
            </p>
            <p className="text-sm text-gray-600">
              {user.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-amber-600">⭐</p>
            <p className="text-sm text-gray-600">Membro</p>
          </div>
        </section>

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition"
            >
              Salvar Alterações
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
