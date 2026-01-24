import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Users, Calendar, Check, X, Clock, AlertCircle, 
  Save, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

const statusConfig: Record<AttendanceStatus, { label: string; icon: React.ReactNode; color: string }> = {
  PRESENTE: { label: 'Presente', icon: <Check className="w-4 h-4" />, color: 'bg-green-500 hover:bg-green-600' },
  FALTA: { label: 'Falta', icon: <X className="w-4 h-4" />, color: 'bg-red-500 hover:bg-red-600' },
  FALTA_JUSTIFICADA: { label: 'Justificada', icon: <AlertCircle className="w-4 h-4" />, color: 'bg-yellow-500 hover:bg-yellow-600' },
  ATRASO: { label: 'Atraso', icon: <Clock className="w-4 h-4" />, color: 'bg-orange-500 hover:bg-orange-600' },
};

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [attendanceData, setAttendanceData] = useState<Map<number, AttendanceStatus>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');

  const { data: classes = [], isLoading: classesLoading } = useClasses();
  const { data: subjects = [] } = useSubjects();
  const { data: students = [], isLoading: studentsLoading } = useStudentsByClass(selectedClassId);
  const { data: existingAttendance = [] } = useAttendanceByClass(selectedClassId, selectedDate);
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

    return { total, presentes, faltas, justificadas, atrasos, pendentes };
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
    if (!selectedClassId) return;

    const records: AttendanceInsert[] = Array.from(attendanceData.entries()).map(([studentId, status]) => ({
      student_id: studentId,
      class_id: selectedClassId,
      subject_id: selectedSubjectId,
      date: selectedDate,
      status,
    }));

    await recordAttendance.mutateAsync(records);
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const newMap = new Map<number, AttendanceStatus>();
    students.forEach(s => newMap.set(s.id, status));
    setAttendanceData(newMap);
  };

  const changeDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(format(current, 'yyyy-MM-dd'));
  };

  const getInitials = (name: string) => {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  return (
    <MainLayout title="Presenças" subtitle="Controlo de assiduidade dos educandos">
      <div className="space-y-6">
        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Data */}
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

              {/* Pesquisa */}
              <div className="space-y-2">
                <Label>Pesquisar Educando</Label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome do educando..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        {selectedClassId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-6 gap-4"
          >
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.presentes}</p>
                  <p className="text-xs text-green-600">Presentes</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.faltas}</p>
                  <p className="text-xs text-red-600">Faltas</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{stats.justificadas}</p>
                  <p className="text-xs text-yellow-600">Justificadas</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{stats.atrasos}</p>
                  <p className="text-xs text-orange-600">Atrasos</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200 bg-gray-50/50">
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">{stats.pendentes}</p>
                  <p className="text-xs text-gray-600">Pendentes</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabela de Chamada */}
        {selectedClassId ? (
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Chamada - {format(new Date(selectedDate), "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </CardTitle>
                  <CardDescription>
                    {classes.find(c => c.id === selectedClassId)?.name}
                    {selectedSubjectId && ` - ${subjects.find(s => s.id === selectedSubjectId)?.name}`}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleMarkAll('PRESENTE')}>
                    <Check className="mr-2 h-4 w-4" />
                    Todos Presentes
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={recordAttendance.isPending || attendanceData.size === 0}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {recordAttendance.isPending ? 'Guardando...' : 'Guardar Presenças'}
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
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Seleccione uma turma</h3>
                <p className="text-muted-foreground">
                  Escolha uma turma e data para fazer a chamada diária
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
