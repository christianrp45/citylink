'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { EmetisIcon } from '@/components/emetis-icon';
import Link from 'next/link';

// Salva o código de referral em localStorage e redireciona para registro
// Se já estiver logado, registra o referral imediatamente
export default function RefPage() {
  const params = useParams<{ code: string }>();
  const code = params.code?.toUpperCase();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!code) return;

    if (status === 'authenticated' && session?.user?.id) {
      // Já logado: registra referral direto
      fetch('/api/users/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      }).finally(() => router.replace('/map'));
      return;
    }

    if (status === 'unauthenticated') {
      // Salva código para usar no pós-registro
      try { localStorage.setItem('emetis_ref', code); } catch {}
      // Redireciona para registro com o código visível
      router.replace(`/register?ref=${code}`);
    }
  }, [code, status, session, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-50 to-white px-6 gap-8">
      <EmetisIcon size={72} variant="blue" />
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-800">Você foi convidado!</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Um amigo te chamou para o Emetis — o app de conexão comunitária cristã.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href={`/register?ref=${code}`}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-center text-sm hover:bg-indigo-700 transition-colors"
        >
          Criar minha conta
        </Link>
        <Link
          href={`/login?redirect=/ref/${code}`}
          className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-center text-sm hover:bg-slate-50 transition-colors"
        >
          Já tenho conta
        </Link>
      </div>
    </div>
  );
}
