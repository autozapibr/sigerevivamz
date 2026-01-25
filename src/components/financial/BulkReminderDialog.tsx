import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { formatMZN } from '@/lib/validators/mozambique';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import type { TuitionFee } from '@/hooks/useFinancial';

interface BulkReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fees: TuitionFee[];
}

const DEFAULT_MESSAGE = `Prezado(a) Encarregado(a),

Identificámos que a propina de {MES} do(a) educando(a) {NOME} encontra-se em atraso.

Valor: {VALOR}
Vencimento: {VENCIMENTO}

Por favor, regularize a situação o mais breve possível.

Atenciosamente,
Secretaria Escolar`;

export function BulkReminderDialog({ open, onOpenChange, fees }: BulkReminderDialogProps) {
  const [selectedFees, setSelectedFees] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [isSending, setIsSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const { toast } = useToast();

  const toggleFee = (feeId: number) => {
    const newSelected = new Set(selectedFees);
    if (newSelected.has(feeId)) {
      newSelected.delete(feeId);
    } else {
      newSelected.add(feeId);
    }
    setSelectedFees(newSelected);
  };

  const selectAll = () => {
    if (selectedFees.size === fees.length) {
      setSelectedFees(new Set());
    } else {
      setSelectedFees(new Set(fees.map(f => f.id)));
    }
  };

  const sendReminders = async () => {
    if (selectedFees.size === 0) {
      toast({
        title: 'Nenhum educando seleccionado',
        description: 'Seleccione pelo menos um educando para enviar lembretes.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    setSentCount(0);

    const selectedFeesList = fees.filter(f => selectedFees.has(f.id));
    
    for (const fee of selectedFeesList) {
      const phone = fee.student?.phone?.replace(/\D/g, '');
      if (!phone) continue;

      const personalizedMessage = message
        .replace('{NOME}', fee.student?.name || '')
        .replace('{MES}', format(parseISO(`${fee.month}-01`), 'MMMM yyyy', { locale: pt }))
        .replace('{VALOR}', formatMZN(fee.amount || 0))
        .replace('{VENCIMENTO}', fee.due_date ? format(parseISO(fee.due_date), 'dd/MM/yyyy') : '-');

      // Open WhatsApp in new tab for each
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(personalizedMessage)}`, '_blank');
      
      setSentCount(prev => prev + 1);
      // Small delay between opens to avoid browser blocking
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsSending(false);
    toast({
      title: 'Lembretes preparados',
      description: `${selectedFeesList.length} janelas do WhatsApp foram abertas. Confirme o envio em cada uma.`,
    });
    
    onOpenChange(false);
    setSelectedFees(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enviar Lembretes em Massa
          </DialogTitle>
          <DialogDescription>
            Seleccione os educandos e personalize a mensagem de lembrete
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-4">
          {/* Select all & counter */}
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectedFees.size === fees.length && fees.length > 0}
                onCheckedChange={selectAll}
              />
              <Label htmlFor="select-all" className="text-sm font-medium">
                Seleccionar todos
              </Label>
            </div>
            <Badge variant="outline">
              {selectedFees.size} de {fees.length} seleccionados
            </Badge>
          </div>

          {/* Fee list */}
          <ScrollArea className="h-[180px] border rounded-lg">
            <div className="p-2 space-y-1">
              {fees.map(fee => (
                <div
                  key={fee.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleFee(fee.id)}
                >
                  <Checkbox
                    checked={selectedFees.has(fee.id)}
                    onCheckedChange={() => toggleFee(fee.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{fee.student?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(`${fee.month}-01`), 'MMM/yy', { locale: pt })} • {fee.student?.phone || 'Sem telefone'}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-destructive shrink-0">
                    {formatMZN(fee.amount || 0)}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message template */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Mensagem (use {'{NOME}'}, {'{MES}'}, {'{VALOR}'}, {'{VENCIMENTO}'} como variáveis)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancelar
          </Button>
          <Button 
            onClick={sendReminders}
            disabled={isSending || selectedFees.size === 0}
            className="gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando ({sentCount}/{selectedFees.size})...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                Enviar via WhatsApp ({selectedFees.size})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
