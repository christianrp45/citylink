import { notFound } from 'next/navigation';
import { getCadernoMeta, COR_CLASSES } from '@/lib/data/formacao';
import { parseVolumeSections } from '@/lib/formacao-parser';
import { CadernoClient } from './caderno-client';

interface Props {
  params: Promise<{ caderno: string }>;
}

export default async function CadernoPage({ params }: Props) {
  const { caderno } = await params;
  const meta = getCadernoMeta(caderno);
  if (!meta) notFound();

  const sections = parseVolumeSections(caderno);
  const cor = COR_CLASSES[meta.cor];

  return (
    <CadernoClient
      meta={meta}
      sections={sections}
      cor={cor}
    />
  );
}

export async function generateStaticParams() {
  const { CADERNOS } = await import('@/lib/data/formacao');
  return CADERNOS.map((c) => ({ caderno: c.slug }));
}
