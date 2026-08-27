'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { CellGuideDetail, StudyPoint } from '@/lib/types';

type Format = 'a4' | 'mobile';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="section">
      <div className="section-header">{title}</div>
      <div className="section-body">{children}</div>
    </div>
  );
}

function PointBlock({ pt, i }: { pt: StudyPoint; i: number }) {
  if (!pt.title && !pt.content) return null;
  return (
    <div className="point-block">
      <p className="point-title">{pt.title}</p>
      {pt.bibleRef && <p className="point-ref">📖 {pt.bibleRef}</p>}
      {pt.content && <p className="point-content">{pt.content}</p>}
      {pt.discussionQuestion && (
        <p className="point-question">💬 {pt.discussionQuestion}</p>
      )}
      {pt.innerReflection && (
        <div className="point-reflection">
          <p className="reflection-label">Reflexão Interior</p>
          <p className="reflection-text">{pt.innerReflection}</p>
        </div>
      )}
    </div>
  );
}

export default function GuidePrintPage() {
  const { meetingId } = useParams<{ cellId: string; meetingId: string }>();
  const [guide, setGuide] = useState<CellGuideDetail | null>(null);
  const [format, setFormat] = useState<Format>('a4');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!meetingId) return;
    fetch(`/api/mdc/meetings/${meetingId}/guide`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setGuide(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [meetingId]);

  const handlePrint = () => window.print();

  const handleDownload = async () => {
    const el = document.getElementById('guide-page');
    if (!el || !guide) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pageFormat = format === 'mobile' ? 'a5' : 'a4';
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: pageFormat });

      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const canvasW = canvas.width;
      const canvasH = canvas.height;
      const ratio = pdfW / (canvasW / 2); // canvas scale=2
      const totalH = (canvasH / 2) * ratio;

      let remaining = totalH;
      let offset = 0;

      while (remaining > 0) {
        if (offset > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -offset, pdfW, totalH);
        offset += pdfH;
        remaining -= pdfH;
      }

      const filename = (guide.sermonTitle || guide.title || 'roteiro')
        .replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .toLowerCase();
      pdf.save(`${filename}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#64748b' }}>
        Carregando roteiro…
      </div>
    );
  }

  if (!guide) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#ef4444' }}>
        Roteiro não encontrado.
      </div>
    );
  }

  const isMobile = format === 'mobile';

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: Georgia, 'Times New Roman', serif;
          background: #f1f5f9;
          color: #1e293b;
        }

        /* ── Barra de controles (não imprime) ── */
        .controls {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          background: #1e293b;
          color: white;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-family: system-ui, sans-serif;
          font-size: 13px;
        }
        .controls-title { font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 35%; }
        .controls-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .fmt-btn {
          padding: 5px 12px; border-radius: 6px; border: 1.5px solid #475569;
          background: transparent; color: white; cursor: pointer; font-size: 12px; font-weight: 600;
          transition: all .15s;
        }
        .fmt-btn.active { background: white; color: #1e293b; border-color: white; }
        .dl-btn {
          padding: 6px 16px; border-radius: 6px; border: none;
          background: #10b981; color: white; font-weight: 700; cursor: pointer; font-size: 13px;
          display: flex; align-items: center; gap: 6px;
        }
        .dl-btn:hover { background: #059669; }
        .dl-btn:disabled { opacity: .6; cursor: not-allowed; }
        .print-btn {
          padding: 6px 16px; border-radius: 6px; border: none;
          background: #3b82f6; color: white; font-weight: 700; cursor: pointer; font-size: 13px;
        }
        .print-btn:hover { background: #2563eb; }

        /* ── Página ── */
        .page {
          margin: 60px auto 40px;
          background: white;
          box-shadow: 0 4px 24px rgba(0,0,0,.12);
        }

        /* A4 */
        .page.a4 {
          width: 210mm;
          min-height: 297mm;
          padding: 18mm 20mm 18mm;
        }

        /* Mobile */
        .page.mobile {
          width: 390px;
          min-height: 0;
          padding: 20px 18px 32px;
          border-radius: 12px;
        }

        /* ── Cabeçalho do roteiro ── */
        .guide-header {
          background: #1e293b;
          color: white;
          padding: ${isMobile ? '16px' : '20px 24px'};
          border-radius: ${isMobile ? '10px' : '6px'};
          margin-bottom: ${isMobile ? '14px' : '18px'};
        }
        .guide-eyebrow { font-family: system-ui, sans-serif; font-size: 9px; letter-spacing: .12em; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }
        .guide-title { font-size: ${isMobile ? '18px' : '22px'}; font-weight: 700; line-height: 1.25; }
        .guide-preacher { font-size: ${isMobile ? '13px' : '14px'}; color: #cbd5e1; margin-top: 4px; }
        .guide-passage { font-size: ${isMobile ? '13px' : '14px'}; color: #a5b4fc; margin-top: 6px; }
        .guide-theme { font-size: 12px; color: #64748b; font-style: italic; margin-top: 4px; }
        .ai-badge { display: inline-block; margin-top: 8px; font-size: 10px; padding: 2px 8px; background: rgba(255,255,255,.18); border-radius: 99px; font-family: system-ui, sans-serif; }

        /* ── Seções ── */
        .section { margin-bottom: ${isMobile ? '14px' : '18px'}; page-break-inside: avoid; }
        .section-header {
          background: #1e293b; color: white;
          font-family: system-ui, sans-serif; font-size: ${isMobile ? '10px' : '9px'};
          font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
          padding: ${isMobile ? '8px 12px' : '6px 12px'};
          border-radius: 4px; margin-bottom: 8px;
        }
        .section-body {
          font-size: ${isMobile ? '14px' : '13px'};
          line-height: ${isMobile ? '1.65' : '1.6'};
          color: #334155;
        }

        /* Leader note */
        .leader-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 12px; }

        /* Icebreaker */
        .ice-title { font-weight: 700; color: #1e293b; margin-bottom: 4px; font-size: ${isMobile ? '14px' : '13px'}; }

        /* YouTube / Exaltação */
        .yt-item { display: flex; align-items: center; gap: 10px; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
        .yt-item:last-child { border-bottom: none; }
        .yt-bullet { width: 22px; height: 22px; background: #fee2e2; border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; }
        .yt-title { font-size: ${isMobile ? '13px' : '12px'}; color: #4f46e5; }
        .yt-url { font-size: 10px; color: #94a3b8; font-family: monospace; }
        .yt-hint { font-size: 11px; color: #94a3b8; font-style: italic; margin-top: 6px; }

        /* Intro */
        .intro-label { font-weight: 700; font-size: ${isMobile ? '12px' : '11px'}; text-transform: uppercase; letter-spacing: .06em; color: #475569; margin-bottom: 4px; font-family: system-ui, sans-serif; }

        /* Points */
        .point-block { border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 12px; }
        .point-block:first-child { border-top: none; padding-top: 0; margin-top: 0; }
        .point-title { font-weight: 700; font-size: ${isMobile ? '15px' : '14px'}; color: #1e293b; margin-bottom: 3px; }
        .point-ref { font-size: 12px; color: #4f46e5; margin-bottom: 6px; font-family: system-ui, sans-serif; }
        .point-content { font-size: ${isMobile ? '14px' : '13px'}; line-height: 1.65; color: #334155; margin-bottom: 8px; }
        .point-question { font-weight: 700; font-size: ${isMobile ? '14px' : '13px'}; color: #1e293b; background: #f8fafc; border-left: 3px solid #4f46e5; padding: 8px 10px; border-radius: 0 4px 4px 0; }
        .point-reflection { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 6px; padding: 10px 12px; margin-top: 8px; }
        .reflection-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #7c3aed; margin-bottom: 4px; font-family: system-ui, sans-serif; }
        .reflection-text { font-size: ${isMobile ? '13px' : '12px'}; color: #4c1d95; font-style: italic; line-height: 1.6; }

        /* Conclusão */
        .conclusion-question { font-weight: 700; color: #1e293b; margin-top: 10px; font-size: ${isMobile ? '14px' : '13px'}; }
        .leader-tip { font-size: 12px; color: #64748b; font-style: italic; margin-top: 8px; }

        /* Evangelismo */
        .evang-story { border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 10px; }
        .evang-challenge { font-weight: 700; margin-top: 8px; color: #1e293b; font-size: ${isMobile ? '14px' : '13px'}; }

        /* Rodapé */
        .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 10px; display: flex; align-items: center; justify-content: space-between; }
        .footer-brand { font-family: system-ui, sans-serif; font-size: 10px; color: #94a3b8; }

        /* ── IMPRESSÃO ── */
        @media print {
          .controls { display: none !important; }
          body { background: white !important; }
          .page {
            margin: 0 !important;
            box-shadow: none !important;
            width: 100% !important;
            border-radius: 0 !important;
          }
          .page.a4 { padding: 12mm 16mm !important; }
          .page.mobile { padding: 12px !important; width: 100% !important; }
          .section { page-break-inside: avoid; }
          @page { size: ${isMobile ? 'A5' : 'A4'}; margin: 10mm; }
        }
      `}</style>

      {/* Barra de controles */}
      <div className="controls">
        <span className="controls-title">
          {guide.sermonTitle || guide.title || 'Roteiro de Célula'}
        </span>
        <div className="controls-right">
          <button
            className={`fmt-btn${format === 'a4' ? ' active' : ''}`}
            onClick={() => setFormat('a4')}
          >
            📄 A4
          </button>
          <button
            className={`fmt-btn${format === 'mobile' ? ' active' : ''}`}
            onClick={() => setFormat('mobile')}
          >
            📱 Celular
          </button>
          <button className="dl-btn" onClick={handleDownload} disabled={downloading}>
            {downloading ? '⏳ Gerando…' : '⬇ Baixar PDF'}
          </button>
          <button className="print-btn" onClick={handlePrint}>
            🖨 Imprimir
          </button>
        </div>
      </div>

      {/* Página do roteiro */}
      <div id="guide-page" className={`page ${format}`}>

        {/* Cabeçalho */}
        <div className="guide-header">
          <p className="guide-eyebrow">Roteiro de Célula · Emetis</p>
          <p className="guide-title">{guide.sermonTitle || guide.title}</p>
          {guide.preacher && <p className="guide-preacher">{guide.preacher}</p>}
          {guide.biblePassage && <p className="guide-passage">📖 {guide.biblePassage}</p>}
          {guide.theme && <p className="guide-theme">{guide.theme}</p>}
          {guide.generatedByAI && <span className="ai-badge">✨ Gerado com IA</span>}
        </div>

        {/* Para o Líder */}
        {guide.leaderNote && (
          <Section title="Para o Líder">
            <div className="leader-box">{guide.leaderNote}</div>
          </Section>
        )}

        {/* Quebrando o Gelo */}
        {guide.icebreaker && (
          <Section title="Quebrando o Gelo">
            {guide.icebreakerTitle && <p className="ice-title">{guide.icebreakerTitle}</p>}
            <p>{guide.icebreaker}</p>
          </Section>
        )}

        {/* Exaltação */}
        {guide.youtubeLinks && guide.youtubeLinks.length > 0 && (
          <Section title="Exaltação">
            {guide.youtubeLinks.map((yt, i) => (
              <div key={i} className="yt-item">
                <div className="yt-bullet">▶</div>
                <div>
                  <p className="yt-title">{yt.title}</p>
                  {yt.url && <p className="yt-url">{yt.url}</p>}
                </div>
              </div>
            ))}
            <p className="yt-hint">Façam orações de exaltação e agradecimento.</p>
          </Section>
        )}

        {/* O que aprendemos */}
        {(guide.introduction || guide.studyPoints?.length) && (
          <Section title="O que aprendemos essa semana?">
            {guide.introduction && (
              <div style={{ marginBottom: '12px' }}>
                <p className="intro-label">Introdução</p>
                <p>{guide.introduction}</p>
              </div>
            )}
            {guide.studyPoints?.filter(p => p.title || p.content).map((pt, i) => (
              <PointBlock key={i} pt={pt} i={i} />
            ))}
          </Section>
        )}

        {/* Conclusão */}
        {guide.conclusion && (
          <Section title="Conclusão e Checagem">
            <p>{guide.conclusion}</p>
            <p className="conclusion-question">
              💬 Qual dos pontos mais te chamou atenção? Qual passo prático você tomará em relação a isso?
            </p>
            <p className="leader-tip">
              Dica: Divida em micro-grupos (2–5 pessoas) para oração específica. Encerrem com um louvor.
            </p>
          </Section>
        )}

        {/* Evangelismo */}
        {(guide.evangelism || guide.evangelismStory || guide.evangelismChallenge) && (
          <Section title="Evangelismo">
            {guide.evangelism && <p>{guide.evangelism}</p>}
            {guide.evangelismStory && (
              <div className="evang-story">
                <p>🌎 {guide.evangelismStory}</p>
              </div>
            )}
            {guide.evangelismChallenge && (
              <p className="evang-challenge">
                Desafio da semana: {guide.evangelismChallenge}
              </p>
            )}
          </Section>
        )}

        {/* Rodapé */}
        <div className="footer">
          <span className="footer-brand">Emetis · eColabs</span>
          <span className="footer-brand">Roteiro gerado em {new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </>
  );
}
