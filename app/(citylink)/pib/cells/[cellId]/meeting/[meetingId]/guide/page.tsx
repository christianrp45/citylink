'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { CellGuideDetail, StudyPoint, YoutubeLink } from '@/lib/types';

// Mapeia nome do livro → abreviação usada no leitor bíblico
const BOOK_MAP: Record<string, string> = {
  'gênesis': 'gn', 'êxodo': 'ex', 'levítico': 'lv', 'números': 'nm',
  'deuteronômio': 'dt', 'josué': 'js', 'juízes': 'jz', 'rute': 'rt',
  '1 samuel': '1sm', '2 samuel': '2sm', '1 reis': '1rs', '2 reis': '2rs',
  '1 crônicas': '1cr', '2 crônicas': '2cr', 'esdras': 'ed', 'neemias': 'ne',
  'ester': 'et', 'jó': 'jó', 'salmos': 'sl', 'provérbios': 'pv',
  'eclesiastes': 'ec', 'cânticos': 'ct', 'isaías': 'is', 'jeremias': 'jr',
  'lamentações': 'lm', 'ezequiel': 'ez', 'daniel': 'dn', 'oséias': 'os',
  'joel': 'jl', 'amós': 'am', 'obadias': 'ob', 'jonas': 'jn', 'miquéias': 'mq',
  'naum': 'na', 'habacuque': 'hc', 'sofonias': 'sf', 'ageu': 'ag',
  'zacarias': 'zc', 'malaquias': 'ml', 'mateus': 'mt', 'marcos': 'mc',
  'lucas': 'lc', 'joão': 'jo', 'atos': 'at', 'romanos': 'rm',
  '1 coríntios': '1co', '2 coríntios': '2co', 'gálatas': 'gl', 'efésios': 'ef',
  'filipenses': 'fp', 'colossenses': 'cl', '1 tessalonicenses': '1ts',
  '2 tessalonicenses': '2ts', '1 timóteo': '1tm', '2 timóteo': '2tm',
  'tito': 'tt', 'filemom': 'fm', 'hebreus': 'hb', 'tiago': 'tg',
  '1 pedro': '1pe', '2 pedro': '2pe', '1 joão': '1jo', '2 joão': '2jo',
  '3 joão': '3jo', 'judas': 'jd', 'apocalipse': 'ap',
};

function parseBiblePassageUrl(passage: string): string | null {
  if (!passage) return null;
  const match = passage.match(/^(.+?)\s+(\d+)/i);
  if (!match) return null;
  const bookName = match[1].trim().toLowerCase();
  const chapter = parseInt(match[2], 10);
  const abbrev = BOOK_MAP[bookName];
  if (!abbrev || isNaN(chapter)) return null;
  return `/bible/read/${abbrev}/${chapter}`;
}

const EMPTY_POINT: StudyPoint = { title: '', bibleRef: '', content: '', discussionQuestion: '' };

type GuideForm = {
  title: string;
  biblePassage: string;
  sermonTitle: string;
  preacher: string;
  theme: string;
  leaderNote: string;
  icebreakerTitle: string;
  icebreaker: string;
  youtubeLinks: YoutubeLink[];
  introduction: string;
  studyPoints: StudyPoint[];
  conclusion: string;
  conclusionQuestion: string;
  leaderTip: string;
  evangelism: string;
  evangelismStory: string;
  evangelismChallenge: string;
  sermonContent: string;
};

const EMPTY_FORM: GuideForm = {
  title: '',
  biblePassage: '',
  sermonTitle: '',
  preacher: '',
  theme: '',
  leaderNote: '',
  icebreakerTitle: '',
  icebreaker: '',
  youtubeLinks: [],
  introduction: '',
  studyPoints: [{ ...EMPTY_POINT }, { ...EMPTY_POINT }, { ...EMPTY_POINT }],
  conclusion: '',
  conclusionQuestion: '',
  leaderTip: '',
  evangelism: '',
  evangelismStory: '',
  evangelismChallenge: '',
  sermonContent: '',
};

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="bg-gray-900 text-white text-center text-xs font-bold tracking-widest uppercase py-2 px-4 rounded-lg">
      {label}
    </div>
  );
}

// ─── Parser de texto livre → campos do roteiro ────────────────────────────────
// Detecta padrões comuns em notas de sermão e preenche os campos automaticamente.
function parseSermonText(text: string): Partial<GuideForm> {
  const result: Partial<GuideForm> = {};
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const get = (keys: string[]) => {
    for (const key of keys) {
      const re = new RegExp(`^${key}[:\\-–]?\\s*(.+)`, 'im');
      const m = text.match(re);
      if (m) return m[1].trim();
    }
    return '';
  };

  // Campos com rótulo explícito
  result.title        = get(['título','title','tema do encontro','nome do encontro']) || lines[0] || '';
  result.sermonTitle  = get(['título da pregação','título do sermão','sermão','pregação']) || result.title;
  result.preacher     = get(['pregador','pregadora','pr\\.?','pastor','pastora']);
  result.theme        = get(['tema','assunto','subject']);
  result.biblePassage = get(['passagem','passage','texto','texto base','referência','ref\\.?']);
  result.leaderNote   = get(['nota do líder','nota para o líder','para o líder','leaderNote']);
  result.icebreakerTitle = get(['quebra-gelo','icebreaker','dinâmica']);
  result.icebreaker   = get(['dinâmica','pergunta inicial']);
  result.introduction = get(['introdução','intro','contexto']);
  result.conclusion   = get(['conclusão','conclusao','fechamento','aplicação final']);
  result.evangelism   = get(['evangelismo','visão missionária','missão']);
  result.evangelismChallenge = get(['desafio','desafio da semana','missão da semana']);

  // Se não achou passagem com rótulo, tenta regex de referência bíblica
  if (!result.biblePassage) {
    const bibleRe = /\b(Gênesis|Êxodo|Levítico|Números|Deuteronômio|Josué|Juízes|Rute|Samuel|Reis|Crônicas|Esdras|Neemias|Ester|Jó|Salmos|Provérbios|Eclesiastes|Cânticos|Isaías|Jeremias|Lamentações|Ezequiel|Daniel|Oséias|Joel|Amós|Obadias|Jonas|Miquéias|Naum|Habacuque|Sofonias|Ageu|Zacarias|Malaquias|Mateus|Marcos|Lucas|João|Atos|Romanos|Coríntios|Gálatas|Efésios|Filipenses|Colossenses|Tessalonicenses|Timóteo|Tito|Filemom|Hebreus|Tiago|Pedro|Judas|Apocalipse)\s+\d+[:\-\d\s,;–]+/i;
    const m = text.match(bibleRe);
    if (m) result.biblePassage = m[0].trim().replace(/[,;]$/, '');
  }

  // Detecta pontos numerados (1. / 2. / I. / •)
  const pointPatterns = [
    /^(?:ponto\s*)?(\d+)[.)]\s+(.+)/im,
    /^(?:[IVX]+)[.)]\s+(.+)/im,
    /^[•\-\*]\s+(.+)/im,
  ];
  const points: Partial<StudyPoint>[] = [];
  for (const line of lines) {
    for (const re of pointPatterns) {
      const m = line.match(re);
      if (m && points.length < 3) {
        const title = (m[2] || m[1] || '').trim();
        if (title.length > 3) { points.push({ title, bibleRef: '', content: '', discussionQuestion: '' }); break; }
      }
    }
    if (points.length === 3) break;
  }
  if (points.length > 0) {
    result.studyPoints = [
      ...(points as StudyPoint[]),
      ...Array.from({ length: Math.max(0, 3 - points.length) }, () => ({ ...EMPTY_POINT })),
    ];
  }

  return result;
}

export default function GuidePage() {
  const { cellId, meetingId } = useParams<{ cellId: string; meetingId: string }>();
  const [guide, setGuide] = useState<CellGuideDetail | null>(null);
  const [form, setForm] = useState<GuideForm>(EMPTY_FORM);
  const [editing, setEditing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [saving, setSaving] = useState(false);
  const [newYtTitle, setNewYtTitle] = useState('');
  const [newYtUrl, setNewYtUrl] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  useEffect(() => {
    if (!meetingId) return;
    fetch(`/api/pib/meetings/${meetingId}/guide`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: CellGuideDetail | null) => {
        if (data) {
          setGuide(data);
          setForm({
            title: data.title ?? '',
            biblePassage: data.biblePassage ?? '',
            sermonTitle: data.sermonTitle ?? '',
            preacher: data.preacher ?? '',
            theme: data.theme ?? '',
            leaderNote: data.leaderNote ?? '',
            icebreakerTitle: data.icebreakerTitle ?? '',
            icebreaker: data.icebreaker ?? '',
            youtubeLinks: data.youtubeLinks ?? [],
            introduction: data.introduction ?? '',
            studyPoints: data.studyPoints?.length
              ? data.studyPoints
              : [{ ...EMPTY_POINT }, { ...EMPTY_POINT }, { ...EMPTY_POINT }],
            conclusion: data.conclusion ?? '',
            conclusionQuestion: '',
            leaderTip: '',
            evangelism: data.evangelism ?? '',
            evangelismStory: data.evangelismStory ?? '',
            evangelismChallenge: data.evangelismChallenge ?? '',
            sermonContent: '',
          });
        } else {
          setEditing(true);
        }
      });
  }, [meetingId]);

  const handleGenerate = async () => {
    if (!form.biblePassage && !form.sermonContent) {
      alert('Informe a passagem bíblica ou cole o conteúdo da pregação');
      return;
    }
    setGenerating(true);
    setGenError('');
    try {
      const res = await fetch('/api/pib/ai/generate-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          biblePassage: form.biblePassage,
          sermonTitle: form.sermonTitle,
          preacher: form.preacher,
          theme: form.theme,
          sermonContent: form.sermonContent,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm((f) => ({
          ...f,
          title: data.title ?? f.title,
          biblePassage: data.biblePassage ?? f.biblePassage,
          sermonTitle: data.sermonTitle ?? f.sermonTitle,
          preacher: data.preacher ?? f.preacher,
          theme: data.theme ?? f.theme,
          leaderNote: data.leaderNote ?? f.leaderNote,
          icebreakerTitle: data.icebreakerTitle ?? f.icebreakerTitle,
          icebreaker: data.icebreaker ?? f.icebreaker,
          introduction: data.introduction ?? f.introduction,
          studyPoints: data.studyPoints?.length ? data.studyPoints : f.studyPoints,
          conclusion: data.conclusion ?? f.conclusion,
          conclusionQuestion: data.conclusionQuestion ?? f.conclusionQuestion,
          leaderTip: data.leaderTip ?? f.leaderTip,
          evangelism: data.evangelism ?? f.evangelism,
          evangelismStory: data.evangelismStory ?? f.evangelismStory,
          evangelismChallenge: data.evangelismChallenge ?? f.evangelismChallenge,
        }));
      } else {
        setGenError(data.error ?? 'Erro desconhecido ao gerar roteiro.');
      }
    } catch (e: unknown) {
      setGenError(`Erro de rede: ${e instanceof Error ? e.message : String(e)}`);
    }
    setGenerating(false);
  };

  const handleSave = async (publish = false) => {
    setSaving(true);
    const res = await fetch(`/api/pib/meetings/${meetingId}/guide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title || form.sermonTitle || 'Roteiro',
        biblePassage: form.biblePassage,
        sermonTitle: form.sermonTitle,
        preacher: form.preacher,
        theme: form.theme,
        leaderNote: form.leaderNote,
        icebreakerTitle: form.icebreakerTitle,
        icebreaker: form.icebreaker,
        youtubeLinks: form.youtubeLinks,
        introduction: form.introduction,
        studyPoints: form.studyPoints,
        conclusion: form.conclusion,
        evangelism: form.evangelism,
        evangelismStory: form.evangelismStory,
        evangelismChallenge: form.evangelismChallenge,
        isPublished: publish,
        generatedByAI: guide?.generatedByAI ?? false,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setGuide(data);
      setEditing(false);
    } else {
      alert(data.error ?? 'Erro ao salvar roteiro');
    }
    setSaving(false);
  };

  const addYoutubeLink = () => {
    if (!newYtUrl) return;
    setForm((f) => ({
      ...f,
      youtubeLinks: [...f.youtubeLinks, { title: newYtTitle || newYtUrl, url: newYtUrl }],
    }));
    setNewYtTitle('');
    setNewYtUrl('');
  };

  const removeYoutubeLink = (i: number) => {
    setForm((f) => ({ ...f, youtubeLinks: f.youtubeLinks.filter((_, idx) => idx !== i) }));
  };

  const setPoint = (i: number, field: keyof StudyPoint, value: string) => {
    setForm((f) => {
      const pts = [...f.studyPoints];
      pts[i] = { ...pts[i], [field]: value };
      return { ...f, studyPoints: pts };
    });
  };

  // ── VISUALIZAÇÃO ──────────────────────────────────────────────
  if (guide && !editing) {
    const passageUrl = guide.biblePassage ? parseBiblePassageUrl(guide.biblePassage) : null;

    return (
      <div className="h-full overflow-y-auto bg-gray-100 pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href={`/pib/cells/${cellId}`} className="text-gray-500 hover:text-gray-700 text-lg">←</Link>
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Roteiro de Célula</p>
              <p className="text-sm font-bold text-gray-900">{guide.sermonTitle || guide.title}</p>
            </div>
            <button onClick={() => setEditing(true)} className="text-sm text-indigo-600 font-medium">Editar</button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
          {/* Cabeçalho: título + pregação */}
          <div className="bg-gray-900 text-white rounded-2xl p-5">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Roteiro de Célula</p>
            {guide.sermonTitle && <h2 className="text-lg font-bold">{guide.sermonTitle}</h2>}
            {guide.preacher && <p className="text-gray-300 text-sm">{guide.preacher}</p>}
            {guide.biblePassage && (
              passageUrl ? (
                <Link href={passageUrl} className="inline-block mt-2 text-indigo-300 text-sm underline underline-offset-2">
                  📖 {guide.biblePassage}
                </Link>
              ) : (
                <p className="mt-2 text-indigo-300 text-sm">📖 {guide.biblePassage}</p>
              )
            )}
            {guide.theme && <p className="text-gray-400 text-xs mt-1 italic">{guide.theme}</p>}
            {guide.generatedByAI && (
              <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-white/20 rounded-full">✨ Gerado com IA</span>
            )}
          </div>

          {/* PARA O LÍDER */}
          {guide.leaderNote && (
            <div className="space-y-2">
              <SectionHeader label="Para o Líder" />
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-gray-800 text-sm leading-relaxed">{guide.leaderNote}</p>
              </div>
            </div>
          )}

          {/* QUEBRANDO O GELO */}
          {guide.icebreaker && (
            <div className="space-y-2">
              <SectionHeader label="Quebrando o Gelo" />
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                {guide.icebreakerTitle && (
                  <p className="font-bold text-gray-900 text-sm mb-1">{guide.icebreakerTitle}</p>
                )}
                <p className="text-gray-700 text-sm leading-relaxed">{guide.icebreaker}</p>
              </div>
            </div>
          )}

          {/* EXALTAÇÃO */}
          {guide.youtubeLinks && guide.youtubeLinks.length > 0 && (
            <div className="space-y-2">
              <SectionHeader label="Exaltação" />
              <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2">
                {guide.youtubeLinks.map((yt, i) => (
                  <a key={i} href={yt.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition group">
                    <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 text-sm">▶</span>
                    </div>
                    <span className="text-sm text-indigo-600 group-hover:underline truncate">{yt.title}</span>
                  </a>
                ))}
                <p className="text-xs text-gray-400 pt-1">Façam orações de exaltação e agradecimento.</p>
              </div>
            </div>
          )}

          {/* O QUE APRENDEMOS */}
          {(guide.introduction || (guide.studyPoints && guide.studyPoints.length > 0)) && (
            <div className="space-y-2">
              <SectionHeader label="O que aprendemos essa semana?" />
              <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
                {guide.introduction && (
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">INTRODUÇÃO</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{guide.introduction}</p>
                  </div>
                )}
                {guide.studyPoints?.filter(p => p.title || p.content).map((pt, i) => (
                  <div key={i} className="border-t border-gray-100 pt-3">
                    <p className="font-bold text-gray-900 text-sm">{pt.title}</p>
                    {pt.bibleRef && (
                      <p className="text-indigo-600 text-xs mb-1">{pt.bibleRef}</p>
                    )}
                    <p className="text-gray-700 text-sm leading-relaxed mb-2">{pt.content}</p>
                    {pt.discussionQuestion && (
                      <p className="font-bold text-gray-800 text-sm">• {pt.discussionQuestion}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONCLUSÃO E CHECAGEM */}
          {guide.conclusion && (
            <div className="space-y-2">
              <SectionHeader label="Conclusão e Checagem" />
              <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
                <p className="text-gray-700 text-sm leading-relaxed">{guide.conclusion}</p>
                <p className="font-bold text-gray-800 text-sm">
                  • Qual dos pontos mais te chamou atenção? Qual passo prático você tomará em relação a isso?
                </p>
                <p className="text-xs text-gray-500 italic">
                  Dica para o líder: Divida a célula em micro-grupos (2-5) e deixe que abram seus corações. Encerrem em oração e/ou com um louvor.
                </p>
              </div>
            </div>
          )}

          {/* EVANGELISMO */}
          {(guide.evangelism || guide.evangelismStory || guide.evangelismChallenge) && (
            <div className="space-y-2">
              <SectionHeader label="Evangelismo" />
              <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
                {guide.evangelism && (
                  <div className="space-y-1">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      <span className="underline">Se houver não crentes:</span> faça um breve momento de testemunho e apelo para entrega da vida a Jesus.
                    </p>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      <span className="underline">Se todos já forem crentes:</span> {guide.evangelism}
                    </p>
                  </div>
                )}
                {guide.evangelismStory && (
                  <p className="text-gray-700 text-sm leading-relaxed border-t border-gray-100 pt-3">
                    🌎 {guide.evangelismStory}
                  </p>
                )}
                {guide.evangelismChallenge && (
                  <p className="text-sm">
                    <span className="font-bold">Desafio da semana:</span>{' '}
                    <span className="text-gray-700">{guide.evangelismChallenge}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {!guide.isPublished && (
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition disabled:opacity-50"
            >
              {saving ? 'Publicando...' : '📢 Publicar roteiro para o grupo'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── EDITOR ────────────────────────────────────────────────────
  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
  const textareaCls = `${inputCls} resize-none`;
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => guide && setEditing(false)} className="text-gray-500 hover:text-gray-700">←</button>
          <h1 className="text-base font-bold text-indigo-900 flex-1 text-center">
            {guide ? 'Editar Roteiro' : 'Novo Roteiro'}
          </h1>
          <button onClick={() => handleSave(false)} disabled={saving}
            className="text-sm text-indigo-600 font-medium disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* Geração por IA */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-sm font-bold text-indigo-900">Teos</p>
            <p className="text-xs text-indigo-600 mt-0.5">Preencha o texto base da pregação para a IA criar o roteiro completo no padrão Bíblico.</p>
          </div>

          {/* Texto base — campo principal */}
          <div>
            <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wide mb-1">
              Texto / Versículo Base <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Cole aqui o versículo, trecho bíblico ou texto da pregação que será a base do estudo.&#10;&#10;Ex: Daniel 4:28-37 — &quot;Doze meses depois, enquanto caminhava no terraço do palácio real da Babilônia, o rei exclamou...&quot;&#10;&#10;Ou cole a transcrição completa da pregação."
              value={form.sermonContent}
              onChange={(e) => setForm((f) => ({ ...f, sermonContent: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 border border-indigo-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white resize-none"
            />
          </div>

          {/* Referência + Tema */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Passagem Bíblica</label>
              <input type="text" placeholder="Ex: Daniel 4:28-34" value={form.biblePassage}
                onChange={(e) => setForm((f) => ({ ...f, biblePassage: e.target.value }))}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Tema (opcional)</label>
              <input type="text" placeholder="Ex: Orgulho" value={form.theme}
                onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
                className={inputCls} />
            </div>
          </div>

          {/* Título + Pregador */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Título da Pregação</label>
              <input type="text" placeholder="Ex: Nem Parece Errado" value={form.sermonTitle}
                onChange={(e) => setForm((f) => ({ ...f, sermonTitle: e.target.value }))}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Pregador(a)</label>
              <input type="text" placeholder="Ex: Pr. Alexandre Budal" value={form.preacher}
                onChange={(e) => setForm((f) => ({ ...f, preacher: e.target.value }))}
                className={inputCls} />
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating || (!form.biblePassage && !form.sermonContent)}
            className="w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-40">
            {generating ? 'Gerando roteiro...' : 'Gerar Roteiro com Teos'}
          </button>
          {genError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-700 mb-1">Erro ao gerar roteiro:</p>
              <p className="text-xs text-red-600 break-all">{genError}</p>
            </div>
          )}
          {!form.biblePassage && !form.sermonContent && (
            <p className="text-xs text-center text-indigo-400">Preencha o texto base ou a passagem bíblica para gerar</p>
          )}
        </div>

        {/* Importar texto sem IA */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <button
            type="button"
            onClick={() => setShowImport((v) => !v)}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <p className="text-sm font-bold text-amber-900">📋 Preencher do texto (sem IA)</p>
              <p className="text-xs text-amber-700 mt-0.5">Cole suas notas e os campos são preenchidos automaticamente.</p>
            </div>
            <span className="text-amber-600 text-lg">{showImport ? '▲' : '▼'}</span>
          </button>

          {showImport && (
            <div className="space-y-3">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={8}
                placeholder={`Cole aqui suas notas do sermão em qualquer formato. Exemplos de rótulos que o sistema reconhece:\n\nTítulo: A Humildade que Liberta\nPregador: Pr. João\nPassagem: Filipenses 2:1-11\nTema: Humildade\nIntrodução: ...\n1. Primeiro ponto\n2. Segundo ponto\n3. Terceiro ponto\nConclusão: ...`}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-none font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (!importText.trim()) return;
                  const parsed = parseSermonText(importText);
                  setForm((f) => ({ ...f, ...parsed }));
                  setShowImport(false);
                  setImportText('');
                }}
                disabled={!importText.trim()}
                className="w-full py-2.5 bg-amber-500 text-white text-sm font-bold rounded-lg hover:bg-amber-600 transition disabled:opacity-40"
              >
                📋 Preencher campos do roteiro
              </button>
              <p className="text-xs text-amber-600 text-center">Os campos são preenchidos mas você pode editar antes de salvar.</p>
            </div>
          )}
        </div>

        {/* PARA O LÍDER */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
          <SectionHeader label="Para o Líder" />
          <textarea value={form.leaderNote} rows={3}
            placeholder="Mensagem de encorajamento e reflexão para o líder sobre discipulado..."
            onChange={(e) => setForm((f) => ({ ...f, leaderNote: e.target.value }))}
            className={textareaCls} />
        </div>

        {/* QUEBRANDO O GELO */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
          <SectionHeader label="Quebrando o Gelo" />
          <div>
            <label className={labelCls}>Nome/Tema do Quebra-gelo</label>
            <input type="text" placeholder="Ex: Soft Skill Aleatória" value={form.icebreakerTitle}
              onChange={(e) => setForm((f) => ({ ...f, icebreakerTitle: e.target.value }))}
              className={inputCls} />
          </div>
          <textarea value={form.icebreaker} rows={3}
            placeholder="Descreva a dinâmica ou pergunta leve para começar..."
            onChange={(e) => setForm((f) => ({ ...f, icebreaker: e.target.value }))}
            className={textareaCls} />
        </div>

        {/* EXALTAÇÃO */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <SectionHeader label="Exaltação" />
          {form.youtubeLinks.map((yt, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="flex-1 text-indigo-600 truncate">{yt.title}</span>
              <button onClick={() => removeYoutubeLink(i)} className="text-red-400 hover:text-red-600 text-xs">Remover</button>
            </div>
          ))}
          <div className="space-y-2">
            <input type="text" placeholder="Nome da música" value={newYtTitle}
              onChange={(e) => setNewYtTitle(e.target.value)} className={inputCls} />
            <div className="flex gap-2">
              <input type="url" placeholder="https://youtube.com/watch?v=..." value={newYtUrl}
                onChange={(e) => setNewYtUrl(e.target.value)} className={`flex-1 ${inputCls}`} />
              <button onClick={addYoutubeLink} disabled={!newYtUrl}
                className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition disabled:opacity-40">
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* O QUE APRENDEMOS */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <SectionHeader label="O que aprendemos essa semana?" />
          <div>
            <label className={labelCls}>Introdução</label>
            <textarea value={form.introduction} rows={3}
              placeholder="Parágrafo introdutório que apresenta o tema da pregação..."
              onChange={(e) => setForm((f) => ({ ...f, introduction: e.target.value }))}
              className={textareaCls} />
          </div>
          {form.studyPoints.map((pt, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2">
              <p className="text-xs font-bold text-indigo-700 uppercase">Ponto {i + 1}</p>
              <input type="text" placeholder={`Título (ex: 1) O Pecado do Olhar Distorcido...)`}
                value={pt.title} onChange={(e) => setPoint(i, 'title', e.target.value)} className={inputCls} />
              <input type="text" placeholder="Referência bíblica (ex: Fp 2:3-4)"
                value={pt.bibleRef} onChange={(e) => setPoint(i, 'bibleRef', e.target.value)} className={inputCls} />
              <textarea placeholder="Desenvolvimento do ponto (3-4 linhas)..." rows={3}
                value={pt.content} onChange={(e) => setPoint(i, 'content', e.target.value)} className={textareaCls} />
              <textarea placeholder="Pergunta de discussão para o grupo..." rows={2}
                value={pt.discussionQuestion} onChange={(e) => setPoint(i, 'discussionQuestion', e.target.value)} className={textareaCls} />
            </div>
          ))}
        </div>

        {/* CONCLUSÃO */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
          <SectionHeader label="Conclusão e Checagem" />
          <textarea value={form.conclusion} rows={4}
            placeholder="Parágrafo de conclusão que amarra os pontos e convida à transformação..."
            onChange={(e) => setForm((f) => ({ ...f, conclusion: e.target.value }))}
            className={textareaCls} />
          <p className="text-xs text-gray-400 italic">
            A pergunta de checagem padrão será incluída automaticamente: "Qual dos pontos mais te chamou atenção? Qual passo prático você tomará?"
          </p>
        </div>

        {/* EVANGELISMO */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
          <SectionHeader label="Evangelismo" />
          <div>
            <label className={labelCls}>Orientação (para crentes)</label>
            <textarea value={form.evangelism} rows={2}
              placeholder="Comunique a visão de multiplicação do Reino, de fazer discípulos..."
              onChange={(e) => setForm((f) => ({ ...f, evangelism: e.target.value }))}
              className={textareaCls} />
          </div>
          <div>
            <label className={labelCls}>História Inspiradora</label>
            <textarea value={form.evangelismStory} rows={3}
              placeholder="Título e história inspiradora sobre evangelismo ou missões..."
              onChange={(e) => setForm((f) => ({ ...f, evangelismStory: e.target.value }))}
              className={textareaCls} />
          </div>
          <div>
            <label className={labelCls}>Desafio da Semana</label>
            <textarea value={form.evangelismChallenge} rows={2}
              placeholder="Desafio prático relacionado a evangelismo ou servir..."
              onChange={(e) => setForm((f) => ({ ...f, evangelismChallenge: e.target.value }))}
              className={textareaCls} />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => handleSave(false)} disabled={saving}
            className="flex-1 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition disabled:opacity-40">
            Salvar rascunho
          </button>
          <button onClick={() => handleSave(true)} disabled={saving}
            className="flex-1 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition disabled:opacity-40">
            📢 Publicar
          </button>
        </div>
      </div>
    </div>
  );
}
