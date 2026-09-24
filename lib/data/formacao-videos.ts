/**
 * Vídeo-aulas da Série Integrar — mapeamento manual de lição → vídeo do YouTube.
 *
 * Caminho de custo zero: vídeos hospedados como "não listados" no YouTube
 * (não aparecem em busca/canal público, só quem tem o link/embed acessa) e
 * embedados aqui. Só migrar para Cloudflare Stream/Mux se o formato
 * realmente engajar e valer o investimento.
 *
 * Chave: slug do caderno (igual a CADERNOS em lib/data/formacao.ts).
 * Valor: mapa { slug da lição (índice "1", "2"...) → ID do vídeo do YouTube }.
 * Nenhuma lição tem vídeo ainda — adicionar aqui conforme forem gravados.
 */
export const FORMACAO_VIDEOS: Record<string, Record<string, string>> = {
  // 'primeiros-passos': { '1': 'dQw4w9WgXcQ' },
};

export function getFormacaoVideoId(cadernoSlug: string, licaoSlug: string): string | null {
  return FORMACAO_VIDEOS[cadernoSlug]?.[licaoSlug] ?? null;
}
