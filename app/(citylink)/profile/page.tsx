'use client';

import { useState } from 'react';
import { LogOut, Edit2, MapPin, Phone, Mail, Users, Star } from 'lucide-react';
import { BottomNav } from '@/components/citylink-bottom-nav';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_PROFILE = {
  id: 'u1',
  name: 'João Silva',
  avatar: 'https://i.pravatar.cc/150?img=1',
  profession: 'Eletricista',
  email: 'joao@exemplo.com',
  phone: '(62) 98765-4321',
  location: 'Setor Bueno, Goiânia',
  helpOffer: 'Ajudo com pequenos consertos elétricos e instalações. Disponível aos finais de semana.',
  friendCount: 3,
  isOnline: true,
};

type AvailabilityStatus = 'mesa-posta' | 'requer-aviso' | 'offline';

const STATUS_CONFIG: Record<AvailabilityStatus, { label: string; desc: string; color: string; dot: string }> = {
  'mesa-posta':   { label: 'Mesa Posta',    desc: 'Aceito visitas sem aviso prévio', color: 'bg-green-50 border-green-200', dot: 'bg-green-500' },
  'requer-aviso': { label: 'Requer Aviso',  desc: 'Prefiro ser avisado antes',       color: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  'offline':      { label: 'Offline',       desc: 'Não disponível para visitas',     color: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400' },
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [status, setStatus] = useState<AvailabilityStatus>('mesa-posta');
  const [isEditing, setIsEditing] = useState(false);
  const [editHelp, setEditHelp] = useState(profile.helpOffer);

  const statusInfo = STATUS_CONFIG[status];

  function handleSave() {
    setProfile((prev) => ({ ...prev, helpOffer: editHelp }));
    setIsEditing(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Profile Header */}
      <div className="bg-blue-600 pt-6 pb-16 px-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
            {profile.isOnline && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="text-white">
            <h1 className="text-xl font-bold">{profile.name}</h1>
            <p className="text-blue-200 text-sm">{profile.profession}</p>
            <div className="flex items-center gap-1 mt-1 text-blue-200 text-xs">
              <MapPin size={11} />
              <span>{profile.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mx-4 -mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
        <div className="py-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{profile.friendCount}</p>
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
        {/* Mesa Posta / Availability */}
        <div className={`bg-white rounded-2xl border p-4 ${statusInfo.color}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800">Mesa Posta</h3>
            <div className={`w-3 h-3 rounded-full ${statusInfo.dot}`} />
          </div>
          <p className="text-sm text-slate-600 mb-3">{statusInfo.desc}</p>
          <div className="flex gap-2">
            {(Object.entries(STATUS_CONFIG) as [AvailabilityStatus, typeof statusInfo][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setStatus(key)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  status === key
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${cfg.dot}`} />
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Help Offer */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800">Como posso ajudar</h3>
            {!isEditing && (
              <button
                onClick={() => { setEditHelp(profile.helpOffer); setIsEditing(true); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Edit2 size={15} />
              </button>
            )}
          </div>
          {isEditing ? (
            <>
              <textarea
                value={editHelp}
                onChange={(e) => setEditHelp(e.target.value)}
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
                  onClick={handleSave}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed">
              {profile.helpOffer || 'Nenhum talento registrado ainda'}
            </p>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
          <h3 className="font-bold text-slate-800">Informações</h3>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Mail size={15} className="text-slate-400 flex-shrink-0" />
            <span>{profile.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Phone size={15} className="text-slate-400 flex-shrink-0" />
            <span>{profile.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <MapPin size={15} className="text-slate-400 flex-shrink-0" />
            <span>{profile.location}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Users size={15} className="text-slate-400 flex-shrink-0" />
            <span>{profile.friendCount} amigos na rede</span>
          </div>
        </div>

        {/* Sign out */}
        <button className="w-full py-3 rounded-2xl border border-red-200 text-red-500 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
          <LogOut size={16} />
          Sair da Conta
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
