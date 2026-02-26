import React, { useState, useMemo, useEffect } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  Search, 
  Phone,
  CheckCircle2,
  MessageSquare,
  Banknote,
  Smartphone,
  Building2,
  Send,
  FileText,
  Filter,
  LayoutGrid,
  List,
  Loader2,
  Zap,
  HelpCircle,
  User,
} from 'lucide-react';
import { useOverdueFees, usePayTuition, type TuitionFee } from '@/hooks/useFinancial';
import { useSendNotification } from '@/hooks/useCollections';
import { formatMZN } from '@/lib/validators/mozambique';
import { format, parseISO, isValid } from 'date-fns';
import { pt } from 'date-fns/locale';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DebtorCard, getDaysOverdue, getUrgencyLevel, formatMonthSafe } from '@/components/financial/DebtorCard';
import { CollectionStatsCards } from '@/components/financial/CollectionStatsCards';
import { MobileActionSheet } from '@/components/financial/MobileActionSheet';
import { NegotiationDialog } from '@/components/financial/NegotiationDialog';
import { SmartReminderDialog } from '@/components/financial/SmartReminderDialog';
import { CommunicationHistorySheet } from '@/components/financial/CommunicationHistorySheet';
import { CollectionHelpDialog } from '@/components/financial/CollectionHelpDialog';
import { StudentCollectionProfile } from '@/components/financial/StudentCollectionProfile';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const PAYMENT_METHODS = [
  { value: 'NUMERARIO', label: 'Numerário', icon: Banknote },
  { value: 'CONTA_BANCARIA', label: 'Conta Bancária', icon: Building2 },
  { value: 'CARTEIRA_MOVEL', label: 'Carteira Móvel', icon: Smartphone },
];

type UrgencyFilter = 'all' | 'baixa' | 'media' | 'alta' | 'critica';
type ViewMode = 'kanban' | 'list';

export default function CobrancasPage() {
  const { searchQuery: searchTerm, setPlaceholder } = useSearch();

  useEffect(() => {
    setPlaceholder('Pesquisar educando devedor...');
    return () => setPlaceholder('Pesquisar educandos, professores, turmas...');
  }, [setPlaceholder]);
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; fee: TuitionFee | null }>({ open: false, fee: null });
  const [paymentMethod, setPaymentMethod] = useState('NUMERARIO');
  
  // New state for enhanced features
  const [mobileActionSheet, setMobileActionSheet] = useState<{ open: boolean; fee: TuitionFee | null }>({ open: false, fee: null });
  const [negotiationDialog, setNegotiationDialog] = useState<{ open: boolean; fee: TuitionFee | null }>({ open: false, fee: null });
  const [smartReminderOpen, setSmartReminderOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [studentProfile, setStudentProfile] = useState<{ open: boolean; studentId: number | null; studentName?: string }>({
    open: false,
    studentId: null,
  });
  const [historySheet, setHistorySheet] = useState<{ open: boolean; studentId: number | null; studentName?: string }>({ 
    open: false, 
    studentId: null 
  });

  const { toast } = useToast();
  const isMobile = useIsMobile();

  const { data: overdueFees = [], isLoading } = useOverdueFees();
  const payTuition = usePayTuition();
  const sendNotification = useSendNotification();

  // Filter and group fees
  const { feesByUrgency, filteredFees, stats } = useMemo(() => {
    const baixa = overdueFees.filter(f => getDaysOverdue(f.due_date) <= 7);
    const media = overdueFees.filter(f => {
      const days = getDaysOverdue(f.due_date);
      return days > 7 && days <= 30;
    });
    const alta = overdueFees.filter(f => {
      const days = getDaysOverdue(f.due_date);
      return days > 30 && days <= 60;
    });
    const critica = overdueFees.filter(f => getDaysOverdue(f.due_date) > 60);

    let filtered = overdueFees;
    if (urgencyFilter !== 'all') {
      filtered = { baixa, media, alta, critica }[urgencyFilter] || [];
    }
    if (searchTerm) {
      filtered = filtered.filter(f => 
        f.student?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return {
      feesByUrgency: { baixa, media, alta, critica },
      filteredFees: filtered,
      stats: {
        total: overdueFees.length,
        valorTotal: overdueFees.reduce((sum, f) => sum + (f.amount || 0), 0),
        mediaDias: overdueFees.length > 0 
          ? Math.round(overdueFees.reduce((sum, f) => sum + getDaysOverdue(f.due_date), 0) / overdueFees.length)
          : 0,
        criticos: critica.length,
      },
    };
  }, [overdueFees, urgencyFilter, searchTerm]);

  const handlePayment = () => {
    if (!paymentDialog.fee) return;
    
    payTuition.mutate(
      { feeId: paymentDialog.fee.id, paymentMethod },
      {
        onSuccess: () => {
          setPaymentDialog({ open: false, fee: null });
          setPaymentMethod('NUMERARIO');
          setMobileActionSheet({ open: false, fee: null });
        },
      }
    );
  };

  const handleSendWhatsApp = async (fee: TuitionFee) => {
    if (!fee.student?.phone) {
      toast({
        title: 'Sem telefone',
        description: 'Este educando não tem telefone registado.',
        variant: 'destructive',
      });
      return;
    }

    const daysOverdue = getDaysOverdue(fee.due_date);
    let monthFormatted = formatMonthSafe(fee.month);

    const message = `Prezado(a) Encarregado(a),

Identificámos que a propina de ${monthFormatted} do(a) educando(a) ${fee.student?.name} encontra-se em atraso há ${daysOverdue} dias.

📌 Valor: ${formatMZN(fee.amount || 0)}

Por favor, regularize a situação o mais breve possível.

Atenciosamente,
Secretaria Escolar`;

    sendNotification.mutate({
      type: 'whatsapp',
      phone: fee.student.phone,
      message,
      studentId: fee.student_id,
      tuitionFeeId: fee.id,
      recipientName: fee.student.guardian || fee.student.name,
    });
  };

  const handleSendSMS = async (fee: TuitionFee) => {
    if (!fee.student?.phone) {
      toast({
        title: 'Sem telefone',
        description: 'Este educando não tem telefone registado.',
        variant: 'destructive',
      });
      return;
    }

    const message = `Propina ${formatMonthSafe(fee.month, 'MMM/yy')} de ${fee.student?.name}: ${formatMZN(fee.amount || 0)} em atraso. Regularize.`;

    sendNotification.mutate({
      type: 'sms',
      phone: fee.student.phone,
      message,
      studentId: fee.student_id,
      tuitionFeeId: fee.id,
      recipientName: fee.student.guardian || fee.student.name,
    });
  };

  const handleCall = (fee: TuitionFee) => {
    if (fee.student?.phone) {
      window.open(`tel:${fee.student.phone}`);
    }
  };

  // Mobile: handle tap on card
  const handleCardTap = (fee: TuitionFee) => {
    if (isMobile) {
      setMobileActionSheet({ open: true, fee });
    }
  };

  const handleGenerateReport = () => {
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade de relatório de cobranças será implementada em breve.',
    });
  };

  const renderKanbanColumn = (
    fees: TuitionFee[], 
    title: string, 
    colorClass: string,
    borderClass: string
  ) => (
    <div className="space-y-3 min-w-[240px] w-full md:w-auto md:flex-1">
      <div className={`flex items-center gap-2 pb-2 border-b ${borderClass}`}>
        <div className={`h-2 w-2 rounded-full ${colorClass}`} />
        <h3 className="font-medium text-sm truncate">{title}</h3>
        <Badge variant="outline" className="ml-auto shrink-0">{fees.length}</Badge>
      </div>
      <ScrollArea className="h-[calc(100vh-450px)] min-h-[250px] pr-2">
        <div className="space-y-3">
          <AnimatePresence>
            {fees
              .filter(f => !searchTerm || f.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(fee => (
                <DebtorCard
                  key={fee.id}
                  fee={fee}
                  onPay={(f) => setPaymentDialog({ open: true, fee: f })}
                  onContact={(f) => setMobileActionSheet({ open: true, fee: f })}
                  onViewProfile={(f) => setStudentProfile({ 
                    open: true, 
                    studentId: f.student_id, 
                    studentName: f.student?.name 
                  })}
                />
              ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <MainLayout 
      title="Cobranças" 
      subtitle="Sistema Inteligente de Gestão de Inadimplência"
    >
      <div className="space-y-4 md:space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Stats Cards */}
        <CollectionStatsCards
          totalDebtors={stats.total}
          totalAmount={stats.valorTotal}
          averageDays={stats.mediaDias}
          criticalCount={stats.criticos}
        />

        {/* Search & Actions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3">
              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Mobile Filter */}
                <div className="flex gap-2 sm:hidden">
                  <Select value={urgencyFilter} onValueChange={(v) => setUrgencyFilter(v as UrgencyFilter)}>
                    <SelectTrigger className="flex-1">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Urgência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="baixa">Baixa (≤7d)</SelectItem>
                      <SelectItem value="media">Média (8-30d)</SelectItem>
                      <SelectItem value="alta">Alta (31-60d)</SelectItem>
                      <SelectItem value="critica">Crítica (&gt;60d)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Actions Row */}
              <div className="flex flex-wrap gap-2 justify-between">
                <div className="hidden sm:flex gap-2">
                  <Select value={urgencyFilter} onValueChange={(v) => setUrgencyFilter(v as UrgencyFilter)}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Urgência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="baixa">Baixa (≤7d)</SelectItem>
                      <SelectItem value="media">Média (8-30d)</SelectItem>
                      <SelectItem value="alta">Alta (31-60d)</SelectItem>
                      <SelectItem value="critica">Crítica (&gt;60d)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="hidden md:flex border rounded-md">
                    <Button
                      variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="rounded-r-none"
                      onClick={() => setViewMode('kanban')}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="rounded-l-none"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => setHelpDialogOpen(true)}
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Ajuda</span>
                  </Button>
                  <Button variant="outline" className="gap-2" size="sm" onClick={handleGenerateReport}>
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Relatório</span>
                  </Button>
                  <Button 
                    className="gap-2 bg-primary" 
                    size="sm"
                    onClick={() => setSmartReminderOpen(true)}
                    disabled={overdueFees.length === 0}
                  >
                    <Zap className="h-4 w-4" />
                    <span className="hidden sm:inline">Envio Inteligente</span>
                    <span className="sm:hidden">Enviar</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : overdueFees.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-4" />
                <h3 className="text-lg font-medium">Nenhuma cobrança pendente</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Todos os pagamentos estão em dia!
                </p>
              </div>
            ) : (
              <>
                {/* Mobile List View */}
                <div className="md:hidden space-y-2">
                  <AnimatePresence>
                    {filteredFees.map(fee => (
                      <div key={fee.id} onClick={() => handleCardTap(fee)}>
                        <DebtorCard
                          fee={fee}
                          compact
                          onPay={(f) => setPaymentDialog({ open: true, fee: f })}
                          onContact={(f) => setMobileActionSheet({ open: true, fee: f })}
                        />
                      </div>
                    ))}
                  </AnimatePresence>
                  {filteredFees.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum resultado encontrado
                    </p>
                  )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block">
                  {viewMode === 'kanban' && urgencyFilter === 'all' ? (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {renderKanbanColumn(feesByUrgency.baixa, 'Baixa (≤7 dias)', 'bg-warning', 'border-warning/30')}
                      {renderKanbanColumn(feesByUrgency.media, 'Média (8-30 dias)', 'bg-orange-500', 'border-orange-500/30')}
                      {renderKanbanColumn(feesByUrgency.alta, 'Alta (31-60 dias)', 'bg-destructive', 'border-destructive/30')}
                      {renderKanbanColumn(feesByUrgency.critica, 'Crítica (>60 dias)', 'bg-destructive animate-pulse', 'border-destructive')}
                    </div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      <AnimatePresence>
                        {filteredFees.map(fee => (
                          <DebtorCard
                            key={fee.id}
                            fee={fee}
                            onPay={(f) => setPaymentDialog({ open: true, fee: f })}
                            onContact={(f) => setMobileActionSheet({ open: true, fee: f })}
                            onViewProfile={(f) => setStudentProfile({ 
                              open: true, 
                              studentId: f.student_id, 
                              studentName: f.student?.name 
                            })}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog.open} onOpenChange={(open) => setPaymentDialog({ open, fee: open ? paymentDialog.fee : null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Registar Pagamento
            </DialogTitle>
            <DialogDescription>
              Confirme o pagamento da propina em atraso
            </DialogDescription>
          </DialogHeader>

          {paymentDialog.fee && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Educando:</span>
                  <span className="font-medium truncate ml-2">{paymentDialog.fee.student?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Referência:</span>
                  <span>{formatMonthSafe(paymentDialog.fee.month)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dias em atraso:</span>
                  <span className="text-destructive font-medium">{getDaysOverdue(paymentDialog.fee.due_date)} dias</span>
                </div>
                <div className="flex justify-between text-lg border-t pt-2 mt-2">
                  <span className="font-medium">Valor:</span>
                  <span className="font-bold text-success">{formatMZN(paymentDialog.fee.amount || 0)}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Método de Pagamento</label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(method => (
                    <Button
                      key={method.value}
                      type="button"
                      variant={paymentMethod === method.value ? 'default' : 'outline'}
                      className={cn(
                        'flex flex-col h-auto py-3 gap-1',
                        paymentMethod === method.value && 'ring-2 ring-primary'
                      )}
                      onClick={() => setPaymentMethod(method.value)}
                    >
                      <method.icon className="h-5 w-5" />
                      <span className="text-xs">{method.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPaymentDialog({ open: false, fee: null })}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={payTuition.isPending}
              className="bg-success hover:bg-success/90 gap-2"
            >
              {payTuition.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Action Sheet (Bottom Sheet) */}
      <MobileActionSheet
        open={mobileActionSheet.open}
        onOpenChange={(open) => setMobileActionSheet({ open, fee: open ? mobileActionSheet.fee : null })}
        fee={mobileActionSheet.fee}
        onPay={() => {
          setPaymentDialog({ open: true, fee: mobileActionSheet.fee });
        }}
        onNegotiate={() => {
          setNegotiationDialog({ open: true, fee: mobileActionSheet.fee });
          setMobileActionSheet({ open: false, fee: null });
        }}
        onWhatsApp={() => {
          if (mobileActionSheet.fee) handleSendWhatsApp(mobileActionSheet.fee);
        }}
        onSMS={() => {
          if (mobileActionSheet.fee) handleSendSMS(mobileActionSheet.fee);
        }}
        onCall={() => {
          if (mobileActionSheet.fee) handleCall(mobileActionSheet.fee);
        }}
        onViewHistory={() => {
          if (mobileActionSheet.fee) {
            setHistorySheet({
              open: true,
              studentId: mobileActionSheet.fee.student_id,
              studentName: mobileActionSheet.fee.student?.name,
            });
            setMobileActionSheet({ open: false, fee: null });
          }
        }}
        onViewProfile={() => {
          if (mobileActionSheet.fee) {
            setStudentProfile({
              open: true,
              studentId: mobileActionSheet.fee.student_id,
              studentName: mobileActionSheet.fee.student?.name,
            });
            setMobileActionSheet({ open: false, fee: null });
          }
        }}
      />

      {/* Negotiation Dialog */}
      <NegotiationDialog
        open={negotiationDialog.open}
        onOpenChange={(open) => setNegotiationDialog({ open, fee: open ? negotiationDialog.fee : null })}
        fee={negotiationDialog.fee}
      />

      {/* Smart Reminder Dialog */}
      <SmartReminderDialog
        open={smartReminderOpen}
        onOpenChange={setSmartReminderOpen}
        fees={overdueFees}
      />

      {/* Communication History Sheet */}
      <CommunicationHistorySheet
        open={historySheet.open}
        onOpenChange={(open) => setHistorySheet({ open, studentId: open ? historySheet.studentId : null })}
        studentId={historySheet.studentId}
        studentName={historySheet.studentName}
      />

      {/* Help Dialog */}
      <CollectionHelpDialog
        open={helpDialogOpen}
        onOpenChange={setHelpDialogOpen}
      />

      {/* Student Collection Profile */}
      <StudentCollectionProfile
        open={studentProfile.open}
        onOpenChange={(open) => setStudentProfile({ open, studentId: open ? studentProfile.studentId : null })}
        studentId={studentProfile.studentId || 0}
        studentName={studentProfile.studentName || ''}
      />
    </MainLayout>
  );
}
