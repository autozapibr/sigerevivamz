import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, Building2, Smartphone, Mail, MessageSquare, 
  Upload, CheckCircle2, Copy, Phone, Send, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentProofDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName?: string;
  month?: string;
  amount?: number;
}

const PAYMENT_CHANNELS = [
  {
    method: 'Conta Bancária',
    icon: Building2,
    details: [
      { label: 'Banco', value: 'BCI - Banco Comercial e de Investimentos' },
      { label: 'Titular', value: 'Escola Reviva, Lda' },
      { label: 'Conta Nº', value: '1234567890' },
      { label: 'NIB', value: '0008 0000 1234 5678 9012 3' },
    ]
  },
  {
    method: 'M-Pesa',
    icon: Smartphone,
    details: [
      { label: 'Número', value: '+258 84 123 4567' },
      { label: 'Nome', value: 'Escola Reviva' },
      { label: 'Referência', value: 'Propina + Nome do Educando' },
    ]
  },
  {
    method: 'e-Mola',
    icon: Smartphone,
    details: [
      { label: 'Número', value: '+258 86 123 4567' },
      { label: 'Nome', value: 'Escola Reviva' },
      { label: 'Referência', value: 'Propina + Nome do Educando' },
    ]
  },
];

const CONTACT_CHANNELS = [
  { 
    label: 'E-mail do Financeiro', 
    value: 'financeiro@escolareviva.com', 
    icon: Mail,
    action: () => window.open('mailto:financeiro@escolareviva.com?subject=Comprovativo de Pagamento de Propina', '_blank')
  },
  { 
    label: 'WhatsApp do Financeiro', 
    value: '+258 84 000 0000 (a configurar)', 
    icon: MessageSquare,
    action: () => toast.info('WhatsApp do financeiro será configurado em breve')
  },
];

export function PaymentProofDialog({ open, onOpenChange, studentName, month, amount }: PaymentProofDialogProps) {
  const [step, setStep] = useState<'info' | 'send'>('info');
  const [notes, setNotes] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  };

  const handleClose = () => {
    setStep('info');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            {step === 'info' ? 'Meios de Pagamento' : 'Enviar Comprovativo'}
          </DialogTitle>
          <DialogDescription>
            {step === 'info' 
              ? 'Escolha um dos meios de pagamento abaixo e envie o comprovativo à equipa financeira.'
              : 'Envie o comprovativo do pagamento para a equipa financeira da escola.'
            }
          </DialogDescription>
        </DialogHeader>

        {studentName && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
            <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium">{studentName}</span>
              {month && <span className="text-muted-foreground"> — {month}</span>}
              {amount && <span className="text-muted-foreground"> — {amount.toLocaleString('pt-MZ')} MZN</span>}
            </div>
          </div>
        )}

        {step === 'info' ? (
          <div className="space-y-4">
            {PAYMENT_CHANNELS.map((channel, idx) => (
              <Card key={idx} className="border">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <channel.icon className="h-4 w-4 text-primary" />
                    </div>
                    <h4 className="font-medium text-sm">{channel.method}</h4>
                  </div>
                  <div className="space-y-2">
                    {channel.details.map((detail, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{detail.label}:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{detail.value}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(detail.value)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="pt-2">
              <Button className="w-full gap-2" onClick={() => setStep('send')}>
                <Send className="h-4 w-4" />
                Já fiz o pagamento — Enviar Comprovativo
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea 
                placeholder="Ex: Pagamento referente à propina de Março do educando João..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Enviar comprovativo via:</Label>
              {CONTACT_CHANNELS.map((channel, idx) => (
                <Button 
                  key={idx}
                  variant="outline" 
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={channel.action}
                >
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <channel.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{channel.label}</p>
                    <p className="text-xs text-muted-foreground">{channel.value}</p>
                  </div>
                </Button>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-muted/50 border text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">📌 Dica:</p>
              <p>Após enviar o comprovativo, a equipa financeira irá validar o pagamento e actualizar o estado da propina. Receberá uma notificação quando o pagamento for confirmado.</p>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('info')}>
                Voltar
              </Button>
              <Button onClick={handleClose}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Concluído
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
