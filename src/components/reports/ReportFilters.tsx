import { useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CalendarIcon, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { PROVINCES } from '@/lib/validators/mozambique';
import { useClassesList } from '@/hooks/useClasses';
import type { ReportType, ReportFilters as ReportFiltersType } from '@/hooks/useReports';

interface ReportFiltersProps {
  reportType: ReportType;
  filters: Omit<ReportFiltersType, 'reportType'>;
  onFiltersChange: (filters: Omit<ReportFiltersType, 'reportType'>) => void;
}

export function ReportFilters({ reportType, filters, onFiltersChange }: ReportFiltersProps) {
  const { data: classes = [] } = useClassesList();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const resetFilters = () => {
    onFiltersChange({});
  };

  const updateFilter = (key: keyof Omit<ReportFiltersType, 'reportType'>, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Status options based on report type
  const getStatusOptions = () => {
    switch (reportType) {
      case 'students':
      case 'teachers':
        return [
          { value: 'all', label: 'Todos' },
          { value: 'Ativo', label: 'Activos' },
          { value: 'Inativo', label: 'Inactivos' },
        ];
      case 'enrollments':
        return [
          { value: 'all', label: 'Todos' },
          { value: 'PENDENTE', label: 'Pendentes' },
          { value: 'EM_ANALISE', label: 'Em Análise' },
          { value: 'APROVADA', label: 'Aprovadas' },
          { value: 'REJEITADA', label: 'Rejeitadas' },
          { value: 'CANCELADA', label: 'Canceladas' },
        ];
      default:
        return [];
    }
  };

  const statusOptions = getStatusOptions();
  const showStatusFilter = statusOptions.length > 0;
  const showClassFilter = ['students', 'enrollments', 'attendance'].includes(reportType);
  const showGenderFilter = reportType === 'students';
  const showProvinceFilter = reportType === 'students';
  const showDateFilter = reportType === 'enrollments';

  return (
    <div className="bg-card rounded-xl border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="w-4 h-4" />
          Filtros
        </div>
        <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2">
          <RotateCcw className="w-4 h-4 mr-1" />
          Limpar
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        {showStatusFilter && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Estado</Label>
            <Select 
              value={filters.status || 'all'} 
              onValueChange={(v) => updateFilter('status', v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Class Filter */}
        {showClassFilter && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Turma</Label>
            <Select 
              value={filters.classId?.toString() || 'all'} 
              onValueChange={(v) => updateFilter('classId', v === 'all' ? undefined : parseInt(v))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Todas as turmas</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name} ({c.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Gender Filter */}
        {showGenderFilter && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Género</Label>
            <Select 
              value={filters.gender || 'all'} 
              onValueChange={(v) => updateFilter('gender', v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="MASCULINO">Masculino</SelectItem>
                <SelectItem value="FEMININO">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Province Filter */}
        {showProvinceFilter && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Província</Label>
            <Select 
              value={filters.province || 'all'} 
              onValueChange={(v) => updateFilter('province', v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Todas</SelectItem>
                {PROVINCES.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Date Range Filter */}
        {showDateFilter && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Data Início</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-9 justify-start text-left font-normal",
                      !filters.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate 
                      ? format(new Date(filters.startDate), "dd/MM/yyyy", { locale: pt })
                      : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate ? new Date(filters.startDate) : undefined}
                    onSelect={(date) => {
                      updateFilter('startDate', date ? format(date, 'yyyy-MM-dd') : undefined);
                      setStartDateOpen(false);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Data Fim</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-9 justify-start text-left font-normal",
                      !filters.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate 
                      ? format(new Date(filters.endDate), "dd/MM/yyyy", { locale: pt })
                      : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate ? new Date(filters.endDate) : undefined}
                    onSelect={(date) => {
                      updateFilter('endDate', date ? format(date, 'yyyy-MM-dd') : undefined);
                      setEndDateOpen(false);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
