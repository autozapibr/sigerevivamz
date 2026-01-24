import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Search, 
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  MessageSquare,
  User,
  Calendar,
  Banknote,
  Smartphone,
  Building2,
  Send,
  FileText,
  TrendingDown,
  Users
} from 'lucide-react';
import { useOverdueFees, usePayTuition, type TuitionFee } from '@/hooks/useFinancial';
import { formatMZN } from '@/lib/validators/mozambique';
import { format, parseISO, differenceInDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const PAYMENT_METHODS = [
  { value: 'DINHEIRO', label: 'Dinheiro', icon: Banknote },
  { value: 'M-PESA', label: 'M-Pesa', icon: Smartphone },
  { value: 'TRANSFERENCIA', label: 'Transferência', icon: Building2 },
];

function getDaysOverdue(dueDate: string | null) {
  if (!dueDate) return 0;
  return differenceInDays(new Date(), parseISO(dueDate));
}

function getUrgencyLevel(days: number): { label: string; color: string; bgColor: string } {
  if (days <= 7) {
    return { label: 'Baixa', color: 'text-warning', bgColor: 'bg-warning/10' };
  } else if (days <= 30) {
    return { label: 'Média', color: 'text-orange-500', bgColor: 'bg-orange-500/10' };
  } else if (days <= 60) {
    return { label: 'Alta', color: 'text-destructive', bgColor: 'bg-destructive/10' };
  } else {
    return { label: 'Crítica', color: 'text-destructive', bgColor: 'bg-destructive/20' };
  }
}

interface DebtorCardProps {
  fee: TuitionFee;
  onPay: (fee: TuitionFee) => void;
  onContact: (fee: TuitionFee) => void;
}

function DebtorCard({ fee, onPay, onContact }: DebtorCardProps) {
  const daysOverdue = getDaysOverdue(fee.due_date);
  const urgency = getUrgencyLevel(daysOverdue);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group"
    >
      <Card className="hover:shadow-md transition-all hover:border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {fee.student?.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium truncate">{fee.student?.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(`${fee.month}-01`), 'MMMM yyyy', { locale: pt })}
                  </p>
                </div>
                <Badge className={cn("text-xs", urgency.bgColor, urgency.color)}>
                  {daysOverdue}d atraso
                </Badge>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-destructive">
                    {formatMZN(fee.amount || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Venc: {fee.due_date ? format(parseISO(fee.due_date), 'dd/MM/yyyy') : '-'}
                  </p>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onContact(fee)}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 bg-success hover:bg-success/90"
                    onClick={() => onPay(fee)}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Pagar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function CobrancasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; fee: TuitionFee | null }>({ open: false, fee: null });
  const [contactDialog, setContactDialog] = useState<{ open: boolean; fee: TuitionFee | null }>({ open: false, fee: null });
  const [paymentMethod, setPaymentMethod] = useState('DINHEIRO');

  const { data: overdueFees = [], isLoading } = useOverdueFees();
  const payTuition = usePayTuition();

  // Group by urgency level
  const feesByUrgency = {
    baixa: overdueFees.filter(f => getDaysOverdue(f.due_date) <= 7),
    media: overdueFees.filter(f => {
      const days = getDaysOverdue(f.due_date);
      return days > 7 && days <= 30;
    }),
    alta: overdueFees.filter(f => {
      const days = getDaysOverdue(f.due_date);
      return days > 30 && days <= 60;
    }),
    critica: overdueFees.filter(f => getDaysOverdue(f.due_date) > 60),
  };

  const filteredFees = overdueFees.filter(f => 
    !searchTerm || f.student?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: overdueFees.length,
    valorTotal: overdueFees.reduce((sum, f) => sum + (f.amount || 0), 0),
    mediaDias: overdueFees.length > 0 
      ? Math.round(overdueFees.reduce((sum, f) => sum + getDaysOverdue(f.due_date), 0) / overdueFees.length)
      : 0,
  };

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

  return (
    <MainLayout 
      title="Cobranças" 
      subtitle="Gestão de inadimplência e cobranças"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-destructive bg-gradient-to-br from-card to-destructive/5">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Inadimplentes</p>
                    <p className="text-2xl font-bold text-destructive">{stats.total}</p>
                    <p className="text-xs text-muted-foreground mt-1">educandos</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-destructive" />
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
            <Card className="border-l-4 border-l-warning bg-gradient-to-br from-card to-warning/5">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor em Atraso</p>
                    <p className="text-2xl font-bold text-warning">
                      {formatMZN(stats.valorTotal)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">total pendente</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-warning" />
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
            <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-card to-orange-500/5">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Média de Atraso</p>
                    <p className="text-2xl font-bold text-orange-500">{stats.mediaDias}</p>
                    <p className="text-xs text-muted-foreground mt-1">dias</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-500" />
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
            <Card className="border-l-4 border-l-primary bg-gradient-to-br from-card to-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Críticos</p>
                    <p className="text-2xl font-bold">{feesByUrgency.critica.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">&gt;60 dias</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search & Kanban View */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar educando..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Gerar Relatório
                </Button>
                <Button variant="outline" className="gap-2">
                  <Send className="h-4 w-4" />
                  Enviar Lembretes
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
              <Tabs defaultValue="kanban" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
                  <TabsTrigger value="kanban">Kanban</TabsTrigger>
                  <TabsTrigger value="list">Lista</TabsTrigger>
                </TabsList>

                <TabsContent value="kanban">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Baixa Urgência */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-warning/30">
                        <div className="h-2 w-2 rounded-full bg-warning" />
                        <h3 className="font-medium text-sm">Baixa (≤7 dias)</h3>
                        <Badge variant="outline" className="ml-auto">{feesByUrgency.baixa.length}</Badge>
                      </div>
                      <ScrollArea className="h-[400px] pr-2">
                        <div className="space-y-3">
                          <AnimatePresence>
                            {feesByUrgency.baixa
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

                    {/* Média Urgência */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-orange-500/30">
                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                        <h3 className="font-medium text-sm">Média (8-30 dias)</h3>
                        <Badge variant="outline" className="ml-auto">{feesByUrgency.media.length}</Badge>
                      </div>
                      <ScrollArea className="h-[400px] pr-2">
                        <div className="space-y-3">
                          <AnimatePresence>
                            {feesByUrgency.media
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

                    {/* Alta Urgência */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-destructive/30">
                        <div className="h-2 w-2 rounded-full bg-destructive" />
                        <h3 className="font-medium text-sm">Alta (31-60 dias)</h3>
                        <Badge variant="outline" className="ml-auto">{feesByUrgency.alta.length}</Badge>
                      </div>
                      <ScrollArea className="h-[400px] pr-2">
                        <div className="space-y-3">
                          <AnimatePresence>
                            {feesByUrgency.alta
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

                    {/* Crítica */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-destructive">
                        <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                        <h3 className="font-medium text-sm">Crítica (&gt;60 dias)</h3>
                        <Badge variant="outline" className="ml-auto">{feesByUrgency.critica.length}</Badge>
                      </div>
                      <ScrollArea className="h-[400px] pr-2">
                        <div className="space-y-3">
                          <AnimatePresence>
                            {feesByUrgency.critica
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
                  </div>
                </TabsContent>

                <TabsContent value="list">
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
                </TabsContent>
              </Tabs>
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
                  <span className="font-medium">{paymentDialog.fee.student?.name}</span>
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
              {payTuition.isPending && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
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
                <div>
                  <p className="font-medium">{contactDialog.fee.student?.name}</p>
                  <p className="text-sm text-muted-foreground">
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
                  <AlertTriangle className="h-4 w-4" />
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
    </MainLayout>
  );
}
