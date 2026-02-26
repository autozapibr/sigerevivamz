import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Printer, FileText } from 'lucide-react';
import DOMPurify from 'dompurify';

interface LessonPlanPreviewProps {
  content: string;
  onSave: () => void;
  isSaving: boolean;
}

export function LessonPlanPreview({ content, onSave, isSaving }: LessonPlanPreviewProps) {
  const sanitizedContent = DOMPurify.sanitize(content);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html><head><title>Plano de Aula AEP</title>
        <style>body { font-family: 'Inter', sans-serif; padding: 20px; }</style>
        </head><body>${sanitizedContent}</body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Plano de Aula Gerado
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-1 h-4 w-4" /> Imprimir
          </Button>
          <Button size="sm" onClick={onSave} disabled={isSaving}>
            <Save className="mr-1 h-4 w-4" /> Guardar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="prose prose-sm max-w-none dark:prose-invert border rounded-lg p-6 bg-card"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </CardContent>
    </Card>
  );
}
