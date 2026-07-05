'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function CityLinkError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center pb-24">
      <AlertCircle size={48} className="text-red-400" />
      <div>
        <p className="font-bold text-slate-800 text-lg">Algo deu errado</p>
        <p className="text-slate-500 text-sm mt-1">
          Não foi possível carregar esta página. Verifique sua conexão e tente novamente.
        </p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
      >
        <RefreshCw size={15} />
        Tentar novamente
      </button>
    </div>
  );
}
