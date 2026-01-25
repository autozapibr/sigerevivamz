/**
 * Financial Excel Exporter
 * Professional accounting-grade Excel export for SGE REVIVA
 */
import * as XLSX from 'xlsx';
import { formatMZN } from '@/lib/validators/mozambique';

export interface FinancialReportData {
  title: string;
  period: string;
  generatedAt: Date;
  schoolName?: string;
  nuit?: string;
  summary: {
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
    taxaAdimplencia?: number;
  };
  monthlyData: {
    month: string;
    receitas: number;
    despesas: number;
    propinas: number;
    saldo: number;
  }[];
  tuitionData?: {
    studentName: string;
    month: string;
    amount: number;
    status: string;
    dueDate?: string;
  }[];
  transactions?: {
    date: string;
    description: string;
    type: string;
    amount: number;
    category?: string;
  }[];
}

// Format date for Mozambique locale
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

// Format number as MZN for Excel (without symbol for numeric operations)
const formatNumber = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export const generateFinancialExcel = (data: FinancialReportData): void => {
  const workbook = XLSX.utils.book_new();

  // ==================== RESUMO SHEET ====================
  const summaryData = [
    ['RELATÓRIO FINANCEIRO - SGE REVIVA'],
    [''],
    ['Instituição:', data.schoolName || 'Escola REVIVA'],
    ['NUIT:', data.nuit || 'N/A'],
    ['Período:', data.period],
    ['Gerado em:', formatDate(data.generatedAt)],
    [''],
    ['═══════════════════════════════════════'],
    ['RESUMO EXECUTIVO'],
    ['═══════════════════════════════════════'],
    [''],
    ['Indicador', 'Valor (MZN)'],
    ['Total de Receitas', formatNumber(data.summary.totalReceitas)],
    ['Total de Despesas', formatNumber(data.summary.totalDespesas)],
    ['Saldo do Período', formatNumber(data.summary.saldo)],
    ['Taxa de Adimplência', data.summary.taxaAdimplencia ? `${data.summary.taxaAdimplencia}%` : 'N/A'],
    [''],
    ['Margem Operacional', data.summary.totalReceitas > 0 
      ? `${((data.summary.saldo / data.summary.totalReceitas) * 100).toFixed(1)}%` 
      : '0%'
    ],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths
  summarySheet['!cols'] = [
    { wch: 25 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

  // ==================== FLUXO MENSAL SHEET ====================
  const monthlyHeaders = ['Mês', 'Receitas (MZN)', 'Despesas (MZN)', 'Propinas (MZN)', 'Saldo (MZN)', 'Margem (%)'];
  
  const monthlyRows = data.monthlyData.map(m => [
    m.month,
    formatNumber(m.receitas),
    formatNumber(m.despesas),
    formatNumber(m.propinas),
    formatNumber(m.saldo),
    m.receitas > 0 ? `${((m.saldo / m.receitas) * 100).toFixed(1)}%` : '0%'
  ]);

  // Add totals row
  const totals = data.monthlyData.reduce(
    (acc, m) => ({
      receitas: acc.receitas + m.receitas,
      despesas: acc.despesas + m.despesas,
      propinas: acc.propinas + m.propinas,
      saldo: acc.saldo + m.saldo,
    }),
    { receitas: 0, despesas: 0, propinas: 0, saldo: 0 }
  );

  monthlyRows.push([
    'TOTAL',
    formatNumber(totals.receitas),
    formatNumber(totals.despesas),
    formatNumber(totals.propinas),
    formatNumber(totals.saldo),
    totals.receitas > 0 ? `${((totals.saldo / totals.receitas) * 100).toFixed(1)}%` : '0%'
  ]);

  const monthlySheetData = [
    ['FLUXO DE CAIXA MENSAL'],
    ['Período:', data.period],
    [''],
    monthlyHeaders,
    ...monthlyRows
  ];

  const monthlySheet = XLSX.utils.aoa_to_sheet(monthlySheetData);
  
  monthlySheet['!cols'] = [
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Fluxo Mensal');

  // ==================== PROPINAS SHEET (if data exists) ====================
  if (data.tuitionData && data.tuitionData.length > 0) {
    const tuitionHeaders = ['Educando', 'Mês', 'Valor (MZN)', 'Estado', 'Data Vencimento'];
    
    const tuitionRows = data.tuitionData.map(t => [
      t.studentName,
      t.month,
      formatNumber(t.amount),
      t.status,
      t.dueDate || 'N/A'
    ]);

    const tuitionSheetData = [
      ['RELATÓRIO DE PROPINAS'],
      ['Período:', data.period],
      ['Total de Registos:', data.tuitionData.length],
      [''],
      tuitionHeaders,
      ...tuitionRows
    ];

    const tuitionSheet = XLSX.utils.aoa_to_sheet(tuitionSheetData);
    
    tuitionSheet['!cols'] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 18 },
    ];

    XLSX.utils.book_append_sheet(workbook, tuitionSheet, 'Propinas');
  }

  // ==================== TRANSACÇÕES SHEET (if data exists) ====================
  if (data.transactions && data.transactions.length > 0) {
    const transHeaders = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor (MZN)'];
    
    const transRows = data.transactions.map(t => [
      t.date,
      t.description,
      t.type,
      t.category || 'N/A',
      formatNumber(t.amount)
    ]);

    const transSheetData = [
      ['LIVRO DE TRANSACÇÕES'],
      ['Período:', data.period],
      ['Total de Registos:', data.transactions.length],
      [''],
      transHeaders,
      ...transRows
    ];

    const transSheet = XLSX.utils.aoa_to_sheet(transSheetData);
    
    transSheet['!cols'] = [
      { wch: 12 },
      { wch: 40 },
      { wch: 12 },
      { wch: 20 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(workbook, transSheet, 'Transacções');
  }

  // Generate filename
  const filename = `Relatorio_Financeiro_${data.period.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Download file
  XLSX.writeFile(workbook, filename);
};

// Export monthly summary as a simple Excel
export const exportSimpleFinancialExcel = (
  monthlyData: { month: string; receitas: number; despesas: number; propinas: number; saldo: number }[],
  year: number
): void => {
  const data: FinancialReportData = {
    title: 'Relatório Financeiro',
    period: `Ano ${year}`,
    generatedAt: new Date(),
    schoolName: 'Escola REVIVA',
    summary: {
      totalReceitas: monthlyData.reduce((acc, m) => acc + m.receitas, 0),
      totalDespesas: monthlyData.reduce((acc, m) => acc + m.despesas, 0),
      saldo: monthlyData.reduce((acc, m) => acc + m.saldo, 0),
    },
    monthlyData,
  };

  generateFinancialExcel(data);
};
