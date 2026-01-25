import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Printer, Download, Share2, CheckCircle2 } from 'lucide-react';
import { formatMZN } from '@/lib/validators/mozambique';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

interface ReceiptData {
  id: string;
  receiptNumber: string;
  studentName: string;
  studentId?: string;
  guardianName?: string;
  description: string;
  month: string;
  amount: number;
  paymentMethod: string;
  paidAt: string;
  schoolName?: string;
  schoolAddress?: string;
  schoolPhone?: string;
  schoolNuit?: string;
}

interface ReceiptGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: ReceiptData | null;
}

const SCHOOL_INFO = {
  name: 'Escola REVIVA',
  address: 'Av. Eduardo Mondlane, Maputo, Moçambique',
  phone: '+258 84 123 4567',
  nuit: '400000001',
  email: 'info@escolareviva.co.mz',
};

export function ReceiptGenerator({ open, onOpenChange, receipt }: ReceiptGeneratorProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!receipt) return null;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo ${receipt.receiptNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 40px; 
              max-width: 800px; 
              margin: 0 auto;
              color: #1a1a1a;
            }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
            .header p { font-size: 12px; color: #666; }
            .receipt-title { 
              text-align: center; 
              margin: 30px 0; 
              padding: 15px;
              background: #f5f5f5;
              border-radius: 8px;
            }
            .receipt-title h2 { font-size: 18px; font-weight: 600; }
            .receipt-title p { font-size: 14px; color: #666; margin-top: 5px; }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 20px; 
              margin: 30px 0;
            }
            .info-block { }
            .info-block label { 
              display: block; 
              font-size: 11px; 
              color: #666; 
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .info-block p { font-size: 14px; font-weight: 500; }
            .amount-block {
              text-align: center;
              padding: 30px;
              background: linear-gradient(135deg, #2D5F3F 0%, #4A7C59 100%);
              border-radius: 12px;
              color: white;
              margin: 30px 0;
            }
            .amount-block label { 
              display: block; 
              font-size: 12px; 
              opacity: 0.9;
              margin-bottom: 8px;
            }
            .amount-block .value { 
              font-size: 32px; 
              font-weight: 700; 
            }
            .footer { 
              margin-top: 40px; 
              padding-top: 20px;
              border-top: 2px dashed #ddd;
              text-align: center;
            }
            .footer p { font-size: 11px; color: #666; margin-bottom: 5px; }
            .signature-area {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
              padding-top: 30px;
            }
            .signature-line {
              width: 200px;
              text-align: center;
            }
            .signature-line hr { 
              border: none; 
              border-top: 1px solid #333; 
              margin-bottom: 8px;
            }
            .signature-line p { font-size: 11px; color: #666; }
            .badge { 
              display: inline-block;
              padding: 4px 12px;
              background: #e8f5e9;
              color: #2e7d32;
              border-radius: 16px;
              font-size: 12px;
              font-weight: 500;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const paymentMethodLabel = {
    'DINHEIRO': 'Dinheiro',
    'M-PESA': 'M-Pesa',
    'TRANSFERENCIA': 'Transferência Bancária',
    'CHEQUE': 'Cheque',
  }[receipt.paymentMethod] || receipt.paymentMethod;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Recibo de Pagamento
          </DialogTitle>
          <DialogDescription>
            Visualize ou imprima o comprovativo de pagamento
          </DialogDescription>
        </DialogHeader>

        {/* Receipt Preview */}
        <div 
          ref={printRef}
          className="bg-white border rounded-lg p-6 space-y-6"
        >
          {/* Header */}
          <div className="header text-center">
            <h1 className="text-xl font-bold text-foreground">{SCHOOL_INFO.name}</h1>
            <p className="text-xs text-muted-foreground">{SCHOOL_INFO.address}</p>
            <p className="text-xs text-muted-foreground">Tel: {SCHOOL_INFO.phone} | Email: {SCHOOL_INFO.email}</p>
            <p className="text-xs text-muted-foreground">NUIT: {SCHOOL_INFO.nuit}</p>
          </div>

          <Separator />

          {/* Receipt Title */}
          <div className="receipt-title text-center p-4 bg-muted/50 rounded-lg">
            <h2 className="text-lg font-semibold">RECIBO DE PAGAMENTO</h2>
            <p className="text-sm text-muted-foreground">Nº {receipt.receiptNumber}</p>
          </div>

          {/* Info Grid */}
          <div className="info-grid grid grid-cols-2 gap-6">
            <div className="info-block">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Data de Pagamento</label>
              <p className="font-medium">{format(parseISO(receipt.paidAt), "d 'de' MMMM 'de' yyyy", { locale: pt })}</p>
            </div>
            <div className="info-block">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Método de Pagamento</label>
              <p className="font-medium">{paymentMethodLabel}</p>
            </div>
            <div className="info-block col-span-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Nome do Educando</label>
              <p className="font-medium">{receipt.studentName}</p>
            </div>
            {receipt.guardianName && (
              <div className="info-block col-span-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Encarregado de Educação</label>
                <p className="font-medium">{receipt.guardianName}</p>
              </div>
            )}
            <div className="info-block col-span-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Referência</label>
              <p className="font-medium">{receipt.description}</p>
            </div>
          </div>

          {/* Amount Block */}
          <div className="amount-block text-center p-6 bg-primary rounded-xl text-primary-foreground">
            <label className="text-sm opacity-90">VALOR PAGO</label>
            <p className="value text-3xl font-bold mt-1">{formatMZN(receipt.amount)}</p>
          </div>

          {/* Badge */}
          <div className="flex justify-center">
            <Badge className="bg-success/10 text-success border-success/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Pagamento Confirmado
            </Badge>
          </div>

          {/* Signature Area */}
          <div className="signature-area flex justify-between pt-8 mt-8 border-t-2 border-dashed">
            <div className="signature-line text-center">
              <hr className="border-t border-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Assinatura do Funcionário</p>
            </div>
            <div className="signature-line text-center">
              <hr className="border-t border-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Carimbo da Escola</p>
            </div>
          </div>

          {/* Footer */}
          <div className="footer text-center pt-4 border-t border-dashed">
            <p className="text-xs text-muted-foreground">
              Este documento serve como comprovativo de pagamento.
            </p>
            <p className="text-xs text-muted-foreground">
              Gerado electronicamente em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end mt-4 no-print">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Partilhar
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
