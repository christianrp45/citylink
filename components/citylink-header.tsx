'use client';

import { Bell, ChevronLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { EmetisLogo } from './emetis-icon';

const ROOT_PATHS = ['/map', '/community', '/bible', '/chat', '/pib', '/profile', '/businesses', '/events'];

function isRootPage(pathname: string) {
  return ROOT_PATHS.some((p) => pathname === p);
}

export function EmetisHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const showBack = !isRootPage(pathname);

  return (
    <header
      className="text-white px-4 py-3 flex items-center justify-between flex-shrink-0"
      style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 55%, #2563EB 100%)',
        boxShadow: 'var(--em-shadow-header)',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        {showBack ? (
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 -ml-1 px-2 py-1.5 rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors"
            aria-label="Voltar"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
            <span className="text-sm font-semibold">Voltar</span>
          </button>
        ) : (
          <EmetisLogo iconSize={26} variant="white" />
        )}
      </div>

      <button
        type="button"
        className="relative p-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors"
        aria-label="Notificações"
      >
        <Bell size={22} strokeWidth={1.8} />
        {/* Badge de notificação (decorativo por agora) */}
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full border border-white/60" />
      </button>
    </header>
  );
}
