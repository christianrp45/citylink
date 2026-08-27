'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  ChevronDown,
  HandHeart,
  MessageCircle,
  Settings,
  Trophy,
  UserPlus,
  Loader2,
} from 'lucide-react';

type NotifType = 'visit' | 'friend_request' | 'message' | 'mission';

type NotificationItem = {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  avatarUrl?: string;
};

type PushPrefs = {
  pushVisits: boolean;
  pushMessages: boolean;
  pushFriendRequests: boolean;
  pushMissions: boolean;
};

const TYPE_ICON: Record<NotifType, React.ReactNode> = {
  visit:          <HandHeart size={16} className="text-green-600" />,
  friend_request: <UserPlus  size={16} className="text-indigo-600" />,
  message:        <MessageCircle size={16} className="text-blue-600" />,
  mission:        <Trophy    size={16} className="text-amber-500" />,
};

const TYPE_BG: Record<NotifType, string> = {
  visit:          'bg-green-100',
  friend_request: 'bg-indigo-100',
  message:        'bg-blue-100',
  mission:        'bg-amber-100',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'agora';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

const SEEN_KEY = 'emetis_notif_seen_at';

const PREF_LABELS: { key: keyof PushPrefs; label: string; desc: string }[] = [
  { key: 'pushVisits',        label: 'Visitas',          desc: 'Pedidos e respostas de visita' },
  { key: 'pushMessages',      label: 'Mensagens',        desc: 'Novas mensagens diretas' },
  { key: 'pushFriendRequests',label: 'Amigos',           desc: 'Pedidos de amizade' },
  { key: 'pushMissions',      label: 'Missões',          desc: 'Conquistas e missões completadas' },
];

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-indigo-500' : 'bg-slate-200'}`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
          value ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [seenAt, setSeenAt] = useState<number>(0);

  // Preferences
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefs, setPrefs] = useState<PushPrefs>({
    pushVisits: true,
    pushMessages: true,
    pushFriendRequests: true,
    pushMissions: true,
  });
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsSaving, setPrefsSaving] = useState(false);

  // Pagination
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const stored = parseInt(localStorage.getItem(SEEN_KEY) ?? '0', 10);
    setSeenAt(stored);

    fetch('/api/notifications')
      .then((r) => r.ok ? r.json() : [])
      .then((data: NotificationItem[]) => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Marca como visto agora
    localStorage.setItem(SEEN_KEY, Date.now().toString());

    // Load preferences
    fetch('/api/notifications/preferences')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setPrefs(data); })
      .catch(() => {})
      .finally(() => setPrefsLoading(false));
  }, []);

  function isNew(iso: string) {
    return new Date(iso).getTime() > seenAt;
  }

  async function togglePref(key: keyof PushPrefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setPrefsSaving(true);
    try {
      await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: next[key] }),
      });
    } catch {
      // revert on error
      setPrefs(prefs);
    } finally {
      setPrefsSaving(false);
    }
  }

  const visibleItems = items.slice(0, visibleCount);

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <Bell size={20} className="text-indigo-600" />
        <h1 className="font-bold text-slate-800 text-lg">Notificações</h1>
      </div>

      {/* Preferências (collapsible) */}
      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <button
          type="button"
          onClick={() => setPrefsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-indigo-500" />
            <span className="text-sm font-semibold text-slate-700">Preferências de notificação</span>
            {prefsSaving && <Loader2 size={12} className="animate-spin text-slate-400" />}
          </div>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${prefsOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {prefsOpen && (
          <div className="border-t border-slate-100 divide-y divide-slate-50">
            {prefsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 size={18} className="animate-spin text-indigo-400" />
              </div>
            ) : (
              PREF_LABELS.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                  <ToggleSwitch value={prefs[key]} onChange={() => togglePref(key)} />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-indigo-400" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <Bell size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">Tudo em dia!</p>
          <p className="text-xs mt-1">Sem notificações no momento.</p>
        </div>
      )}

      <div className="divide-y divide-slate-100 mt-4">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => router.push(item.href)}
            className={`w-full flex items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-white ${
              isNew(item.createdAt) ? 'bg-white' : 'bg-slate-50'
            }`}
          >
            {/* Avatar ou ícone */}
            <div className="flex-shrink-0 relative">
              {item.avatarUrl ? (
                <img
                  src={item.avatarUrl}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover"
                />
              ) : (
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${TYPE_BG[item.type]}`}>
                  {TYPE_ICON[item.type]}
                </div>
              )}
              {/* Badge de tipo quando tem avatar */}
              {item.avatarUrl && (
                <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${TYPE_BG[item.type]} border-2 border-white`}>
                  {TYPE_ICON[item.type]}
                </div>
              )}
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <span className="text-[10px] text-slate-400 flex-shrink-0">{timeAgo(item.createdAt)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">{item.body}</p>
            </div>

            {/* Ponto de novo */}
            {isNew(item.createdAt) && (
              <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-1.5" />
            )}
          </button>
        ))}
      </div>

      {/* Carregar mais */}
      {!loading && visibleCount < items.length && (
        <div className="flex justify-center py-4">
          <button
            type="button"
            onClick={() => setVisibleCount((v) => v + 10)}
            className="px-6 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-50 transition-colors"
          >
            Carregar mais
          </button>
        </div>
      )}
    </div>
  );
}
