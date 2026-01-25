import React, { useState, useMemo } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Send,
  MessageSquare,
  Loader2,
  CheckCircle2,
  Smartphone,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { formatMZN } from '@/lib/validators/mozambique';
import { format, parseISO, isValid } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useBulkSendNotifications } from '@/hooks/useCollections';
import { formatMonthSafe, getDaysOverdue } from './DebtorCard';
import type { TuitionFee } from '@/hooks/useFinancial';
import { cn } from '@/lib/utils';

interface SmartReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fees: TuitionFee[];
}

const MESSAGE_TEMPLATES = {
  gentle: {
    name: 'Lembrete Gentil',
    description: 'Para atrasos recentes (≤7 dias)',
    icon: '💬',
    template: `Prezado(a) Encarregado(a),

Esperamos que esteja bem. Este é um lembrete amigável sobre a propina de {MES} do(a) educando(a) {NOME}.

📌 Valor: {VALOR}
📅 Vencimento: {VENCIMENTO}

Caso já tenha efectuado o pagamento, por favor desconsidere esta mensagem.

Atenciosamente,
Secretaria Escolar 🏫`,
  },
  urgent: {
    name: 'Lembrete Urgente',
    description: 'Para atrasos moderados (8-30 dias)',
    icon: '⚠️',
    template: `Prezado(a) Encarregado(a),

Verificámos que a propina de {MES} do(a) educando(a) {NOME} encontra-se em atraso há {DIAS} dias.

📌 Valor: {VALOR}
📅 Vencimento: {VENCIMENTO}

Solicitamos a regularização urgente para evitar penalizações.

Para negociar, entre em contacto connosco.

Atenciosamente,
Secretaria Escolar`,
  },
  final: {
    name: 'Aviso Final',
    description: 'Para atrasos graves (>30 dias)',
    icon: '🚨',
    template: `AVISO IMPORTANTE

Prezado(a) Encarregado(a),

A propina de {MES} do(a) {NOME} está pendente há {DIAS} dias.

💰 Valor: {VALOR}

Esta é a última comunicação antes de medidas administrativas.

Regularize imediatamente ou contacte-nos para negociar.

Secretaria Escolar`,
  },
};

type TemplateKey = keyof typeof MESSAGE_TEMPLATES;

export function SmartReminderDialog({ open, onOpenChange, fees }: SmartReminderDialogProps) {
  const [selectedFees, setSelectedFees] = useState<Set<number>>(new Set());
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [templateKey, setTemplateKey] = useState<TemplateKey>('gentle');
  const [customMessage, setCustomMessage] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const { toast } = useToast();

  const bulkSend = useBulkSendNotifications();

  const { feesWithPhone, feesWithoutPhone } = useMemo(() => {
    const withPhone = fees.filter(f => f.student?.phone?.replace(/\D/g, '').length >= 9);
    const withoutPhone = fees.filter(f => !f.student?.phone?.replace(/\D/g, '') || f.student?.phone?.replace(/\D/g, '').length < 9);
    return { feesWithPhone: withPhone, feesWithoutPhone: withoutPhone };
  }, [fees]);

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
    if (selectedFees.size === feesWithPhone.length) {
      setSelectedFees(new Set());
    } else {
      setSelectedFees(new Set(feesWithPhone.map(f => f.id)));
    }
  };

  const getMessage = () => {
    if (useCustom) return customMessage;
    return MESSAGE_TEMPLATES[templateKey].template;
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

    const selectedFeesList = feesWithPhone.filter(f => selectedFees.has(f.id));
    const notifications = selectedFeesList.map(fee => {
      const daysOverdue = getDaysOverdue(fee.due_date);
      let monthFormatted = '-';
      try {
        if (fee.month && /^\d{4}-\d{2}$/.test(fee.month)) {
          const date = parseISO(`${fee.month}-01`);
          if (isValid(date)) {
            monthFormatted = format(date, 'MMMM yyyy', { locale: pt });
          }
        } else {
          monthFormatted = fee.month || '-';
        }
      } catch {
        monthFormatted = fee.month || '-';
      }

      const personalizedMessage = getMessage()
        .replace('{NOME}', fee.student?.name || '')
        .replace('{MES}', monthFormatted)
        .replace('{VALOR}', formatMZN(fee.amount || 0))
        .replace('{DIAS}', daysOverdue.toString())
        .replace('{VENCIMENTO}', fee.due_date ? format(parseISO(fee.due_date), 'dd/MM/yyyy') : '-');

      return {
        type: channel,
        phone: fee.student?.phone || '',
        message: personalizedMessage,
        studentId: fee.student_id,
        tuitionFeeId: fee.id,
        recipientName: fee.student?.guardian || fee.student?.name || 'Encarregado',
      };
    });

    bulkSend.mutate(notifications, {
      onSuccess: () => {
        onOpenChange(false);
        setSelectedFees(new Set());
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Envio Inteligente de Lembretes
          </DialogTitle>
          <DialogDescription>
            Seleccione os destinatários e personalize a mensagem
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="recipients" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recipients" className="gap-2">
              <Users className="h-4 w-4" />
              Destinatários
            </TabsTrigger>
            <TabsTrigger value="message" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Mensagem
            </TabsTrigger>
          </TabsList>

          {/* Recipients Tab */}
          <TabsContent value="recipients" className="flex-1 overflow-hidden flex flex-col mt-4 space-y-4">
            {/* Channel Selection */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant={channel === 'whatsapp' ? 'default' : 'outline'}
                className={cn("flex-1 gap-2", channel === 'whatsapp' && "bg-green-600 hover:bg-green-700")}
                onClick={() => setChannel('whatsapp')}
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button
                type="button"
                variant={channel === 'sms' ? 'default' : 'outline'}
                className={cn("flex-1 gap-2", channel === 'sms' && "bg-blue-600 hover:bg-blue-700")}
                onClick={() => setChannel('sms')}
              >
                <Smartphone className="h-4 w-4" />
                SMS
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <Card className="bg-muted/50">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold">{fees.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </CardContent>
              </Card>
              <Card className="bg-success/10 border-success/30">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-success">{feesWithPhone.length}</p>
                  <p className="text-xs text-muted-foreground">Com Telefone</p>
                </CardContent>
              </Card>
              <Card className="bg-warning/10 border-warning/30">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-warning">{feesWithoutPhone.length}</p>
                  <p className="text-xs text-muted-foreground">Sem Telefone</p>
                </CardContent>
              </Card>
            </div>

            {/* Select all & counter */}
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectedFees.size === feesWithPhone.length && feesWithPhone.length > 0}
                  onCheckedChange={selectAll}
                  disabled={feesWithPhone.length === 0}
                />
                <Label htmlFor="select-all" className="text-sm font-medium">
                  Seleccionar todos
                </Label>
              </div>
              <Badge variant="outline">
                {selectedFees.size} de {feesWithPhone.length} seleccionados
              </Badge>
            </div>

            {/* Fee list */}
            <ScrollArea className="flex-1 border rounded-lg">
              <div className="p-2 space-y-1">
                {feesWithPhone.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-8 w-8 mx-auto text-warning mb-2" />
                    <p className="text-muted-foreground">
                      Nenhum educando com telefone válido
                    </p>
                  </div>
                ) : (
                  feesWithPhone.map(fee => (
                    <div
                      key={fee.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors",
                        selectedFees.has(fee.id) && "bg-primary/10"
                      )}
                      onClick={() => toggleFee(fee.id)}
                    >
                      <Checkbox
                        checked={selectedFees.has(fee.id)}
                        onCheckedChange={() => toggleFee(fee.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fee.student?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatMonthSafe(fee.month, 'MMM/yy')} • {fee.student?.phone}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {getDaysOverdue(fee.due_date)}d
                      </Badge>
                      <p className="text-sm font-bold text-destructive shrink-0">
                        {formatMZN(fee.amount || 0)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Message Tab */}
          <TabsContent value="message" className="flex-1 overflow-hidden flex flex-col mt-4 space-y-4">
            {/* Template Selection */}
            <RadioGroup
              value={useCustom ? 'custom' : templateKey}
              onValueChange={(v) => {
                if (v === 'custom') {
                  setUseCustom(true);
                } else {
                  setUseCustom(false);
                  setTemplateKey(v as TemplateKey);
                }
              }}
              className="grid grid-cols-2 gap-2"
            >
              {Object.entries(MESSAGE_TEMPLATES).map(([key, template]) => (
                <Label
                  key={key}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors",
                    !useCustom && templateKey === key
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={key} className="mt-1" />
                  <div>
                    <p className="font-medium text-sm">
                      {template.icon} {template.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                </Label>
              ))}
              <Label
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors col-span-2",
                  useCustom
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                )}
              >
                <RadioGroupItem value="custom" className="mt-1" />
                <div>
                  <p className="font-medium text-sm">✏️ Mensagem Personalizada</p>
                  <p className="text-xs text-muted-foreground">
                    Escreva sua própria mensagem
                  </p>
                </div>
              </Label>
            </RadioGroup>

            {/* Message Preview/Editor */}
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-medium">
                {useCustom ? 'Sua Mensagem' : 'Pré-visualização'}
                <span className="text-xs text-muted-foreground ml-2">
                  Use {'{NOME}'}, {'{MES}'}, {'{VALOR}'}, {'{DIAS}'}, {'{VENCIMENTO}'}
                </span>
              </Label>
              <Textarea
                value={useCustom ? customMessage : MESSAGE_TEMPLATES[templateKey].template}
                onChange={(e) => useCustom && setCustomMessage(e.target.value)}
                readOnly={!useCustom}
                className={cn(
                  "resize-none text-sm min-h-[200px]",
                  !useCustom && "bg-muted/50"
                )}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={bulkSend.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={sendReminders}
            disabled={bulkSend.isPending || selectedFees.size === 0}
            className={cn(
              "gap-2",
              channel === 'whatsapp' && "bg-green-600 hover:bg-green-700",
              channel === 'sms' && "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {bulkSend.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                {channel === 'whatsapp' ? <MessageSquare className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                Enviar ({selectedFees.size})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
