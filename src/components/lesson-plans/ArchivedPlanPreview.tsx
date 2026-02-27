import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, FileDown, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

interface ArchivedPlanPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filePath: string;
  fileName: string;
  teacherName?: string;
}

const A4_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700;800&display=swap');
* { box-sizing: border-box; }
body {
  font-family: 'Work Sans', sans-serif;
  font-weight: 400;
  color: hsl(20 14.3% 8%);
  margin: 0; padding: 20px;
  font-size: 12px; line-height: 1.7;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.page-header { padding-bottom: 10px; margin-bottom: 14px; border-bottom: 2px solid hsl(140 37% 28%); }
.page-header-top { display: flex; align-items: center; gap: 12px; }
.page-header-logo { width: 38px; height: 38px; background: linear-gradient(135deg, hsl(140 37% 28%), hsl(140 25% 39%)); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.page-header-title { font-size: 15px; font-weight: 800; color: hsl(140 37% 28%); margin: 0; }
.page-header-sub { font-size: 9px; color: hsl(140 25% 39%); margin: 0; font-weight: 500; }
.page-header-right { margin-left: auto; text-align: right; }
.page-header-right p:first-child { font-size: 12px; font-weight: 700; color: hsl(20 14.3% 8%); margin: 0; }
.page-header-right p:last-child { font-size: 9px; color: hsl(20 14.3% 28%); margin: 0; }
.page-header-meta { display: flex; gap: 18px; font-size: 10px; color: hsl(20 14.3% 18%); margin-top: 6px; padding-top: 5px; }
.page-header-meta strong { font-weight: 600; }
h1 { display: none; }
h2 { font-size: 13px; font-weight: 700; color: hsl(140 37% 28%); margin: 20px 0 8px; border-bottom: 1.5px solid hsl(140 37% 28% / 0.3); padding-bottom: 4px; }
h3 { font-size: 13px; font-weight: 600; color: hsl(140 25% 39%); margin: 16px 0 6px; }
h4 { font-size: 12px; font-weight: 600; color: hsl(20 14.3% 12%); margin: 12px 0 5px; }
p, li { font-size: 12px; }
p { margin: 6px 0; }
ul, ol { padding-left: 22px; margin: 6px 0; }
li { margin: 4px 0; }
strong { font-weight: 600; }
blockquote { border-left: 3px solid hsl(140 37% 28%); margin: 10px 0; padding: 10px 16px; background: hsl(140 25% 96%); font-style: italic; border-radius: 4px; }
table { border-collapse: collapse; width: 100%; margin: 12px 0; }
th { background: hsl(140 37% 28%); color: white; padding: 7px 10px; text-align: left; font-size: 11px; font-weight: 600; }
td { border: 1px solid hsl(140 10% 82%); padding: 6px 10px; font-size: 11px; }
tr:nth-child(even) td { background: hsl(140 10% 97%); }
hr { border: none; border-top: 1px solid hsl(140 10% 82%); margin: 12px 0; }
@media print { .no-print { display: none !important; } }
`;

export function ArchivedPlanPreview({ open, onOpenChange, filePath, fileName, teacherName }: ArchivedPlanPreviewProps) {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!open || !filePath) return;
    setLoading(true);
    setHtmlContent(null);

    (async () => {
      try {
        const { data, error } = await supabase.storage
          .from('teacher-files')
          .download(filePath);
        if (error) throw error;
        const text = await data.text();
        // Extract body content from the full HTML
        const bodyMatch = text.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const content = bodyMatch ? bodyMatch[1] : text;
        setHtmlContent(DOMPurify.sanitize(content));
      } catch {
        toast.error('Erro ao carregar ficheiro.');
        onOpenChange(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, filePath]);

  const handlePrint = () => {
    if (!htmlContent) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Permita pop-ups para imprimir.');
      return;
    }
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${fileName}</title><style>${A4_STYLES}</style></head><body>${htmlContent}</body></html>`);
    printWindow.document.close();
    printWindow.onafterprint = () => printWindow.close();
    setTimeout(() => printWindow.print(), 350);
  };

  const handleDownloadPdf = async () => {
    if (!htmlContent) return;
    setIsDownloading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const wrapper = document.createElement('div');
      const styleEl = document.createElement('style');
      styleEl.textContent = A4_STYLES;
      wrapper.appendChild(styleEl);
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = htmlContent;
      wrapper.appendChild(contentDiv);
      document.body.appendChild(wrapper);

      const dateOnly = new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const pdfName = fileName.replace(/\.html$/i, '.pdf');

      const marginTop = 20;
      const marginBottom = 18;
      const marginLeft = 14;
      const marginRight = 14;

      await (html2pdf().set({
        margin: [marginTop, marginRight, marginBottom, marginLeft],
        filename: pdfName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      }).from(wrapper).toPdf() as any).get('pdf').then((pdf: any) => {
        const totalPages = pdf.internal.getNumberOfPages();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setDrawColor(180, 200, 180);
          pdf.setLineWidth(0.3);
          pdf.line(marginLeft, pageHeight - 12, pageWidth - marginRight, pageHeight - 12);
          pdf.setFontSize(7);
          pdf.setTextColor(120, 120, 120);
          pdf.text('SiGER - Sistema de Gestão Escolar Reviva', marginLeft, pageHeight - 8);
          const dateWidth = pdf.getStringUnitWidth(dateOnly) * 7 / pdf.internal.scaleFactor;
          pdf.text(dateOnly, (pageWidth - dateWidth) / 2, pageHeight - 8);
          const pageText = `Página ${i} de ${totalPages}`;
          const pageTextWidth = pdf.getStringUnitWidth(pageText) * 7 / pdf.internal.scaleFactor;
          pdf.text(pageText, pageWidth - marginRight - pageTextWidth, pageHeight - 8);
        }
      }).save();

      document.body.removeChild(wrapper);
      toast.success('PDF descarregado!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Não foi possível gerar o PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-border">
          <DialogTitle className="text-sm font-medium truncate flex-1">
            {fileName}
            {teacherName && <span className="text-muted-foreground font-normal ml-2">— {teacherName}</span>}
          </DialogTitle>
          <div className="flex items-center gap-1 ml-2">
            <Button variant="ghost" size="icon" onClick={handlePrint} title="Imprimir" className="h-8 w-8" disabled={!htmlContent}>
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDownloadPdf} title="Descarregar PDF" className="h-8 w-8" disabled={!htmlContent || isDownloading}>
              <FileDown className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : htmlContent ? (
          <div className="px-8 py-8 lesson-plan-screen-preview">
              <style dangerouslySetInnerHTML={{ __html: `
                .lesson-plan-screen-preview {
                  font-family: 'Inter', 'Work Sans', sans-serif;
                  font-size: 14px;
                  line-height: 1.75;
                  color: hsl(20 14.3% 8%);
                }
                .lesson-plan-screen-preview h1 { display: none; }
                .lesson-plan-screen-preview h2 {
                  font-size: 17px; font-weight: 700; color: hsl(140 37% 28%);
                  margin: 24px 0 10px; padding-bottom: 6px;
                  border-bottom: 1.5px solid hsl(140 37% 28% / 0.25);
                }
                .lesson-plan-screen-preview h3 { font-size: 15px; font-weight: 600; color: hsl(140 25% 35%); margin: 20px 0 8px; }
                .lesson-plan-screen-preview h4 { font-size: 14px; font-weight: 600; color: hsl(20 14.3% 12%); margin: 16px 0 6px; }
                .lesson-plan-screen-preview p { margin: 8px 0; }
                .lesson-plan-screen-preview ul, .lesson-plan-screen-preview ol { padding-left: 24px; margin: 8px 0; }
                .lesson-plan-screen-preview li { margin: 5px 0; }
                .lesson-plan-screen-preview strong { font-weight: 600; }
                .lesson-plan-screen-preview blockquote { border-left: 3px solid hsl(140 37% 28%); margin: 12px 0; padding: 12px 18px; background: hsl(140 25% 96%); font-style: italic; border-radius: 6px; }
                .lesson-plan-screen-preview table { border-collapse: collapse; width: 100%; margin: 14px 0; }
                .lesson-plan-screen-preview th { background: hsl(140 37% 28%); color: white; padding: 8px 12px; text-align: left; font-size: 13px; font-weight: 600; }
                .lesson-plan-screen-preview td { border: 1px solid hsl(140 10% 82%); padding: 7px 12px; font-size: 13px; }
                .lesson-plan-screen-preview tr:nth-child(even) td { background: hsl(140 10% 97%); }
                .lesson-plan-screen-preview hr { border: none; border-top: 1px solid hsl(140 10% 82%); margin: 16px 0; }
              `}} />
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
