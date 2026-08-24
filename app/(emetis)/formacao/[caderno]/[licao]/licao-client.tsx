'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { COR_CLASSES } from '@/lib/data/formacao';
import type { CadernoMeta } from '@/lib/data/formacao';
import type { FormacaoSectionWithContent } from '@/lib/formacao-parser';

interface NavItem { slug: string; titulo: string }

interface Props {
  meta: CadernoMeta;
  section: FormacaoSectionWithContent;
  prev: NavItem | null;
  next: NavItem | null;
  total: number;
  current: number;
}

export function LicaoClient({ meta, section, prev, next, total, current }: Props) {
  const router = useRouter();
  const cor = COR_CLASSES[meta.cor];
  const storageKey = `formacao:${meta.slug}:${section.slug}`;

  const [concluido, setConcluido] = useState(false);

  useEffect(() => {
    setConcluido(localStorage.getItem(storageKey) === 'done');
  }, [storageKey]);

  // Injeta ?from= nos links de versículos para o leitor Bíblico saber onde voltar
  useEffect(() => {
    const from = encodeURIComponent(window.location.pathname);
    const links = document.querySelectorAll<HTMLAnchorElement>('a[data-verse-link="true"]');
    for (const a of links) {
      const base = a.getAttribute('href')?.split('?')[0] ?? '';
      a.href = `${base}?from=${from}`;
      // Abre no leitor bíblico com router para manter SPA
      a.addEventListener('click', (e) => {
        e.preventDefault();
        router.push(`${base}?from=${from}`);
      });
    }
  }, [router, meta.slug, section.slug]);

  async function toggleConcluido() {
    if (concluido) {
      localStorage.removeItem(storageKey);
      setConcluido(false);
    } else {
      localStorage.setItem(storageKey, 'done');
      setConcluido(true);
      // Sincroniza com DB e concede XP (fire-and-forget)
      fetch('/api/formacao/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caderno: meta.slug, licao: section.slug }),
      }).catch(() => {});
      // Avança automaticamente para a próxima após marcar
      if (next) {
        setTimeout(() => router.push(`/formacao/${meta.slug}/${next.slug}`), 600);
      }
    }
  }

  const pct = Math.round((current / total) * 100);

  return (
    <div className="flex flex-col min-h-full">
      {/* Topbar */}
      <div className={`${cor.bg} px-4 pt-4 pb-4 flex-shrink-0`}>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.push(`/formacao/${meta.slug}`)}
            className="flex items-center gap-1 text-white/80 text-sm hover:text-white"
          >
            <ChevronLeft size={16} /> {meta.titulo}
          </button>
          <span className="text-white/60 text-xs font-medium">
            {current}/{total}
          </span>
        </div>

        {/* Progresso */}
        <div className="bg-white/20 rounded-full h-1">
          <div
            className="bg-white rounded-full h-1 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Título */}
        {section.groupTitulo && (
          <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wide mt-3">
            {section.groupTitulo}
          </p>
        )}
        <h1 className="text-white font-bold text-base leading-snug mt-0.5">
          {section.titulo}
        </h1>
      </div>

      {/* Conteúdo markdown */}
      <div className="flex-1 px-4 py-5">
        <div
          className="prose prose-sm prose-slate max-w-none
            prose-headings:font-bold prose-headings:text-slate-800
            prose-h2:text-base prose-h3:text-sm prose-h4:text-sm
            prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-sm
            prose-strong:text-slate-800
            prose-blockquote:border-l-4 prose-blockquote:not-italic prose-blockquote:text-slate-600
            prose-ul:text-slate-700 prose-li:text-sm
            prose-ol:text-slate-700
            prose-hr:border-slate-200
            [&_.verse-link]:text-indigo-600 [&_.verse-link]:font-semibold [&_.verse-link]:underline [&_.verse-link]:decoration-dotted [&_.verse-link]:underline-offset-2"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: conteúdo gerado server-side a partir dos arquivos .md locais
          dangerouslySetInnerHTML={{ __html: section.contentHtml }}
        />
      </div>

      {/* Rodapé: marcar como concluído + navegação */}
      <div className="flex-shrink-0 border-t border-slate-100 bg-white px-4 py-3 space-y-3">
        {/* Botão concluir */}
        <button
          onClick={toggleConcluido}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
            concluido
              ? `${cor.light} ${cor.text} border ${cor.border}`
              : `${cor.bg} text-white shadow-sm active:scale-[0.97]`
          }`}
        >
          {concluido ? (
            <>
              <CheckCircle2 size={16} /> Concluído
            </>
          ) : (
            <>
              <Circle size={16} /> Marcar como concluído
            </>
          )}
        </button>

        {/* Navegação anterior / próxima */}
        <div className="flex gap-2">
          {prev ? (
            <Link
              href={`/formacao/${meta.slug}/${prev.slug}`}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-slate-200 text-slate-500 text-xs font-medium hover:bg-slate-50 truncate"
            >
              <ChevronLeft size={14} />
              <span className="truncate">{prev.titulo}</span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {next ? (
            <Link
              href={`/formacao/${meta.slug}/${next.slug}`}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold truncate ${cor.light} ${cor.text}`}
            >
              <span className="truncate">{next.titulo}</span>
              <ChevronRight size={14} />
            </Link>
          ) : (
            <Link
              href={`/formacao/${meta.slug}`}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold"
            >
              Ver caderno
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
