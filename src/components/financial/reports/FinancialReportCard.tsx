import { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  Share2, 
  Mail, 
  MessageCircle,
  Copy,
  Check,
  Loader2,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { formatMZN } from '@/lib/validators/mozambique';

export interface ReportColumn {
  key: string;
  header: string;
  format?: 'currency' | 'percent' | 'date' | 'text';
}

export interface FinancialReportCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  data: any[];
  columns: ReportColumn[];
  summary?: {
    label: string;
    value: string | number;
    variant?: 'default' | 'success' | 'warning' | 'destructive';
  }[];
  isLoading?: boolean;
  children?: React.ReactNode;
}

// Generate PDF from report data
function generateReportPDF(
  title: string,
  data: any[],
  columns: ReportColumn[],
  summary?: { label: string; value: string | number }[]
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return false;

  const formatValue = (value: any, format?: string) => {
    if (value === null || value === undefined) return '-';
    if (format === 'currency') return formatMZN(Number(value));
    if (format === 'percent') return `${Number(value).toFixed(1)}%`;
    return String(value);
  };

  const tableRows = data.map((row) =>
    `<tr>${columns.map((c) => `<td style="border:1px solid #ddd;padding:10px;${c.format === 'currency' ? 'text-align:right;font-family:monospace;' : ''}">${formatValue(row[c.key], c.format)}</td>`).join('')}</tr>`
  ).join('');

  const summaryCards = summary?.map(s => `
    <div class="summary-card">
      <div class="label">${s.label}</div>
      <div class="value">${s.value}</div>
    </div>
  `).join('') || '';

  const html = `
    <!DOCTYPE html>
    <html lang="pt-MZ">
      <head>
        <meta charset="UTF-8">
        <title>${title} - SiGER</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: A4; margin: 15mm; }
          body { 
            font-family: 'Segoe UI', Tahoma, sans-serif; 
            font-size: 10pt;
            color: #1a1a1a;
          }
          .container { max-width: 210mm; margin: 0 auto; padding: 20px; }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #2D5F3F;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .logo h1 { color: #2D5F3F; font-size: 20pt; }
          .logo h2 { color: #4A7C59; font-size: 9pt; margin-top: 4px; }
          .institution { text-align: right; font-size: 9pt; color: #666; }
          .institution strong { color: #1a1a1a; display: block; font-size: 11pt; margin-bottom: 4px; }
          .doc-title { text-align: center; margin: 25px 0; }
          .doc-title h2 { font-size: 16pt; color: #2D5F3F; text-transform: uppercase; letter-spacing: 1px; }
          .doc-title .meta { font-size: 10pt; color: #666; margin-top: 5px; }
          .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 20px 0; }
          .summary-card { 
            border: 1px solid #e0e0e0; 
            border-radius: 6px; 
            padding: 12px; 
            text-align: center;
            background: #f8f9fa;
          }
          .summary-card.success { border-left: 3px solid #22c55e; }
          .summary-card.warning { border-left: 3px solid #f59e0b; }
          .summary-card.destructive { border-left: 3px solid #ef4444; }
          .summary-card .label { font-size: 8pt; color: #666; text-transform: uppercase; margin-bottom: 5px; }
          .summary-card .value { font-size: 12pt; font-weight: 700; }
          .summary-card.success .value { color: #22c55e; }
          .summary-card.warning .value { color: #f59e0b; }
          .summary-card.destructive .value { color: #ef4444; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 9pt; }
          thead { background: #2D5F3F; color: white; }
          th { padding: 10px 8px; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 8pt; }
          td { padding: 8px; border-bottom: 1px solid #e8e8e8; }
          tbody tr:nth-child(even) { background: #f9fafb; }
          .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 8pt; color: #666; display: flex; justify-content: space-between; }
          .signatures { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
          .sig-box { text-align: center; }
          .sig-line { border-top: 1px solid #1a1a1a; margin-top: 50px; padding-top: 8px; font-size: 9pt; }
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
            <p class="meta">Gerado em ${new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' })} | Total: ${data.length} registos</p>
          </div>

          ${summaryCards ? `<div class="summary-grid">${summaryCards}</div>` : ''}
          
          <table>
            <thead>
              <tr>${columns.map((c) => `<th>${c.header}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          
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

export function FinancialReportCard({
  title,
  description,
  icon,
  data,
  columns,
  summary,
  isLoading,
  children
}: FinancialReportCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const formatValue = (value: any, format?: string) => {
    if (value === null || value === undefined) return '-';
    if (format === 'currency') return formatMZN(Number(value));
    if (format === 'percent') return `${Number(value).toFixed(1)}%`;
    return String(value);
  };

  // Generate CSV
  const generateCSV = () => {
    const headers = columns.map((c) => c.header).join(',');
    const rows = data.map((row) =>
      columns.map((c) => {
        const value = formatValue(row[c.key], c.format);
        const strValue = String(value);
        if (strValue.includes(',') || strValue.includes('"')) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      }).join(',')
    );
    return [headers, ...rows].join('\n');
  };

  // Download CSV
  const handleDownloadCSV = () => {
    setIsExporting(true);
    try {
      const csv = generateCSV();
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Download iniciado',
        description: 'O ficheiro CSV foi descarregado.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Generate PDF/Print
  const handlePrint = () => {
    setIsExporting(true);
    try {
      const success = generateReportPDF(title, data, columns, summary?.map(s => ({ label: s.label, value: String(s.value) })));
      if (success) {
        toast({
          title: 'PDF gerado',
          description: 'Seleccione "Guardar como PDF" na janela de impressão.',
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    const summaryText = summary?.map(s => `• ${s.label}: ${s.value}`).join('\n') || '';
    const message = `📊 *${title}*\n\n` +
      `📅 Data: ${new Date().toLocaleDateString('pt-MZ')}\n` +
      `📈 Total de registos: ${data.length}\n\n` +
      (summaryText ? `*Resumo:*\n${summaryText}\n\n` : '') +
      `_Relatório gerado pelo SiGER_`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Share via Email
  const handleShareEmail = () => {
    const summaryText = summary?.map(s => `• ${s.label}: ${s.value}`).join('\n') || '';
    const subject = `Relatório: ${title} - SiGER`;
    const body = `Relatório: ${title}\n\n` +
      `Data: ${new Date().toLocaleDateString('pt-MZ')}\n` +
      `Total de registos: ${data.length}\n\n` +
      (summaryText ? `Resumo:\n${summaryText}\n\n` : '') +
      `---\nRelatório gerado pelo SiGER - Sistema de Gestão Escolar REVIVA`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Copy summary
  const handleCopy = async () => {
    const summaryText = summary?.map(s => `${s.label}: ${s.value}`).join('\n') || '';
    const text = `${title}\n` +
      `Data: ${new Date().toLocaleDateString('pt-MZ')}\n` +
      `Total de registos: ${data.length}\n\n` +
      (summaryText ? `Resumo:\n${summaryText}` : '');
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: 'Copiado!',
      description: 'Resumo copiado para a área de transferência.',
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              {icon}
              <span className="truncate">{title}</span>
            </CardTitle>
            {description && (
              <CardDescription className="text-xs mt-1">{description}</CardDescription>
            )}
          </div>
          
          <TooltipProvider>
            <div className="flex items-center gap-1 shrink-0">
              {/* PDF/Print */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handlePrint}
                    disabled={isLoading || isExporting || data.length === 0}
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>PDF / Imprimir</TooltipContent>
              </Tooltip>

              {/* Download CSV */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleDownloadCSV}
                    disabled={isLoading || isExporting || data.length === 0}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Descarregar CSV</TooltipContent>
              </Tooltip>

              {/* Share Dropdown */}
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        disabled={isLoading || data.length === 0}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Partilhar</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={handleShareWhatsApp}>
                    <MessageCircle className="w-4 h-4 mr-2 text-primary" />
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareEmail}>
                    <Mail className="w-4 h-4 mr-2 text-primary" />
                    E-mail
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleCopy}>
                    {copied ? (
                      <Check className="w-4 h-4 mr-2 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    Copiar resumo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TooltipProvider>
        </div>

        {/* Summary Cards */}
        {summary && summary.length > 0 && !isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            {summary.map((item, index) => (
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
          <>
            {children || (
              <div className="overflow-x-auto max-h-[300px]">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      {columns.map((col) => (
                        <th key={col.key} className="text-left py-2 px-2 font-medium">
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-b border-muted/30 hover:bg-muted/30">
                        {columns.map((col) => (
                          <td key={col.key} className="py-2 px-2">
                            {formatValue(row[col.key], col.format)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    +{data.length - 10} registos adicionais (visíveis no PDF/Excel)
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
