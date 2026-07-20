'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  IconMap,
  IconCommunity,
  IconBible,
  IconChat,
  IconGroups,
  IconProfile,
} from '@/components/emetis-icons';

type NavIcon = React.ComponentType<{ size?: number; strokeWidth?: number; filled?: boolean; className?: string }>;

const NAV_ITEMS: { href: string; label: string; icon: NavIcon }[] = [
  { href: '/map',       label: 'Mapa',    icon: IconMap },
  { href: '/community', label: 'Amigos',  icon: IconCommunity },
  { href: '/bible',     label: 'Bíblia',  icon: IconBible },
  { href: '/chat',      label: 'Chat',    icon: IconChat },
  { href: '/mdc',       label: 'Grupos',  icon: IconGroups },
  { href: '/profile',   label: 'Perfil',  icon: IconProfile },
];

export function BottomNav() {
  const pathname = usePathname();
  const [pendingVisits, setPendingVisits] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchBadges = useCallback(async () => {
    try {
      const [visitsRes, unreadRes] = await Promise.all([
        fetch('/api/visits/pending'),
        fetch('/api/messages/unread'),
      ]);
      if (visitsRes.ok) {
        const data: unknown[] = await visitsRes.json();
        setPendingVisits(Array.isArray(data) ? data.length : 0);
      }
      if (unreadRes.ok) {
        const data = await unreadRes.json() as { count: number };
        setUnreadMessages(data.count ?? 0);
      }
    } catch { /* silencioso */ }
  }, []);

  // Polling a cada 30s
  useEffect(() => {
    fetchBadges();
    const interval = setInterval(fetchBadges, 30_000);
    return () => clearInterval(interval);
  }, [fetchBadges]);

  // Re-fetch imediato quando sai do chat (para limpar badge)
  useEffect(() => {
    if (!pathname.startsWith('/chat')) {
      fetchBadges();
    }
  }, [pathname, fetchBadges]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-40"
      style={{ boxShadow: 'var(--em-shadow-nav)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          // Badge de chat não aparece quando o usuário já está na tela de chat
          const badge =
            (href === '/profile' && pendingVisits > 0) ? pendingVisits :
            (href === '/chat' && unreadMessages > 0 && !pathname.startsWith('/chat')) ? unreadMessages :
            0;

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
                  filled={isActive}
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
