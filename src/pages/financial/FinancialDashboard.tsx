import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
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
  Banknote
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
  delay = 0 
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  delay?: number;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={cn('border-l-4', colorClasses[color])}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className={cn('text-2xl font-bold', {
                'text-success': color === 'success',
                'text-warning': color === 'warning',
                'text-destructive': color === 'destructive',
              })}>{value}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
              {trend && trendValue && (
                <div className={cn('flex items-center gap-1 text-xs', {
                  'text-success': trend === 'up',
                  'text-destructive': trend === 'down',
                  'text-muted-foreground': trend === 'neutral',
                })}>
                  {trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
                  {trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
                  <span>{trendValue} vs mês anterior</span>
                </div>
              )}
            </div>
            <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', iconColorClasses[color])}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function FinancialDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const previousMonth = format(subMonths(parseISO(`${selectedMonth}-01`), 1), 'yyyy-MM');
  
  const { data: summary } = useFinancialSummary(selectedMonth);
  const { data: prevSummary } = useFinancialSummary(previousMonth);
  const { data: monthlyData = [] } = useMonthlyReport(CURRENT_YEAR);
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

  // Monthly chart data
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
      <div className="space-y-6">
        {/* Month Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS_OPTIONS.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/financeiro/relatorios" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Ver Relatórios
              </Link>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Receitas"
            value={formatMZN(summary?.totalReceitas || 0)}
            subtitle={`${transactions.filter(t => t.type === 'Receita').length} movimentos`}
            icon={TrendingUp}
            color="success"
            trend={revenueChange >= 0 ? 'up' : 'down'}
            trendValue={`${Math.abs(revenueChange).toFixed(1)}%`}
            delay={0.1}
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
          />
          <StatCard
            title="Saldo do Mês"
            value={formatMZN(summary?.saldo || 0)}
            subtitle={format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy', { locale: pt })}
            icon={Wallet}
            color={(summary?.saldo || 0) >= 0 ? 'primary' : 'destructive'}
            delay={0.3}
          />
          <StatCard
            title="Propinas em Atraso"
            value={formatMZN(totalOverdue)}
            subtitle={`${overdueFees.length} educandos`}
            icon={AlertTriangle}
            color={overdueFees.length > 0 ? 'warning' : 'success'}
            delay={0.4}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Fluxo Financeiro Mensal
                </CardTitle>
                <CardDescription>Receitas vs Despesas nos últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
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
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        className="fill-muted-foreground"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        className="fill-muted-foreground"
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
              </CardContent>
            </Card>
          </motion.div>

          {/* Tuition Distribution Pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Estado das Propinas
                </CardTitle>
                <CardDescription>Distribuição do mês seleccionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tuitionDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
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
                          <span className="text-sm text-muted-foreground">{value}</span>
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
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Badge variant="outline" className="text-success border-success/30">
                    Taxa: {summary?.taxaAdimplencia || 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Budget Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Metas do Mês
                </CardTitle>
                <CardDescription>Progresso em relação ao orçamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Receitas</span>
                    <span className="font-medium">{formatMZN(summary?.totalReceitas || 0)} / {formatMZN(monthlyBudget.receitas)}</span>
                  </div>
                  <Progress value={revenueProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">{revenueProgress.toFixed(0)}% da meta</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Despesas</span>
                    <span className="font-medium">{formatMZN(summary?.totalDespesas || 0)} / {formatMZN(monthlyBudget.despesas)}</span>
                  </div>
                  <Progress 
                    value={expenseProgress} 
                    className={cn('h-2', expenseProgress > 80 && '[&>div]:bg-destructive')}
                  />
                  <p className="text-xs text-muted-foreground text-right">{expenseProgress.toFixed(0)}% do limite</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Resumo de Educandos
                </CardTitle>
                <CardDescription>Estatísticas de pagamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Educandos Activos</p>
                        <p className="text-xs text-muted-foreground">Com matrícula válida</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold">{activeStudents}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Em Dia</p>
                        <p className="text-xs text-muted-foreground">Propinas pagas</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-success">{summary?.propinasPagas || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Pendentes</p>
                        <p className="text-xs text-muted-foreground">A aguardar pagamento</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-warning">{summary?.propinasPendentes || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Movimentos Recentes
                  </CardTitle>
                  <CardDescription>Últimos 5 movimentos</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/financeiro/caixa">Ver todos</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum movimento este mês
                    </p>
                  ) : (
                    recentTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'h-8 w-8 rounded-full flex items-center justify-center',
                            tx.type === 'Receita' ? 'bg-success/10' : 'bg-destructive/10'
                          )}>
                            {tx.type === 'Receita' ? (
                              <TrendingUp className="h-4 w-4 text-success" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate max-w-[150px]">
                              {tx.description || 'Sem descrição'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(tx.date), 'dd/MM')}
                            </p>
                          </div>
                        </div>
                        <span className={cn(
                          'text-sm font-medium',
                          tx.type === 'Receita' ? 'text-success' : 'text-destructive'
                        )}>
                          {tx.type === 'Receita' ? '+' : '-'}{formatMZN(tx.amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Acções Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/financeiro/propinas">
                    <CreditCard className="h-6 w-6 text-primary" />
                    <span>Gerir Propinas</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/financeiro/caixa">
                    <Banknote className="h-6 w-6 text-success" />
                    <span>Livro Caixa</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/financeiro/cobrancas">
                    <AlertTriangle className="h-6 w-6 text-warning" />
                    <span>Cobranças</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/financeiro/relatorios">
                    <BarChart3 className="h-6 w-6 text-secondary" />
                    <span>Relatórios</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
