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
}

const schoolHeaderHtml = `
<div style="border-bottom: 3px solid #2D5F3F; padding-bottom: 16px; margin-bottom: 24px;">
  <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #2D5F3F, #4A7C59); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>
    </div>
    <div>
      <h1 style="font-size: 20px; font-weight: 800; color: #2D5F3F; margin: 0; letter-spacing: -0.5px;">ESCOLA REVIVA</h1>
      <p style="font-size: 11px; color: #4A7C59; margin: 0; font-weight: 500;">SiGER - Sistema de Gestão Escolar Reviva</p>
    </div>
    <div style="margin-left: auto; text-align: right;">
      <p style="font-size: 13px; font-weight: 700; color: #1a1a1a; margin: 0;">PLANO DE AULA</p>
      <p style="font-size: 11px; color: #666; margin: 0;">Abordagem Educacional por Princípios</p>
    </div>
  </div>
</div>
`;

export function LessonPlanPreview({ content, onSave, isSaving }: LessonPlanPreviewProps) {
  const sanitizedContent = DOMPurify.sanitize(content);

  const getFullHtml = () => `
    <!DOCTYPE html>
    <html><head><title>Plano de Aula AEP - Escola Reviva</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      body { font-family: 'Inter', sans-serif; padding: 32px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
      h1, h2, h3 { color: #2D5F3F; }
      table { border-collapse: collapse; width: 100%; }
      th { background: #2D5F3F; color: white; padding: 8px 12px; text-align: left; }
      td { border: 1px solid #ddd; padding: 8px 12px; }
      @media print { body { padding: 16px; } }
    </style>
    </head><body>${schoolHeaderHtml}${sanitizedContent}</body></html>
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
    const text = `Plano de Aula AEP - Escola Reviva\n\n${new Date().toLocaleDateString('pt-MZ')}`;
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
    <Card className="border-primary/20 shadow-lg">
      {/* School Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-t-lg p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-extrabold text-white tracking-tight">ESCOLA REVIVA</h2>
            <p className="text-xs text-white/70 font-medium">SiGER - Sistema de Gestão Escolar Reviva</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">PLANO DE AULA</p>
            <p className="text-xs text-white/70">Abordagem Educacional por Princípios</p>
          </div>
        </div>
      </div>

      {/* Action buttons bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-muted/30">
        <p className="text-xs text-muted-foreground font-medium">
          Gerado em {new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 text-xs gap-1.5">
            <Printer className="h-3.5 w-3.5" /> Imprimir
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} className="h-8 text-xs gap-1.5">
            <Share2 className="h-3.5 w-3.5" /> Partilhar
          </Button>
          <Button size="sm" onClick={onSave} disabled={isSaving} className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90">
            <Save className="h-3.5 w-3.5" /> Guardar
          </Button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-6 sm:p-8">
        <div
          className="prose prose-sm sm:prose max-w-none dark:prose-invert prose-headings:text-primary prose-th:bg-primary prose-th:text-primary-foreground"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </CardContent>
    </Card>
  );
}
