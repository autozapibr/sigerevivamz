import { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Share2, 
  Mail, 
  MessageCircle,
  Copy,
  Check
} from 'lucide-react';
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

interface ReportActionsProps {
  reportTitle: string;
  data: any[];
  columns: { key: string; header: string }[];
}

export function ReportActions({ reportTitle, data, columns }: ReportActionsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Generate CSV content
  const generateCSV = () => {
    const headers = columns.map((c) => c.header).join(',');
    const rows = data.map((row) =>
      columns.map((c) => {
        const value = row[c.key];
        // Escape quotes and wrap in quotes if contains comma
        const strValue = String(value ?? '');
        if (strValue.includes(',') || strValue.includes('"')) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      }).join(',')
    );
    return [headers, ...rows].join('\n');
  };

  // Download as CSV/Excel
  const handleDownloadExcel = () => {
    const csv = generateCSV();
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Download iniciado',
      description: 'O ficheiro CSV foi descarregado.',
    });
  };

  // Print report
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableRows = data.map((row) =>
      `<tr>${columns.map((c) => `<td style="border:1px solid #ddd;padding:8px;">${row[c.key] ?? '-'}</td>`).join('')}</tr>`
    ).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle} - SiGER</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              color: #333;
            }
            h1 { 
              color: #2D5F3F; 
              border-bottom: 2px solid #2D5F3F;
              padding-bottom: 10px;
            }
            .meta {
              color: #666;
              margin-bottom: 20px;
              font-size: 12px;
            }
            table { 
              border-collapse: collapse; 
              width: 100%;
              margin-top: 20px;
            }
            th { 
              background: #2D5F3F; 
              color: white; 
              padding: 10px 8px;
              text-align: left;
            }
            td { 
              border: 1px solid #ddd; 
              padding: 8px;
            }
            tr:nth-child(even) { background: #f9f9f9; }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #999;
              font-size: 10px;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>📊 ${reportTitle}</h1>
          <div class="meta">
            <strong>Data:</strong> ${new Date().toLocaleDateString('pt-MZ')} |
            <strong>Total de registos:</strong> ${data.length}
          </div>
          <table>
            <thead>
              <tr>${columns.map((c) => `<th>${c.header}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="footer">
            Relatório gerado pelo SiGER - Sistema de Gestão Escolar REVIVA
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    const summary = `📊 *${reportTitle}*\n\n` +
      `📅 Data: ${new Date().toLocaleDateString('pt-MZ')}\n` +
      `📈 Total de registos: ${data.length}\n\n` +
      `_Relatório gerado pelo SiGER_`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(summary)}`;
    window.open(url, '_blank');
  };

  // Share via Email
  const handleShareEmail = () => {
    const subject = `Relatório: ${reportTitle} - SiGER`;
    const body = `Relatório: ${reportTitle}\n\n` +
      `Data: ${new Date().toLocaleDateString('pt-MZ')}\n` +
      `Total de registos: ${data.length}\n\n` +
      `---\nRelatório gerado pelo SiGER - Sistema de Gestão Escolar REVIVA`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Copy summary to clipboard
  const handleCopy = async () => {
    const summary = `${reportTitle}\n` +
      `Data: ${new Date().toLocaleDateString('pt-MZ')}\n` +
      `Total de registos: ${data.length}`;
    
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: 'Copiado!',
      description: 'Resumo copiado para a área de transferência.',
    });
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {/* Download Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={handleDownloadExcel}
            >
              <FileSpreadsheet className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Exportar para Excel/CSV</p>
          </TooltipContent>
        </Tooltip>

        {/* Print Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Imprimir relatório</p>
          </TooltipContent>
        </Tooltip>

        {/* Share Dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Share2 className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Partilhar / Enviar</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="bg-popover w-48">
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
  );
}
