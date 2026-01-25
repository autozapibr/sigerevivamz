import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  GraduationCap,
  Building2,
  UserCheck,
  ClipboardCheck,
  UserPlus,
  BarChart3,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { ReportActions } from '@/components/reports/ReportActions';
import { ReportTable, StatusBadge, PercentageBadge, type ReportColumn } from '@/components/reports/ReportTable';
import { formatMZN } from '@/lib/validators/mozambique';
import {
  type ReportType,
  type ReportFilters as ReportFiltersType,
  useStudentsReport,
  useEnrollmentsReport,
  useClassesReport,
  useTeachersReport,
  useAttendanceReport,
  useGuardiansReport,
  useReportsSummary,
} from '@/hooks/useReports';

const REPORT_TYPES: { value: ReportType; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'students', label: 'Estudantes', icon: Users, description: 'Lista completa de educandos' },
  { value: 'enrollments', label: 'Matrículas', icon: FileText, description: 'Matrículas e pagamentos' },
  { value: 'classes', label: 'Turmas', icon: Building2, description: 'Turmas e alocação' },
  { value: 'teachers', label: 'Professores', icon: UserCheck, description: 'Corpo docente' },
  { value: 'attendance', label: 'Assiduidade', icon: ClipboardCheck, description: 'Taxas de presença' },
  { value: 'guardians', label: 'Encarregados', icon: UserPlus, description: 'Encarregados de educação' },
];

// Column definitions for each report type
const getColumnsForType = (type: ReportType): ReportColumn[] => {
  switch (type) {
    case 'students':
      return [
        { key: 'name', header: 'Nome' },
        { key: 'gender', header: 'Género', align: 'center' },
        { key: 'birth_date', header: 'Nascimento' },
        { key: 'class_name', header: 'Turma' },
        { key: 'phone', header: 'Telefone' },
        { key: 'bi_number', header: 'BI' },
        { key: 'province', header: 'Província' },
        { key: 'status', header: 'Estado', format: (v) => <StatusBadge status={v} /> },
      ];
    case 'enrollments':
      return [
        { key: 'enrollment_number', header: 'Nº Matrícula' },
        { key: 'student_name', header: 'Estudante' },
        { key: 'class_name', header: 'Turma' },
        { key: 'academic_year', header: 'Ano Lectivo' },
        { key: 'enrollment_date', header: 'Data' },
        { key: 'enrollment_fee', header: 'Taxa Matr.', align: 'right', format: (v) => formatMZN(v) },
        { key: 'monthly_fee', header: 'Propina', align: 'right', format: (v) => formatMZN(v) },
        { key: 'status', header: 'Estado', format: (v) => <StatusBadge status={v} /> },
      ];
    case 'classes':
      return [
        { key: 'name', header: 'Nome da Turma' },
        { key: 'year', header: 'Ano Lectivo', align: 'center' },
        { key: 'teacher_name', header: 'Director de Turma' },
        { key: 'students_count', header: 'Nº Estudantes', align: 'center' },
      ];
    case 'teachers':
      return [
        { key: 'name', header: 'Nome' },
        { key: 'phone', header: 'Telefone' },
        { key: 'email', header: 'E-mail' },
        { key: 'qualifications', header: 'Habilitações' },
        { key: 'contract_type', header: 'Tipo Contrato' },
        { key: 'status', header: 'Estado', format: (v) => <StatusBadge status={v} /> },
      ];
    case 'attendance':
      return [
        { key: 'student_name', header: 'Estudante' },
        { key: 'class_name', header: 'Turma' },
        { key: 'total_days', header: 'Total Dias', align: 'center' },
        { key: 'presences', header: 'Presenças', align: 'center' },
        { key: 'absences', header: 'Faltas', align: 'center' },
        { key: 'justified_absences', header: 'Just.', align: 'center' },
        { key: 'delays', header: 'Atrasos', align: 'center' },
        { key: 'presence_rate', header: 'Taxa', align: 'center', format: (v) => <PercentageBadge value={v} /> },
      ];
    case 'guardians':
      return [
        { key: 'full_name', header: 'Nome Completo' },
        { key: 'relationship', header: 'Parentesco' },
        { key: 'phone', header: 'Telefone' },
        { key: 'email', header: 'E-mail' },
        { key: 'occupation', header: 'Profissão' },
        { key: 'students', header: 'Educandos', format: (v: string[]) => v.length > 0 ? v.join(', ') : '-' },
      ];
    default:
      return [];
  }
};

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>('students');
  const [filters, setFilters] = useState<Omit<ReportFiltersType, 'reportType'>>({});

  // Summary stats
  const { data: summary, isLoading: summaryLoading } = useReportsSummary();

  // Report data based on type
  const studentsQuery = useStudentsReport(filters);
  const enrollmentsQuery = useEnrollmentsReport(filters);
  const classesQuery = useClassesReport(filters);
  const teachersQuery = useTeachersReport(filters);
  const attendanceQuery = useAttendanceReport(filters);
  const guardiansQuery = useGuardiansReport(filters);

  const currentQuery = useMemo(() => {
    switch (reportType) {
      case 'students': return studentsQuery;
      case 'enrollments': return enrollmentsQuery;
      case 'classes': return classesQuery;
      case 'teachers': return teachersQuery;
      case 'attendance': return attendanceQuery;
      case 'guardians': return guardiansQuery;
      default: return studentsQuery;
    }
  }, [reportType, studentsQuery, enrollmentsQuery, classesQuery, teachersQuery, attendanceQuery, guardiansQuery]);

  const columns = getColumnsForType(reportType);
  const data = currentQuery.data || [];
  const isLoading = currentQuery.isLoading;
  const reportTitle = REPORT_TYPES.find((r) => r.value === reportType)?.label || 'Relatório';

  // Reset filters when changing report type
  const handleReportTypeChange = (type: string) => {
    setReportType(type as ReportType);
    setFilters({});
  };

  const summaryCards = [
    { 
      label: 'Estudantes Activos', 
      value: summary?.activeStudents ?? 0, 
      icon: Users, 
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      label: 'Professores Activos', 
      value: summary?.activeTeachers ?? 0, 
      icon: UserCheck, 
      color: 'text-secondary',
      bg: 'bg-secondary/10'
    },
    { 
      label: 'Turmas', 
      value: summary?.totalClasses ?? 0, 
      icon: Building2, 
      color: 'text-accent-foreground',
      bg: 'bg-accent'
    },
    { 
      label: 'Matrículas Pendentes', 
      value: summary?.pendingEnrollments ?? 0, 
      icon: FileText, 
      color: 'text-orange-600',
      bg: 'bg-orange-100 dark:bg-orange-900/30'
    },
  ];

  return (
    <MainLayout 
      title="Relatórios" 
      subtitle="Relatórios e análises para a Secretaria"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, idx) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">{card.label}</p>
                      <p className="text-2xl font-bold">{card.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${card.bg}`}>
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Report Type Selector */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Seleccionar Relatório
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={reportType} onValueChange={handleReportTypeChange}>
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 h-auto gap-2 bg-transparent p-0">
                {REPORT_TYPES.map((type) => (
                  <TabsTrigger
                    key={type.value}
                    value={type.value}
                    className="flex flex-col items-center gap-1 p-3 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg border data-[state=active]:border-primary"
                  >
                    <type.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{type.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Dynamic Filters */}
        <ReportFilters
          reportType={reportType}
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Report Results */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">
                  Relatório de {reportTitle}
                </CardTitle>
                <Badge variant="secondary">
                  {data.length} registos
                </Badge>
              </div>
              <ReportActions
                reportTitle={`Relatório de ${reportTitle}`}
                data={data}
                columns={columns.map((c) => ({ key: c.key, header: c.header }))}
              />
            </div>
          </CardHeader>
          <CardContent>
            <ReportTable
              columns={columns}
              data={data}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
