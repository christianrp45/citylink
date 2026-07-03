import { CityLinkHeader } from '@/components/citylink-header';

export default function CityLinkLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <CityLinkHeader />
      <main className="flex-1 overflow-y-auto pb-16">
        {children}
      </main>
    </div>
  );
}
