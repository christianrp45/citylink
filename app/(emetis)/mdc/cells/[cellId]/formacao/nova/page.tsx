'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { CADERNOS, COR_CLASSES } from '@/lib/data/formacao';

export default function NovaTurmaPage() {
  const { cellId } = useParams<{ cellId: string }>();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/formacao/turma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cellId, caderno: selected }),
      });
      if (res.status === 409) {
        setError('Já existe uma turma ativa para este caderno.');
        return;
      }
      if (!res.ok) throw new Error();
      router.push(`/mdc/cells/${cellId}/formacao`);
    } catch {
      setError('Erro ao criar turma. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-4 pt-4 pb-6">
        <button
          onClick={() => router.push(`/mdc/cells/${cellId}/formacao`)}
          className="flex items-center gap-1 text-white/70 text-sm mb-4 hover:text-white"
        >
          <ChevronLeft size={16} /> Turmas
        </button>
        <h1 className="text-white font-bold text-lg">Nova Turma</h1>
        <p className="text-white/70 text-xs mt-0.5">Escolha o caderno que a célula vai estudar</p>
      </div>

      <div className="px-4 py-5 flex-1 space-y-3">
        {CADERNOS.map((caderno) => {
          const cor = COR_CLASSES[caderno.cor];
          const isSelected = selected === caderno.slug;
          return (
            <button
              key={caderno.slug}
              onClick={() => setSelected(caderno.slug)}
              className={`w-full flex items-center gap-4 bg-white rounded-2xl border px-4 py-3.5 text-left transition-all active:scale-[0.98] ${
                isSelected ? `${cor.border} ring-2 ${cor.border} ring-offset-1` : 'border-slate-100'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl ${cor.bg} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-black text-sm">{caderno.numero}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base">{caderno.emoji}</span>
                  <p className="text-sm font-bold text-slate-800 truncate">{caderno.titulo}</p>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{caderno.descricao}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                isSelected ? `${cor.bg} border-transparent` : 'border-slate-300'
              }`}>
                {isSelected && <span className="flex items-center justify-center h-full text-white text-[10px] font-bold">✓</span>}
              </div>
            </button>
          );
        })}

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          onClick={handleCreate}
          disabled={!selected || loading}
          className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Criando turma…' : 'Criar turma'}
        </button>
      </div>
    </div>
  );
}
