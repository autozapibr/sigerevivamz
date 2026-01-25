import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Percent,
  Calendar,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Banknote,
} from 'lucide-react';
import { formatMZN } from '@/lib/validators/mozambique';
import { format, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useCreateAgreement } from '@/hooks/useCollections';
import type { TuitionFee } from '@/hooks/useFinancial';

interface NegotiationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fee: TuitionFee | null;
}

export function NegotiationDialog({ open, onOpenChange, fee }: NegotiationDialogProps) {
  const [negotiationType, setNegotiationType] = useState<'promise' | 'installment' | 'discount'>('promise');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [installments, setInstallments] = useState(2);
  const [promisedDate, setPromisedDate] = useState('');
  const [notes, setNotes] = useState('');

  const createAgreement = useCreateAgreement();

  // Reset form when fee changes
  useEffect(() => {
    if (fee) {
      setDiscountPercent(0);
      setInstallments(2);
      setPromisedDate(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
      setNotes('');
    }
  }, [fee]);

  if (!fee) return null;

  const originalAmount = fee.amount || 0;
  const discountAmount = (originalAmount * discountPercent) / 100;
  const finalAmount = originalAmount - discountAmount;
  const installmentAmount = finalAmount / installments;

  const handleSubmit = () => {
    if (!fee) return;

    createAgreement.mutate(
      {
        tuitionFeeId: fee.id,
        studentId: fee.student_id,
        originalAmount,
        discountPercent: negotiationType === 'discount' ? discountPercent : 0,
        installments: negotiationType === 'installment' ? installments : 1,
        promisedDate,
        notes,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const suggestedDiscounts = [5, 10, 15, 20];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary" />
            Negociar Pagamento
          </DialogTitle>
          <DialogDescription>
            Crie um acordo de pagamento para {fee.student?.name}
          </DialogDescription>
        </DialogHeader>

        {/* Current Debt Summary */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dívida Original</p>
                <p className="text-xl font-bold text-destructive">
                  {formatMZN(originalAmount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Referência</p>
                <p className="text-sm font-medium">
                  {fee.month}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={negotiationType} onValueChange={(v) => setNegotiationType(v as typeof negotiationType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="promise" className="gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Promessa</span>
            </TabsTrigger>
            <TabsTrigger value="installment" className="gap-1">
              <Banknote className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Parcelar</span>
            </TabsTrigger>
            <TabsTrigger value="discount" className="gap-1">
              <Percent className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Desconto</span>
            </TabsTrigger>
          </TabsList>

          {/* Promise Tab */}
          <TabsContent value="promise" className="space-y-4 mt-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Registar Promessa de Pagamento</p>
                <p className="text-sm text-muted-foreground">
                  O encarregado promete pagar na data indicada
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data Prometida</Label>
              <Input
                type="date"
                value={promisedDate}
                onChange={(e) => setPromisedDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </TabsContent>

          {/* Installment Tab */}
          <TabsContent value="installment" className="space-y-4 mt-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-secondary/50">
              <Banknote className="h-5 w-5 text-secondary-foreground mt-0.5" />
              <div>
                <p className="font-medium">Parcelamento da Dívida</p>
                <p className="text-sm text-muted-foreground">
                  Dividir o valor em prestações mensais
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Número de Parcelas: {installments}x</Label>
                <Slider
                  value={[installments]}
                  onValueChange={([v]) => setInstallments(v)}
                  min={2}
                  max={6}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>2x</span>
                  <span>6x</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Primeira Parcela</Label>
                <Input
                  type="date"
                  value={promisedDate}
                  onChange={(e) => setPromisedDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              {/* Installment Preview */}
              <Card className="bg-success/5 border-success/20">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Valor por Parcela</span>
                    <span className="text-lg font-bold text-success">
                      {formatMZN(installmentAmount)}
                    </span>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Array.from({ length: installments }).map((_, i) => (
                      <div key={i} className="flex justify-between p-2 rounded bg-background">
                        <span>{i + 1}ª Parcela</span>
                        <span className="text-muted-foreground">
                          {format(addDays(new Date(promisedDate || new Date()), i * 30), 'dd/MM/yy')}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Discount Tab */}
          <TabsContent value="discount" className="space-y-4 mt-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/30">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium">Desconto para Regularização</p>
                <p className="text-sm text-muted-foreground">
                  Oferecer desconto para pagamento imediato
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Quick discount buttons */}
              <div className="grid grid-cols-4 gap-2">
                {suggestedDiscounts.map((d) => (
                  <Button
                    key={d}
                    type="button"
                    variant={discountPercent === d ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDiscountPercent(d)}
                    className={cn(
                      discountPercent === d && 'ring-2 ring-primary'
                    )}
                  >
                    {d}%
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Desconto Personalizado: {discountPercent}%</Label>
                <Slider
                  value={[discountPercent]}
                  onValueChange={([v]) => setDiscountPercent(v)}
                  min={0}
                  max={30}
                  step={1}
                  className="py-4"
                />
              </div>

              <div className="space-y-2">
                <Label>Data Limite para Pagamento</Label>
                <Input
                  type="date"
                  value={promisedDate}
                  onChange={(e) => setPromisedDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              {/* Discount Preview */}
              <Card className={cn(
                "border-2 transition-colors",
                discountPercent > 0 ? "border-success/50 bg-success/5" : "border-muted"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground line-through">
                        {formatMZN(originalAmount)}
                      </p>
                      <p className="text-2xl font-bold text-success">
                        {formatMZN(finalAmount)}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div className="text-right">
                      <Badge className="bg-success">
                        -{discountPercent}%
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Economia: {formatMZN(discountAmount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Notes */}
        <div className="space-y-2">
          <Label>Observações (opcional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detalhes da negociação, contacto realizado, etc."
            rows={2}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createAgreement.isPending || !promisedDate}
            className="gap-2"
          >
            {createAgreement.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                A criar...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Criar Acordo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
