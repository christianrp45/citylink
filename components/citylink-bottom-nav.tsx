'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MapPin, Users, Calendar, MessageCircle, User, Church } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/map',       label: 'Mapa',    icon: MapPin },
  { href: '/community', label: 'Amigos',  icon: Users },
  { href: '/events',    label: 'Eventos', icon: Calendar },
  { href: '/chat',      label: 'Chat',    icon: MessageCircle },
  { href: '/pib',       label: 'Igreja',  icon: Church },
  { href: '/profile',   label: 'Perfil',  icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const [pendingVisits, setPendingVisits] = useState(0);

  // Busca contagem de visitas pendentes a cada 30s
  useEffect(() => {
    async function fetchPending() {
      try {
        const res = await fetch('/api/visits/pending');
        if (res.ok) {
          const data: unknown[] = await res.json();
          setPendingVisits(Array.isArray(data) ? data.length : 0);
        }
      } catch {
        // silencioso — não quebra a nav
      }
    }

    fetchPending();
    const interval = setInterval(fetchPending, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] z-40">
      <div className="flex">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          const badge = href === '/profile' && pendingVisits > 0 ? pendingVisits : 0;

          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors relative ${
                isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon size={22} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium">{label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
