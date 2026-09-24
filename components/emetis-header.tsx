'use client';

import { useEffect, useState } from 'react';
import { Bell, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { EmetisIcon, EmetisLogo } from './emetis-icon';
import { IconProfile } from './emetis-icons';

const ROOT_PATHS = ['/map', '/community', '/bible', '/chat', '/mdc', '/missions', '/businesses', '/events'];

function isRootPage(pathname: string) {
  return ROOT_PATHS.some((p) => pathname === p);
}

export function EmetisHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isRoot = isRootPage(pathname);
  const [notifCount, setNotifCount] = useState(0);
  const [pendingVisits, setPendingVisits] = useState(0);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [notifRes, visitsRes] = await Promise.all([
          fetch('/api/notifications'),
          fetch('/api/visits/pending'),
        ]);
        if (notifRes.ok) {
          const data = await notifRes.json();
          setNotifCount(Array.isArray(data) ? data.length : 0);
        }
        if (visitsRes.ok) {
          const data: unknown[] = await visitsRes.json();
          setPendingVisits(Array.isArray(data) ? data.length : 0);
        }
      } catch {
        // silencioso — sem contadores visíveis se falhar
      }
    }

    fetchCounts();
    // Atualiza a cada 60 s enquanto a página estiver aberta
    const timer = setInterval(fetchCounts, 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className="text-white px-4 py-3 flex items-center justify-between flex-shrink-0"
      style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 55%, #2563EB 100%)',
        boxShadow: 'var(--em-shadow-header)',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        {/* Botão voltar — apenas em sub-páginas */}
        {!isRoot && (
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 -ml-1 px-2 py-1.5 rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors"
            aria-label="Voltar"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
            <span className="text-sm font-semibold">Voltar</span>
          </button>
        )}

        {/* Logo — sempre visível, linka para /map */}
        <Link href="/map" aria-label="Ir para o mapa" className="flex items-center rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors p-1">
          {isRoot
            ? <EmetisLogo iconSize={26} variant="white" />
            : <EmetisIcon size={24} variant="white" />
          }
        </Link>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => router.push('/notifications')}
          className="relative p-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors"
          aria-label="Notificações"
        >
          <Bell size={22} strokeWidth={1.8} />
          {notifCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] flex items-center justify-center bg-amber-400 rounded-full border border-white/60 text-[9px] font-bold text-slate-900 px-0.5">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>

        <Link
          href="/profile"
          className="relative p-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors"
          aria-label="Perfil e configurações"
        >
          <IconProfile size={22} strokeWidth={1.8} />
          {pendingVisits > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] flex items-center justify-center bg-amber-400 rounded-full border border-white/60 text-[9px] font-bold text-slate-900 px-0.5">
              {pendingVisits > 9 ? '9+' : pendingVisits}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
