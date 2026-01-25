import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface ReportColumn {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any, row: any) => React.ReactNode;
}

interface ReportTableProps {
  columns: ReportColumn[];
  data: any[];
  isLoading?: boolean;
}

export function ReportTable({ columns, data, isLoading }: ReportTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    const aStr = String(aVal ?? '').toLowerCase();
    const bStr = String(bVal ?? '').toLowerCase();
    return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const getSortIcon = (key: string) => {
    if (sortKey !== key) {
      return <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground/50" />;
    }
    return sortDir === 'asc' 
      ? <ChevronUp className="w-3.5 h-3.5" /> 
      : <ChevronDown className="w-3.5 h-3.5" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <div className="animate-pulse">A carregar dados...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <p className="text-lg">Sem dados para exibir</p>
        <p className="text-sm">Ajuste os filtros para ver resultados</p>
      </div>
    );
  }

  return (
    <ScrollArea className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "cursor-pointer hover:bg-muted/80 transition-colors whitespace-nowrap",
                  col.align === 'center' && "text-center",
                  col.align === 'right' && "text-right"
                )}
                onClick={() => handleSort(col.key)}
              >
                <div className={cn(
                  "flex items-center gap-1",
                  col.align === 'center' && "justify-center",
                  col.align === 'right' && "justify-end"
                )}>
                  {col.header}
                  {getSortIcon(col.key)}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, rowIdx) => (
            <TableRow key={rowIdx} className="hover:bg-muted/30">
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap",
                    col.align === 'center' && "text-center",
                    col.align === 'right' && "text-right"
                  )}
                >
                  {col.format ? col.format(row[col.key], row) : row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

// Helper components for formatting
export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    'Ativo': { variant: 'default', label: 'Activo' },
    'Inativo': { variant: 'secondary', label: 'Inactivo' },
    'PENDENTE': { variant: 'outline', label: 'Pendente' },
    'EM_ANALISE': { variant: 'secondary', label: 'Em Análise' },
    'APROVADA': { variant: 'default', label: 'Aprovada' },
    'REJEITADA': { variant: 'destructive', label: 'Rejeitada' },
    'CANCELADA': { variant: 'destructive', label: 'Cancelada' },
  };

  const config = variants[status] || { variant: 'outline' as const, label: status };

  return (
    <Badge variant={config.variant} className="font-normal">
      {config.label}
    </Badge>
  );
}

export function PercentageBadge({ value }: { value: number }) {
  const color = value >= 80 ? 'text-green-600' : value >= 60 ? 'text-yellow-600' : 'text-red-600';
  return <span className={cn("font-medium", color)}>{value.toFixed(1)}%</span>;
}
