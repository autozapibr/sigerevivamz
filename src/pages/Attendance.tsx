import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, parseISO, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Users, Calendar, Check, X, Clock, AlertCircle, 
  Save, ChevronLeft, ChevronRight, Filter, ClipboardCheck,
  BarChart3, Download, CalendarDays, Percent
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useClasses, useSubjects } from '@/hooks/useGrades';
import { 
  useStudentsByClass, 
  useAttendanceByClass, 
  useRecordAttendance,
  AttendanceStatus,
  AttendanceInsert
} from '@/hooks/useAttendance';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

const statusConfig: Record<AttendanceStatus, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  PRESENTE: { label: 'Presente', icon: <Check className="w-4 h-4" />, color: 'bg-green-500 hover:bg-green-600', bgColor: 'bg-green-100 text-green-700' },
  FALTA: { label: 'Falta', icon: <X className="w-4 h-4" />, color: 'bg-red-500 hover:bg-red-600', bgColor: 'bg-red-100 text-red-700' },
  FALTA_JUSTIFICADA: { label: 'Justificada', icon: <AlertCircle className="w-4 h-4" />, color: 'bg-yellow-500 hover:bg-yellow-600', bgColor: 'bg-yellow-100 text-yellow-700' },
  ATRASO: { label: 'Atraso', icon: <Clock className="w-4 h-4" />, color: 'bg-orange-500 hover:bg-orange-600', bgColor: 'bg-orange-100 text-orange-700' },
};

// Componente de Chamada Diária
function DailyAttendance({ 
  classId, 
  subjectId, 
  date, 
  students, 
  studentsLoading, 
  classes, 
  subjects 
}: {
  classId: number | null;
  subjectId: number | null;
  date: string;
  students: any[];
  studentsLoading: boolean;
  classes: any[];
  subjects: any[];
}) {
  const [attendanceData, setAttendanceData] = useState<Map<number, AttendanceStatus>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');

  const { data: existingAttendance = [] } = useAttendanceByClass(classId, date);
  const recordAttendance = useRecordAttendance();

  // Initialize attendance data from existing records
  React.useEffect(() => {
    const map = new Map<number, AttendanceStatus>();
    existingAttendance.forEach(record => {
      map.set(record.student_id, record.status as AttendanceStatus);
    });
    setAttendanceData(map);
  }, [existingAttendance]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const stats = useMemo(() => {
    const total = students.length;
    const presentes = Array.from(attendanceData.values()).filter(s => s === 'PRESENTE').length;
    const faltas = Array.from(attendanceData.values()).filter(s => s === 'FALTA').length;
    const justificadas = Array.from(attendanceData.values()).filter(s => s === 'FALTA_JUSTIFICADA').length;
    const atrasos = Array.from(attendanceData.values()).filter(s => s === 'ATRASO').length;
    const pendentes = total - attendanceData.size;
    const taxaPresenca = total > 0 ? Math.round((presentes / total) * 100) : 0;

    return { total, presentes, faltas, justificadas, atrasos, pendentes, taxaPresenca };
  }, [students, attendanceData]);

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setAttendanceData(prev => {
      const newMap = new Map(prev);
      if (newMap.get(studentId) === status) {
        newMap.delete(studentId);
      } else {
        newMap.set(studentId, status);
      }
      return newMap;
    });
  };

  const handleSave = async () => {
    if (!classId) return;

    const records: AttendanceInsert[] = Array.from(attendanceData.entries()).map(([studentId, status]) => ({
      student_id: studentId,
      class_id: classId,
      subject_id: subjectId,
      date: date,
      status,
    }));

    await recordAttendance.mutateAsync(records);
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const newMap = new Map<number, AttendanceStatus>();
    students.forEach(s => newMap.set(s.id, status));
    setAttendanceData(newMap);
  };

  const getInitials = (name: string) => {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  if (!classId) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Seleccione uma turma</h3>
            <p className="text-muted-foreground">
              Escolha uma turma para fazer a chamada diária
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-7 gap-4"
      >
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.presentes}</p>
              <p className="text-xs text-green-600">Presentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.faltas}</p>
              <p className="text-xs text-red-600">Faltas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.justificadas}</p>
              <p className="text-xs text-yellow-600">Justificadas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.atrasos}</p>
              <p className="text-xs text-orange-600">Atrasos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-gray-50/50 dark:bg-gray-950/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.pendentes}</p>
              <p className="text-xs text-gray-600">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.taxaPresenca}%</p>
              <p className="text-xs text-primary">Taxa Presença</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabela de Chamada */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Chamada - {format(new Date(date), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </CardTitle>
              <CardDescription>
                {classes.find((c: any) => c.id === classId)?.name}
                {subjectId && ` - ${subjects.find((s: any) => s.id === subjectId)?.name}`}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-40"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => handleMarkAll('PRESENTE')}>
                <Check className="mr-2 h-4 w-4" />
                Todos Presentes
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={recordAttendance.isPending || attendanceData.size === 0}
              >
                <Save className="mr-2 h-4 w-4" />
                {recordAttendance.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {studentsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {students.length === 0 
                  ? 'Nenhum educando nesta turma'
                  : 'Nenhum educando encontrado'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Educando</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student, index) => {
                  const currentStatus = attendanceData.get(student.id);
                  return (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="group"
                    >
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.photo_url || ''} alt={student.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {currentStatus ? (
                          <Badge 
                            variant="secondary" 
                            className={`${statusConfig[currentStatus].color} text-white`}
                          >
                            {statusConfig[currentStatus].icon}
                            <span className="ml-1">{statusConfig[currentStatus].label}</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pendente</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {(Object.keys(statusConfig) as AttendanceStatus[]).map((status) => (
                            <Button
                              key={status}
                              variant={currentStatus === status ? 'default' : 'outline'}
                              size="sm"
                              className={currentStatus === status ? statusConfig[status].color : ''}
                              onClick={() => handleStatusChange(student.id, status)}
                              title={statusConfig[status].label}
                            >
                              {statusConfig[status].icon}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de Relatório Mensal
function MonthlyReport({ classId, month, classes }: { classId: number | null; month: Date; classes: any[] }) {
  const { data: students = [] } = useStudentsByClass(classId);
  
  // Buscar todas as presenças do mês
  const startDate = format(startOfMonth(month), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(month), 'yyyy-MM-dd');
  
  const { data: monthlyAttendance = [] } = useQuery({
    queryKey: ['attendance-monthly', classId, startDate, endDate],
    queryFn: async () => {
      if (!classId) return [];
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', classId)
        .gte('date', startDate)
        .lte('date', endDate);
      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });

  // Dias úteis do mês (excluindo fins de semana)
  const workingDays = useMemo(() => {
    const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
    return days.filter(d => !isWeekend(d));
  }, [month]);

  // Calcular estatísticas por educando
  const studentStats = useMemo(() => {
    return students.map(student => {
      const records = monthlyAttendance.filter((a: any) => a.student_id === student.id);
      const presentes = records.filter((a: any) => a.status === 'PRESENTE').length;
      const faltas = records.filter((a: any) => a.status === 'FALTA').length;
      const justificadas = records.filter((a: any) => a.status === 'FALTA_JUSTIFICADA').length;
      const atrasos = records.filter((a: any) => a.status === 'ATRASO').length;
      const totalRegistado = records.length;
      const taxaPresenca = totalRegistado > 0 ? Math.round((presentes / totalRegistado) * 100) : 0;

      return {
        ...student,
        presentes,
        faltas,
        justificadas,
        atrasos,
        totalRegistado,
        taxaPresenca,
      };
    }).sort((a, b) => b.taxaPresenca - a.taxaPresenca);
  }, [students, monthlyAttendance]);

  if (!classId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Seleccione uma Turma</h3>
          <p className="text-muted-foreground">Escolha uma turma para ver o relatório mensal</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Relatório de {format(month, 'MMMM yyyy', { locale: ptBR })}
            </CardTitle>
            <CardDescription>
              {classes.find((c: any) => c.id === classId)?.name} - {workingDays.length} dias úteis
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {studentStats.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum registo de presença neste mês</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Educando</TableHead>
                <TableHead className="text-center">Presenças</TableHead>
                <TableHead className="text-center">Faltas</TableHead>
                <TableHead className="text-center">Justificadas</TableHead>
                <TableHead className="text-center">Atrasos</TableHead>
                <TableHead className="text-center">Taxa</TableHead>
                <TableHead className="w-32">Progresso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentStats.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={statusConfig.PRESENTE.bgColor}>{student.presentes}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={statusConfig.FALTA.bgColor}>{student.faltas}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={statusConfig.FALTA_JUSTIFICADA.bgColor}>{student.justificadas}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={statusConfig.ATRASO.bgColor}>{student.atrasos}</Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    <span className={student.taxaPresenca >= 75 ? 'text-green-600' : student.taxaPresenca >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                      {student.taxaPresenca}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Progress 
                      value={student.taxaPresenca} 
                      className="h-2"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Componente de Estatísticas
function AttendanceStatistics({ classId }: { classId: number | null }) {
  const { data: students = [] } = useStudentsByClass(classId);
  
  // Buscar todas as presenças da turma
  const { data: allAttendance = [] } = useQuery({
    queryKey: ['attendance-all', classId],
    queryFn: async () => {
      if (!classId) return [];
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', classId);
      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });

  const distributionData = useMemo(() => {
    const counts = {
      PRESENTE: allAttendance.filter((a: any) => a.status === 'PRESENTE').length,
      FALTA: allAttendance.filter((a: any) => a.status === 'FALTA').length,
      FALTA_JUSTIFICADA: allAttendance.filter((a: any) => a.status === 'FALTA_JUSTIFICADA').length,
      ATRASO: allAttendance.filter((a: any) => a.status === 'ATRASO').length,
    };

    return [
      { name: 'Presenças', value: counts.PRESENTE, color: '#22c55e' },
      { name: 'Faltas', value: counts.FALTA, color: '#ef4444' },
      { name: 'Justificadas', value: counts.FALTA_JUSTIFICADA, color: '#eab308' },
      { name: 'Atrasos', value: counts.ATRASO, color: '#f97316' },
    ].filter(d => d.value > 0);
  }, [allAttendance]);

  // Top 5 mais assíduos
  const topStudents = useMemo(() => {
    return students.map(student => {
      const records = allAttendance.filter((a: any) => a.student_id === student.id);
      const presentes = records.filter((a: any) => a.status === 'PRESENTE').length;
      const total = records.length;
      const taxa = total > 0 ? Math.round((presentes / total) * 100) : 0;
      return { ...student, taxa, total };
    })
    .filter(s => s.total > 0)
    .sort((a, b) => b.taxa - a.taxa)
    .slice(0, 5);
  }, [students, allAttendance]);

  if (!classId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Seleccione uma Turma</h3>
          <p className="text-muted-foreground">Escolha uma turma para ver as estatísticas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Distribuição Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuição de Presenças</CardTitle>
          <CardDescription>Total de registos por estado</CardDescription>
        </CardHeader>
        <CardContent>
          {distributionData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum registo de presença
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${value}`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top 5 Mais Assíduos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top 5 - Melhor Assiduidade</CardTitle>
          <CardDescription>Educandos com maior taxa de presença</CardDescription>
        </CardHeader>
        <CardContent>
          {topStudents.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          ) : (
            <div className="space-y-4">
              {topStudents.map((student, index) => (
                <div key={student.id} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{student.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={student.taxa} className="h-2 flex-1" />
                      <span className="text-sm font-bold text-primary">{student.taxa}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useCurrentTeacher, useTeacherAssignments } from '@/hooks/useTeachers';
import { useAuth } from '@/contexts/AuthContext';

export default function Attendance() {
  const { user } = useAuth();
  const { data: teacher } = useCurrentTeacher();
  const { data: assignments } = useTeacherAssignments(teacher?.id || null);

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('chamada');

  const { data: allClasses = [], isLoading: classesLoading } = useClasses();
  const { data: allSubjects = [] } = useSubjects();
  
  const { data: userRoles } = useQuery({
    queryKey: ['user-roles-attendance', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
      return data?.map(r => String(r.role)) || [];
    },
    enabled: !!user?.id
  });

  const isAdmin = userRoles?.some(r => ['ADMIN', 'PEDAGOGICO', 'DIRETORIA', 'SECRETARIA'].includes(r));
  const isProfessor = userRoles?.includes('PROFESSOR');
  const hasTeacherProfile = !!teacher;
  const shouldFilterByTeacher = isProfessor || (hasTeacherProfile && assignments?.classes.length > 0);

  const classes = useMemo(() => {
    if (shouldFilterByTeacher) {
      return assignments?.classes || [];
    }
    return allClasses;
  }, [allClasses, assignments, shouldFilterByTeacher]);

  const subjects = useMemo(() => {
    if (shouldFilterByTeacher) {
      if (!selectedClassId) return [];
      return (assignments?.subjects || [])
        .filter((s: any) => s.class_id === selectedClassId)
        .map((s: any) => ({ 
          id: s.subject_id, 
          name: s.subject_name 
        }));
    }
    return allSubjects;
  }, [allSubjects, assignments, shouldFilterByTeacher, selectedClassId]);

  const { data: students = [], isLoading: studentsLoading } = useStudentsByClass(selectedClassId);

  const changeDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(format(current, 'yyyy-MM-dd'));
  };

  const changeMonth = (months: number) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + months);
    setSelectedMonth(newMonth);
  };

  return (
    <MainLayout title="Assiduidade" subtitle="Controlo de presenças e frequência dos educandos">
      <div className="space-y-6">
        {/* Header com Explicação */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <ClipboardCheck className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">O que é a Assiduidade?</h2>
                <p className="text-muted-foreground">
                  O módulo de <strong>Assiduidade</strong> permite fazer a chamada diária dos educandos, 
                  registando presenças, faltas, faltas justificadas e atrasos. Os dados são usados para 
                  calcular a taxa de frequência de cada educando e gerar relatórios para os encarregados de educação.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <div className="flex items-center gap-2">
                    <Badge className={statusConfig.PRESENTE.bgColor}>
                      <Check className="w-3 h-3 mr-1" /> Presente
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusConfig.FALTA.bgColor}>
                      <X className="w-3 h-3 mr-1" /> Falta
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusConfig.FALTA_JUSTIFICADA.bgColor}>
                      <AlertCircle className="w-3 h-3 mr-1" /> Justificada
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusConfig.ATRASO.bgColor}>
                      <Clock className="w-3 h-3 mr-1" /> Atraso
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros Principais */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Turma */}
              <div className="space-y-2">
                <Label>Turma</Label>
                <Select 
                  value={selectedClassId?.toString() || ''} 
                  onValueChange={(v) => setSelectedClassId(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Disciplina (opcional) */}
              <div className="space-y-2">
                <Label>Disciplina (opcional)</Label>
                <Select 
                  value={selectedSubjectId?.toString() || 'all'} 
                  onValueChange={(v) => setSelectedSubjectId(v === 'all' ? null : Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Chamada Geral</SelectItem>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data (para chamada diária) */}
              {activeTab === 'chamada' && (
                <div className="space-y-2">
                  <Label>Data</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" size="icon" onClick={() => changeDate(1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Mês (para relatório mensal) */}
              {activeTab === 'relatorio' && (
                <div className="space-y-2">
                  <Label>Mês</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 h-10 px-3 border rounded-md flex items-center justify-center bg-background">
                      {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
                    </div>
                    <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Info da Turma */}
              <div className="space-y-2">
                <Label>Educandos na Turma</Label>
                <div className="h-10 flex items-center px-3 bg-muted rounded-md">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">{students.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Funcionalidades */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chamada" className="gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Chamada Diária
            </TabsTrigger>
            <TabsTrigger value="relatorio" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Relatório Mensal
            </TabsTrigger>
            <TabsTrigger value="estatisticas" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Estatísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chamada" className="mt-6">
            <DailyAttendance 
              classId={selectedClassId}
              subjectId={selectedSubjectId}
              date={selectedDate}
              students={students}
              studentsLoading={studentsLoading}
              classes={classes}
              subjects={subjects}
            />
          </TabsContent>

          <TabsContent value="relatorio" className="mt-6">
            <MonthlyReport 
              classId={selectedClassId}
              month={selectedMonth}
              classes={classes}
            />
          </TabsContent>

          <TabsContent value="estatisticas" className="mt-6">
            <AttendanceStatistics classId={selectedClassId} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
