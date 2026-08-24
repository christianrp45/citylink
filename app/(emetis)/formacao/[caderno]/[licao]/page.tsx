import { notFound } from 'next/navigation';
import { getCadernoMeta } from '@/lib/data/formacao';
import { getFormacaoSection, parseVolumeSections } from '@/lib/formacao-parser';
import { LicaoClient } from './licao-client';

interface Props {
  params: Promise<{ caderno: string; licao: string }>;
}

export default async function LicaoPage({ params }: Props) {
  const { caderno, licao } = await params;

  const meta = getCadernoMeta(caderno);
  if (!meta) notFound();

  const section = getFormacaoSection(caderno, licao);
  if (!section) notFound();

  // Navegação anterior/próxima
  const allSections = parseVolumeSections(caderno);
  const currentIdx = allSections.findIndex((s) => s.slug === licao);
  const prev = currentIdx > 0 ? allSections[currentIdx - 1] : null;
  const next = currentIdx < allSections.length - 1 ? allSections[currentIdx + 1] : null;

  return (
    <LicaoClient
      meta={meta}
      section={section}
      prev={prev ? { slug: prev.slug, titulo: prev.titulo } : null}
      next={next ? { slug: next.slug, titulo: next.titulo } : null}
      total={allSections.length}
      current={currentIdx + 1}
    />
  );
}
