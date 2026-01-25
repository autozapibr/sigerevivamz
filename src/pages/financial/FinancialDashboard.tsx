import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Receipt,
  PiggyBank,
  Target,
  BarChart3,
  Banknote,
  Eye,
  FileText,
  RefreshCw
} from 'lucide-react';
import { 
  useFinancialSummary, 
  useTuitionFees, 
  useTransactions, 
  useMonthlyReport,
  useOverdueFees 
} from '@/hooks/useFinancial';
import { useStudents } from '@/hooks/useStudents';
import { formatMZN } from '@/lib/validators/mozambique';
import { format, startOfMonth, endOfMonth, parseISO, subMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const CURRENT_YEAR = 2026;
const MONTHS_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const month = String(i + 1).padStart(2, '0');
  return {
    value: `${CURRENT_YEAR}-${month}`,
    label: format(new Date(CURRENT_YEAR, i, 1), 'MMMM yyyy', { locale: pt }),
  };
});

const PIE_COLORS = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  color = 'primary',
  delay = 0,
  isLoading = false,
  href
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  delay?: number;
  isLoading?: boolean;
  href?: string;
}) {
  const colorClasses = {
    primary: 'border-l-primary bg-gradient-to-br from-card to-primary/5',
    success: 'border-l-success bg-gradient-to-br from-card to-success/5',
    warning: 'border-l-warning bg-gradient-to-br from-card to-warning/5',
    destructive: 'border-l-destructive bg-gradient-to-br from-card to-destructive/5',
  };
  
  const iconColorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
  };

  const content = (
    <Card className={cn(
      'border-l-4 transition-all', 
      colorClasses[color],
      href && 'hover:shadow-md hover:scale-[1.02] cursor-pointer'
    )}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-sm text-muted-foreground truncate">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className={cn('text-xl sm:text-2xl font-bold truncate', {
                'text-success': color === 'success',
                'text-warning': color === 'warning',
                'text-destructive': color === 'destructive',
              })}>{value}</p>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
            {trend && trendValue && (
              <div className={cn('flex items-center gap-1 text-xs', {
                'text-success': trend === 'up',
                'text-destructive': trend === 'down',
                'text-muted-foreground': trend === 'neutral',
              })}>
                {trend === 'up' && <ArrowUpRight className="h-3 w-3 flex-shrink-0" />}
                {trend === 'down' && <ArrowDownRight className="h-3 w-3 flex-shrink-0" />}
                <span className="truncate">{trendValue} vs mês anterior</span>
              </div>
            )}
          </div>
          <div className={cn('h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-2', iconColorClasses[color])}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
      >
        <Link to={href}>{content}</Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {content}
    </motion.div>
  );
}

// Quick action button component
function QuickAction({ 
  icon: Icon, 
  label, 
  href, 
  color = 'default' 
}: { 
  icon: React.ElementType; 
  label: string; 
  href: string;
  color?: 'default' | 'success' | 'destructive' | 'warning';
}) {
  const colorClasses = {
    default: 'bg-muted hover:bg-muted/80',
    success: 'bg-success/10 hover:bg-success/20 text-success',
    destructive: 'bg-destructive/10 hover:bg-destructive/20 text-destructive',
    warning: 'bg-warning/10 hover:bg-warning/20 text-warning',
  };

  return (
    <Link to={href}>
      <div className={cn(
        'flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl transition-all cursor-pointer',
        colorClasses[color]
      )}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="text-xs sm:text-sm font-medium text-center">{label}</span>
      </div>
    </Link>
  );
}

export default function FinancialDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const previousMonth = format(subMonths(parseISO(`${selectedMonth}-01`), 1), 'yyyy-MM');
  
  const { data: summary, isLoading: loadingSummary } = useFinancialSummary(selectedMonth);
  const { data: prevSummary } = useFinancialSummary(previousMonth);
  const { data: monthlyData = [], isLoading: loadingMonthly } = useMonthlyReport(CURRENT_YEAR);
  const { data: overdueFees = [] } = useOverdueFees();
  const { data: allFees = [] } = useTuitionFees({ month: selectedMonth });
  const { data: students = [] } = useStudents();

  const startDate = format(startOfMonth(parseISO(`${selectedMonth}-01`)), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(parseISO(`${selectedMonth}-01`)), 'yyyy-MM-dd');
  const { data: transactions = [] } = useTransactions({ startDate, endDate });

  // Calculate trends
  const revenueChange = prevSummary?.totalReceitas 
    ? ((summary?.totalReceitas || 0) - prevSummary.totalReceitas) / prevSummary.totalReceitas * 100 
    : 0;
  const expenseChange = prevSummary?.totalDespesas 
    ? ((summary?.totalDespesas || 0) - prevSummary.totalDespesas) / prevSummary.totalDespesas * 100 
    : 0;

  // Active students with tuition
  const activeStudents = students.filter(s => s.status === 'Ativo').length;
  
  // Overdue total
  const totalOverdue = overdueFees.reduce((sum, f) => sum + (f.amount || 0), 0);

  // Tuition distribution for pie chart
  const tuitionDistribution = [
    { name: 'Pagos', value: allFees.filter(f => f.status === 'Pago').length, color: PIE_COLORS[0] },
    { name: 'Pendentes', value: allFees.filter(f => f.status === 'Pendente').length, color: PIE_COLORS[1] },
    { name: 'Atrasados', value: allFees.filter(f => f.status === 'Atrasado').length, color: PIE_COLORS[2] },
  ];

  // Monthly chart data - last 6 months
  const chartData = monthlyData.slice(0, 6).map(d => ({
    ...d,
    month: d.month.charAt(0).toUpperCase() + d.month.slice(1),
  }));

  // Recent transactions
  const recentTransactions = transactions.slice(0, 5);

  // Budget targets (example - could be fetched from settings)
  const monthlyBudget = {
    receitas: 500000,
    despesas: 350000,
  };

  const revenueProgress = Math.min(((summary?.totalReceitas || 0) / monthlyBudget.receitas) * 100, 100);
  const expenseProgress = Math.min(((summary?.totalDespesas || 0) / monthlyBudget.despesas) * 100, 100);

  return (
    <MainLayout 
      title="Dashboard Financeiro" 
      subtitle="Visão geral das finanças escolares"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Month Selector & Quick Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="h-5 w-5 text-muted-foreground hidden sm:block" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS_OPTIONS.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" asChild className="flex-1 sm:flex-none">
              <Link to="/financeiro/relatorios" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Ver Relatórios</span>
                <span className="sm:hidden">Relatórios</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1 sm:flex-none">
              <Link to="/financeiro/propinas" className="gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Gestão Propinas</span>
                <span className="sm:hidden">Propinas</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Receitas"
            value={formatMZN(summary?.totalReceitas || 0)}
            subtitle={`${transactions.filter(t => t.type === 'Receita').length} movimentos`}
            icon={TrendingUp}
            color="success"
            trend={revenueChange >= 0 ? 'up' : 'down'}
            trendValue={`${Math.abs(revenueChange).toFixed(1)}%`}
            delay={0.1}
            isLoading={loadingSummary}
            href="/financeiro/caixa"
          />
          <StatCard
            title="Total Despesas"
            value={formatMZN(summary?.totalDespesas || 0)}
            subtitle={`${transactions.filter(t => t.type === 'Despesa').length} movimentos`}
            icon={TrendingDown}
            color="destructive"
            trend={expenseChange >= 0 ? 'down' : 'up'}
            trendValue={`${Math.abs(expenseChange).toFixed(1)}%`}
            delay={0.2}
            isLoading={loadingSummary}
            href="/financeiro/caixa"
          />
          <StatCard
            title="Saldo do Mês"
            value={formatMZN(summary?.saldo || 0)}
            subtitle={format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy', { locale: pt })}
            icon={Wallet}
            color={(summary?.saldo || 0) >= 0 ? 'primary' : 'destructive'}
            delay={0.3}
            isLoading={loadingSummary}
          />
          <StatCard
            title="Propinas em Atraso"
            value={formatMZN(totalOverdue)}
            subtitle={`${overdueFees.length} educandos`}
            icon={AlertTriangle}
            color={overdueFees.length > 0 ? 'warning' : 'success'}
            delay={0.4}
            href="/financeiro/cobrancas"
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Acções Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
                <QuickAction icon={CreditCard} label="Propinas" href="/financeiro/propinas" color="success" />
                <QuickAction icon={Wallet} label="Caixa" href="/financeiro/caixa" />
                <QuickAction icon={AlertTriangle} label="Cobranças" href="/financeiro/cobrancas" color="warning" />
                <QuickAction icon={BarChart3} label="Relatórios" href="/financeiro/relatorios" />
                <QuickAction icon={Receipt} label="Recibos" href="/financeiro/propinas" color="default" />
                <QuickAction icon={FileText} label="Exportar" href="/financeiro/relatorios" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Monthly Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BarChart3 className="h-5 w-5" />
                  Fluxo Financeiro Mensal
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Receitas vs Despesas nos últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMonthly ? (
                  <div className="h-[240px] sm:h-[280px] flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="h-[240px] sm:h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 11 }} 
                          tickLine={false}
                          axisLine={false}
                          className="fill-muted-foreground"
                        />
                        <YAxis 
                          tick={{ fontSize: 11 }} 
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                          className="fill-muted-foreground"
                          width={40}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-3 shadow-md">
                                  <p className="font-medium mb-2">{label}</p>
                                  {payload.map((p: any, i: number) => (
                                    <p key={i} className="text-sm" style={{ color: p.color }}>
                                      {p.name}: {formatMZN(p.value)}
                                    </p>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="receitas" 
                          stroke="hsl(var(--success))" 
                          fillOpacity={1} 
                          fill="url(#colorReceitas)" 
                          name="Receitas"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="despesas" 
                          stroke="hsl(var(--destructive))" 
                          fillOpacity={1} 
                          fill="url(#colorDespesas)" 
                          name="Despesas"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tuition Distribution Pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <CreditCard className="h-5 w-5" />
                  Estado das Propinas
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Distribuição do mês seleccionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] sm:h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tuitionDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {tuitionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value: string) => (
                          <span className="text-xs sm:text-sm text-muted-foreground">{value}</span>
                        )}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-md">
                                <p className="text-sm font-medium">{data.name}: {data.value}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <Badge variant="outline" className="text-success border-success/30">
                    Taxa: {summary?.taxaAdimplencia || 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Budget Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Target className="h-5 w-5" />
                  Metas do Mês
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Progresso em relação ao orçamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Receitas</span>
                    <span className="font-medium text-xs sm:text-sm">{formatMZN(summary?.totalReceitas || 0)} / {formatMZN(monthlyBudget.receitas)}</span>
                  </div>
                  <Progress value={revenueProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">{revenueProgress.toFixed(0)}% da meta</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Despesas</span>
                    <span className="font-medium text-xs sm:text-sm">{formatMZN(summary?.totalDespesas || 0)} / {formatMZN(monthlyBudget.despesas)}</span>
                  </div>
                  <Progress 
                    value={expenseProgress} 
                    className={cn("h-2", expenseProgress > 90 && "[&>div]:bg-destructive")}
                  />
                  <p className="text-xs text-muted-foreground text-right">{expenseProgress.toFixed(0)}% do limite</p>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Educandos Activos</span>
                    <Badge variant="outline">{activeStudents}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Receipt className="h-5 w-5" />
                    Movimentos Recentes
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Últimas transacções registadas</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/financeiro/caixa" className="gap-1">
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Ver Todos</span>
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum movimento neste período</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTransactions.map((tx, index) => (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.05 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className={cn(
                          'h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0',
                          tx.type === 'Receita' ? 'bg-success/10' : 'bg-destructive/10'
                        )}>
                          {tx.type === 'Receita' ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{tx.description || 'Sem descrição'}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(tx.date), 'dd MMM yyyy', { locale: pt })}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={cn(
                            'text-sm font-medium',
                            tx.type === 'Receita' ? 'text-success' : 'text-destructive'
                          )}>
                            {tx.type === 'Receita' ? '+' : '-'}{formatMZN(tx.amount)}
                          </p>
                          {tx.category?.name && (
                            <p className="text-xs text-muted-foreground">{tx.category.name}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Overdue Summary */}
        {overdueFees.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium text-warning">Atenção: Propinas em Atraso</p>
                      <p className="text-sm text-muted-foreground">
                        {overdueFees.length} educandos com propinas em atraso totalizando {formatMZN(totalOverdue)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" asChild className="w-full sm:w-auto border-warning text-warning hover:bg-warning/10">
                    <Link to="/financeiro/cobrancas" className="gap-2">
                      <Users className="h-4 w-4" />
                      Gerir Cobranças
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
