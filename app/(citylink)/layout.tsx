import { Suspense } from 'react';
import { CityLinkHeader } from '@/components/citylink-header';

export default function CityLinkLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <CityLinkHeader />
      <main className="flex-1 overflow-hidden">
        <Suspense fallback={<div className="flex h-full items-center justify-center text-slate-400">Carregando...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
