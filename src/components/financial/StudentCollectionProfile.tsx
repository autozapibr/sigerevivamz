import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  CreditCard,
  MessageSquare,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Phone,
  Banknote,
  History,
  Loader2,
  Receipt,
} from 'lucide-react';
import { formatMZN } from '@/lib/validators/mozambique';
import { format, parseISO, isValid } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { usePaymentAgreements, useCommunicationHistory, type PaymentAgreement, type CommunicationHistory } from '@/hooks/useCollections';

interface StudentCollectionProfileProps {
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
}

export function StudentCollectionProfile({
  open,
  onOpenChange,
  studentId,
  studentName,
}: StudentCollectionProfileProps) {
  // Fetch tuition fees
  const { data: fees = [], isLoading: loadingFees } = useQuery({
    queryKey: ['student-financial-profile', studentId],
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

  // Fetch payment agreements
  const { data: agreements = [], isLoading: loadingAgreements } = usePaymentAgreements(studentId);

  // Fetch communication history
  const { data: communications = [], isLoading: loadingComms } = useCommunicationHistory(studentId);

  const isLoading = loadingFees || loadingAgreements || loadingComms;

  // Calculate summary
  const summary = {
    totalPaid: fees.filter(f => f.status === 'Pago').reduce((sum, f) => sum + (f.amount || 0), 0),
    totalPending: fees.filter(f => f.status !== 'Pago').reduce((sum, f) => sum + (f.amount || 0), 0),
    paidCount: fees.filter(f => f.status === 'Pago').length,
    overdueCount: fees.filter(f => f.status === 'Atrasado').length,
    activeAgreements: agreements.filter(a => a.status === 'ATIVO').length,
    totalCommunications: communications.length,
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'Pago':
        return <Badge className="bg-success/10 text-success border-success/20">Pago</Badge>;
      case 'Pendente':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pendente</Badge>;
      case 'Atrasado':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Atrasado</Badge>;
      default:
        return <Badge variant="outline">{status || 'N/A'}</Badge>;
    }
  };

  const getAgreementStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      ATIVO: { color: 'bg-primary/10 text-primary', label: 'Ativo' },
      CUMPRIDO: { color: 'bg-success/10 text-success', label: 'Cumprido' },
      QUEBRADO: { color: 'bg-destructive/10 text-destructive', label: 'Quebrado' },
      PENDENTE: { color: 'bg-warning/10 text-warning', label: 'Pendente' },
      CANCELADO: { color: 'bg-muted text-muted-foreground', label: 'Cancelado' },
    };
    const s = statusMap[status] || { color: 'bg-muted', label: status };
    return <Badge className={s.color}>{s.label}</Badge>;
  };

  const getCommTypeIcon = (type: string) => {
    switch (type) {
      case 'WHATSAPP':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'SMS':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'TELEFONE':
        return <Phone className="h-4 w-4 text-primary" />;
      case 'EMAIL':
        return <MessageSquare className="h-4 w-4 text-orange-500" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatMonthSafe = (month: string | null) => {
    if (!month) return '-';
    if (/^\d{4}-\d{2}$/.test(month)) {
      try {
        return format(parseISO(`${month}-01`), 'MMMM yyyy', { locale: pt });
      } catch {
        return month;
      }
    }
    return month;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {studentName?.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="flex items-center gap-2">
                Perfil Financeiro Completo
              </DialogTitle>
              <DialogDescription>{studentName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="border-l-4 border-l-success">
                <CardContent className="py-3 px-4">
                  <p className="text-xs text-muted-foreground">Total Pago</p>
                  <p className="text-lg font-bold text-success">{formatMZN(summary.totalPaid)}</p>
                  <p className="text-xs text-muted-foreground">{summary.paidCount} propinas</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-destructive">
                <CardContent className="py-3 px-4">
                  <p className="text-xs text-muted-foreground">Em Dívida</p>
                  <p className="text-lg font-bold text-destructive">{formatMZN(summary.totalPending)}</p>
                  <p className="text-xs text-muted-foreground">{summary.overdueCount} em atraso</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-primary">
                <CardContent className="py-3 px-4">
                  <p className="text-xs text-muted-foreground">Acordos Ativos</p>
                  <p className="text-lg font-bold text-primary">{summary.activeAgreements}</p>
                  <p className="text-xs text-muted-foreground">de {agreements.length} total</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-secondary">
                <CardContent className="py-3 px-4">
                  <p className="text-xs text-muted-foreground">Comunicações</p>
                  <p className="text-lg font-bold">{summary.totalCommunications}</p>
                  <p className="text-xs text-muted-foreground">registadas</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="fees" className="mt-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="fees" className="gap-1 text-xs sm:text-sm">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Propinas</span>
                  <span className="sm:hidden">Prop.</span>
                </TabsTrigger>
                <TabsTrigger value="agreements" className="gap-1 text-xs sm:text-sm">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Acordos</span>
                  <span className="sm:hidden">Acor.</span>
                </TabsTrigger>
                <TabsTrigger value="communications" className="gap-1 text-xs sm:text-sm">
                  <History className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Comunicações</span>
                  <span className="sm:hidden">Hist.</span>
                </TabsTrigger>
              </TabsList>

              {/* Fees Tab */}
              <TabsContent value="fees" className="mt-4">
                <ScrollArea className="h-[280px] pr-2">
                  {fees.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma propina registada</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {fees.map((fee) => (
                        <div
                          key={fee.id}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg border',
                            fee.status === 'Pago' ? 'bg-success/5' : fee.status === 'Atrasado' ? 'bg-destructive/5' : 'bg-muted/30'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'p-2 rounded-full',
                              fee.status === 'Pago' ? 'bg-success/10' : fee.status === 'Atrasado' ? 'bg-destructive/10' : 'bg-warning/10'
                            )}>
                              {fee.status === 'Pago' ? (
                                <CheckCircle2 className="h-4 w-4 text-success" />
                              ) : fee.status === 'Atrasado' ? (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              ) : (
                                <Clock className="h-4 w-4 text-warning" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{formatMonthSafe(fee.month)}</p>
                              <p className="text-xs text-muted-foreground">
                                Venc: {fee.due_date && isValid(parseISO(fee.due_date))
                                  ? format(parseISO(fee.due_date), 'dd/MM/yyyy')
                                  : '-'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn(
                              'font-bold',
                              fee.status === 'Pago' ? 'text-success' : 'text-foreground'
                            )}>
                              {formatMZN(fee.amount || 0)}
                            </p>
                            {getStatusBadge(fee.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* Agreements Tab */}
              <TabsContent value="agreements" className="mt-4">
                <ScrollArea className="h-[280px] pr-2">
                  {agreements.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>Nenhum acordo de pagamento</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {agreements.map((agreement) => (
                        <Card key={agreement.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  {getAgreementStatusBadge(agreement.status)}
                                  {agreement.installments > 1 && (
                                    <Badge variant="outline">{agreement.installments}x</Badge>
                                  )}
                                </div>
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Valor Original:</span>{' '}
                                  <span className="line-through">{formatMZN(agreement.original_amount)}</span>
                                </p>
                                {agreement.discount_percent && agreement.discount_percent > 0 && (
                                  <p className="text-xs text-success">
                                    Desconto: {agreement.discount_percent}% (-{formatMZN(agreement.discount_amount || 0)})
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">
                                  {formatMZN(agreement.agreed_amount)}
                                </p>
                                {agreement.promised_date && (
                                  <p className="text-xs text-muted-foreground">
                                    Até {format(parseISO(agreement.promised_date), 'dd/MM/yyyy')}
                                  </p>
                                )}
                              </div>
                            </div>
                            {agreement.notes && (
                              <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                                {agreement.notes}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* Communications Tab */}
              <TabsContent value="communications" className="mt-4">
                <ScrollArea className="h-[280px] pr-2">
                  {communications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma comunicação registada</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {communications.map((comm) => (
                        <div
                          key={comm.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                        >
                          {getCommTypeIcon(comm.communication_type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {comm.communication_type}
                              </Badge>
                              <Badge
                                className={cn(
                                  'text-xs',
                                  comm.status === 'ENTREGUE' || comm.status === 'LIDO'
                                    ? 'bg-success/10 text-success'
                                    : comm.status === 'FALHOU'
                                    ? 'bg-destructive/10 text-destructive'
                                    : 'bg-muted'
                                )}
                              >
                                {comm.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {comm.message_content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Para: {comm.recipient_name} • {comm.sent_at && format(parseISO(comm.sent_at), 'dd/MM/yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
