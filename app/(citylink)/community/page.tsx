'use client';

import { useState } from 'react';
import { MapPin, MessageCircle, UserMinus, Search, UserPlus } from 'lucide-react';
import { BottomNav } from '@/components/citylink-bottom-nav';
import VisitRequestModal from '@/components/visit-request-modal';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CURRENT_USER_ID = 'u1';

const ALL_USERS = [
  {
    id: 'u1',
    name: 'João Silva',
    avatar: 'https://i.pravatar.cc/150?img=1',
    profession: 'Pastor',
    location: 'Setor Bueno, Goiânia',
    online: true,
    openToVisits: true,
    homeLocation: { lat: -16.686, lng: -49.264, address: 'Setor Bueno, Goiânia' },
    isFriend: false, // self
  },
  {
    id: 'u2',
    name: 'Maria Santos',
    avatar: 'https://i.pravatar.cc/150?img=5',
    profession: 'Educadora',
    location: 'Setor Central, Goiânia',
    online: true,
    openToVisits: true,
    homeLocation: { lat: -16.678, lng: -49.253, address: 'Setor Central, Goiânia' },
    isFriend: true,
  },
  {
    id: 'u3',
    name: 'Pedro Oliveira',
    avatar: 'https://i.pravatar.cc/150?img=8',
    profession: 'Engenheiro',
    location: 'Jardim Goiás, Goiânia',
    online: false,
    openToVisits: false,
    homeLocation: { lat: -16.705, lng: -49.259, address: 'Jardim Goiás, Goiânia' },
    isFriend: true,
  },
  {
    id: 'u4',
    name: 'Ana Costa',
    avatar: 'https://i.pravatar.cc/150?img=9',
    profession: 'Médica',
    location: 'Setor Oeste, Goiânia',
    online: true,
    openToVisits: false,
    homeLocation: { lat: -16.695, lng: -49.275, address: 'Setor Oeste, Goiânia' },
    isFriend: true,
  },
  {
    id: 'u5',
    name: 'Carlos Ferreira',
    avatar: 'https://i.pravatar.cc/150?img=12',
    profession: 'Músico',
    location: 'Setor Marista, Goiânia',
    online: true,
    openToVisits: true,
    homeLocation: { lat: -16.713, lng: -49.267, address: 'Setor Marista, Goiânia' },
    isFriend: false,
  },
  {
    id: 'u6',
    name: 'Luana Pereira',
    avatar: 'https://i.pravatar.cc/150?img=20',
    profession: 'Designer',
    location: 'Setor Sul, Goiânia',
    online: false,
    openToVisits: true,
    homeLocation: { lat: -16.721, lng: -49.270, address: 'Setor Sul, Goiânia' },
    isFriend: false,
  },
  {
    id: 'u7',
    name: 'Rafael Souza',
    avatar: 'https://i.pravatar.cc/150?img=15',
    profession: 'Advogado',
    location: 'Setor Aeroporto, Goiânia',
    online: true,
    openToVisits: false,
    homeLocation: { lat: -16.660, lng: -49.248, address: 'Setor Aeroporto, Goiânia' },
    isFriend: false,
  },
];

type User = typeof ALL_USERS[number];

// ─── User Card ────────────────────────────────────────────────────────────────
function FriendCard({
  user,
  isFriend,
  onVisit,
  onRemove,
  onAdd,
}: {
  user: User;
  isFriend: boolean;
  onVisit: (user: User) => void;
  onRemove?: (id: string) => void;
  onAdd?: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-14 h-14 rounded-full object-cover"
          />
          {user.online && (
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-800 text-sm truncate">{user.name}</p>
            {user.openToVisits && (
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                Aberto
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{user.profession}</p>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="flex-shrink-0" />
            <span className="truncate">{user.location}</span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <button
            onClick={() => onVisit(user)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            <MapPin size={11} />
            Visitar
          </button>
          <div className="flex gap-1.5">
            {isFriend ? (
              <>
                <button className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                  <MessageCircle size={14} />
                </button>
                {onRemove && (
                  <button
                    onClick={() => onRemove(user.id)}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors"
                  >
                    <UserMinus size={14} />
                  </button>
                )}
              </>
            ) : (
              onAdd && (
                <button
                  onClick={() => onAdd(user.id)}
                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <UserPlus size={14} />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FriendsPage() {
  const [tab, setTab] = useState<'friends' | 'discover'>('friends');
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState<string[]>(
    ALL_USERS.filter((u) => u.isFriend && u.id !== CURRENT_USER_ID).map((u) => u.id)
  );
  const [visitTarget, setVisitTarget] = useState<User | null>(null);

  const friendUsers = ALL_USERS.filter((u) => friends.includes(u.id));
  const discoverUsers = ALL_USERS.filter(
    (u) => u.id !== CURRENT_USER_ID && !friends.includes(u.id)
  );

  const filtered = (tab === 'friends' ? friendUsers : discoverUsers).filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.profession.toLowerCase().includes(search.toLowerCase())
  );

  function handleRemove(id: string) {
    setFriends((prev) => prev.filter((fid) => fid !== id));
  }

  function handleAdd(id: string) {
    setFriends((prev) => [...prev, id]);
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-24">
      {/* Search */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm px-4 py-3 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pessoas..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-colors"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('friends')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === 'friends'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Meus Amigos ({friendUsers.length})
          </button>
          <button
            onClick={() => setTab('discover')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === 'discover'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Descobrir
          </button>
        </div>
      </div>

      {/* List */}
      <div className="p-4 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-2">{tab === 'friends' ? '👥' : '🔍'}</p>
            <p className="text-sm">
              {tab === 'friends'
                ? 'Nenhum amigo ainda. Explore para conectar!'
                : 'Nenhum resultado encontrado'}
            </p>
          </div>
        )}

        {filtered.map((user) => (
          <FriendCard
            key={user.id}
            user={user}
            isFriend={tab === 'friends'}
            onVisit={setVisitTarget}
            onRemove={tab === 'friends' ? handleRemove : undefined}
            onAdd={tab === 'discover' ? handleAdd : undefined}
          />
        ))}
      </div>

      {visitTarget && (
        <VisitRequestModal user={visitTarget} onClose={() => setVisitTarget(null)} />
      )}

      <BottomNav />
    </div>
  );
}
