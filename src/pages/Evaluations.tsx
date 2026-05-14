import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Save, Calculator, Filter, FileSpreadsheet,
   TrendingUp, TrendingDown, Download, BarChart3, Users,
   GraduationCap, ClipboardList, CheckCircle2, XCircle, AlertCircle, Clock,
   FileText
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useToast } from '@/hooks/use-toast';
import { 
  useClasses, 
  useSubjects, 
  useGradesByClass, 
  useSaveGrades,
  calculateTrimesterAverage,
  classifyGrade,
  GradeInsert
} from '@/hooks/useGrades';
 import { useStudentsByClass, useAttendanceByClass, useRecordAttendance, AttendanceStatus } from '@/hooks/useAttendance';
 import { useCurrentTeacher, useTeacherAssignments } from '@/hooks/useTeachers';
 import { Link } from 'react-router-dom';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';

const TRIMESTRES = [
  { value: '1', label: '1º Trimestre' },
  { value: '2', label: '2º Trimestre' },
  { value: '3', label: '3º Trimestre' },
];

interface StudentGrade {
  student_id: number;
  student_name: string;
   acs1: number | null;
   acs2: number | null;
   acs3: number | null;
   at: number | null;
  media: number | null;
}

// Componente de Lançamento de Notas
function GradeEntry({ 
  classId, 
  subjectId, 
  trimestre,
  students,
  existingGrades,
  studentsLoading,
  classes,
  subjects
}: {
  classId: number | null;
  subjectId: number | null;
  trimestre: number;
  students: any[];
  existingGrades: any[];
  studentsLoading: boolean;
  classes: any[];
  subjects: any[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradesData, setGradesData] = useState<Map<number, StudentGrade>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();
  const saveGrades = useSaveGrades();

  // Initialize grades from existing data
  React.useEffect(() => {
    if (students.length > 0) {
      const map = new Map<number, StudentGrade>();
      
      students.forEach(student => {
        const existingGrade = existingGrades.find(g => g.student_id === student.id);
        map.set(student.id, {
          student_id: student.id,
          student_name: student.name,
           acs1: existingGrade?.acs1 ?? null,
           acs2: existingGrade?.acs2 ?? null,
           acs3: existingGrade?.acs3 ?? null,
           at: existingGrade?.at ?? null,
          media: existingGrade?.media_trimestral ?? null,
        });
      });
      
      setGradesData(map);
      setHasChanges(false);
    }
  }, [students, existingGrades]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return Array.from(gradesData.values());
    return Array.from(gradesData.values()).filter(s => 
      s.student_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [gradesData, searchQuery]);

  const stats = useMemo(() => {
    const allGrades = Array.from(gradesData.values());
    const withMedia = allGrades.filter(g => g.media !== null);
    const aprovados = withMedia.filter(g => (g.media || 0) >= 10).length;
    const reprovados = withMedia.filter(g => (g.media || 0) < 10).length;
    const mediaGeral = withMedia.length > 0 
      ? withMedia.reduce((sum, g) => sum + (g.media || 0), 0) / withMedia.length 
      : 0;

    return { 
      total: allGrades.length, 
      avaliados: withMedia.length,
      aprovados, 
      reprovados, 
      mediaGeral: Math.round(mediaGeral * 100) / 100 
    };
  }, [gradesData]);

   const handleGradeChange = (studentId: number, field: 'acs1' | 'acs2' | 'acs3' | 'at', value: string) => {
    const numValue = value === '' ? null : Math.min(20, Math.max(0, parseFloat(value) || 0));
    
    setGradesData(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(studentId);
      if (current) {
         const updated = { ...current, [field]: numValue } as any;
         // Recalcular a média localmente apenas após o blur/enter para atualizar a interface visual
         updated.media = calculateTrimesterAverage(
           updated.acs1 ?? null, 
           updated.acs2 ?? null, 
           updated.acs3 ?? null, 
           updated.at ?? null
         );
         newMap.set(studentId, updated as StudentGrade);
      }
      return newMap;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!classId || !subjectId) {
      toast({
        title: 'Atenção',
        description: 'Seleccione uma turma e disciplina',
        variant: 'destructive',
      });
      return;
    }

     const grades: GradeInsert[] = Array.from(gradesData.values())
       .filter(g => g.acs1 !== null || g.acs2 !== null || g.acs3 !== null || g.at !== null)
       .map(g => ({
         student_id: g.student_id,
         subject_id: subjectId,
         trimestre: trimestre,
         acs1: g.acs1,
         acs2: g.acs2,
         acs3: g.acs3,
         at: g.at,
         class_id: classId,
       }));

    if (grades.length === 0) {
      toast({
        title: 'Atenção',
        description: 'Nenhuma nota para guardar',
        variant: 'destructive',
      });
      return;
    }

    await saveGrades.mutateAsync(grades);
    setHasChanges(false);
  };

  const GradeInput = ({ 
    value, 
    onBlur, 
    placeholder 
  }: { 
    value: number | null; 
    onBlur: (v: string) => void; 
    placeholder: string;
  }) => {
    const [localValue, setLocalValue] = React.useState(value?.toString() ?? '');

    React.useEffect(() => {
      setLocalValue(value?.toString() ?? '');
    }, [value]);

    return (
      <Input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={localValue}
        onChange={(e) => {
          const val = e.target.value.replace(',', '.');
          if (val === '' || /^\d*\.?\d*$/.test(val)) {
            if (val.length <= 5) {
              setLocalValue(val);
            }
          }
        }}
        onBlur={() => onBlur(localValue)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onBlur(localValue);
            (e.target as HTMLInputElement).blur();
          }
        }}
        placeholder={placeholder}
        className="w-16 text-center font-bold h-9 bg-background focus:ring-1 focus:ring-primary/30 border-muted-foreground/20"
      />
    );
  };

  const MediaBadge = ({ media }: { media: number | null }) => {
    const { label, className } = classifyGrade(media);
    return (
      <Badge variant="outline" className={className}>
        {media !== null ? `${media.toFixed(1)} - ${label}` : '-'}
      </Badge>
    );
  };

  if (!classId || !subjectId) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <FileSpreadsheet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Seleccione a Turma e Disciplina</h3>
            <p className="text-muted-foreground">
              Escolha uma turma e disciplina acima para lançar as notas
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
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Educandos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.avaliados}</p>
              <p className="text-xs text-blue-600">Avaliados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.aprovados}</p>
                <p className="text-xs text-green-600">Aprovados (≥10)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.reprovados}</p>
                <p className="text-xs text-red-600">Reprovados (&lt;10)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.mediaGeral}</p>
                <p className="text-xs text-primary">Média Geral</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabela de Notas */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Pauta - {TRIMESTRES.find(t => t.value === trimestre.toString())?.label}
              </CardTitle>
              <CardDescription>
                {classes.find((c: any) => c.id === classId)?.name} - {subjects.find((s: any) => s.id === subjectId)?.name}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
              <Button 
                onClick={handleSave} 
                disabled={saveGrades.isPending || !hasChanges}
              >
                <Save className="mr-2 h-4 w-4" />
                {saveGrades.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legenda MEC */}
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
             <p className="text-sm font-medium mb-2">Sistema de Avaliação Moçambicano (SiGER):</p>
             <div className="flex flex-wrap gap-4 text-xs">
               <span><strong>ACS</strong> - Avaliação Contínua e Sistemática</span>
               <span><strong>AT</strong> - Avaliação Trimestral</span>
               <span className="text-muted-foreground ml-2">Fórmula: (Média ACS * 2 + AT) / 3</span>
             </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="grade-excelente">18-20 Excelente</Badge>
              <Badge variant="outline" className="grade-bom">14-17 Bom</Badge>
              <Badge variant="outline" className="grade-suficiente">10-13 Suficiente</Badge>
              <Badge variant="outline" className="grade-insuficiente">5-9 Insuficiente</Badge>
              <Badge variant="outline" className="grade-mau">0-4 Mau</Badge>
            </div>
          </div>

          {studentsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {gradesData.size === 0 
                  ? 'Nenhum educando nesta turma'
                  : 'Nenhum educando encontrado'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="min-w-[200px]">Educando</TableHead>
                     <TableHead className="text-center w-20">ACS 1</TableHead>
                     <TableHead className="text-center w-20">ACS 2</TableHead>
                     <TableHead className="text-center w-20">ACS 3</TableHead>
                     <TableHead className="text-center w-20">AT</TableHead>
                    <TableHead className="text-center w-32">Média</TableHead>
                    <TableHead className="text-center w-28">Classificação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((grade, index) => (
                    <motion.tr
                      key={grade.student_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {grade.student_name}
                      </TableCell>
                       <TableCell className="text-center">
                         <GradeInput
                           value={grade.acs1}
                           onBlur={(v) => handleGradeChange(grade.student_id, 'acs1', v)}
                           placeholder="ACS 1"
                         />
                       </TableCell>
                       <TableCell className="text-center">
                         <GradeInput
                           value={grade.acs2}
                           onBlur={(v) => handleGradeChange(grade.student_id, 'acs2', v)}
                           placeholder="ACS 2"
                         />
                       </TableCell>
                       <TableCell className="text-center">
                         <GradeInput
                           value={grade.acs3}
                           onBlur={(v) => handleGradeChange(grade.student_id, 'acs3', v)}
                           placeholder="ACS 3"
                         />
                       </TableCell>
                       <TableCell className="text-center">
                         <GradeInput
                           value={grade.at}
                           onBlur={(v) => handleGradeChange(grade.student_id, 'at', v)}
                           placeholder="AT"
                         />
                       </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-lg font-bold ${classifyGrade(grade.media).className}`}>
                          {grade.media !== null ? grade.media.toFixed(1) : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <MediaBadge media={grade.media} />
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

 // Componente de Registro de Faltas
 function AttendanceEntry({
   classId,
   subjectId,
   students,
   studentsLoading,
   classes,
   subjects
 }: {
   classId: number | null;
   subjectId: number | null;
   students: any[];
   studentsLoading: boolean;
   classes: any[];
   subjects: any[];
 }) {
   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
   const [attendanceData, setAttendanceData] = useState<Map<number, AttendanceStatus>>(new Map());
   const [observations, setObservations] = useState<Map<number, string>>(new Map());
   const [hasChanges, setHasChanges] = useState(false);
   const { toast } = useToast();
   const recordAttendance = useRecordAttendance();
   const { data: existingAttendance = [], isLoading: attendanceLoading } = useAttendanceByClass(classId, selectedDate);
 
   // Initialize from existing data
   React.useEffect(() => {
     const dataMap = new Map<number, AttendanceStatus>();
     const obsMap = new Map<number, string>();
     
     // Default to PRESENTE for everyone if no records exist
     students.forEach(student => {
       dataMap.set(student.id, 'PRESENTE');
     });
 
     existingAttendance.forEach(record => {
       dataMap.set(record.student_id, record.status);
       if (record.observation) obsMap.set(record.student_id, record.observation);
     });
 
     setAttendanceData(dataMap);
     setObservations(obsMap);
     setHasChanges(false);
   }, [students, existingAttendance]);
 
   const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
     setAttendanceData(prev => {
       const next = new Map(prev);
       next.set(studentId, status);
       return next;
     });
     setHasChanges(true);
   };
 
   const handleSave = async () => {
     if (!classId) return;
 
     const records = Array.from(attendanceData.entries()).map(([studentId, status]) => ({
       student_id: studentId,
       class_id: classId,
       subject_id: subjectId,
       date: selectedDate,
       status,
       observation: observations.get(studentId) || null
     }));
 
     await recordAttendance.mutateAsync(records);
     setHasChanges(false);
   };
 
   if (!classId) return (
     <Card>
       <CardContent className="py-12 text-center">
         <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
         <h3 className="text-lg font-medium mb-2">Seleccione uma Turma</h3>
         <p className="text-muted-foreground">Escolha uma turma para registrar presenças</p>
       </CardContent>
     </Card>
   );
 
   return (
     <div className="space-y-6">
       <Card>
         <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
             <div>
               <CardTitle className="flex items-center gap-2">
                 <Users className="h-5 w-5" />
                 Chamada Diária
               </CardTitle>
               <CardDescription>
                 Registrar faltas e presenças para {classes.find((c: any) => c.id === classId)?.name}
               </CardDescription>
             </div>
             <div className="flex items-center gap-2">
               <Input 
                 type="date" 
                 value={selectedDate} 
                 onChange={(e) => setSelectedDate(e.target.value)}
                 className="w-40"
               />
               <Button onClick={handleSave} disabled={recordAttendance.isPending || !hasChanges}>
                 <Save className="mr-2 h-4 w-4" />
                 Guardar Chamada
               </Button>
             </div>
           </div>
         </CardHeader>
         <CardContent>
           {studentsLoading || attendanceLoading ? (
             <div className="space-y-3">
               {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
             </div>
           ) : (
             <div className="overflow-x-auto">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="w-12">#</TableHead>
                     <TableHead>Educando</TableHead>
                     <TableHead className="text-center">Status de Presença</TableHead>
                     <TableHead>Observação</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {students.map((student, index) => {
                     const status = attendanceData.get(student.id) || 'PRESENTE';
                     return (
                       <TableRow key={student.id}>
                         <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                         <TableCell className="font-medium">{student.name}</TableCell>
                         <TableCell>
                           <div className="flex items-center justify-center gap-2">
                             <Button
                               size="sm"
                               variant={status === 'PRESENTE' ? 'default' : 'outline'}
                               className={status === 'PRESENTE' ? 'bg-green-600 hover:bg-green-700' : ''}
                               onClick={() => handleStatusChange(student.id, 'PRESENTE')}
                             >
                               <CheckCircle2 className="h-4 w-4" />
                             </Button>
                             <Button
                               size="sm"
                               variant={status === 'FALTA' ? 'destructive' : 'outline'}
                               onClick={() => handleStatusChange(student.id, 'FALTA')}
                             >
                               <XCircle className="h-4 w-4" />
                             </Button>
                             <Button
                               size="sm"
                               variant={status === 'FALTA_JUSTIFICADA' ? 'secondary' : 'outline'}
                               className={status === 'FALTA_JUSTIFICADA' ? 'bg-orange-500 text-white hover:bg-orange-600' : ''}
                               onClick={() => handleStatusChange(student.id, 'FALTA_JUSTIFICADA')}
                             >
                               <AlertCircle className="h-4 w-4" />
                             </Button>
                             <Button
                               size="sm"
                               variant={status === 'ATRASO' ? 'secondary' : 'outline'}
                               className={status === 'ATRASO' ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                               onClick={() => handleStatusChange(student.id, 'ATRASO')}
                             >
                               <Clock className="h-4 w-4" />
                             </Button>
                           </div>
                         </TableCell>
                         <TableCell>
                           <Input 
                             placeholder="Opcional..." 
                             value={observations.get(student.id) || ''}
                             onChange={(e) => {
                               setObservations(new Map(observations).set(student.id, e.target.value));
                               setHasChanges(true);
                             }}
                             className="h-8"
                           />
                         </TableCell>
                       </TableRow>
                     );
                   })}
                 </TableBody>
               </Table>
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 }
 
 // Componente para Controle de Lançamento (Direção Pedagógica)
 function PedagogicalRelease() {
   const currentYear = new Date().getFullYear();
   const { toast } = useToast();
   
   const { data: settings, refetch } = useQuery({
     queryKey: ['pedagogical-settings'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('pedagogical_settings')
         .select('*')
         .eq('academic_year', currentYear)
         .order('trimestre');
       if (error) throw error;
       return data;
     },
   });
 
   const handleStatusChange = async (trimestre: number, status: 'draft' | 'review' | 'released') => {
     const { error } = await supabase
       .from('pedagogical_settings')
       .upsert({
         academic_year: currentYear,
         trimestre,
         release_status: status,
         released_at: status === 'released' ? new Date().toISOString() : null
       }, { onConflict: 'academic_year,trimestre' });
 
     if (error) {
       toast({ title: 'Erro', description: error.message, variant: 'destructive' });
     } else {
       toast({ title: 'Sucesso', description: `Status do ${trimestre}º Trimestre actualizado.` });
       refetch();
     }
   };
 
   return (
     <Card>
       <CardHeader>
         <CardTitle className="text-lg flex items-center gap-2">
           <CheckCircle2 className="h-5 w-5 text-primary" />
           Controle de Lançamento e Publicação
         </CardTitle>
         <CardDescription>
           Defina o status de cada trimestre. Quando "Publicado", educandos e encarregados poderão ver as notas.
         </CardDescription>
       </CardHeader>
       <CardContent>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[1, 2, 3].map((t) => {
             const current = settings?.find(s => s.trimestre === t);
             const status = current?.release_status || 'draft';
             
             return (
               <div key={t} className="p-4 border rounded-xl space-y-4">
                 <div className="flex items-center justify-between">
                   <h4 className="font-bold">{t}º Trimestre</h4>
                   <Badge variant={status === 'released' ? 'default' : status === 'review' ? 'secondary' : 'outline'}>
                     {status === 'released' ? 'Publicado' : status === 'review' ? 'Em Revisão' : 'Rascunho'}
                   </Badge>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-2">
                   <Button 
                     size="sm" 
                     variant={status === 'draft' ? 'default' : 'outline'}
                     onClick={() => handleStatusChange(t, 'draft')}
                   >
                     Rascunho
                   </Button>
                   <Button 
                     size="sm" 
                     variant={status === 'review' ? 'default' : 'outline'}
                     onClick={() => handleStatusChange(t, 'review')}
                   >
                     Enviar p/ Revisão
                   </Button>
                   <Button 
                     size="sm" 
                     variant={status === 'released' ? 'default' : 'outline'}
                     className={status === 'released' ? 'bg-green-600' : ''}
                     onClick={() => handleStatusChange(t, 'released')}
                   >
                     Publicar Notas
                   </Button>
                 </div>
                 
                 {current?.released_at && (
                   <p className="text-[10px] text-muted-foreground text-center">
                     Publicado em: {new Date(current.released_at).toLocaleDateString()}
                   </p>
                 )}
               </div>
             );
           })}
         </div>
       </CardContent>
     </Card>
   );
 }
 
 // Componente de Resumo Anual
function AnnualSummary({ classId, subjects, classes }: { classId: number | null; subjects: any[]; classes: any[] }) {
  const { data: students = [] } = useStudentsByClass(classId);
  const { data: allGrades = [] } = useGradesByClass(classId, null, null);

  // Calcular médias anuais por educando e disciplina
  const annualData = useMemo(() => {
    if (!students.length || !allGrades.length) return [];

    return students.map(student => {
      const studentGrades = allGrades.filter(g => g.student_id === student.id);
      const subjectAverages: Record<number, { t1: number | null; t2: number | null; t3: number | null; annual: number | null }> = {};

      subjects.forEach(subject => {
        const subjectGrades = studentGrades.filter(g => g.subject_id === subject.id);
        const t1 = subjectGrades.find(g => g.trimestre === 1)?.media_trimestral || null;
        const t2 = subjectGrades.find(g => g.trimestre === 2)?.media_trimestral || null;
        const t3 = subjectGrades.find(g => g.trimestre === 3)?.media_trimestral || null;

        const validGrades = [t1, t2, t3].filter(g => g !== null) as number[];
        const annual = validGrades.length > 0 ? validGrades.reduce((a, b) => a + b, 0) / validGrades.length : null;

        subjectAverages[subject.id] = { t1, t2, t3, annual: annual ? Math.round(annual * 100) / 100 : null };
      });

      // Média geral do educando
      const allAnnuals = Object.values(subjectAverages).map(s => s.annual).filter(a => a !== null) as number[];
      const overallAverage = allAnnuals.length > 0 ? allAnnuals.reduce((a, b) => a + b, 0) / allAnnuals.length : null;

      return {
        student,
        subjectAverages,
        overallAverage: overallAverage ? Math.round(overallAverage * 100) / 100 : null,
      };
    });
  }, [students, allGrades, subjects]);

  if (!classId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Seleccione uma Turma</h3>
          <p className="text-muted-foreground">Escolha uma turma acima para ver o resumo anual</p>
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
              <GraduationCap className="h-5 w-5" />
              Resumo Anual - {classes.find((c: any) => c.id === classId)?.name}
            </CardTitle>
            <CardDescription>Médias trimestrais e anuais por educando</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar Pauta
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {annualData.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma nota lançada ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background">#</TableHead>
                   <TableHead className="sticky left-8 bg-background min-w-[200px]">Educando</TableHead>
                  {subjects.slice(0, 5).map(subject => (
                    <TableHead key={subject.id} className="text-center min-w-[80px]">
                      {subject.code || subject.name.substring(0, 4)}
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-bold">Média Geral</TableHead>
                  <TableHead className="text-center">Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {annualData.map((row, index) => (
                  <TableRow key={row.student.id}>
                    <TableCell className="sticky left-0 bg-background">{index + 1}</TableCell>
                     <TableCell className="sticky left-8 bg-background font-medium">
                       <div className="flex items-center gap-2">
                         {row.student.name}
                         <Link to={`/students/${row.student.id}/caderneta`} className="text-primary hover:underline">
                           <FileText className="h-3 w-3" />
                         </Link>
                       </div>
                     </TableCell>
                    {subjects.slice(0, 5).map(subject => {
                      const avg = row.subjectAverages[subject.id]?.annual;
                      const { className } = classifyGrade(avg);
                      return (
                        <TableCell key={subject.id} className={`text-center ${className}`}>
                          {avg !== null ? avg.toFixed(1) : '-'}
                        </TableCell>
                      );
                    })}
                    <TableCell className={`text-center font-bold ${classifyGrade(row.overallAverage).className}`}>
                      {row.overallAverage !== null ? row.overallAverage.toFixed(1) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.overallAverage !== null && (
                        <Badge variant={row.overallAverage >= 10 ? 'default' : 'destructive'}>
                          {row.overallAverage >= 10 ? 'Aprovado' : 'Reprovado'}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente de Estatísticas/Gráficos
function GradeStatistics({ classId, subjectId }: { classId: number | null; subjectId: number | null }) {
  const { data: grades = [] } = useGradesByClass(classId, subjectId, null);

  const chartData = useMemo(() => {
    const distribution = { excelente: 0, bom: 0, suficiente: 0, insuficiente: 0, mau: 0 };
    
    grades.forEach(grade => {
      const media = grade.media_trimestral;
      if (media === null) return;
      if (media >= 18) distribution.excelente++;
      else if (media >= 14) distribution.bom++;
      else if (media >= 10) distribution.suficiente++;
      else if (media >= 5) distribution.insuficiente++;
      else distribution.mau++;
    });

    return [
      { name: 'Excelente (18-20)', value: distribution.excelente, color: '#059669' },
      { name: 'Bom (14-17)', value: distribution.bom, color: '#0284c7' },
      { name: 'Suficiente (10-13)', value: distribution.suficiente, color: '#ca8a04' },
      { name: 'Insuficiente (5-9)', value: distribution.insuficiente, color: '#ea580c' },
      { name: 'Mau (0-4)', value: distribution.mau, color: '#dc2626' },
    ].filter(d => d.value > 0);
  }, [grades]);

  const trimestreData = useMemo(() => {
    const data = [1, 2, 3].map(t => {
      const tGrades = grades.filter(g => g.trimestre === t && g.media_trimestral !== null);
      const avg = tGrades.length > 0 
        ? tGrades.reduce((sum, g) => sum + (g.media_trimestral || 0), 0) / tGrades.length 
        : 0;
      return {
        name: `${t}º Trim`,
        media: Math.round(avg * 100) / 100,
        total: tGrades.length,
      };
    });
    return data;
  }, [grades]);

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
      {/* Distribuição por Classificação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuição por Classificação</CardTitle>
          <CardDescription>Quantidade de educandos por faixa de nota</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhuma nota lançada
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${value}`}
                >
                  {chartData.map((entry, index) => (
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

      {/* Média por Trimestre */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Média por Trimestre</CardTitle>
          <CardDescription>Evolução da média da turma ao longo do ano</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trimestreData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 20]} />
              <Tooltip 
                formatter={(value: number) => [value.toFixed(1), 'Média']}
              />
              <Bar dataKey="media" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

 export default function Evaluations() {
   const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
   const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
   const [selectedTrimestre, setSelectedTrimestre] = useState<number>(1);
   const [activeTab, setActiveTab] = useState('lancamento');
 
   const { user } = useAuth();
    const { data: classes = [], isLoading: classesLoading } = useClasses();
    const { data: allSubjects = [] } = useSubjects(selectedClassId);
 
   const isAdmin = user?.role === 'ADMIN' || user?.role === 'PEDAGOGICO' || user?.role === 'DIRETORIA' || user?.role === 'SECRETARIA';
 
    const subjects = allSubjects;
 
  const { data: students = [], isLoading: studentsLoading } = useStudentsByClass(selectedClassId);
  const { data: existingGrades = [] } = useGradesByClass(selectedClassId, selectedSubjectId, selectedTrimestre);
 
  const isPedagogical = isAdmin;

  return (
    <MainLayout title="Pauta Digital" subtitle="Sistema de avaliação e lançamento de notas">
      <div className="space-y-6">
        {/* Header com Explicação */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <ClipboardList className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">O que é a Pauta Digital?</h2>
                <p className="text-muted-foreground">
                  A <strong>Pauta Digital</strong> é o sistema de lançamento e gestão de notas dos educandos, 
                  seguindo o modelo de avaliação do <strong>MEC</strong> (Ministério da Educação e Cultura de Moçambique). 
                  As notas são lançadas numa escala de <strong>0 a 20</strong>, com três componentes de avaliação por trimestre:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="p-3 bg-background rounded-lg">
                    <p className="font-semibold text-sm">ACS (30%)</p>
                    <p className="text-xs text-muted-foreground">Avaliação Contínua Sistemática - trabalhos, participação, testes curtos</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <p className="font-semibold text-sm">ACP (30%)</p>
                    <p className="text-xs text-muted-foreground">Avaliação Contínua Parcial - provas parciais do trimestre</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <p className="font-semibold text-sm">ACF (40%)</p>
                    <p className="text-xs text-muted-foreground">Avaliação Contínua Final - prova final do trimestre</p>
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
                  onValueChange={(v) => {
                    setSelectedClassId(Number(v));
                  }}
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

              {/* Disciplina */}
              <div className="space-y-2">
                <Label>Disciplina</Label>
                <Select 
                  value={selectedSubjectId?.toString() || ''} 
                  onValueChange={(v) => setSelectedSubjectId(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.code ? `${s.code} - ${s.name}` : s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Trimestre */}
              <div className="space-y-2">
                <Label>Trimestre</Label>
                <Select 
                  value={selectedTrimestre.toString()} 
                  onValueChange={(v) => setSelectedTrimestre(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIMESTRES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
           <TabsList className={`grid w-full ${isPedagogical ? 'grid-cols-5' : 'grid-cols-4'}`}>
             <TabsTrigger value="lancamento" className="gap-2">
               <FileSpreadsheet className="h-4 w-4" />
               Lançamento de Notas
             </TabsTrigger>
             <TabsTrigger value="faltas" className="gap-2">
               <Users className="h-4 w-4" />
               Faltas
             </TabsTrigger>
             <TabsTrigger value="resumo" className="gap-2">
               <GraduationCap className="h-4 w-4" />
               Resumo Anual
             </TabsTrigger>
             <TabsTrigger value="estatisticas" className="gap-2">
               <BarChart3 className="h-4 w-4" />
               Estatísticas
             </TabsTrigger>
             {isPedagogical && (
               <TabsTrigger value="pedagogico" className="gap-2">
                 <CheckCircle2 className="h-4 w-4" />
                 Publicação
               </TabsTrigger>
             )}
           </TabsList>

           <TabsContent value="lancamento" className="mt-6">
             <GradeEntry 
               classId={selectedClassId}
               subjectId={selectedSubjectId}
               trimestre={selectedTrimestre}
               students={students}
               existingGrades={existingGrades}
               studentsLoading={studentsLoading}
               classes={classes}
               subjects={subjects}
             />
           </TabsContent>
 
           <TabsContent value="faltas" className="mt-6">
             <AttendanceEntry
               classId={selectedClassId}
               subjectId={selectedSubjectId}
               students={students}
               studentsLoading={studentsLoading}
               classes={classes}
               subjects={subjects}
             />
           </TabsContent>

          <TabsContent value="resumo" className="mt-6">
            <AnnualSummary 
              classId={selectedClassId} 
              subjects={subjects}
              classes={classes}
            />
          </TabsContent>

           <TabsContent value="estatisticas" className="mt-6">
             <GradeStatistics classId={selectedClassId} subjectId={selectedSubjectId} />
           </TabsContent>
 
           {isPedagogical && (
             <TabsContent value="pedagogico" className="mt-6">
               <PedagogicalRelease />
             </TabsContent>
           )}
         </Tabs>
      </div>
    </MainLayout>
  );
}
