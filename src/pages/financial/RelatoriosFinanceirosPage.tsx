import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  FileText,
  FileSpreadsheet,
  Loader2,
  Table,
  LineChart as LineChartIcon
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
  Area,
  AreaChart,
  LineChart,
  Line
} from 'recharts';
import { useMonthlyReport, useFinancialSummary, useTuitionFees } from '@/hooks/useFinancial';
import { formatMZN } from '@/lib/validators/mozambique';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { exportSimpleFinancialExcel } from '@/lib/exporters/financial-excel';
import { exportFinancialPDF } from '@/lib/exporters/financial-pdf';
import { useToast } from '@/hooks/use-toast';

const COLORS = {
  receitas: 'hsl(var(--success))',
  despesas: 'hsl(var(--destructive))',
  saldo: 'hsl(var(--primary))',
  propinas: 'hsl(var(--chart-1))',
};

const PIE_COLORS = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

// Custom tooltip for charts
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3 z-50">
        <p className="font-medium mb-2 text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full shrink-0" 
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
}

// Summary stat card component
function StatCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendDirection, 
  icon: Icon, 
  colorClass,
  delay 
}: { 
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
  icon: any;
  colorClass: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={`border-l-4 ${colorClass}`}>
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground truncate">{title}</p>
              <p className={`text-lg md:text-xl font-bold truncate ${
                colorClass.includes('success') ? 'text-success' : 
                colorClass.includes('destructive') ? 'text-destructive' : 
                colorClass.includes('primary') ? 'text-primary' : ''
              }`}>
                {value}
              </p>
              {trend && (
                <div className="flex items-center gap-1 mt-0.5 md:mt-1">
                  {trendDirection === 'up' ? (
                    <ArrowUpRight className="h-3 w-3 text-success" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-destructive" />
                  )}
                  <span className={`text-xs ${trendDirection === 'up' ? 'text-success' : 'text-destructive'}`}>
                    {trend}
                  </span>
                </div>
              )}
              {subtitle && !trend && (
                <p className="text-xs text-muted-foreground mt-0.5 md:mt-1 hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
            <div className={`h-9 w-9 md:h-10 md:w-10 rounded-lg flex items-center justify-center shrink-0 ${
              colorClass.includes('success') ? 'bg-success/10' : 
              colorClass.includes('destructive') ? 'bg-destructive/10' : 
              colorClass.includes('primary') ? 'bg-primary/10' : 'bg-chart-1/10'
            }`}>
              <Icon className={`h-4 w-4 md:h-5 md:w-5 ${
                colorClass.includes('success') ? 'text-success' : 
                colorClass.includes('destructive') ? 'text-destructive' : 
                colorClass.includes('primary') ? 'text-primary' : 'text-chart-1'
              }`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Mobile-friendly table component
function MonthlyTable({ data, totals }: { data: any[]; totals: any }) {
  return (
    <>
      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((month, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="py-2 px-3 bg-muted/50">
              <CardTitle className="text-sm capitalize">{month.month}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receitas:</span>
                <span className="font-medium text-success">{formatMZN(month.receitas)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Despesas:</span>
                <span className="font-medium text-destructive">{formatMZN(month.despesas)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Propinas:</span>
                <span className="font-medium">{formatMZN(month.propinas)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Saldo:</span>
                <span className={cn(
                  "font-bold",
                  month.saldo >= 0 ? "text-primary" : "text-destructive"
                )}>
                  {formatMZN(month.saldo)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Totals Card */}
        <Card className="bg-primary/5 border-primary/30">
          <CardHeader className="py-2 px-3 bg-primary/10">
            <CardTitle className="text-sm">Total Anual</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Receitas:</span>
              <span className="font-bold text-success">{formatMZN(totals.receitas)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Despesas:</span>
              <span className="font-bold text-destructive">{formatMZN(totals.despesas)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Propinas:</span>
              <span className="font-bold">{formatMZN(totals.propinas)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-bold">Saldo:</span>
              <span className={cn(
                "font-bold",
                totals.saldo >= 0 ? "text-primary" : "text-destructive"
              )}>
                {formatMZN(totals.saldo)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
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
            {data.map((month, index) => (
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
                {formatMZN(totals.receitas)}
              </td>
              <td className="text-right py-3 px-4 text-destructive">
                {formatMZN(totals.despesas)}
              </td>
              <td className="text-right py-3 px-4">
                {formatMZN(totals.propinas)}
              </td>
              <td className={cn(
                "text-right py-3 px-4",
                totals.saldo >= 0 ? "text-primary" : "text-destructive"
              )}>
                {formatMZN(totals.saldo)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}

export default function RelatoriosFinanceirosPage() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [activeTab, setActiveTab] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);
  const currentMonth = format(new Date(), 'yyyy-MM');
  const { toast } = useToast();

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

  // Export handlers
  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      exportFinancialPDF(monthlyData, selectedYear, summary?.taxaAdimplencia);
      toast({
        title: 'PDF gerado com sucesso',
        description: 'Na janela de impressão, seleccione "Guardar como PDF" para salvar o documento.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Ocorreu um erro ao gerar o relatório. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      exportSimpleFinancialExcel(monthlyData, selectedYear);
      toast({
        title: 'Excel exportado com sucesso',
        description: 'O ficheiro foi descarregado para a sua pasta de downloads.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao exportar Excel',
        description: 'Ocorreu um erro ao gerar o ficheiro. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <MainLayout 
      title="Relatórios Financeiros" 
      subtitle="Análises e demonstrativos financeiros"
    >
      <div className="space-y-4 md:space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none gap-2"
              onClick={handleExportPDF}
              disabled={isExporting || loadingMonthly}
              size="sm"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Gerar</span> PDF
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none gap-2"
              onClick={handleExportExcel}
              disabled={isExporting || loadingMonthly}
              size="sm"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Exportar</span> Excel
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title={`Receitas ${selectedYear}`}
            value={formatMZN(yearlyTotals.receitas)}
            trend="+12% vs ano anterior"
            trendDirection="up"
            icon={TrendingUp}
            colorClass="border-l-success"
            delay={0.1}
          />
          <StatCard
            title={`Despesas ${selectedYear}`}
            value={formatMZN(yearlyTotals.despesas)}
            trend="+5% vs ano anterior"
            trendDirection="down"
            icon={TrendingDown}
            colorClass="border-l-destructive"
            delay={0.2}
          />
          <StatCard
            title={`Saldo ${selectedYear}`}
            value={formatMZN(yearlyTotals.saldo)}
            subtitle="Resultado acumulado"
            icon={Wallet}
            colorClass={yearlyTotals.saldo >= 0 ? "border-l-primary" : "border-l-destructive"}
            delay={0.3}
          />
          <StatCard
            title="Taxa Adimplência"
            value={`${summary?.taxaAdimplencia || 0}%`}
            subtitle={`${summary?.propinasPagas || 0} de ${allFees.length} pagos`}
            icon={Target}
            colorClass="border-l-chart-1"
            delay={0.4}
          />
        </div>

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4 hidden sm:block" />
              Gráficos
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2">
              <Table className="h-4 w-4 hidden sm:block" />
              Tabela
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-2">
              <LineChartIcon className="h-4 w-4 hidden sm:block" />
              Tendências
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Charts */}
          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Monthly Bar Chart */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <BarChart3 className="h-5 w-5" />
                    Fluxo de Caixa Mensal
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Comparativo de receitas e despesas por mês em {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingMonthly ? (
                    <div className="h-[250px] md:h-[300px] flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="month" 
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                          width={45}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
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
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <PieChart className="h-5 w-5" />
                    Estado das Propinas
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Distribuição por estado de pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPie>
                      <Pie
                        data={tuitionByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {tuitionByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>

                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {tuitionByStatus.map((item, index) => (
                      <div key={index} className="flex items-center gap-1.5 text-xs">
                        <div 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
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
          </TabsContent>

          {/* Table Tab */}
          <TabsContent value="table">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base md:text-lg">Resumo Mensal Detalhado</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Demonstrativo completo de receitas, despesas e saldo por mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMonthly ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <MonthlyTable data={monthlyData} totals={yearlyTotals} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4 md:space-y-6">
            {/* Balance Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <TrendingUp className="h-5 w-5" />
                  Evolução do Saldo
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Tendência do saldo ao longo do ano
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMonthly ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        width={45}
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
                )}
              </CardContent>
            </Card>

            {/* Propinas Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <LineChartIcon className="h-5 w-5" />
                  Evolução das Propinas
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Arrecadação mensal de propinas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMonthly ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="month" 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        width={45}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line 
                        type="monotone" 
                        dataKey="propinas" 
                        name="Propinas" 
                        stroke={COLORS.propinas}
                        strokeWidth={2}
                        dot={{ fill: COLORS.propinas, strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="receitas" 
                        name="Receitas Totais" 
                        stroke={COLORS.receitas}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
