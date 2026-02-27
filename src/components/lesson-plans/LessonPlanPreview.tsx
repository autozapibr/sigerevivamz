import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Printer, Share2, FileDown, GraduationCap } from 'lucide-react';
import DOMPurify from 'dompurify';
import { toast } from '@/hooks/use-toast';

interface LessonPlanPreviewProps {
  content: string;
  onSave: () => void;
  isSaving: boolean;
  teacherName?: string;
  className?: string;
  subjectName?: string;
}

/** Strip markdown code fences the AI may wrap around HTML */
function cleanContent(raw: string): string {
  return raw
    .replace(/^```html\s*/i, '')
    .replace(/^```\w*\s*/gm, '')
    .replace(/```\s*$/gm, '')
    .trim();
}

const A4_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700;800&display=swap');
@page {
  size: A4;
  margin: 18mm 14mm 22mm 14mm;
}
* { box-sizing: border-box; }
body {
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
  color: #1a1a1a;
  margin: 0;
  padding: 20px 24px;
  font-size: 11px;
  line-height: 1.65;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
h1 { font-size: 15px; font-weight: 700; color: #2D5F3F; margin: 14px 0 6px; border-bottom: 2px solid #2D5F3F; padding-bottom: 3px; }
h2 { font-size: 13px; font-weight: 600; color: #2D5F3F; margin: 12px 0 5px; }
h3 { font-size: 12px; font-weight: 600; color: #4A7C59; margin: 10px 0 4px; }
h4 { font-size: 11px; font-weight: 600; color: #333; margin: 8px 0 3px; }
p { margin: 4px 0; }
strong { font-weight: 600; }
table { border-collapse: collapse; width: 100%; margin: 8px 0; }
th { background: #2D5F3F; color: white; padding: 5px 8px; text-align: left; font-size: 10px; font-weight: 600; }
td { border: 1px solid #ddd; padding: 5px 8px; font-size: 10px; }
tr:nth-child(even) td { background: #f9f9f9; }
ul, ol { padding-left: 20px; margin: 5px 0; }
li { margin: 3px 0; font-size: 11px; }
blockquote { border-left: 3px solid #2D5F3F; margin: 6px 0; padding: 6px 12px; background: #f0f7f2; font-style: italic; font-size: 10.5px; }
hr { border: none; border-top: 1px solid #ddd; margin: 10px 0; }
.header-bar { border-bottom: 3px solid #2D5F3F; padding-bottom: 10px; margin-bottom: 16px; }
.header-top { display: flex; align-items: center; gap: 12px; margin-bottom: 5px; }
.header-logo { width: 40px; height: 40px; background: linear-gradient(135deg, #2D5F3F, #4A7C59); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.header-title { font-size: 16px; font-weight: 800; color: #2D5F3F; margin: 0; letter-spacing: -0.5px; }
.header-sub { font-size: 9px; color: #4A7C59; margin: 0; font-weight: 500; }
.header-right { margin-left: auto; text-align: right; }
.header-meta { display: flex; gap: 20px; font-size: 10px; color: #444; margin-top: 6px; padding-top: 6px; border-top: 1px solid #e5e5e5; }
.footer { display: flex; justify-content: space-between; font-size: 8px; color: #999; padding: 6px 0; border-top: 1px solid #eee; margin-top: 20px; }
@media print {
  body { padding: 0; }
  .no-print { display: none !important; }
}
`;

const getSchoolHeaderHtml = (teacherName: string, className: string, subjectName: string) => `
<div class="header-bar">
  <div class="header-top">
    <div class="header-logo">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>
    </div>
    <div>
      <p class="header-title">ESCOLA REVIVA</p>
      <p class="header-sub">SiGER - Sistema de Gestão Escolar Reviva</p>
    </div>
    <div class="header-right">
      <p style="font-size:11px;font-weight:700;color:#1a1a1a;margin:0;">📋 PLANO DE AULA AEP</p>
      <p style="font-size:9px;color:#666;margin:0;">Abordagem Educacional por Princípios</p>
    </div>
  </div>
  <div class="header-meta">
    ${teacherName ? `<span>👤 <strong>Professor:</strong> ${teacherName}</span>` : ''}
    ${className ? `<span>🏫 <strong>Turma:</strong> ${className}</span>` : ''}
    ${subjectName ? `<span>📚 <strong>Disciplina:</strong> ${subjectName}</span>` : ''}
  </div>
</div>
`;

export function LessonPlanPreview({ content, onSave, isSaving, teacherName = '', className = '', subjectName = '' }: LessonPlanPreviewProps) {
  const cleaned = cleanContent(content);
  const sanitizedContent = DOMPurify.sanitize(cleaned);
  const dateStr = new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' });
  const printRef = useRef<HTMLDivElement>(null);

  const getFullHtml = () => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Plano de Aula AEP - Escola Reviva</title>
<style>${A4_STYLES}</style>
</head><body>
${getSchoolHeaderHtml(teacherName, className, subjectName)}
${sanitizedContent}
<div class="footer">
  <span>${dateStr}</span>
  <span>© SiGER - Escola Reviva</span>
</div>
</body></html>`;

  const openPrintWindow = () => {
    const w = window.open('', '_blank');
    if (!w) {
      toast({ title: 'Erro', description: 'Permita pop-ups para imprimir/descarregar.', variant: 'destructive' });
      return null;
    }
    w.document.write(getFullHtml());
    w.document.close();
    return w;
  };

  const handlePrint = () => {
    const w = openPrintWindow();
    if (w) {
      w.onafterprint = () => w.close();
      setTimeout(() => w.print(), 400);
    }
  };

  const handleDownloadPdf = () => {
    const w = openPrintWindow();
    if (w) {
      toast({ title: '💡 Dica', description: 'Na janela de impressão, seleccione "Guardar como PDF" como destino.' });
      setTimeout(() => w.print(), 400);
    }
  };

  const handleShare = async () => {
    const blob = new Blob([getFullHtml()], { type: 'text/html' });
    const file = new File([blob], `plano-aula-${new Date().toISOString().slice(0, 10)}.html`, { type: 'text/html' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ title: 'Plano de Aula AEP', files: [file] });
        return;
      } catch { /* user cancelled */ }
    }
    // Fallback: copy text
    const plainText = cleaned.replace(/<[^>]*>/g, '');
    await navigator.clipboard.writeText(`Plano de Aula AEP - Escola Reviva\n${dateStr}\n\n${plainText}`);
    toast({ title: 'Copiado!', description: 'Conteúdo do plano copiado para a área de transferência.' });
  };

  return (
    <div className="space-y-0">
      {/* Action icons bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 rounded-t-lg border border-b-0 border-border">
        <p className="text-xs text-muted-foreground font-medium">📄 Gerado em {dateStr}</p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handlePrint} title="Imprimir" className="h-8 w-8">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDownloadPdf} title="Download PDF" className="h-8 w-8">
            <FileDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare} title="Partilhar" className="h-8 w-8">
            <Share2 className="h-4 w-4" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button size="sm" onClick={onSave} disabled={isSaving} className="h-8 text-xs gap-1 bg-primary hover:bg-primary/90">
            <Save className="h-3.5 w-3.5" /> Guardar
          </Button>
        </div>
      </div>

      {/* Paper-like preview */}
      <div className="bg-white rounded-b-lg border border-border shadow-lg overflow-hidden" ref={printRef}>
        {/* School Header on preview */}
        <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-extrabold text-white tracking-tight">ESCOLA REVIVA</h2>
              <p className="text-[9px] text-white/70 font-medium">SiGER - Sistema de Gestão Escolar Reviva</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-bold text-white">📋 PLANO DE AULA AEP</p>
              <p className="text-[9px] text-white/70">Abordagem Educacional por Princípios</p>
            </div>
          </div>
          {(teacherName || className || subjectName) && (
            <div className="flex flex-wrap gap-4 mt-1.5 pt-1.5 border-t border-white/20 text-[10px] text-white/80">
              {teacherName && <span>👤 {teacherName}</span>}
              {className && <span>🏫 {className}</span>}
              {subjectName && <span>📚 {subjectName}</span>}
            </div>
          )}
        </div>

        {/* Content area - white paper with DARK text forced */}
        <div className="px-6 sm:px-10 py-5 sm:py-6 min-h-[500px] overflow-x-hidden">
          <div
            className="max-w-none
              [&_h1]:text-[14px] [&_h1]:font-bold [&_h1]:text-[#2D5F3F] [&_h1]:border-b-2 [&_h1]:border-[#2D5F3F] [&_h1]:pb-1 [&_h1]:mt-3 [&_h1]:mb-2
              [&_h2]:text-[13px] [&_h2]:font-semibold [&_h2]:text-[#2D5F3F] [&_h2]:mt-3 [&_h2]:mb-1.5
              [&_h3]:text-[12px] [&_h3]:font-semibold [&_h3]:text-[#4A7C59] [&_h3]:mt-2 [&_h3]:mb-1
              [&_h4]:text-[11px] [&_h4]:font-semibold [&_h4]:text-[#333] [&_h4]:mt-2 [&_h4]:mb-1
              [&_p]:text-[11px] [&_p]:leading-relaxed [&_p]:my-1
              [&_li]:text-[11px] [&_li]:my-0.5
              [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:pl-5 [&_ol]:my-1
              [&_strong]:font-semibold
              [&_table]:w-full [&_table]:border-collapse [&_table]:my-2
              [&_th]:bg-[#2D5F3F] [&_th]:text-white [&_th]:text-[10px] [&_th]:font-semibold [&_th]:py-1 [&_th]:px-2 [&_th]:text-left
              [&_td]:border [&_td]:border-[#ddd] [&_td]:text-[10px] [&_td]:py-1 [&_td]:px-2
              [&_tr:nth-child(even)_td]:bg-[#f9f9f9]
              [&_blockquote]:border-l-[3px] [&_blockquote]:border-l-[#2D5F3F] [&_blockquote]:bg-[#f0f7f2] [&_blockquote]:my-1.5 [&_blockquote]:py-1.5 [&_blockquote]:px-3 [&_blockquote]:italic [&_blockquote]:text-[10.5px]
              [&_hr]:border-t [&_hr]:border-[#ddd] [&_hr]:my-2"
            style={{
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: 300,
              color: '#1a1a1a',
            }}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 sm:px-10 py-2 border-t border-border/50 text-[9px]" style={{ color: '#888' }}>
          <span>{dateStr}</span>
          <span>© SiGER - Escola Reviva</span>
        </div>
      </div>
    </div>
  );
}
