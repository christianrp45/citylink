import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { CityLinkHeader } from '@/components/citylink-header';
import { auth } from '@/app/(auth)/auth';
import { getUserPrivacySettings } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export default async function CityLinkLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Apenas usuários regulares precisam passar pelo onboarding
  if (session?.user?.type === 'regular') {
    const privacy = await getUserPrivacySettings(session.user.id);
    if (!privacy?.consentDataProcessing) {
      redirect('/onboarding');
    }
  }

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
