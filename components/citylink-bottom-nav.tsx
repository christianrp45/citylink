'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Users, Calendar, MessageCircle, User, Church } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/map', label: 'Mapa', icon: MapPin },
  { href: '/community', label: 'Amigos', icon: Users },
  { href: '/events', label: 'Eventos', icon: Calendar },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/pib', label: 'Igreja', icon: Church },
  { href: '/profile', label: 'Perfil', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] z-40">
      <div className="flex">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors relative ${
                isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={22} />
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
