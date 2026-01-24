import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Search, 
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Banknote,
  Smartphone,
  Building2,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import { useTuitionFees, usePayTuition, useGenerateMonthlyFees, useFinancialSummary, type TuitionFee } from '@/hooks/useFinancial';
import { formatMZN } from '@/lib/validators/mozambique';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const MONTHS_2025 = [
  { value: '2025-01', label: 'Janeiro 2025' },
  { value: '2025-02', label: 'Fevereiro 2025' },
  { value: '2025-03', label: 'Março 2025' },
  { value: '2025-04', label: 'Abril 2025' },
  { value: '2025-05', label: 'Maio 2025' },
  { value: '2025-06', label: 'Junho 2025' },
  { value: '2025-07', label: 'Julho 2025' },
  { value: '2025-08', label: 'Agosto 2025' },
  { value: '2025-09', label: 'Setembro 2025' },
  { value: '2025-10', label: 'Outubro 2025' },
  { value: '2025-11', label: 'Novembro 2025' },
  { value: '2025-12', label: 'Dezembro 2025' },
];

const PAYMENT_METHODS = [
  { value: 'DINHEIRO', label: 'Dinheiro', icon: Banknote },
  { value: 'M-PESA', label: 'M-Pesa', icon: Smartphone },
  { value: 'TRANSFERENCIA', label: 'Transferência Bancária', icon: Building2 },
];

function getStatusBadge(status: string | null) {
  switch (status) {
    case 'Pago':
      return (
        <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Pago
        </Badge>
      );
    case 'Pendente':
      return (
        <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20">
          <Clock className="w-3 h-3 mr-1" />
          Pendente
        </Badge>
      );
    case 'Atrasado':
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Atrasado
        </Badge>
      );
    default:
      return <Badge variant="outline">{status || 'N/A'}</Badge>;
  }
}

export default function PropinasPage() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; fee: TuitionFee | null }>({ open: false, fee: null });
  const [paymentMethod, setPaymentMethod] = useState('DINHEIRO');
  const [generateDialog, setGenerateDialog] = useState(false);
  const [defaultAmount, setDefaultAmount] = useState('2500');

  const { data: fees = [], isLoading } = useTuitionFees({
    month: selectedMonth,
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
    search: searchTerm || undefined,
  });

  const { data: summary } = useFinancialSummary(selectedMonth);
  const payTuition = usePayTuition();
  const generateFees = useGenerateMonthlyFees();

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

  const handleGenerateFees = () => {
    generateFees.mutate(
      { month: selectedMonth, defaultAmount: parseFloat(defaultAmount) },
      { onSuccess: () => setGenerateDialog(false) }
    );
  };

  const filteredFees = fees.filter(fee => {
    if (statusFilter !== 'all' && fee.status !== statusFilter) return false;
    if (searchTerm && !fee.student?.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: fees.length,
    pagos: fees.filter(f => f.status === 'Pago').length,
    pendentes: fees.filter(f => f.status === 'Pendente').length,
    atrasados: fees.filter(f => f.status === 'Atrasado').length,
    valorTotal: fees.reduce((sum, f) => sum + (f.amount || 0), 0),
    valorPago: fees.filter(f => f.status === 'Pago').reduce((sum, f) => sum + (f.amount || 0), 0),
  };

  return (
    <MainLayout 
      title="Propinas" 
      subtitle="Gestão de mensalidades escolares"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-primary bg-gradient-to-br from-card to-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Propinas</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatMZN(stats.valorTotal)}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-l-4 border-l-success bg-gradient-to-br from-card to-success/5">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pagos</p>
                    <p className="text-2xl font-bold text-success">{stats.pagos}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatMZN(stats.valorPago)}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-l-4 border-l-warning bg-gradient-to-br from-card to-warning/5">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                    <p className="text-2xl font-bold text-warning">{stats.pendentes}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatMZN(fees.filter(f => f.status === 'Pendente').reduce((sum, f) => sum + (f.amount || 0), 0))}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-l-4 border-l-destructive bg-gradient-to-br from-card to-destructive/5">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Atrasados</p>
                    <p className="text-2xl font-bold text-destructive">{stats.atrasados}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatMZN(fees.filter(f => f.status === 'Atrasado').reduce((sum, f) => sum + (f.amount || 0), 0))}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters & Actions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex flex-1 gap-3 flex-wrap">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[180px]">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS_2025.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Pago">Pagos</SelectItem>
                    <SelectItem value="Pendente">Pendentes</SelectItem>
                    <SelectItem value="Atrasado">Atrasados</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar educando..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setGenerateDialog(true)}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Gerar Propinas
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredFees.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">Nenhuma propina encontrada</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Tente alterar os filtros ou gere novas propinas para este mês
                </p>
                <Button onClick={() => setGenerateDialog(true)} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Gerar Propinas do Mês
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Educando</TableHead>
                      <TableHead>Mês</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredFees.map((fee, index) => (
                        <motion.tr
                          key={fee.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.02 }}
                          className="group hover:bg-muted/50 transition-colors"
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{fee.student?.name}</p>
                              <p className="text-xs text-muted-foreground">{fee.student?.phone || 'Sem telefone'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(parseISO(`${fee.month}-01`), 'MMMM yyyy', { locale: pt })}
                          </TableCell>
                          <TableCell>
                            {fee.due_date 
                              ? format(parseISO(fee.due_date), 'dd/MM/yyyy')
                              : '-'
                            }
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatMZN(fee.amount || 0)}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(fee.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            {fee.status !== 'Pago' && (
                              <Button 
                                size="sm"
                                onClick={() => setPaymentDialog({ open: true, fee })}
                                className="gap-1 bg-success hover:bg-success/90"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Pagar
                              </Button>
                            )}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
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
              Confirme o pagamento da propina
            </DialogDescription>
          </DialogHeader>

          {paymentDialog.fee && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Educando:</span>
                  <span className="font-medium">{paymentDialog.fee.student?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Referência:</span>
                  <span>{format(parseISO(`${paymentDialog.fee.month}-01`), 'MMMM yyyy', { locale: pt })}</span>
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
              {payTuition.isPending && <RefreshCw className="h-4 w-4 animate-spin" />}
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Fees Dialog */}
      <Dialog open={generateDialog} onOpenChange={setGenerateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Gerar Propinas do Mês
            </DialogTitle>
            <DialogDescription>
              Crie automaticamente propinas para todos os educandos activos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Mês de Referência</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS_2025.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Valor Padrão (MZN)</label>
              <Input
                type="number"
                value={defaultAmount}
                onChange={(e) => setDefaultAmount(e.target.value)}
                placeholder="2500.00"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Este valor será aplicado a todos os educandos sem propina gerada
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setGenerateDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleGenerateFees} 
              disabled={generateFees.isPending}
              className="gap-2"
            >
              {generateFees.isPending && <RefreshCw className="h-4 w-4 animate-spin" />}
              Gerar Propinas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
