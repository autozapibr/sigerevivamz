/**
 * Financial PDF Exporter
 * Professional accounting-grade PDF generation for SGE REVIVA
 */
import { formatMZN } from '@/lib/validators/mozambique';

export interface FinancialPDFData {
  title: string;
  period: string;
  generatedAt: Date;
  schoolName?: string;
  nuit?: string;
  address?: string;
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
}

// Format date for Mozambique locale
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('pt-MZ', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const generateFinancialPDF = (data: FinancialPDFData): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita popups para gerar o relatório PDF.');
    return;
  }

  const yearlyTotals = data.monthlyData.reduce(
    (acc, m) => ({
      receitas: acc.receitas + m.receitas,
      despesas: acc.despesas + m.despesas,
      propinas: acc.propinas + m.propinas,
      saldo: acc.saldo + m.saldo,
    }),
    { receitas: 0, despesas: 0, propinas: 0, saldo: 0 }
  );

  const margin = yearlyTotals.receitas > 0 
    ? ((yearlyTotals.saldo / yearlyTotals.receitas) * 100).toFixed(1) 
    : '0';

  const monthlyRows = data.monthlyData.map(m => `
    <tr>
      <td class="month-cell">${m.month}</td>
      <td class="amount-cell positive">${formatMZN(m.receitas)}</td>
      <td class="amount-cell negative">${formatMZN(m.despesas)}</td>
      <td class="amount-cell">${formatMZN(m.propinas)}</td>
      <td class="amount-cell ${m.saldo >= 0 ? 'positive' : 'negative'}">${formatMZN(m.saldo)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="pt-MZ">
      <head>
        <meta charset="UTF-8">
        <title>${data.title} - SiGER</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #1a1a1a;
            background: white;
          }
          
          .container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
          }
          
          /* Header */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #2D5F3F;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          
          .logo-section h1 {
            color: #2D5F3F;
            font-size: 24pt;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          
          .logo-section h2 {
            color: #4A7C59;
            font-size: 10pt;
            font-weight: 500;
            margin-top: 4px;
          }
          
          .institution-info {
            text-align: right;
            font-size: 9pt;
            color: #666;
          }
          
          .institution-info strong {
            color: #1a1a1a;
            display: block;
            font-size: 11pt;
            margin-bottom: 4px;
          }
          
          /* Document Title */
          .doc-title {
            text-align: center;
            margin: 30px 0;
          }
          
          .doc-title h2 {
            font-size: 18pt;
            color: #2D5F3F;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 8px;
          }
          
          .doc-title .period {
            font-size: 12pt;
            color: #666;
          }
          
          /* Summary Cards */
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin: 25px 0;
          }
          
          .summary-card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          }
          
          .summary-card.positive { border-left: 4px solid #22c55e; }
          .summary-card.negative { border-left: 4px solid #ef4444; }
          .summary-card.neutral { border-left: 4px solid #2D5F3F; }
          .summary-card.info { border-left: 4px solid #3b82f6; }
          
          .summary-card .label {
            font-size: 9pt;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          
          .summary-card .value {
            font-size: 14pt;
            font-weight: 700;
          }
          
          .summary-card.positive .value { color: #22c55e; }
          .summary-card.negative .value { color: #ef4444; }
          .summary-card.neutral .value { color: #2D5F3F; }
          .summary-card.info .value { color: #3b82f6; }
          
          /* Data Table */
          .section-title {
            font-size: 12pt;
            color: #2D5F3F;
            font-weight: 600;
            margin: 30px 0 15px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #e0e0e0;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 10pt;
          }
          
          thead {
            background: #2D5F3F;
            color: white;
          }
          
          th {
            padding: 12px 10px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 8pt;
            letter-spacing: 0.5px;
          }
          
          th:not(:first-child) {
            text-align: right;
          }
          
          td {
            padding: 10px;
            border-bottom: 1px solid #e8e8e8;
          }
          
          tbody tr:nth-child(even) {
            background: #f9fafb;
          }
          
          tbody tr:hover {
            background: #f1f5f9;
          }
          
          .month-cell {
            font-weight: 500;
            text-transform: capitalize;
          }
          
          .amount-cell {
            text-align: right;
            font-family: 'Consolas', 'Monaco', monospace;
          }
          
          .amount-cell.positive { color: #22c55e; }
          .amount-cell.negative { color: #ef4444; }
          
          tfoot {
            background: #f1f5f9;
            font-weight: 700;
          }
          
          tfoot td {
            padding: 12px 10px;
            border-top: 2px solid #2D5F3F;
          }
          
          /* Analysis Section */
          .analysis-section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
          }
          
          .analysis-section h4 {
            color: #2D5F3F;
            font-size: 11pt;
            margin-bottom: 12px;
          }
          
          .analysis-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dashed #e2e8f0;
          }
          
          .analysis-item:last-child {
            border-bottom: none;
          }
          
          .analysis-item .label { color: #64748b; }
          .analysis-item .value { font-weight: 600; }
          
          /* Footer */
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            font-size: 8pt;
            color: #666;
          }
          
          .signature-section {
            margin-top: 50px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
          }
          
          .signature-box {
            text-align: center;
          }
          
          .signature-line {
            border-top: 1px solid #1a1a1a;
            margin-top: 50px;
            padding-top: 8px;
            font-size: 9pt;
          }
          
          .watermark {
            position: fixed;
            bottom: 10mm;
            right: 10mm;
            font-size: 7pt;
            color: #999;
          }
          
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .container { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="logo-section">
              <h1>📊 SiGER</h1>
              <h2>Sistema de Gestão Escolar REVIVA</h2>
            </div>
            <div class="institution-info">
              <strong>${data.schoolName || 'Escola REVIVA'}</strong>
              NUIT: ${data.nuit || 'N/A'}<br>
              ${data.address || 'Maputo, Moçambique'}
            </div>
          </div>
          
          <!-- Document Title -->
          <div class="doc-title">
            <h2>${data.title}</h2>
            <p class="period">${data.period}</p>
          </div>
          
          <!-- Summary Cards -->
          <div class="summary-grid">
            <div class="summary-card positive">
              <div class="label">Total Receitas</div>
              <div class="value">${formatMZN(yearlyTotals.receitas)}</div>
            </div>
            <div class="summary-card negative">
              <div class="label">Total Despesas</div>
              <div class="value">${formatMZN(yearlyTotals.despesas)}</div>
            </div>
            <div class="summary-card ${yearlyTotals.saldo >= 0 ? 'neutral' : 'negative'}">
              <div class="label">Saldo do Período</div>
              <div class="value">${formatMZN(yearlyTotals.saldo)}</div>
            </div>
            <div class="summary-card info">
              <div class="label">Taxa Adimplência</div>
              <div class="value">${data.summary.taxaAdimplencia || 0}%</div>
            </div>
          </div>
          
          <!-- Monthly Table -->
          <h3 class="section-title">Demonstrativo Mensal de Fluxo de Caixa</h3>
          <table>
            <thead>
              <tr>
                <th>Mês</th>
                <th>Receitas</th>
                <th>Despesas</th>
                <th>Propinas</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyRows}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>TOTAL</strong></td>
                <td class="amount-cell positive">${formatMZN(yearlyTotals.receitas)}</td>
                <td class="amount-cell negative">${formatMZN(yearlyTotals.despesas)}</td>
                <td class="amount-cell">${formatMZN(yearlyTotals.propinas)}</td>
                <td class="amount-cell ${yearlyTotals.saldo >= 0 ? 'positive' : 'negative'}">${formatMZN(yearlyTotals.saldo)}</td>
              </tr>
            </tfoot>
          </table>
          
          <!-- Analysis Section -->
          <div class="analysis-section">
            <h4>Análise Financeira</h4>
            <div class="analysis-item">
              <span class="label">Margem Operacional</span>
              <span class="value">${margin}%</span>
            </div>
            <div class="analysis-item">
              <span class="label">Média Mensal de Receitas</span>
              <span class="value">${formatMZN(yearlyTotals.receitas / (data.monthlyData.length || 1))}</span>
            </div>
            <div class="analysis-item">
              <span class="label">Média Mensal de Despesas</span>
              <span class="value">${formatMZN(yearlyTotals.despesas / (data.monthlyData.length || 1))}</span>
            </div>
            <div class="analysis-item">
              <span class="label">Total de Propinas Recebidas</span>
              <span class="value">${formatMZN(yearlyTotals.propinas)}</span>
            </div>
          </div>
          
          <!-- Signature Section -->
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line">
                Director(a) da Escola
              </div>
            </div>
            <div class="signature-box">
              <div class="signature-line">
                Responsável Financeiro
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <span>Gerado em: ${formatDate(data.generatedAt)} às ${formatTime(data.generatedAt)}</span>
            <span>Documento gerado pelo SiGER - Sistema de Gestão Escolar REVIVA</span>
          </div>
          
          <div class="watermark">
            SiGER v1.0 | ${formatDate(new Date())}
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

// Simple export function
export const exportFinancialPDF = (
  monthlyData: { month: string; receitas: number; despesas: number; propinas: number; saldo: number }[],
  year: number,
  taxaAdimplencia?: number
): void => {
  const data: FinancialPDFData = {
    title: 'Relatório Financeiro',
    period: `Ano Lectivo ${year}`,
    generatedAt: new Date(),
    schoolName: 'Escola REVIVA',
    nuit: '400000000',
    address: 'Maputo, Moçambique',
    summary: {
      totalReceitas: monthlyData.reduce((acc, m) => acc + m.receitas, 0),
      totalDespesas: monthlyData.reduce((acc, m) => acc + m.despesas, 0),
      saldo: monthlyData.reduce((acc, m) => acc + m.saldo, 0),
      taxaAdimplencia,
    },
    monthlyData,
  };

  generateFinancialPDF(data);
};
