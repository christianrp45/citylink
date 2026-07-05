'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MapPin, Users, BookOpen, MessageCircle, User, Building2 } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/map',       label: 'Mapa',    icon: MapPin },
  { href: '/community', label: 'Amigos',  icon: Users },
  { href: '/bible',     label: 'Bíblia',  icon: BookOpen },
  { href: '/chat',      label: 'Chat',    icon: MessageCircle },
  { href: '/pib',       label: 'Grupos',  icon: Building2 },
  { href: '/profile',   label: 'Perfil',  icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const [pendingVisits, setPendingVisits] = useState(0);

  useEffect(() => {
    async function fetchPending() {
      try {
        const res = await fetch('/api/visits/pending');
        if (res.ok) {
          const data: unknown[] = await res.json();
          setPendingVisits(Array.isArray(data) ? data.length : 0);
        }
      } catch { /* silencioso */ }
    }
    fetchPending();
    const interval = setInterval(fetchPending, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-40"
      style={{ boxShadow: 'var(--em-shadow-nav)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          const badge = href === '/profile' && pendingVisits > 0 ? pendingVisits : 0;

          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center pt-2 pb-1.5 gap-0.5 relative transition-colors"
              style={{ color: isActive ? 'var(--em-700)' : undefined }}
            >
              {/* Ícone com badge */}
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.7}
                  className={isActive ? '' : 'text-slate-400'}
                />
                {badge > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 min-w-[16px] h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none"
                    style={{ background: 'var(--em-error)' }}
                  >
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] leading-none ${isActive ? 'font-bold' : 'font-medium text-slate-400'}`}
              >
                {label}
              </span>

              {/* Indicador ativo — bolinha */}
              {isActive && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                  style={{ background: 'var(--em-600)' }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
