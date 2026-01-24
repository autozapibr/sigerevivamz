import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Users,
  Target,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { useMonthlyReport, useFinancialSummary, useTuitionFees } from '@/hooks/useFinancial';
import { formatMZN } from '@/lib/validators/mozambique';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const COLORS = {
  receitas: 'hsl(var(--success))',
  despesas: 'hsl(var(--destructive))',
  saldo: 'hsl(var(--primary))',
  propinas: 'hsl(var(--chart-1))',
};

const PIE_COLORS = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

export default function RelatoriosFinanceirosPage() {
  const [selectedYear, setSelectedYear] = useState(2025);
  const currentMonth = format(new Date(), 'yyyy-MM');

  const { data: monthlyData = [], isLoading: loadingMonthly } = useMonthlyReport(selectedYear);
  const { data: summary } = useFinancialSummary(currentMonth);
  const { data: allFees = [] } = useTuitionFees();

  // Calculate totals
  const yearlyTotals = monthlyData.reduce(
    (acc, m) => ({
      receitas: acc.receitas + m.receitas,
      despesas: acc.despesas + m.despesas,
      saldo: acc.saldo + m.saldo,
      propinas: acc.propinas + m.propinas,
    }),
    { receitas: 0, despesas: 0, saldo: 0, propinas: 0 }
  );

  // Tuition distribution by status
  const tuitionByStatus = [
    { name: 'Pagos', value: allFees.filter(f => f.status === 'Pago').length, color: PIE_COLORS[0] },
    { name: 'Pendentes', value: allFees.filter(f => f.status === 'Pendente').length, color: PIE_COLORS[1] },
    { name: 'Atrasados', value: allFees.filter(f => f.status === 'Atrasado').length, color: PIE_COLORS[2] },
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{formatMZN(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <MainLayout 
      title="Relatórios Financeiros" 
      subtitle="Análises e demonstrativos financeiros"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-3">
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Gerar PDF
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-success">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Receitas {selectedYear}</p>
                    <p className="text-xl font-bold text-success">
                      {formatMZN(yearlyTotals.receitas)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="h-3 w-3 text-success" />
                      <span className="text-xs text-success">+12% vs ano anterior</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-success" />
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
            <Card className="border-l-4 border-l-destructive">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Despesas {selectedYear}</p>
                    <p className="text-xl font-bold text-destructive">
                      {formatMZN(yearlyTotals.despesas)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowDownRight className="h-3 w-3 text-destructive" />
                      <span className="text-xs text-destructive">+5% vs ano anterior</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-destructive" />
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
              "border-l-4",
              yearlyTotals.saldo >= 0 ? "border-l-primary" : "border-l-destructive"
            )}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo {selectedYear}</p>
                    <p className={cn(
                      "text-xl font-bold",
                      yearlyTotals.saldo >= 0 ? "text-primary" : "text-destructive"
                    )}>
                      {formatMZN(yearlyTotals.saldo)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Resultado acumulado
                    </p>
                  </div>
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    yearlyTotals.saldo >= 0 ? "bg-primary/10" : "bg-destructive/10"
                  )}>
                    <Wallet className={cn(
                      "h-5 w-5",
                      yearlyTotals.saldo >= 0 ? "text-primary" : "text-destructive"
                    )} />
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
            <Card className="border-l-4 border-l-chart-1">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa Adimplência</p>
                    <p className="text-xl font-bold">
                      {summary?.taxaAdimplencia || 0}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {summary?.propinasPagas || 0} de {allFees.length} pagos
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-chart-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Bar Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Fluxo de Caixa Mensal
              </CardTitle>
              <CardDescription>
                Comparativo de receitas e despesas por mês em {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMonthly ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="receitas" 
                      name="Receitas" 
                      fill={COLORS.receitas}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="despesas" 
                      name="Despesas" 
                      fill={COLORS.despesas}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Tuition Status Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Estado das Propinas
              </CardTitle>
              <CardDescription>
                Distribuição por estado de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPie>
                  <Pie
                    data={tuitionByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {tuitionByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>

              <div className="flex justify-center gap-4 mt-4">
                {tuitionByStatus.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}:</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Balance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução do Saldo
            </CardTitle>
            <CardDescription>
              Tendência do saldo acumulado ao longo do ano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.saldo} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.saldo} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="saldo"
                  name="Saldo"
                  stroke={COLORS.saldo}
                  fill="url(#colorSaldo)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Table */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Mensal Detalhado</CardTitle>
            <CardDescription>
              Demonstrativo completo de receitas, despesas e saldo por mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Mês</th>
                    <th className="text-right py-3 px-4 font-medium">Receitas</th>
                    <th className="text-right py-3 px-4 font-medium">Despesas</th>
                    <th className="text-right py-3 px-4 font-medium">Propinas</th>
                    <th className="text-right py-3 px-4 font-medium">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((month, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium capitalize">{month.month}</td>
                      <td className="text-right py-3 px-4 text-success">
                        {formatMZN(month.receitas)}
                      </td>
                      <td className="text-right py-3 px-4 text-destructive">
                        {formatMZN(month.despesas)}
                      </td>
                      <td className="text-right py-3 px-4">
                        {formatMZN(month.propinas)}
                      </td>
                      <td className={cn(
                        "text-right py-3 px-4 font-medium",
                        month.saldo >= 0 ? "text-primary" : "text-destructive"
                      )}>
                        {formatMZN(month.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 font-bold">
                    <td className="py-3 px-4">Total</td>
                    <td className="text-right py-3 px-4 text-success">
                      {formatMZN(yearlyTotals.receitas)}
                    </td>
                    <td className="text-right py-3 px-4 text-destructive">
                      {formatMZN(yearlyTotals.despesas)}
                    </td>
                    <td className="text-right py-3 px-4">
                      {formatMZN(yearlyTotals.propinas)}
                    </td>
                    <td className={cn(
                      "text-right py-3 px-4",
                      yearlyTotals.saldo >= 0 ? "text-primary" : "text-destructive"
                    )}>
                      {formatMZN(yearlyTotals.saldo)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
