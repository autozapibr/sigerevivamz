import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  Receipt
} from 'lucide-react';
import { formatMZN } from '@/lib/validators/mozambique';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { ReceiptGenerator } from './ReceiptGenerator';

interface StudentFinancialHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number;
  studentName: string;
}

interface TuitionFeeWithDetails {
  id: number;
  month: string;
  amount: number | null;
  due_date: string | null;
  status: 'Pago' | 'Pendente' | 'Atrasado' | null;
  paid_at?: string;
  payment_method?: string;
}

export function StudentFinancialHistory({ 
  open, 
  onOpenChange, 
  studentId, 
  studentName 
}: StudentFinancialHistoryProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const { data: fees = [], isLoading } = useQuery({
    queryKey: ['student-financial-history', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tuition_fees')
        .select('*')
        .eq('student_id', studentId)
        .order('month', { ascending: false });
      
      if (error) throw error;
      return data as TuitionFeeWithDetails[];
    },
    enabled: open && !!studentId,
  });

  // Calculate summary
  const summary = {
    totalPaid: fees.filter(f => f.status === 'Pago').reduce((sum, f) => sum + (f.amount || 0), 0),
    totalPending: fees.filter(f => f.status !== 'Pago').reduce((sum, f) => sum + (f.amount || 0), 0),
    paid: fees.filter(f => f.status === 'Pago').length,
    pending: fees.filter(f => f.status === 'Pendente').length,
    overdue: fees.filter(f => f.status === 'Atrasado').length,
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'Pago':
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Pago
          </Badge>
        );
      case 'Pendente':
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'Atrasado':
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Atrasado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || 'N/A'}</Badge>;
    }
  };

  const handleViewReceipt = (fee: TuitionFeeWithDetails) => {
    const receiptData = {
      id: fee.id.toString(),
      receiptNumber: `REC-${fee.month.replace('-', '')}-${fee.id.toString().padStart(4, '0')}`,
      studentName,
      description: `Propina - ${format(parseISO(`${fee.month}-01`), 'MMMM yyyy', { locale: pt })}`,
      month: fee.month,
      amount: fee.amount || 0,
      paymentMethod: fee.payment_method || 'DINHEIRO',
      paidAt: fee.paid_at || new Date().toISOString(),
    };
    setSelectedReceipt(receiptData);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Histórico Financeiro
            </DialogTitle>
            <DialogDescription>
              Extracto completo de {studentName}
            </DialogDescription>
          </DialogHeader>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-l-4 border-l-success">
              <CardContent className="pt-3 pb-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total Pago</p>
                  <p className="text-lg font-bold text-success">{formatMZN(summary.totalPaid)}</p>
                  <p className="text-xs text-muted-foreground">{summary.paid} propinas</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-warning">
              <CardContent className="pt-3 pb-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Em Dívida</p>
                  <p className="text-lg font-bold text-warning">{formatMZN(summary.totalPending)}</p>
                  <p className="text-xs text-muted-foreground">{summary.pending + summary.overdue} propinas</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-3 pb-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Taxa Pagamento</p>
                  <p className="text-lg font-bold text-primary">
                    {fees.length > 0 ? Math.round((summary.paid / fees.length) * 100) : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">{summary.paid}/{fees.length} propinas</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Timeline */}
          <ScrollArea className="h-[350px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : fees.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">Sem registos financeiros</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Nenhuma propina registada para este educando
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {fees.map((fee, index) => (
                  <div 
                    key={fee.id}
                    className={cn(
                      "relative pl-6 pb-4",
                      index < fees.length - 1 && "border-l-2 border-muted ml-2"
                    )}
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute left-0 top-0 w-4 h-4 rounded-full border-2 -translate-x-[9px]",
                      fee.status === 'Pago' 
                        ? "bg-success border-success" 
                        : fee.status === 'Atrasado'
                          ? "bg-destructive border-destructive"
                          : "bg-warning border-warning"
                    )} />

                    <div className="flex items-start justify-between gap-4 bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(parseISO(`${fee.month}-01`), 'MMMM yyyy', { locale: pt })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Vencimento: {fee.due_date 
                            ? format(parseISO(fee.due_date), 'dd/MM/yyyy')
                            : '-'
                          }
                        </p>
                        {fee.status === 'Pago' && fee.paid_at && (
                          <p className="text-xs text-success">
                            Pago em {format(parseISO(fee.paid_at), 'dd/MM/yyyy')}
                          </p>
                        )}
                      </div>
                      <div className="text-right space-y-2">
                        <p className={cn(
                          "text-lg font-bold",
                          fee.status === 'Pago' ? 'text-success' : 'text-foreground'
                        )}>
                          {formatMZN(fee.amount || 0)}
                        </p>
                        {getStatusBadge(fee.status)}
                        {fee.status === 'Pago' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1 text-xs"
                            onClick={() => handleViewReceipt(fee)}
                          >
                            <Receipt className="h-3 w-3" />
                            Recibo
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Actions */}
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <ReceiptGenerator
        open={!!selectedReceipt}
        onOpenChange={(open) => !open && setSelectedReceipt(null)}
        receipt={selectedReceipt}
      />
    </>
  );
}
