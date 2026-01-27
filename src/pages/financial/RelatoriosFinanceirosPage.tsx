import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  BookOpen,
  GraduationCap,
  Wallet,
  Users,
  Calendar,
  Loader2,
  TrendingUp,
  TrendingDown,
  Target,
  FileText,
  FileSpreadsheet,
  Download,
  Share2,
  Printer,
  ArrowUpRight,
  ArrowDownRight,
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
  AreaChart,
  Area,
} from 'recharts';
import { 
  useCashBookReport,
  useEnrollmentsFinancialReport,
  useTuitionFeesReport,
  useSalariesReport,
  useMonthlyFinancialSummary,
} from '@/hooks/useFinancialReportsData';
import { useClasses } from '@/hooks/useGrades';
import { formatMZN } from '@/lib/validators/mozambique';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const COLORS = {
  receitas: 'hsl(var(--success))',
  despesas: 'hsl(var(--destructive))',
  saldo: 'hsl(var(--primary))',
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

// PDF Generator for reports
function generatePDF(
  title: string,
  subtitle: string,
  data: any[],
  columns: { key: string; header: string; format?: 'currency' | 'percent' | 'text' }[],
  totals?: { label: string; value: string | number }[]
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return false;

  const formatValue = (value: any, format?: string) => {
    if (value === null || value === undefined) return '-';
    if (format === 'currency') return formatMZN(Number(value));
    if (format === 'percent') return `${Number(value).toFixed(1)}%`;
    return String(value);
  };

  const tableRows = data.map((row, idx) =>
    `<tr>
      <td style="border:1px solid #ddd;padding:8px;text-align:center;font-size:10px;">${idx + 1}</td>
      ${columns.map((c) => `<td style="border:1px solid #ddd;padding:8px;${c.format === 'currency' ? 'text-align:right;font-family:monospace;' : ''}">${formatValue(row[c.key], c.format)}</td>`).join('')}
    </tr>`
  ).join('');

  const totalsSection = totals?.map(t => `
    <div style="display:inline-block;margin-right:20px;padding:10px 15px;background:#f8f9fa;border-radius:6px;border-left:3px solid #2D5F3F;">
      <div style="font-size:10px;color:#666;text-transform:uppercase;">${t.label}</div>
      <div style="font-size:14px;font-weight:700;color:#1a1a1a;">${t.value}</div>
    </div>
  `).join('') || '';

  const totalPages = Math.ceil(data.length / 25);

  const html = `
    <!DOCTYPE html>
    <html lang="pt-MZ">
      <head>
        <meta charset="UTF-8">
        <title>${title} - SiGER</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 10pt; color: #1a1a1a; }
          .container { max-width: 297mm; margin: 0 auto; padding: 15px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2D5F3F; padding-bottom: 12px; margin-bottom: 15px; }
          .logo h1 { color: #2D5F3F; font-size: 18pt; }
          .logo h2 { color: #4A7C59; font-size: 9pt; margin-top: 2px; }
          .institution { text-align: right; font-size: 9pt; color: #666; }
          .institution strong { color: #1a1a1a; display: block; font-size: 10pt; margin-bottom: 2px; }
          .doc-title { text-align: center; margin: 15px 0; }
          .doc-title h2 { font-size: 14pt; color: #2D5F3F; text-transform: uppercase; letter-spacing: 1px; }
          .doc-title .meta { font-size: 9pt; color: #666; margin-top: 3px; }
          .totals-grid { margin: 15px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 9pt; }
          thead { background: #2D5F3F; color: white; }
          th { padding: 8px 6px; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 8pt; }
          td { padding: 6px; border-bottom: 1px solid #e8e8e8; }
          tbody tr:nth-child(even) { background: #f9fafb; }
          .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e0e0e0; font-size: 8pt; color: #666; display: flex; justify-content: space-between; }
          .page-info { text-align: right; margin-top: 10px; font-size: 8pt; color: #999; }
          .signatures { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 50px; }
          .sig-box { text-align: center; }
          .sig-line { border-top: 1px solid #1a1a1a; margin-top: 40px; padding-top: 6px; font-size: 9pt; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <h1>📊 SiGER</h1>
              <h2>Sistema de Gestão Escolar REVIVA</h2>
            </div>
            <div class="institution">
              <strong>Escola REVIVA</strong>
              NUIT: 400000000<br>
              Maputo, Moçambique
            </div>
          </div>
          
          <div class="doc-title">
            <h2>${title}</h2>
            <p class="meta">${subtitle} | Gerado em ${new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' })} | Total: ${data.length} registos</p>
          </div>

          ${totalsSection ? `<div class="totals-grid">${totalsSection}</div>` : ''}
          
          <table>
            <thead>
              <tr>
                <th style="width:40px;">#</th>
                ${columns.map((c) => `<th>${c.header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          
          <div class="page-info">Página 1 de ${totalPages}</div>
          
          <div class="signatures">
            <div class="sig-box"><div class="sig-line">Director(a) da Escola</div></div>
            <div class="sig-box"><div class="sig-line">Responsável Financeiro</div></div>
          </div>
          
          <div class="footer">
            <span>Gerado em: ${new Date().toLocaleString('pt-MZ')}</span>
            <span>SiGER - Sistema de Gestão Escolar REVIVA</span>
          </div>
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  return true;
}

// CSV Generator
function generateCSV(
  data: any[],
  columns: { key: string; header: string; format?: 'currency' | 'percent' | 'text' }[]
) {
  const formatValue = (value: any, format?: string) => {
    if (value === null || value === undefined) return '';
    if (format === 'currency') return Number(value).toFixed(2);
    if (format === 'percent') return `${Number(value).toFixed(1)}%`;
    return String(value);
  };

  const headers = columns.map((c) => c.header).join(',');
  const rows = data.map((row) =>
    columns.map((c) => {
      const value = formatValue(row[c.key], c.format);
      if (value.includes(',') || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  return [headers, ...rows].join('\n');
}

// Report Section Component
function ReportSection({
  title,
  description,
  icon,
  data,
  columns,
  totals,
  isLoading,
  onExportPDF,
  onExportCSV,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  data: any[];
  columns: { key: string; header: string; format?: 'currency' | 'percent' | 'text' }[];
  totals?: { label: string; value: string | number; variant?: 'success' | 'warning' | 'destructive' }[];
  isLoading: boolean;
  onExportPDF: () => void;
  onExportCSV: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              {icon}
              <span className="truncate">{title}</span>
            </CardTitle>
            <CardDescription className="text-xs mt-1">{description}</CardDescription>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onExportPDF} disabled={isLoading || data.length === 0}>
              <FileText className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onExportCSV} disabled={isLoading || data.length === 0}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {totals && totals.length > 0 && !isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            {totals.map((item, index) => (
              <div
                key={index}
                className={`p-2 rounded-md text-center ${
                  item.variant === 'success' ? 'bg-success/10' :
                  item.variant === 'warning' ? 'bg-warning/10' :
                  item.variant === 'destructive' ? 'bg-destructive/10' :
                  'bg-muted/50'
                }`}
              >
                <p className="text-[10px] text-muted-foreground uppercase truncate">{item.label}</p>
                <p className={`text-sm font-bold truncate ${
                  item.variant === 'success' ? 'text-success' :
                  item.variant === 'warning' ? 'text-warning' :
                  item.variant === 'destructive' ? 'text-destructive' :
                  'text-foreground'
                }`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            Sem dados para exibir
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[350px]">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left py-2 px-2 font-medium w-10">#</th>
                  {columns.map((col) => (
                    <th key={col.key} className="text-left py-2 px-2 font-medium">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 15).map((row, index) => (
                  <tr key={index} className="border-b border-muted/30 hover:bg-muted/30">
                    <td className="py-2 px-2 text-muted-foreground">{index + 1}</td>
                    {columns.map((col) => (
                      <td key={col.key} className={`py-2 px-2 ${col.format === 'currency' ? 'font-mono text-right' : ''}`}>
                        {col.format === 'currency' ? formatMZN(row[col.key]) :
                         col.format === 'percent' ? `${Number(row[col.key]).toFixed(1)}%` :
                         row[col.key] ?? '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 15 && (
              <p className="text-xs text-muted-foreground text-center py-2 bg-muted/30">
                +{data.length - 15} registos adicionais (visíveis no PDF/Excel)
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RelatoriosFinanceirosPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [activeTab, setActiveTab] = useState('caixa');
  const { toast } = useToast();

  // Filters state
  const [cashBookType, setCashBookType] = useState<'all' | 'Receita' | 'Despesa'>('all');
  const [tuitionStatus, setTuitionStatus] = useState<string>('all');
  const [enrollmentStatus, setEnrollmentStatus] = useState<string>('all');
  const [staffType, setStaffType] = useState<'all' | 'teachers' | 'employees'>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Data hooks
  const { data: classes = [] } = useClasses();
  const { data: cashBookData, isLoading: loadingCashBook } = useCashBookReport({
    year: selectedYear,
    month: selectedMonth || undefined,
    type: cashBookType,
  });
  const { data: enrollmentsData, isLoading: loadingEnrollments } = useEnrollmentsFinancialReport({
    year: selectedYear,
    status: enrollmentStatus,
    classId: selectedClass !== 'all' ? parseInt(selectedClass) : undefined,
  });
  const { data: tuitionData, isLoading: loadingTuition } = useTuitionFeesReport({
    year: selectedYear,
    month: selectedMonth || undefined,
    status: tuitionStatus,
    classId: selectedClass !== 'all' ? parseInt(selectedClass) : undefined,
  });
  const { data: salariesData, isLoading: loadingSalaries } = useSalariesReport({
    year: selectedYear,
    staffType,
  });
  const { data: monthlySummary = [], isLoading: loadingSummary } = useMonthlyFinancialSummary(selectedYear);

  // Generate months for filter
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(selectedYear, i, 1);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM', { locale: pt }),
    };
  });

  // Download CSV handler
  const handleDownloadCSV = (filename: string, data: any[], columns: any[]) => {
    const csv = generateCSV(data, columns);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'CSV exportado', description: 'Ficheiro descarregado com sucesso.' });
  };

  // Tuition status distribution for pie chart
  const tuitionByStatus = [
    { name: 'Pagos', value: tuitionData?.byStatus.pago || 0, color: PIE_COLORS[0] },
    { name: 'Pendentes', value: tuitionData?.byStatus.pendente || 0, color: PIE_COLORS[1] },
    { name: 'Atrasados', value: tuitionData?.byStatus.atrasado || 0, color: PIE_COLORS[2] },
  ];

  // Yearly totals from monthly summary
  const yearlyTotals = monthlySummary.reduce(
    (acc, m) => ({
      receitas: acc.receitas + m.receitas,
      despesas: acc.despesas + m.despesas,
      saldo: acc.saldo + m.saldo,
      propinas: acc.propinas + m.propinas,
    }),
    { receitas: 0, despesas: 0, saldo: 0, propinas: 0 }
  );

  // Column definitions
  const cashBookColumns = [
    { key: 'formatted_date', header: 'Data' },
    { key: 'description', header: 'Descrição' },
    { key: 'category', header: 'Categoria' },
    { key: 'type', header: 'Tipo' },
    { key: 'amount', header: 'Valor', format: 'currency' as const },
    { key: 'balance', header: 'Saldo', format: 'currency' as const },
  ];

  const enrollmentsColumns = [
    { key: 'enrollment_number', header: 'Nº Matrícula' },
    { key: 'student_name', header: 'Educando' },
    { key: 'class_name', header: 'Turma' },
    { key: 'enrollment_date', header: 'Data' },
    { key: 'enrollment_fee', header: 'Taxa Matrícula', format: 'currency' as const },
    { key: 'monthly_fee', header: 'Mensalidade', format: 'currency' as const },
    { key: 'discount_percent', header: 'Desconto', format: 'percent' as const },
    { key: 'status', header: 'Estado' },
  ];

  const tuitionColumns = [
    { key: 'student_name', header: 'Educando' },
    { key: 'class_name', header: 'Turma' },
    { key: 'month', header: 'Mês' },
    { key: 'amount', header: 'Valor', format: 'currency' as const },
    { key: 'due_date', header: 'Vencimento' },
    { key: 'status', header: 'Estado' },
    { key: 'paid_at', header: 'Data Pagamento' },
    { key: 'payment_method', header: 'Método' },
  ];

  const salariesColumns = [
    { key: 'name', header: 'Nome' },
    { key: 'type', header: 'Tipo' },
    { key: 'department', header: 'Departamento' },
    { key: 'role', header: 'Função' },
    { key: 'salary', header: 'Salário', format: 'currency' as const },
    { key: 'contract_type', header: 'Contrato' },
    { key: 'payment_method', header: 'Pagamento' },
  ];

  return (
    <MainLayout 
      title="Relatórios Financeiros" 
      subtitle="Livro Caixa, Matrículas, Propinas e Salários"
    >
      <div className="space-y-4 md:space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Global Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Ano</Label>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger className="mt-1">
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
              <div>
                <Label className="text-xs text-muted-foreground">Mês</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Todos os meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os meses</SelectItem>
                    {months.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Turma</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Todas as turmas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as turmas</SelectItem>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full gap-2" onClick={() => {
                  setSelectedMonth('');
                  setSelectedClass('all');
                  setCashBookType('all');
                  setTuitionStatus('all');
                  setEnrollmentStatus('all');
                  setStaffType('all');
                }}>
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title={`Receitas ${selectedYear}`}
            value={formatMZN(yearlyTotals.receitas)}
            subtitle="Total de entradas"
            icon={TrendingUp}
            colorClass="border-l-success"
            delay={0.1}
          />
          <StatCard
            title={`Despesas ${selectedYear}`}
            value={formatMZN(yearlyTotals.despesas)}
            subtitle="Total de saídas"
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
            title="Taxa Cobrança"
            value={`${tuitionData?.totals.collectionRate.toFixed(1) || 0}%`}
            subtitle={`${tuitionData?.byStatus.pago || 0} propinas pagas`}
            icon={Target}
            colorClass="border-l-chart-1"
            delay={0.4}
          />
        </div>

        {/* Tabs for Reports */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-4 h-auto">
            <TabsTrigger value="caixa" className="text-xs sm:text-sm py-2">
              <BookOpen className="h-4 w-4 mr-1 hidden sm:block" />
              Livro Caixa
            </TabsTrigger>
            <TabsTrigger value="matriculas" className="text-xs sm:text-sm py-2">
              <GraduationCap className="h-4 w-4 mr-1 hidden sm:block" />
              Matrículas
            </TabsTrigger>
            <TabsTrigger value="propinas" className="text-xs sm:text-sm py-2">
              <Wallet className="h-4 w-4 mr-1 hidden sm:block" />
              Propinas
            </TabsTrigger>
            <TabsTrigger value="salarios" className="text-xs sm:text-sm py-2">
              <Users className="h-4 w-4 mr-1 hidden sm:block" />
              Salários
            </TabsTrigger>
          </TabsList>

          {/* LIVRO CAIXA TAB */}
          <TabsContent value="caixa" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-3">
                <div className="flex flex-wrap gap-3 items-center">
                  <div>
                    <Label className="text-xs text-muted-foreground">Tipo de Movimento</Label>
                    <Select value={cashBookType} onValueChange={(v) => setCashBookType(v as any)}>
                      <SelectTrigger className="w-40 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="Receita">Receitas</SelectItem>
                        <SelectItem value="Despesa">Despesas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cash Book Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Fluxo de Caixa Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSummary ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthlySummary} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={40} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="receitas" name="Receitas" fill={COLORS.receitas} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="despesas" name="Despesas" fill={COLORS.despesas} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Cash Book Table */}
            <ReportSection
              title="Livro Caixa"
              description={`Movimentações financeiras de ${selectedMonth ? months.find(m => m.value === selectedMonth)?.label : selectedYear}`}
              icon={<BookOpen className="h-5 w-5 text-primary" />}
              data={cashBookData?.data || []}
              columns={cashBookColumns}
              totals={[
                { label: 'Total Receitas', value: formatMZN(cashBookData?.totals.receitas || 0), variant: 'success' },
                { label: 'Total Despesas', value: formatMZN(cashBookData?.totals.despesas || 0), variant: 'destructive' },
                { label: 'Saldo Período', value: formatMZN(cashBookData?.totals.saldo || 0), variant: (cashBookData?.totals.saldo || 0) >= 0 ? 'success' : 'destructive' },
                { label: 'Movimentos', value: cashBookData?.data.length || 0 },
              ]}
              isLoading={loadingCashBook}
              onExportPDF={() => {
                generatePDF(
                  'Livro Caixa',
                  selectedMonth ? months.find(m => m.value === selectedMonth)?.label || '' : `Ano ${selectedYear}`,
                  cashBookData?.data || [],
                  cashBookColumns,
                  [
                    { label: 'Total Receitas', value: formatMZN(cashBookData?.totals.receitas || 0) },
                    { label: 'Total Despesas', value: formatMZN(cashBookData?.totals.despesas || 0) },
                    { label: 'Saldo', value: formatMZN(cashBookData?.totals.saldo || 0) },
                  ]
                );
                toast({ title: 'PDF gerado', description: 'Seleccione "Guardar como PDF" para salvar.' });
              }}
              onExportCSV={() => handleDownloadCSV('livro_caixa', cashBookData?.data || [], cashBookColumns)}
            />
          </TabsContent>

          {/* MATRÍCULAS TAB */}
          <TabsContent value="matriculas" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-3">
                <div className="flex flex-wrap gap-3 items-center">
                  <div>
                    <Label className="text-xs text-muted-foreground">Estado</Label>
                    <Select value={enrollmentStatus} onValueChange={setEnrollmentStatus}>
                      <SelectTrigger className="w-40 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="APROVADA">Aprovada</SelectItem>
                        <SelectItem value="PENDENTE">Pendente</SelectItem>
                        <SelectItem value="EM_ANALISE">Em Análise</SelectItem>
                        <SelectItem value="CANCELADA">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ReportSection
              title="Relatório de Matrículas"
              description="Taxas de matrícula e mensalidades por educando"
              icon={<GraduationCap className="h-5 w-5 text-primary" />}
              data={enrollmentsData?.data || []}
              columns={enrollmentsColumns}
              totals={[
                { label: 'Total Matrículas', value: enrollmentsData?.totals.count || 0 },
                { label: 'Taxas Matrícula', value: formatMZN(enrollmentsData?.totals.enrollmentFees || 0), variant: 'success' },
                { label: 'Mensalidades', value: formatMZN(enrollmentsData?.totals.monthlyFees || 0) },
                { label: 'Projecção Anual', value: formatMZN(enrollmentsData?.totals.annualProjected || 0), variant: 'success' },
              ]}
              isLoading={loadingEnrollments}
              onExportPDF={() => {
                generatePDF(
                  'Relatório de Matrículas',
                  `Ano Lectivo ${selectedYear}`,
                  enrollmentsData?.data || [],
                  enrollmentsColumns,
                  [
                    { label: 'Total Matrículas', value: enrollmentsData?.totals.count || 0 },
                    { label: 'Taxas Matrícula', value: formatMZN(enrollmentsData?.totals.enrollmentFees || 0) },
                    { label: 'Projecção Anual', value: formatMZN(enrollmentsData?.totals.annualProjected || 0) },
                  ]
                );
                toast({ title: 'PDF gerado', description: 'Seleccione "Guardar como PDF" para salvar.' });
              }}
              onExportCSV={() => handleDownloadCSV('matriculas', enrollmentsData?.data || [], enrollmentsColumns)}
            />
          </TabsContent>

          {/* PROPINAS TAB */}
          <TabsContent value="propinas" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-3">
                <div className="flex flex-wrap gap-3 items-center">
                  <div>
                    <Label className="text-xs text-muted-foreground">Estado</Label>
                    <Select value={tuitionStatus} onValueChange={setTuitionStatus}>
                      <SelectTrigger className="w-40 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="Pago">Pago</SelectItem>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Atrasado">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Estado das Propinas</CardTitle>
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

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Arrecadação Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingSummary ? (
                    <div className="h-[180px] flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={monthlySummary} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPropinas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.saldo} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={COLORS.saldo} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={35} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="propinas" name="Propinas Pagas" stroke={COLORS.saldo} fill="url(#colorPropinas)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <ReportSection
              title="Relatório de Propinas"
              description="Pagamentos de propinas por educando"
              icon={<Wallet className="h-5 w-5 text-primary" />}
              data={tuitionData?.data || []}
              columns={tuitionColumns}
              totals={[
                { label: 'Total Esperado', value: formatMZN(tuitionData?.totals.expected || 0) },
                { label: 'Total Pago', value: formatMZN(tuitionData?.totals.paid || 0), variant: 'success' },
                { label: 'Pendente', value: formatMZN(tuitionData?.totals.pending || 0), variant: 'warning' },
                { label: 'Em Atraso', value: formatMZN(tuitionData?.totals.overdue || 0), variant: 'destructive' },
              ]}
              isLoading={loadingTuition}
              onExportPDF={() => {
                generatePDF(
                  'Relatório de Propinas',
                  selectedMonth ? months.find(m => m.value === selectedMonth)?.label || '' : `Ano ${selectedYear}`,
                  tuitionData?.data || [],
                  tuitionColumns,
                  [
                    { label: 'Total Esperado', value: formatMZN(tuitionData?.totals.expected || 0) },
                    { label: 'Total Pago', value: formatMZN(tuitionData?.totals.paid || 0) },
                    { label: 'Taxa Cobrança', value: `${tuitionData?.totals.collectionRate.toFixed(1)}%` },
                  ]
                );
                toast({ title: 'PDF gerado', description: 'Seleccione "Guardar como PDF" para salvar.' });
              }}
              onExportCSV={() => handleDownloadCSV('propinas', tuitionData?.data || [], tuitionColumns)}
            />
          </TabsContent>

          {/* SALÁRIOS TAB */}
          <TabsContent value="salarios" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-3">
                <div className="flex flex-wrap gap-3 items-center">
                  <div>
                    <Label className="text-xs text-muted-foreground">Tipo</Label>
                    <Select value={staffType} onValueChange={(v) => setStaffType(v as any)}>
                      <SelectTrigger className="w-40 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="teachers">Professores</SelectItem>
                        <SelectItem value="employees">Funcionários</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ReportSection
              title="Folha de Salários"
              description="Salários de professores e colaboradores"
              icon={<Users className="h-5 w-5 text-primary" />}
              data={salariesData?.data || []}
              columns={salariesColumns}
              totals={[
                { label: 'Total Colaboradores', value: salariesData?.totals.count || 0 },
                { label: 'Professores', value: `${salariesData?.totals.teachersCount || 0} (${formatMZN(salariesData?.totals.teachersTotal || 0)})` },
                { label: 'Funcionários', value: `${salariesData?.totals.employeesCount || 0} (${formatMZN(salariesData?.totals.employeesTotal || 0)})` },
                { label: 'Total Salários', value: formatMZN(salariesData?.totals.totalSalaries || 0), variant: 'destructive' },
              ]}
              isLoading={loadingSalaries}
              onExportPDF={() => {
                generatePDF(
                  'Folha de Salários',
                  `${staffType === 'teachers' ? 'Professores' : staffType === 'employees' ? 'Funcionários' : 'Todos os Colaboradores'}`,
                  salariesData?.data || [],
                  salariesColumns,
                  [
                    { label: 'Total Colaboradores', value: salariesData?.totals.count || 0 },
                    { label: 'Total Salários', value: formatMZN(salariesData?.totals.totalSalaries || 0) },
                    { label: 'Média Salarial', value: formatMZN(salariesData?.totals.averageSalary || 0) },
                  ]
                );
                toast({ title: 'PDF gerado', description: 'Seleccione "Guardar como PDF" para salvar.' });
              }}
              onExportCSV={() => handleDownloadCSV('salarios', salariesData?.data || [], salariesColumns)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
