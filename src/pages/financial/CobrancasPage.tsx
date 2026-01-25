import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Loader2
} from 'lucide-react';
import { useOverdueFees, usePayTuition, type TuitionFee } from '@/hooks/useFinancial';
import { formatMZN } from '@/lib/validators/mozambique';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DebtorCard, getDaysOverdue, getUrgencyLevel } from '@/components/financial/DebtorCard';
import { CollectionStatsCards } from '@/components/financial/CollectionStatsCards';
import { BulkReminderDialog } from '@/components/financial/BulkReminderDialog';
import { useToast } from '@/hooks/use-toast';

const PAYMENT_METHODS = [
  { value: 'DINHEIRO', label: 'Dinheiro', icon: Banknote },
  { value: 'M-PESA', label: 'M-Pesa', icon: Smartphone },
  { value: 'TRANSFERENCIA', label: 'Transferência', icon: Building2 },
];

type UrgencyFilter = 'all' | 'baixa' | 'media' | 'alta' | 'critica';
type ViewMode = 'kanban' | 'list';

export default function CobrancasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; fee: TuitionFee | null }>({ open: false, fee: null });
  const [contactDialog, setContactDialog] = useState<{ open: boolean; fee: TuitionFee | null }>({ open: false, fee: null });
  const [bulkReminderOpen, setBulkReminderOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('DINHEIRO');
  const { toast } = useToast();

  const { data: overdueFees = [], isLoading } = useOverdueFees();
  const payTuition = usePayTuition();

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
          setPaymentMethod('DINHEIRO');
        },
      }
    );
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
    <div className="space-y-3 min-w-[280px] flex-1">
      <div className={`flex items-center gap-2 pb-2 border-b ${borderClass}`}>
        <div className={`h-2 w-2 rounded-full ${colorClass}`} />
        <h3 className="font-medium text-sm truncate">{title}</h3>
        <Badge variant="outline" className="ml-auto shrink-0">{fees.length}</Badge>
      </div>
      <ScrollArea className="h-[calc(100vh-450px)] min-h-[300px] pr-2">
        <div className="space-y-3">
          <AnimatePresence>
            {fees
              .filter(f => !searchTerm || f.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(fee => (
                <DebtorCard
                  key={fee.id}
                  fee={fee}
                  onPay={(f) => setPaymentDialog({ open: true, fee: f })}
                  onContact={(f) => setContactDialog({ open: true, fee: f })}
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
      subtitle="Gestão de inadimplência e cobranças"
    >
      <div className="space-y-4 md:space-y-6">
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
              {/* Search Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar educando..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
                  >
                    {viewMode === 'kanban' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                  </Button>
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
                  <Button variant="outline" className="gap-2" size="sm" onClick={handleGenerateReport}>
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Relatório</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2" 
                    size="sm"
                    onClick={() => setBulkReminderOpen(true)}
                    disabled={overdueFees.length === 0}
                  >
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">Enviar Lembretes</span>
                    <span className="sm:hidden">Lembretes</span>
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
                      <DebtorCard
                        key={fee.id}
                        fee={fee}
                        compact
                        onPay={(f) => setPaymentDialog({ open: true, fee: f })}
                        onContact={(f) => setContactDialog({ open: true, fee: f })}
                      />
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
                            onContact={(f) => setContactDialog({ open: true, fee: f })}
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
                  <span>{format(parseISO(`${paymentDialog.fee.month}-01`), 'MMMM yyyy', { locale: pt })}</span>
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

      {/* Contact Dialog */}
      <Dialog open={contactDialog.open} onOpenChange={(open) => setContactDialog({ open, fee: open ? contactDialog.fee : null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Contactar Encarregado
            </DialogTitle>
            <DialogDescription>
              Informações de contacto do encarregado de educação
            </DialogDescription>
          </DialogHeader>

          {contactDialog.fee && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {contactDialog.fee.student?.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium truncate">{contactDialog.fee.student?.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {contactDialog.fee.student?.guardian || 'Sem encarregado registado'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {contactDialog.fee.student?.phone && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3"
                    onClick={() => window.open(`tel:${contactDialog.fee?.student?.phone}`)}
                  >
                    <Phone className="h-4 w-4" />
                    {contactDialog.fee.student.phone}
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3"
                  disabled={!contactDialog.fee.student?.phone}
                  onClick={() => {
                    const phone = contactDialog.fee?.student?.phone?.replace(/\D/g, '');
                    const message = encodeURIComponent(
                      `Prezado(a) Encarregado(a),\n\nIdentificámos que a propina de ${format(parseISO(`${contactDialog.fee?.month}-01`), 'MMMM yyyy', { locale: pt })} do(a) educando(a) ${contactDialog.fee?.student?.name} encontra-se em atraso.\n\nValor: ${formatMZN(contactDialog.fee?.amount || 0)}\n\nPor favor, regularize a situação o mais breve possível.\n\nAtenciosamente,\nSecretaria Escolar`
                    );
                    window.open(`https://wa.me/${phone}?text=${message}`);
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                  Enviar WhatsApp
                </Button>
              </div>

              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Propina em atraso há {getDaysOverdue(contactDialog.fee.due_date)} dias</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Valor: {formatMZN(contactDialog.fee.amount || 0)} • Vencimento: {contactDialog.fee.due_date ? format(parseISO(contactDialog.fee.due_date), 'dd/MM/yyyy') : '-'}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setContactDialog({ open: false, fee: null })}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Reminder Dialog */}
      <BulkReminderDialog
        open={bulkReminderOpen}
        onOpenChange={setBulkReminderOpen}
        fees={overdueFees}
      />
    </MainLayout>
  );
}
