import React, { useRef, useState } from 'react';
import { 
  Printer, Mail, MessageCircle, Download, 
  PenTool, FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { StaffContractData, generateContractHTML, CONTRACT_TEMPLATES } from './ContractTemplates';
import { SignatureDialog } from './SignatureDialog';
import { sanitizeHtml, sanitizeForReact } from '@/lib/sanitize';

interface ContractPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffData: StaffContractData | null;
  templateId: string;
  customClauses?: string[];
}

export function ContractPreviewDialog({
  open,
  onOpenChange,
  staffData,
  templateId,
  customClauses = [],
}: ContractPreviewDialogProps) {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const template = CONTRACT_TEMPLATES.find(t => t.id === templateId);

  if (!staffData || !template) return null;

  // Sanitize HTML to prevent XSS attacks
  const contractHTML = sanitizeHtml(generateContractHTML(templateId, staffData, customClauses));

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'Erro',
        description: 'Não foi possível abrir a janela de impressão. Verifique se os pop-ups estão permitidos.',
        variant: 'destructive',
      });
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contrato - ${staffData.name}</title>
          <style>
            @page { margin: 2cm; }
            body { 
              font-family: 'Times New Roman', Times, serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #000;
              max-width: 21cm;
              margin: 0 auto;
              padding: 20px;
            }
            h1 { font-size: 20pt; }
            h2 { font-size: 14pt; }
            h3 { font-size: 12pt; margin-top: 20px; }
            p { text-align: justify; margin: 10px 0; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${contractHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleDownloadPDF = async () => {
    handlePrint();
    toast({
      title: 'Dica',
      description: 'Na janela de impressão, selecione "Guardar como PDF" como destino.',
    });
  };

  const handleSendWhatsApp = () => {
    if (!staffData.phone) {
      toast({
        title: 'Erro',
        description: 'O colaborador não tem número de telefone registado.',
        variant: 'destructive',
      });
      return;
    }

    const phone = staffData.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá ${staffData.name},\n\n` +
      `Segue o seu contrato da Escola Reviva.\n` +
      `Tipo: ${template.name}\n` +
      `Nº: ${staffData.contract_number || 'A definir'}\n\n` +
      `Por favor, compareça à secretaria para assinatura do documento.\n\n` +
      `Atenciosamente,\nEscola Reviva`
    );

    window.open(`https://wa.me/258${phone}?text=${message}`, '_blank');
    
    toast({
      title: 'WhatsApp',
      description: 'A abrir WhatsApp para envio da mensagem.',
    });
  };

  const handleSendEmail = () => {
    if (!staffData.email) {
      toast({
        title: 'Erro',
        description: 'O colaborador não tem e-mail registado.',
        variant: 'destructive',
      });
      return;
    }

    const subject = encodeURIComponent(`Contrato de Trabalho - Escola Reviva`);
    const body = encodeURIComponent(
      `Prezado(a) ${staffData.name},\n\n` +
      `Segue em anexo o seu contrato da Escola Reviva.\n\n` +
      `Tipo de Contrato: ${template.name}\n` +
      `Número do Contrato: ${staffData.contract_number || 'A definir'}\n` +
      `Função: ${staffData.role}\n\n` +
      `Por favor, compareça à secretaria para assinatura do documento original.\n\n` +
      `Atenciosamente,\n` +
      `Escola Reviva\n` +
      `Recursos Humanos`
    );

    window.open(`mailto:${staffData.email}?subject=${subject}&body=${body}`, '_blank');
    
    toast({
      title: 'E-mail',
      description: 'A abrir o cliente de e-mail.',
    });
  };

  const handleSignatureComplete = () => {
    toast({
      title: 'Contrato assinado',
      description: 'O contrato foi assinado digitalmente com sucesso.',
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {template.name} - {staffData.name}
            </DialogTitle>
          </DialogHeader>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 py-3 border-b">
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={handleDownloadPDF} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Guardar PDF
            </Button>
            <Button 
              onClick={() => setShowSignatureDialog(true)} 
              variant="default" 
              size="sm"
            >
              <PenTool className="w-4 h-4 mr-2" />
              Assinar Digital
            </Button>
            <div className="h-6 w-px bg-border mx-1" />
            <Button onClick={handleSendWhatsApp} variant="outline" size="sm" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button onClick={handleSendEmail} variant="outline" size="sm" className="text-primary">
              <Mail className="w-4 h-4 mr-2" />
              E-mail
            </Button>
          </div>

          {/* Contract Preview */}
          <div className="flex-1 overflow-y-auto bg-background rounded-lg border shadow-inner">
            <div 
              ref={printRef}
              className="p-8 min-h-full bg-white text-foreground dark:bg-white dark:text-black"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
              dangerouslySetInnerHTML={sanitizeForReact(contractHTML)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Signature Dialog */}
      <SignatureDialog
        open={showSignatureDialog}
        onOpenChange={setShowSignatureDialog}
        staffData={staffData}
        templateId={templateId}
        contractHTML={contractHTML}
        onSignatureComplete={handleSignatureComplete}
      />
    </>
  );
}
