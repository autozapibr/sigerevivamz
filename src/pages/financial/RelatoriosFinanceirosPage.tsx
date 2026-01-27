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
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  FileText,
  FileSpreadsheet,
  Loader2,
  AlertTriangle,
  Users,
  CreditCard,
  MessageSquare,
  GraduationCap,
  Building
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
import { 
  useDefaultersReport, 
  useTuitionStatusReport, 
  usePaymentAgreementsReport,
  useExpensesByCategoryReport,
  useRevenuesByCategoryReport,
  useCommunicationsReport,
  useEnrollmentFeesReport,
  useClassFinancialReport
} from '@/hooks/useFinancialReports';
import { FinancialReportCard, type ReportColumn } from '@/components/financial/reports/FinancialReportCard';
import { formatMZN } from '@/lib/validators/mozambique';
import { format } from 'date-fns';
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

export default function RelatoriosFinanceirosPage() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [isExporting, setIsExporting] = useState(false);
  const currentMonth = format(new Date(), 'yyyy-MM');
  const { toast } = useToast();

  // Data hooks
  const { data: monthlyData = [], isLoading: loadingMonthly } = useMonthlyReport(selectedYear);
  const { data: summary } = useFinancialSummary(currentMonth);
  const { data: allFees = [] } = useTuitionFees();
  
  // Report hooks
  const { data: defaultersData = [], isLoading: loadingDefaulters } = useDefaultersReport();
  const { data: tuitionStatusData = [], isLoading: loadingTuition } = useTuitionStatusReport();
  const { data: agreementsData = [], isLoading: loadingAgreements } = usePaymentAgreementsReport();
  const { data: expensesData = [], isLoading: loadingExpenses } = useExpensesByCategoryReport(selectedYear);
  const { data: revenuesData = [], isLoading: loadingRevenues } = useRevenuesByCategoryReport(selectedYear);
  const { data: commsData = [], isLoading: loadingComms } = useCommunicationsReport();
  const { data: enrollmentsData = [], isLoading: loadingEnrollments } = useEnrollmentFeesReport(selectedYear);
  const { data: classData = [], isLoading: loadingClass } = useClassFinancialReport();

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

  // Column definitions for reports
  const defaultersColumns: ReportColumn[] = [
    { key: 'student_name', header: 'Educando' },
    { key: 'class_name', header: 'Turma' },
    { key: 'month', header: 'Mês' },
    { key: 'amount', header: 'Valor', format: 'currency' },
    { key: 'days_overdue', header: 'Dias Atraso' },
    { key: 'urgency', header: 'Urgência' },
  ];

  const tuitionColumns: ReportColumn[] = [
    { key: 'student_name', header: 'Educando' },
    { key: 'class_name', header: 'Turma' },
    { key: 'month', header: 'Mês' },
    { key: 'amount', header: 'Valor', format: 'currency' },
    { key: 'status', header: 'Estado' },
  ];

  const agreementsColumns: ReportColumn[] = [
    { key: 'student_name', header: 'Educando' },
    { key: 'original_amount', header: 'Valor Original', format: 'currency' },
    { key: 'agreed_amount', header: 'Valor Acordado', format: 'currency' },
    { key: 'discount_percent', header: 'Desconto', format: 'percent' },
    { key: 'installments', header: 'Parcelas' },
    { key: 'status', header: 'Estado' },
  ];

  const expenseColumns: ReportColumn[] = [
    { key: 'date', header: 'Data' },
    { key: 'description', header: 'Descrição' },
    { key: 'category', header: 'Categoria' },
    { key: 'amount', header: 'Valor', format: 'currency' },
  ];

  const revenueColumns: ReportColumn[] = [
    { key: 'date', header: 'Data' },
    { key: 'description', header: 'Descrição' },
    { key: 'category', header: 'Categoria' },
    { key: 'amount', header: 'Valor', format: 'currency' },
  ];

  const commsColumns: ReportColumn[] = [
    { key: 'recipient_name', header: 'Destinatário' },
    { key: 'type', header: 'Canal' },
    { key: 'template', header: 'Modelo' },
    { key: 'status', header: 'Estado' },
    { key: 'sent_at', header: 'Enviado Em' },
  ];

  const enrollmentColumns: ReportColumn[] = [
    { key: 'student_name', header: 'Educando' },
    { key: 'class_name', header: 'Turma' },
    { key: 'enrollment_fee', header: 'Taxa Matrícula', format: 'currency' },
    { key: 'monthly_fee', header: 'Mensalidade', format: 'currency' },
    { key: 'discount', header: 'Desconto', format: 'percent' },
    { key: 'status', header: 'Estado' },
  ];

  const classColumns: ReportColumn[] = [
    { key: 'class_name', header: 'Turma' },
    { key: 'total_expected', header: 'Total Esperado', format: 'currency' },
    { key: 'total_paid', header: 'Total Pago', format: 'currency' },
    { key: 'total_overdue', header: 'Em Atraso', format: 'currency' },
    { key: 'collection_rate', header: 'Taxa Cobrança', format: 'percent' },
  ];

  // Summary calculations
  const totalOverdue = defaultersData.reduce((acc, d) => acc + (d.amount || 0), 0);
  const totalAgreements = agreementsData.reduce((acc, a) => acc + (a.agreed_amount || 0), 0);
  const totalExpenses = expensesData.reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalRevenues = revenuesData.reduce((acc, r) => acc + (r.amount || 0), 0);

  return (
    <MainLayout 
      title="Relatórios Financeiros" 
      subtitle="Análises e demonstrativos financeiros"
    >
      <div className="space-y-4 md:space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
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

          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none gap-2"
              onClick={handleExportPDF}
              disabled={isExporting || loadingMonthly}
              size="sm"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              PDF Geral
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none gap-2"
              onClick={handleExportExcel}
              disabled={isExporting || loadingMonthly}
              size="sm"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              Excel
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

        {/* Tabs for different report categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-4 h-auto">
            <TabsTrigger value="visao-geral" className="text-xs sm:text-sm py-2">
              <BarChart3 className="h-4 w-4 mr-1 hidden sm:block" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="cobrancas" className="text-xs sm:text-sm py-2">
              <AlertTriangle className="h-4 w-4 mr-1 hidden sm:block" />
              Cobranças
            </TabsTrigger>
            <TabsTrigger value="movimentacoes" className="text-xs sm:text-sm py-2">
              <CreditCard className="h-4 w-4 mr-1 hidden sm:block" />
              Movimentações
            </TabsTrigger>
            <TabsTrigger value="academico" className="text-xs sm:text-sm py-2">
              <GraduationCap className="h-4 w-4 mr-1 hidden sm:block" />
              Académico
            </TabsTrigger>
          </TabsList>

          {/* VISÃO GERAL TAB */}
          <TabsContent value="visao-geral" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Monthly Bar Chart */}
              <Card className="lg:col-span-2 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-5 w-5" />
                    Fluxo de Caixa Mensal
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Comparativo de receitas e despesas por mês em {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-2 sm:p-4">
                  {loadingMonthly ? (
                    <div className="h-[200px] sm:h-[250px] flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="w-full h-[200px] sm:h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData} margin={{ top: 10, right: 5, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="month" 
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                            interval="preserveStartEnd"
                            angle={-45}
                            textAnchor="end"
                            height={50}
                          />
                          <YAxis 
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                            width={35}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                          <Bar dataKey="receitas" name="Receitas" fill={COLORS.receitas} radius={[4, 4, 0, 0]} />
                          <Bar dataKey="despesas" name="Despesas" fill={COLORS.despesas} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tuition Status Pie Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <PieChart className="h-5 w-5" />
                    Estado das Propinas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <RechartsPie>
                      <Pie
                        data={tuitionByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
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
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
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
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5" />
                  Evolução do Saldo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingMonthly ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.saldo} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={COLORS.saldo} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} interval={0} angle={-45} textAnchor="end" height={50} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} width={40} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="saldo" name="Saldo" stroke={COLORS.saldo} fill="url(#colorSaldo)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* COBRANÇAS TAB */}
          <TabsContent value="cobrancas" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Inadimplentes */}
              <FinancialReportCard
                title="Relatório de Inadimplência"
                description="Propinas em atraso detalhado por educando"
                icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
                data={defaultersData}
                columns={defaultersColumns}
                isLoading={loadingDefaulters}
                summary={[
                  { label: 'Total em Atraso', value: formatMZN(totalOverdue), variant: 'destructive' },
                  { label: 'Educandos', value: defaultersData.length, variant: 'warning' },
                  { label: 'Críticos (60+ dias)', value: defaultersData.filter(d => d.urgency === 'Crítica').length, variant: 'destructive' },
                ]}
              />

              {/* Acordos de Pagamento */}
              <FinancialReportCard
                title="Acordos de Pagamento"
                description="Negociações de regularização de dívidas"
                icon={<CreditCard className="h-5 w-5 text-primary" />}
                data={agreementsData}
                columns={agreementsColumns}
                isLoading={loadingAgreements}
                summary={[
                  { label: 'Total Acordado', value: formatMZN(totalAgreements), variant: 'success' },
                  { label: 'Acordos Activos', value: agreementsData.filter(a => a.status === 'PENDENTE').length },
                  { label: 'Pagos', value: agreementsData.filter(a => a.status === 'PAGO').length, variant: 'success' },
                ]}
              />
            </div>

            {/* Comunicações */}
            <FinancialReportCard
              title="Histórico de Cobranças"
              description="Comunicações de cobrança enviadas via WhatsApp, SMS e outros canais"
              icon={<MessageSquare className="h-5 w-5 text-primary" />}
              data={commsData}
              columns={commsColumns}
              isLoading={loadingComms}
              summary={[
                { label: 'Total Enviados', value: commsData.length },
                { label: 'WhatsApp', value: commsData.filter(c => c.type === 'WHATSAPP').length, variant: 'success' },
                { label: 'SMS', value: commsData.filter(c => c.type === 'SMS').length },
              ]}
            />
          </TabsContent>

          {/* MOVIMENTAÇÕES TAB */}
          <TabsContent value="movimentacoes" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Receitas */}
              <FinancialReportCard
                title="Receitas por Categoria"
                description={`Receitas registadas em ${selectedYear}`}
                icon={<TrendingUp className="h-5 w-5 text-success" />}
                data={revenuesData}
                columns={revenueColumns}
                isLoading={loadingRevenues}
                summary={[
                  { label: 'Total Receitas', value: formatMZN(totalRevenues), variant: 'success' },
                  { label: 'Transacções', value: revenuesData.length },
                ]}
              />

              {/* Despesas */}
              <FinancialReportCard
                title="Despesas por Categoria"
                description={`Despesas registadas em ${selectedYear}`}
                icon={<TrendingDown className="h-5 w-5 text-destructive" />}
                data={expensesData}
                columns={expenseColumns}
                isLoading={loadingExpenses}
                summary={[
                  { label: 'Total Despesas', value: formatMZN(totalExpenses), variant: 'destructive' },
                  { label: 'Transacções', value: expensesData.length },
                ]}
              />
            </div>

            {/* Propinas Detalhado */}
            <FinancialReportCard
              title="Propinas Detalhado"
              description="Lista completa de propinas por status"
              icon={<Wallet className="h-5 w-5" />}
              data={tuitionStatusData}
              columns={tuitionColumns}
              isLoading={loadingTuition}
              summary={[
                { label: 'Total Registos', value: tuitionStatusData.length },
                { label: 'Pagos', value: tuitionStatusData.filter(t => t.status === 'Pago').length, variant: 'success' },
                { label: 'Pendentes', value: tuitionStatusData.filter(t => t.status === 'Pendente').length, variant: 'warning' },
                { label: 'Atrasados', value: tuitionStatusData.filter(t => t.status === 'Atrasado').length, variant: 'destructive' },
              ]}
            />
          </TabsContent>

          {/* ACADÉMICO TAB */}
          <TabsContent value="academico" className="space-y-4">
            {/* Matrículas */}
            <FinancialReportCard
              title="Matrículas e Taxas"
              description="Relatório de matrículas com valores de taxa e mensalidade"
              icon={<GraduationCap className="h-5 w-5 text-primary" />}
              data={enrollmentsData}
              columns={enrollmentColumns}
              isLoading={loadingEnrollments}
              summary={[
                { label: 'Total Matrículas', value: enrollmentsData.length },
                { label: 'Aprovadas', value: enrollmentsData.filter(e => e.status === 'APROVADA').length, variant: 'success' },
                { label: 'Pendentes', value: enrollmentsData.filter(e => e.status === 'PENDENTE').length, variant: 'warning' },
              ]}
            />

            {/* Por Turma */}
            <FinancialReportCard
              title="Resumo Financeiro por Turma"
              description="Análise de arrecadação e inadimplência por turma"
              icon={<Building className="h-5 w-5" />}
              data={classData}
              columns={classColumns}
              isLoading={loadingClass}
              summary={[
                { label: 'Turmas', value: classData.length },
                { label: 'Total Esperado', value: formatMZN(classData.reduce((a, c) => a + c.total_expected, 0)) },
                { label: 'Total Recebido', value: formatMZN(classData.reduce((a, c) => a + c.total_paid, 0)), variant: 'success' },
              ]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
