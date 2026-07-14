import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { EmetisHeader } from '@/components/emetis-header';
import { BottomNav } from '@/components/emetis-bottom-nav';
import { auth } from '@/app/(auth)/auth';
import { getUserPrivacySettings } from '@/lib/db/queries';

export default async function EmetisLayout({ children }: { children: React.ReactNode }) {
  await connection();
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
      <EmetisHeader />
      <main className="flex-1 overflow-hidden">
        <Suspense fallback={<div className="flex h-full items-center justify-center text-slate-400">Carregando...</div>}>
          {children}
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}
