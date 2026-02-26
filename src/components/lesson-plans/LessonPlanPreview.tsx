import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Printer, Share2, Download, GraduationCap } from 'lucide-react';
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

const getSchoolHeaderHtml = (teacherName: string, className: string, subjectName: string) => `
<div style="border-bottom: 3px solid #2D5F3F; padding-bottom: 12px; margin-bottom: 20px;">
  <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 6px;">
    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #2D5F3F, #4A7C59); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>
    </div>
    <div>
      <h1 style="font-size: 18px; font-weight: 800; color: #2D5F3F; margin: 0; letter-spacing: -0.5px;">ESCOLA REVIVA</h1>
      <p style="font-size: 10px; color: #4A7C59; margin: 0; font-weight: 500;">SiGER - Sistema de Gestão Escolar Reviva</p>
    </div>
    <div style="margin-left: auto; text-align: right;">
      <p style="font-size: 12px; font-weight: 700; color: #1a1a1a; margin: 0;">📋 PLANO DE AULA AEP</p>
      <p style="font-size: 10px; color: #666; margin: 0;">Abordagem Educacional por Princípios</p>
    </div>
  </div>
  <div style="display: flex; gap: 24px; font-size: 11px; color: #444; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e5e5;">
    ${teacherName ? `<span>👤 <strong>Professor:</strong> ${teacherName}</span>` : ''}
    ${className ? `<span>🏫 <strong>Turma:</strong> ${className}</span>` : ''}
    ${subjectName ? `<span>📚 <strong>Disciplina:</strong> ${subjectName}</span>` : ''}
  </div>
</div>
`;

export function LessonPlanPreview({ content, onSave, isSaving, teacherName = '', className = '', subjectName = '' }: LessonPlanPreviewProps) {
  const sanitizedContent = DOMPurify.sanitize(content);
  const dateStr = new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' });

  const getFullHtml = () => `
    <!DOCTYPE html>
    <html><head><title>Plano de Aula AEP - Escola Reviva</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      @page {
        size: A4;
        margin: 20mm 15mm 25mm 15mm;
        @bottom-left { content: "${dateStr}"; font-size: 9px; color: #888; font-family: 'Inter', sans-serif; }
        @bottom-right { content: "Página " counter(page) " de " counter(pages); font-size: 9px; color: #888; font-family: 'Inter', sans-serif; }
      }
      body { font-family: 'Inter', sans-serif; padding: 0; color: #1a1a1a; max-width: 100%; margin: 0; font-size: 12px; line-height: 1.6; }
      h1 { font-size: 16px; color: #2D5F3F; margin: 16px 0 8px; border-bottom: 2px solid #2D5F3F; padding-bottom: 4px; }
      h2 { font-size: 14px; color: #2D5F3F; margin: 14px 0 6px; }
      h3 { font-size: 13px; color: #4A7C59; margin: 10px 0 4px; }
      table { border-collapse: collapse; width: 100%; margin: 8px 0; }
      th { background: #2D5F3F; color: white; padding: 6px 10px; text-align: left; font-size: 11px; }
      td { border: 1px solid #ddd; padding: 6px 10px; font-size: 11px; }
      tr:nth-child(even) td { background: #f9f9f9; }
      ul, ol { padding-left: 20px; margin: 6px 0; }
      li { margin: 3px 0; }
      blockquote { border-left: 3px solid #2D5F3F; margin: 8px 0; padding: 6px 12px; background: #f0f7f2; font-style: italic; }
      .page-break { page-break-before: always; }
      @media print {
        body { padding: 0; }
        .no-print { display: none !important; }
      }
    </style>
    </head><body>${getSchoolHeaderHtml(teacherName, className, subjectName)}${sanitizedContent}
    <div style="position: fixed; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-between; font-size: 9px; color: #888; padding: 8px 15mm; border-top: 1px solid #eee;">
      <span>${dateStr}</span>
      <span>© SiGER - Escola Reviva</span>
    </div>
    </body></html>
  `;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(getFullHtml());
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const blob = new Blob([getFullHtml()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plano-aula-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Download iniciado', description: 'Ficheiro HTML do plano de aula descarregado.' });
  };

  const handleShare = async () => {
    const text = `Plano de Aula AEP - Escola Reviva\n\n${dateStr}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Plano de Aula AEP', text });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text + '\n\n' + content.replace(/<[^>]*>/g, ''));
      toast({ title: 'Copiado!', description: 'Conteúdo do plano copiado para a área de transferência.' });
    }
  };

  return (
    <div className="space-y-0">
      {/* Action buttons bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 rounded-t-lg border border-b-0 border-border">
        <p className="text-xs text-muted-foreground font-medium">
          📄 Gerado em {dateStr}
        </p>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" onClick={handlePrint} className="h-7 text-[11px] gap-1">
            <Printer className="h-3 w-3" /> Imprimir
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="h-7 text-[11px] gap-1">
            <Download className="h-3 w-3" /> Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} className="h-7 text-[11px] gap-1">
            <Share2 className="h-3 w-3" /> Partilhar
          </Button>
          <Button size="sm" onClick={onSave} disabled={isSaving} className="h-7 text-[11px] gap-1 bg-primary hover:bg-primary/90">
            <Save className="h-3 w-3" /> Guardar
          </Button>
        </div>
      </div>

      {/* Paper-like preview */}
      <div className="bg-white rounded-b-lg border border-border shadow-lg overflow-hidden">
        {/* School Header on preview */}
        <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-extrabold text-white tracking-tight">ESCOLA REVIVA</h2>
              <p className="text-[10px] text-white/70 font-medium">SiGER - Sistema de Gestão Escolar Reviva</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">📋 PLANO DE AULA AEP</p>
              <p className="text-[10px] text-white/70">Abordagem Educacional por Princípios</p>
            </div>
          </div>
          {(teacherName || className || subjectName) && (
            <div className="flex gap-4 mt-2 pt-2 border-t border-white/20 text-[11px] text-white/80">
              {teacherName && <span>👤 {teacherName}</span>}
              {className && <span>🏫 {className}</span>}
              {subjectName && <span>📚 {subjectName}</span>}
            </div>
          )}
        </div>

        {/* Content area - white paper */}
        <div className="px-6 sm:px-10 py-6 sm:py-8 min-h-[600px]">
          <div
            className="prose prose-sm max-w-none 
              prose-headings:text-primary prose-headings:font-bold
              prose-h1:text-lg prose-h1:border-b-2 prose-h1:border-primary prose-h1:pb-1
              prose-h2:text-base prose-h3:text-sm prose-h3:text-secondary
              prose-th:bg-primary prose-th:text-primary-foreground prose-th:text-xs
              prose-td:text-xs prose-td:border-border
              prose-blockquote:border-l-primary prose-blockquote:bg-primary/5
              prose-li:text-sm
              prose-p:text-sm prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 sm:px-10 py-3 border-t border-border/50 text-[10px] text-muted-foreground">
          <span>{dateStr}</span>
          <span>© SiGER - Escola Reviva</span>
        </div>
      </div>
    </div>
  );
}
