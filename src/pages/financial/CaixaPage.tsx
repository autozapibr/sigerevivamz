import React, { useState, useEffect } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Wallet, 
  Search, 
  Plus,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Download,
  Trash2,
  Edit,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { useTransactions, useCreateTransaction, useDeleteTransaction, useFinancialSummary } from '@/hooks/useFinancial';
import { useUndoableDelete } from '@/hooks/useUndoableDelete';
import { formatMZN as _fmtMZN } from '@/lib/utils';
import { CategorySelect } from '@/components/financial/CategorySelect';
import { formatMZN } from '@/lib/validators/mozambique';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { pt } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type TransactionType = Database['public']['Enums']['transaction_type'];

const MONTHS = [
  { value: '2026-01', label: 'Janeiro 2026' },
  { value: '2026-02', label: 'Fevereiro 2026' },
  { value: '2026-03', label: 'Março 2026' },
  { value: '2026-04', label: 'Abril 2026' },
  { value: '2026-05', label: 'Maio 2026' },
  { value: '2026-06', label: 'Junho 2026' },
  { value: '2026-07', label: 'Julho 2026' },
  { value: '2026-08', label: 'Agosto 2026' },
  { value: '2026-09', label: 'Setembro 2026' },
  { value: '2026-10', label: 'Outubro 2026' },
  { value: '2026-11', label: 'Novembro 2026' },
  { value: '2026-12', label: 'Dezembro 2026' },
];

// Mobile transaction card
function TransactionCard({ 
  tx, 
  onDelete 
}: { 
  tx: any; 
  onDelete: (id: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border rounded-lg bg-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={cn(
            'h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0',
            tx.type === 'Receita' ? 'bg-success/10' : 'bg-destructive/10'
          )}>
            {tx.type === 'Receita' ? (
              <ArrowUpCircle className="h-4 w-4 text-success" />
            ) : (
              <ArrowDownCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{tx.description || 'Sem descrição'}</p>
            <p className="text-xs text-muted-foreground">
              {format(parseISO(tx.date), 'dd/MM/yyyy')}
            </p>
            {tx.category?.name && (
              <Badge variant="outline" className="mt-1 text-xs">{tx.category.name}</Badge>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={cn(
            'font-medium',
            tx.type === 'Receita' ? 'text-success' : 'text-destructive'
          )}>
            {tx.type === 'Receita' ? '+' : '-'}{formatMZN(tx.amount)}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 mt-1"
            onClick={() => onDelete(tx.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CaixaPage() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { searchQuery: searchTerm, setPlaceholder } = useSearch();

  useEffect(() => {
    setPlaceholder('Pesquisar movimentos financeiros...');
    return () => setPlaceholder('Pesquisar educandos, professores, turmas...');
  }, [setPlaceholder]);
  const [newMovementDialog, setNewMovementDialog] = useState(false);
  const [movementType, setMovementType] = useState<TransactionType>('Receita');
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    category_id: '',
  });

  const startDate = format(startOfMonth(parseISO(`${selectedMonth}-01`)), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(parseISO(`${selectedMonth}-01`)), 'yyyy-MM-dd');

  const { data: transactions = [], isLoading } = useTransactions({
    type: typeFilter !== 'all' ? typeFilter as TransactionType : undefined,
    startDate,
    endDate,
  });

  // Categories are now managed by CategorySelect component
  const { data: summary } = useFinancialSummary(selectedMonth);
  const createTransaction = useCreateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const undoableDelete = useUndoableDelete<{ id: number; description?: string | null; amount: number; type: string }>();

  const handleDelete = (tx: { id: number; description?: string | null; amount: number; type: string }) => {
    undoableDelete(tx, {
      message: `${tx.type === 'Receita' ? 'Receita' : 'Despesa'} eliminada`,
      description: tx.description ?? `Movimento #${tx.id}`,
      delay: 6000,
      commit: async (item) => { await new Promise<void>((res, rej) => deleteTransaction.mutate(item.id, { onSuccess: () => res(), onError: (e) => rej(e) })); },
    });
  };

  const filteredTransactions = transactions.filter(t => {
    if (searchTerm && !t.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Calculate running balance
  let runningBalance = 0;
  const transactionsWithBalance = [...filteredTransactions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(t => {
      runningBalance += t.type === 'Receita' ? t.amount : -t.amount;
      return { ...t, balance: runningBalance };
    })
    .reverse();

  const handleSubmit = () => {
    createTransaction.mutate(
      {
        type: movementType,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
      },
      {
        onSuccess: () => {
          setNewMovementDialog(false);
          setFormData({ amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), category_id: '' });
        },
      }
    );
  };

  // Categories filtering is now handled in CategorySelect component

  return (
    <MainLayout 
      title="Livro Caixa" 
      subtitle="Controlo de entradas e saídas financeiras"
    >
      <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-success bg-gradient-to-br from-card to-success/5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Receitas</p>
                    <p className="text-xl sm:text-2xl font-bold text-success truncate">
                      {formatMZN(summary?.totalReceitas || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {transactions.filter(t => t.type === 'Receita').length} movimentos
                    </p>
                  </div>
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0 ml-2">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
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
            <Card className="border-l-4 border-l-destructive bg-gradient-to-br from-card to-destructive/5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Despesas</p>
                    <p className="text-xl sm:text-2xl font-bold text-destructive truncate">
                      {formatMZN(summary?.totalDespesas || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {transactions.filter(t => t.type === 'Despesa').length} movimentos
                    </p>
                  </div>
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0 ml-2">
                    <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
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
            <Card className={cn(
              "border-l-4 bg-gradient-to-br from-card",
              (summary?.saldo || 0) >= 0 
                ? "border-l-primary to-primary/5" 
                : "border-l-destructive to-destructive/5"
            )}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Saldo do Mês</p>
                    <p className={cn(
                      "text-xl sm:text-2xl font-bold truncate",
                      (summary?.saldo || 0) >= 0 ? "text-primary" : "text-destructive"
                    )}>
                      {formatMZN(summary?.saldo || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy', { locale: pt })}
                    </p>
                  </div>
                  <div className={cn(
                    "h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-2",
                    (summary?.saldo || 0) >= 0 ? "bg-primary/10" : "bg-destructive/10"
                  )}>
                    <Wallet className={cn(
                      "h-5 w-5 sm:h-6 sm:w-6",
                      (summary?.saldo || 0) >= 0 ? "text-primary" : "text-destructive"
                    )} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters & Actions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-4">
              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Receita">Receitas</SelectItem>
                    <SelectItem value="Despesa">Despesas</SelectItem>
                  </SelectContent>
                </Select>

              </div>

              {/* Actions Row */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => {
                    setMovementType('Receita');
                    setNewMovementDialog(true);
                  }}
                  className="gap-2 bg-success hover:bg-success/90 flex-1 sm:flex-none"
                >
                  <ArrowUpCircle className="h-4 w-4" />
                  Receita
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setMovementType('Despesa');
                    setNewMovementDialog(true);
                  }}
                  className="gap-2 flex-1 sm:flex-none"
                >
                  <ArrowDownCircle className="h-4 w-4" />
                  Despesa
                </Button>
                <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : transactionsWithBalance.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">Nenhum movimento encontrado</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Comece registando uma receita ou despesa
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
                  <Button 
                    onClick={() => {
                      setMovementType('Receita');
                      setNewMovementDialog(true);
                    }}
                    className="gap-2 bg-success hover:bg-success/90"
                  >
                    <ArrowUpCircle className="h-4 w-4" />
                    Nova Receita
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      setMovementType('Despesa');
                      setNewMovementDialog(true);
                    }}
                    className="gap-2"
                  >
                    <ArrowDownCircle className="h-4 w-4" />
                    Nova Despesa
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile View - Cards */}
                <div className="block lg:hidden space-y-3">
                  <AnimatePresence>
                    {transactionsWithBalance.map(tx => (
                      <TransactionCard 
                        key={tx.id} 
                        tx={tx} 
                        onDelete={(id) => { const tx = transactionsWithBalance.find(t => t.id === id); if (tx) handleDelete(tx); }}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Desktop View - Table */}
                <div className="hidden lg:block rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Entrada</TableHead>
                        <TableHead className="text-right">Saída</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                        <TableHead className="text-right">Acções</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {transactionsWithBalance.map((tx, index) => (
                          <motion.tr
                            key={tx.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.02 }}
                            className="group hover:bg-muted/50 transition-colors"
                          >
                            <TableCell className="font-medium">
                              {format(parseISO(tx.date), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {tx.type === 'Receita' ? (
                                  <ArrowUpCircle className="h-4 w-4 text-success" />
                                ) : (
                                  <ArrowDownCircle className="h-4 w-4 text-destructive" />
                                )}
                                {tx.description || '-'}
                              </div>
                            </TableCell>
                            <TableCell>
                              {tx.category?.name ? (
                                <Badge variant="outline">{tx.category.name}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {tx.type === 'Receita' && (
                                <span className="text-success font-medium">
                                  {formatMZN(tx.amount)}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {tx.type === 'Despesa' && (
                                <span className="text-destructive font-medium">
                                  {formatMZN(tx.amount)}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className={cn(
                              "text-right font-medium",
                              tx.balance >= 0 ? "text-primary" : "text-destructive"
                            )}>
                              {formatMZN(tx.balance)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(tx)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Movement Dialog */}
      <Dialog open={newMovementDialog} onOpenChange={setNewMovementDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {movementType === 'Receita' ? (
                <ArrowUpCircle className="h-5 w-5 text-success" />
              ) : (
                <ArrowDownCircle className="h-5 w-5 text-destructive" />
              )}
              Nova {movementType}
            </DialogTitle>
            <DialogDescription>
              Registe um novo movimento no livro caixa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <CurrencyInput
                  label="Valor (MZN)"
                  value={formData.amount}
                  onChange={(val) => setFormData(prev => ({ ...prev, amount: val }))}
                  placeholder="0,00"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1.5"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="category">Categoria</Label>
                <CategorySelect
                  value={formData.category_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  type={movementType}
                  placeholder="Seleccione categoria..."
                  className="mt-1.5"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o movimento..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewMovementDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createTransaction.isPending || !formData.amount}
              className={cn(
                "gap-2",
                movementType === 'Receita' ? 'bg-success hover:bg-success/90' : ''
              )}
            >
              {createTransaction.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : movementType === 'Receita' ? (
                <ArrowUpCircle className="h-4 w-4" />
              ) : (
                <ArrowDownCircle className="h-4 w-4" />
              )}
              Registar {movementType}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
