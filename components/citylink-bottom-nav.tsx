'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/map', label: '🗺️', title: 'Mapa' },
    { href: '/community', label: '🤝', title: 'Comunidade' },
    { href: '/pib', label: '✝️', title: 'Células' },
    { href: '/businesses', label: '🏪', title: 'Negócios' },
    { href: '/profile', label: '👤', title: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="flex justify-around max-w-4xl mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.includes(item.href.replace('/', ''));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 py-3 text-center transition ${
                isActive
                  ? 'text-indigo-600 border-t-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={item.title}
            >
              <div className="text-2xl">{item.label}</div>
              <div className="text-xs font-medium mt-1">{item.title}</div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
