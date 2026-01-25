import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  FileText,
  RefreshCw,
  PieChart,
  ArrowUpCircle,
  ArrowDownCircle,
  Target,
  ChevronRight,
  Banknote,
  Receipt
} from 'lucide-react';
import { 
  useFinancialSummary, 
  useTuitionFees, 
  useTransactions, 
  useMonthlyReport,
  useOverdueFees,
  useCategoryStats
} from '@/hooks/useFinancial';
import { formatMZN } from '@/lib/validators/mozambique';
import { format, startOfMonth, endOfMonth, parseISO, subMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area,
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

// Colors for category charts
const CATEGORY_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(145, 37%, 28%)',
  'hsl(200, 50%, 45%)',
  'hsl(280, 40%, 50%)',
  'hsl(30, 60%, 50%)',
  'hsl(350, 50%, 55%)',
  'hsl(180, 45%, 40%)',
];

// Animated KPI Card
function KPICard({ 
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
  const colorConfig = {
    primary: {
      border: 'border-l-primary',
      bg: 'bg-primary/10',
      text: 'text-primary',
      icon: 'text-primary',
    },
    success: {
      border: 'border-l-success',
      bg: 'bg-success/10',
      text: 'text-success',
      icon: 'text-success',
    },
    warning: {
      border: 'border-l-warning',
      bg: 'bg-warning/10',
      text: 'text-warning',
      icon: 'text-warning',
    },
    destructive: {
      border: 'border-l-destructive',
      bg: 'bg-destructive/10',
      text: 'text-destructive',
      icon: 'text-destructive',
    },
  };

  const config = colorConfig[color];

  const content = (
    <Card className={cn(
      'border-l-4 transition-all duration-200 h-full',
      config.border,
      href && 'hover:shadow-md hover:scale-[1.01] cursor-pointer group'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{title}</p>
            {isLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <p className={cn('text-xl sm:text-2xl font-bold truncate', config.text)}>
                {value}
              </p>
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
                <span className="truncate">{trendValue}</span>
              </div>
            )}
          </div>
          <div className={cn(
            'h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center flex-shrink-0',
            config.bg
          )}>
            <Icon className={cn('h-5 w-5', config.icon)} />
          </div>
        </div>
        {href && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2 group-hover:text-primary transition-colors">
            Ver detalhes <ChevronRight className="h-3 w-3" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const wrappedContent = href ? (
    <Link to={href} className="block h-full">{content}</Link>
  ) : content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="h-full"
    >
      {wrappedContent}
    </motion.div>
  );
}

// Recent Transaction Item
function TransactionItem({ tx }: { tx: any }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-0">
      <div className={cn(
        'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0',
        tx.type === 'Receita' ? 'bg-success/10' : 'bg-destructive/10'
      )}>
        {tx.type === 'Receita' ? (
          <ArrowUpCircle className="h-4 w-4 text-success" />
        ) : (
          <ArrowDownCircle className="h-4 w-4 text-destructive" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{tx.description || 'Sem descrição'}</p>
        <p className="text-xs text-muted-foreground">
          {format(parseISO(tx.date), 'dd MMM', { locale: pt })}
        </p>
      </div>
      <p className={cn(
        'text-sm font-semibold flex-shrink-0',
        tx.type === 'Receita' ? 'text-success' : 'text-destructive'
      )}>
        {tx.type === 'Receita' ? '+' : '-'}{formatMZN(tx.amount)}
      </p>
    </div>
  );
}

// Overdue Fee Item
function OverdueItem({ fee }: { fee: any }) {
  const daysOverdue = fee.due_date 
    ? Math.ceil((new Date().getTime() - new Date(fee.due_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  // Safe date formatting - handle invalid month values
  const formatMonth = () => {
    if (!fee.month || typeof fee.month !== 'string') {
      return 'Data inválida';
    }
    try {
      // Validate month format (should be YYYY-MM)
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(fee.month)) {
        return fee.month;
      }
      const date = parseISO(`${fee.month}-01`);
      if (isNaN(date.getTime())) {
        return fee.month;
      }
      return format(date, 'MMM yyyy', { locale: pt });
    } catch {
      return fee.month || 'N/A';
    }
  };
    
  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-0">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="bg-destructive/10 text-destructive text-xs font-medium">
          {fee.student?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{fee.student?.name || 'Educando'}</p>
        <p className="text-xs text-muted-foreground">
          {formatMonth()} • {daysOverdue}d atraso
        </p>
      </div>
      <p className="text-sm font-semibold text-destructive flex-shrink-0">
        {formatMZN(fee.amount || 0)}
      </p>
    </div>
  );
}

// Quick Navigation Button
function QuickNavButton({ 
  icon: Icon, 
  label, 
  href,
  color = 'default'
}: { 
  icon: React.ElementType; 
  label: string; 
  href: string;
  color?: 'default' | 'success' | 'warning' | 'destructive';
}) {
  const colorClasses = {
    default: 'bg-muted hover:bg-muted/80',
    success: 'bg-success/10 hover:bg-success/20 text-success',
    warning: 'bg-warning/10 hover:bg-warning/20 text-warning',
    destructive: 'bg-destructive/10 hover:bg-destructive/20 text-destructive',
  };

  return (
    <Link to={href}>
      <div className={cn(
        'flex flex-col items-center justify-center gap-1.5 p-3 sm:p-4 rounded-xl transition-all h-full',
        colorClasses[color]
      )}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">{label}</span>
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

  const startDate = format(startOfMonth(parseISO(`${selectedMonth}-01`)), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(parseISO(`${selectedMonth}-01`)), 'yyyy-MM-dd');
  const { data: transactions = [] } = useTransactions({ startDate, endDate });
  
  // Category statistics for charts
  const { data: revenueByCategory = [] } = useCategoryStats({ startDate, endDate, type: 'Receita' });
  const { data: expenseByCategory = [] } = useCategoryStats({ startDate, endDate, type: 'Despesa' });

  // Calculate trends
  const revenueChange = prevSummary?.totalReceitas 
    ? ((summary?.totalReceitas || 0) - prevSummary.totalReceitas) / prevSummary.totalReceitas * 100 
    : 0;

  // Tuition stats
  const tuitionStats = {
    pagos: allFees.filter(f => f.status === 'Pago').length,
    pendentes: allFees.filter(f => f.status === 'Pendente').length,
    atrasados: allFees.filter(f => f.status === 'Atrasado').length,
    total: allFees.length,
  };

  const taxaAdimplencia = tuitionStats.total > 0 
    ? Math.round((tuitionStats.pagos / tuitionStats.total) * 100) 
    : 0;
  
  // Overdue total
  const totalOverdue = overdueFees.reduce((sum, f) => sum + (f.amount || 0), 0);

  // Tuition distribution for pie chart
  const tuitionDistribution = [
    { name: 'Pagos', value: tuitionStats.pagos, color: PIE_COLORS[0] },
    { name: 'Pendentes', value: tuitionStats.pendentes, color: PIE_COLORS[1] },
    { name: 'Atrasados', value: tuitionStats.atrasados, color: PIE_COLORS[2] },
  ].filter(d => d.value > 0);

  // Monthly chart data
  const chartData = monthlyData.slice(-6).map(d => ({
    ...d,
    name: d.month.charAt(0).toUpperCase() + d.month.slice(1, 3),
  }));

  // Recent transactions
  const recentTransactions = transactions.slice(0, 5);
  const recentOverdue = overdueFees.slice(0, 5);

  return (
    <MainLayout 
      title="Financeiro" 
      subtitle={format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy', { locale: pt })}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Month Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS_OPTIONS.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" asChild className="flex-1 sm:flex-none" size="sm">
              <Link to="/financeiro/relatorios" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Relatórios</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPICard
            title="Receitas do Mês"
            value={formatMZN(summary?.totalReceitas || 0)}
            subtitle={`${transactions.filter(t => t.type === 'Receita').length} movimentos`}
            icon={TrendingUp}
            color="success"
            trend={revenueChange >= 0 ? 'up' : 'down'}
            trendValue={`${Math.abs(revenueChange).toFixed(0)}% vs mês anterior`}
            delay={0.05}
            isLoading={loadingSummary}
            href="/financeiro/caixa"
          />
          <KPICard
            title="Despesas do Mês"
            value={formatMZN(summary?.totalDespesas || 0)}
            subtitle={`${transactions.filter(t => t.type === 'Despesa').length} movimentos`}
            icon={TrendingDown}
            color="destructive"
            delay={0.1}
            isLoading={loadingSummary}
            href="/financeiro/caixa"
          />
          <KPICard
            title="Saldo Actual"
            value={formatMZN(summary?.saldo || 0)}
            icon={Wallet}
            color={(summary?.saldo || 0) >= 0 ? 'primary' : 'destructive'}
            delay={0.15}
            isLoading={loadingSummary}
          />
          <KPICard
            title="Em Atraso"
            value={formatMZN(totalOverdue)}
            subtitle={`${overdueFees.length} educandos`}
            icon={AlertTriangle}
            color={overdueFees.length > 0 ? 'warning' : 'success'}
            delay={0.2}
            href="/financeiro/cobrancas"
          />
        </div>

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                <QuickNavButton icon={CreditCard} label="Propinas" href="/financeiro/propinas" color="success" />
                <QuickNavButton icon={Wallet} label="Caixa" href="/financeiro/caixa" />
                <QuickNavButton icon={AlertTriangle} label="Cobranças" href="/financeiro/cobrancas" color="warning" />
                <QuickNavButton icon={BarChart3} label="Relatórios" href="/financeiro/relatorios" />
                <QuickNavButton icon={FileText} label="Recibos" href="/financeiro/propinas" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
            <TabsTrigger value="propinas" className="text-xs sm:text-sm">Propinas</TabsTrigger>
            <TabsTrigger value="movimentos" className="text-xs sm:text-sm">Movimentos</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Cash Flow Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2"
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Fluxo de Caixa
                    </CardTitle>
                    <CardDescription className="text-xs">Últimos 6 meses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingMonthly ? (
                      <div className="h-[200px] flex items-center justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="h-[200px] sm:h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 11 }} 
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis 
                              tick={{ fontSize: 10 }} 
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                              width={35}
                            />
                            <Tooltip
                              content={({ active, payload, label }) => {
                                if (active && payload?.length) {
                                  return (
                                    <div className="rounded-lg border bg-background p-2.5 shadow-md text-xs">
                                      <p className="font-medium mb-1">{label}</p>
                                      {payload.map((p: any, i: number) => (
                                        <div key={i} className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                          <span className="text-muted-foreground">{p.name}:</span>
                                          <span className="font-medium">{formatMZN(p.value)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar 
                              dataKey="receitas" 
                              name="Receitas"
                              fill="hsl(var(--success))" 
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                              dataKey="despesas" 
                              name="Despesas"
                              fill="hsl(var(--destructive))" 
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Overdue List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        Em Atraso
                      </CardTitle>
                      <Badge variant="outline" className="text-warning border-warning/30">
                        {overdueFees.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentOverdue.length === 0 ? (
                      <div className="text-center py-6">
                        <CheckCircle2 className="h-8 w-8 mx-auto text-success mb-2" />
                        <p className="text-sm text-muted-foreground">Sem atrasos!</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[180px]">
                        {recentOverdue.map(fee => (
                          <OverdueItem key={fee.id} fee={fee} />
                        ))}
                        {overdueFees.length > 5 && (
                          <Link to="/financeiro/cobrancas" className="block text-center py-2 text-xs text-primary hover:underline">
                            Ver todos ({overdueFees.length})
                          </Link>
                        )}
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Category Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Revenue by Category */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      Receitas por Categoria
                    </CardTitle>
                    <CardDescription className="text-xs">Distribuição do mês</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {revenueByCategory.length === 0 ? (
                      <div className="h-[180px] flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Sem dados de receitas</p>
                      </div>
                    ) : (
                      <>
                        <div className="h-[180px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                              <Pie
                                data={revenueByCategory.slice(0, 6)}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={2}
                                dataKey="total"
                              >
                                {revenueByCategory.slice(0, 6).map((_, index) => (
                                  <Cell key={`rev-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (active && payload?.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
                                        <p className="font-medium">{data.name}</p>
                                        <p className="text-success">{formatMZN(data.total)}</p>
                                        <p className="text-muted-foreground">{data.count} movimentos</p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                            </RechartsPie>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center mt-2">
                          {revenueByCategory.slice(0, 4).map((cat, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs">
                              <div 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} 
                              />
                              <span className="text-muted-foreground truncate max-w-[80px]">{cat.name}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Expenses by Category */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-destructive" />
                      Despesas por Categoria
                    </CardTitle>
                    <CardDescription className="text-xs">Distribuição do mês</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {expenseByCategory.length === 0 ? (
                      <div className="h-[180px] flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Sem dados de despesas</p>
                      </div>
                    ) : (
                      <>
                        <div className="h-[180px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                              <Pie
                                data={expenseByCategory.slice(0, 6)}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={2}
                                dataKey="total"
                              >
                                {expenseByCategory.slice(0, 6).map((_, index) => (
                                  <Cell key={`exp-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (active && payload?.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
                                        <p className="font-medium">{data.name}</p>
                                        <p className="text-destructive">{formatMZN(data.total)}</p>
                                        <p className="text-muted-foreground">{data.count} movimentos</p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                            </RechartsPie>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center mt-2">
                          {expenseByCategory.slice(0, 4).map((cat, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs">
                              <div 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} 
                              />
                              <span className="text-muted-foreground truncate max-w-[80px]">{cat.name}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Propinas Tab */}
          <TabsContent value="propinas" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Propinas</p>
                      <p className="text-2xl font-bold">{tuitionStats.total}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-success">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Pagas</p>
                      <p className="text-2xl font-bold text-success">{tuitionStats.pagos}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-warning">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Pendentes</p>
                      <p className="text-2xl font-bold text-warning">{tuitionStats.pendentes}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-destructive">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Atrasadas</p>
                      <p className="text-2xl font-bold text-destructive">{tuitionStats.atrasados}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Tuition Pie Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Distribuição de Propinas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tuitionDistribution.length === 0 ? (
                    <div className="h-[200px] flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">Sem dados disponíveis</p>
                    </div>
                  ) : (
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={tuitionDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {tuitionDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload?.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                                      <span>{data.name}: {data.value}</span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <div className="flex justify-center gap-4 mt-2">
                    {tuitionDistribution.map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Adimplencia Progress */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Taxa de Adimplência
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-4">
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-muted/30"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="hsl(var(--success))"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${taxaAdimplencia * 3.52} 352`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-3xl font-bold">{taxaAdimplencia}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <p className="font-bold text-success">{tuitionStats.pagos}</p>
                      <p className="text-muted-foreground">Pagos</p>
                    </div>
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <p className="font-bold text-warning">{tuitionStats.pendentes}</p>
                      <p className="text-muted-foreground">Pendentes</p>
                    </div>
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <p className="font-bold text-destructive">{tuitionStats.atrasados}</p>
                      <p className="text-muted-foreground">Atrasados</p>
                    </div>
                  </div>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/financeiro/propinas" className="gap-2">
                      <CreditCard className="h-4 w-4" />
                      Gerir Propinas
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Movimentos Tab */}
          <TabsContent value="movimentos" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Transactions */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Últimos Movimentos</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/financeiro/caixa" className="text-xs">Ver todos</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <Wallet className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Sem movimentos este mês</p>
                    </div>
                  ) : (
                    <div>
                      {recentTransactions.map(tx => (
                        <TransactionItem key={tx.id} tx={tx} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Resumo do Mês</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-success" />
                        </div>
                        <span className="text-sm">Total Entradas</span>
                      </div>
                      <span className="font-semibold text-success">{formatMZN(summary?.totalReceitas || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        </div>
                        <span className="text-sm">Total Saídas</span>
                      </div>
                      <span className="font-semibold text-destructive">{formatMZN(summary?.totalDespesas || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Wallet className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Saldo</span>
                      </div>
                      <span className={cn('font-bold text-lg', (summary?.saldo || 0) >= 0 ? 'text-primary' : 'text-destructive')}>
                        {formatMZN(summary?.saldo || 0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button asChild className="flex-1 bg-success hover:bg-success/90" size="sm">
                      <Link to="/financeiro/caixa" className="gap-2">
                        <ArrowUpCircle className="h-4 w-4" />
                        Receita
                      </Link>
                    </Button>
                    <Button asChild variant="destructive" className="flex-1" size="sm">
                      <Link to="/financeiro/caixa" className="gap-2">
                        <ArrowDownCircle className="h-4 w-4" />
                        Despesa
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
