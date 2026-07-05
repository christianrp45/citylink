'use client';

import { Bell, ChevronLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const ROOT_PATHS = ['/map', '/community', '/bible', '/chat', '/pib', '/profile', '/businesses', '/events'];

function isRootPage(pathname: string) {
  return ROOT_PATHS.some((p) => pathname === p);
}

export function CityLinkHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const showBack = !isRootPage(pathname);

  return (
    <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow-lg flex-shrink-0">
      <div className="flex items-center gap-2">
        {showBack ? (
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 -ml-1 px-2 py-1 rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Voltar"
          >
            <ChevronLeft size={22} />
            <span className="text-sm font-medium">Voltar</span>
          </button>
        ) : (
          <>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-lg tracking-tight">Emetis</span>
          </>
        )}
      </div>
      <button className="relative p-2 rounded-full hover:bg-blue-700 transition-colors">
        <Bell size={22} />
      </button>
    </header>
  );
}
