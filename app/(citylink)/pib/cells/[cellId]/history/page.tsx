'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

type GuideHistoryItem = {
  guideId: string;
  meetingId: string;
  scheduledAt: string;
  meetingStatus: string;
  title: string;
  sermonTitle?: string;
  preacher?: string;
  biblePassage?: string;
  theme?: string;
  isPublished: boolean;
  generatedByAI: boolean;
  createdAt: string;
};

export default function CellHistoryPage() {
  const { cellId } = useParams<{ cellId: string }>();
  const { data: session } = useSession();
  const [guides, setGuides] = useState<GuideHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLeader, setIsLeader] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!cellId) return;
    Promise.all([
      fetch(`/api/pib/cells/${cellId}/guides`).then((r) => r.json()),
      fetch(`/api/pib/cells/${cellId}`).then((r) => r.ok ? r.json() : null),
    ]).then(([guidesData, cellData]) => {
      setGuides(Array.isArray(guidesData) ? guidesData : []);
      if (cellData && session?.user?.id) {
        setIsLeader(
          cellData.leaderId === session.user.id ||
          cellData.coLeaderId === session.user.id
        );
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [cellId, session?.user?.id]);

  const handleDelete = async (meetingId: string) => {
    if (!confirm('Tem certeza que deseja excluir este roteiro? Esta ação não pode ser desfeita.')) return;
    setDeleting(meetingId);
    try {
      const res = await fetch(`/api/pib/meetings/${meetingId}/guide`, { method: 'DELETE' });
      if (res.ok) {
        setGuides((prev) => prev.filter((g) => g.meetingId !== meetingId));
      }
    } finally {
      setDeleting(null);
    }
  };

  const pastGuides = guides.filter(
    (g) => new Date(g.scheduledAt) < new Date()
  );
  const upcomingGuides = guides.filter(
    (g) => new Date(g.scheduledAt) >= new Date()
  );

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href={`/pib/cells/${cellId}`} className="text-gray-500 hover:text-gray-700 text-lg">←</Link>
          <h1 className="text-base font-bold text-indigo-900 flex-1">Histórico de Roteiros</h1>
          <Link
            href={`/pib/cells/${cellId}/meeting/new`}
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            + Novo Encontro
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        {loading ? (
          <p className="text-center text-gray-400 py-12">Carregando histórico...</p>
        ) : guides.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-4xl">📖</p>
            <p className="text-gray-500 font-medium">Nenhum roteiro encontrado</p>
            <p className="text-gray-400 text-sm">Agende um encontro e crie o roteiro para que ele apareça aqui.</p>
            <Link
              href={`/pib/cells/${cellId}/meeting/new`}
              className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              Agendar primeiro encontro
            </Link>
          </div>
        ) : (
          <>
            {/* Próximos */}
            {upcomingGuides.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Próximos encontros</p>
                {upcomingGuides.map((g) => (
                  <GuideCard
                    key={g.guideId}
                    item={g}
                    cellId={cellId}
                    isLeader={isLeader}
                    deleting={deleting}
                    onDelete={handleDelete}
                    accent="indigo"
                  />
                ))}
              </div>
            )}

            {/* Passados */}
            {pastGuides.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Encontros anteriores</p>
                {pastGuides.map((g) => (
                  <GuideCard
                    key={g.guideId}
                    item={g}
                    cellId={cellId}
                    isLeader={isLeader}
                    deleting={deleting}
                    onDelete={handleDelete}
                    accent="gray"
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function GuideCard({
  item,
  cellId,
  isLeader,
  deleting,
  onDelete,
  accent,
}: {
  item: GuideHistoryItem;
  cellId: string;
  isLeader: boolean;
  deleting: string | null;
  onDelete: (meetingId: string) => void;
  accent: 'indigo' | 'gray';
}) {
  const date = new Date(item.scheduledAt);
  const dateStr = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 ${
      accent === 'indigo' ? 'border-indigo-500' : 'border-gray-300'
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
              accent === 'indigo' ? 'text-indigo-500' : 'text-gray-400'
            }`}>
              {dateStr}
            </p>
            <p className="font-bold text-gray-900 text-sm leading-tight">
              {item.sermonTitle || item.title}
            </p>
            {item.preacher && (
              <p className="text-xs text-gray-500 mt-0.5">{item.preacher}</p>
            )}
            {item.biblePassage && (
              <p className="text-xs text-indigo-600 mt-0.5">📖 {item.biblePassage}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {item.isPublished && (
                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                  Publicado
                </span>
              )}
              {item.generatedByAI && (
                <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-medium">
                  ✨ IA
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Link
            href={`/pib/cells/${cellId}/meeting/${item.meetingId}/guide`}
            className="flex-1 text-center px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            📖 Ver roteiro
          </Link>
          {isLeader && (
            <button
              onClick={() => onDelete(item.meetingId)}
              disabled={deleting === item.meetingId}
              className="px-3 py-2 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
            >
              {deleting === item.meetingId ? '...' : 'Excluir'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
