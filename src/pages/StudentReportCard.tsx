   // Fetch release settings
   const { data: releaseSettings } = useQuery({
     queryKey: ['pedagogical-release-settings', student?.class?.year],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('pedagogical_settings')
         .select('*')
         .eq('academic_year', student?.class?.year);
       if (error) throw error;
       return data;
     },
     enabled: !!student?.class?.year
   });
 
   const isReleased = (trimestre: number) => {
     const setting = releaseSettings?.find(s => s.trimestre === trimestre);
     return setting?.release_status === 'released';
   };
 
 import React, { useMemo } from 'react';
 import { useParams, useNavigate } from 'react-router-dom';
 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { MainLayout } from '@/components/layout/MainLayout';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { 
   ArrowLeft, Printer, Download, GraduationCap,
   Calendar, User, BookOpen, Clock, AlertCircle, ShieldAlert
 } from 'lucide-react';
 import { 
   Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
 } from '@/components/ui/table';
 import { classifyGrade } from '@/hooks/useGrades';
 import { Skeleton } from '@/components/ui/skeleton';
 
 export default function StudentReportCard() {
   const { id } = useParams();
   const navigate = useNavigate();
   const studentId = Number(id);
 
   // Fetch student and class details
   const { data: student, isLoading: studentLoading } = useQuery({
     queryKey: ['student-report-card', studentId],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('students')
         .select(`
           *,
           class:class_id (id, name, year, teacher:teacher_id (name))
         `)
         .eq('id', studentId)
         .single();
       if (error) throw error;
       return data;
     },
   });
 
   // Fetch all subjects
   const { data: subjects = [] } = useQuery({
     queryKey: ['subjects'],
     queryFn: async () => {
       const { data, error } = await supabase.from('subjects').select('*').order('name');
       if (error) throw error;
       return data;
     },
   });
 
   // Fetch all grades for this student
   const { data: grades = [], isLoading: gradesLoading } = useQuery({
     queryKey: ['student-grades', studentId],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('grades')
         .select('*')
         .eq('student_id', studentId);
       if (error) throw error;
       return data;
     },
   });
 
   // Fetch attendance summary
   const { data: attendanceStats } = useQuery({
     queryKey: ['student-attendance-summary', studentId],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('attendance')
         .select('status')
         .eq('student_id', studentId);
       
       if (error) throw error;
       
       const total = data.length;
       const faltas = data.filter(a => a.status === 'FALTA').length;
       const justificadas = data.filter(a => a.status === 'FALTA_JUSTIFICADA').length;
       const atrasos = data.filter(a => a.status === 'ATRASO').length;
       
       return { total, faltas, justificadas, atrasos, presenca: total > 0 ? Math.round(((total - faltas) / total) * 100) : 100 };
     },
   });
 
   const reportData = useMemo(() => {
     return subjects.map(subject => {
       const subjectGrades = grades.filter(g => g.subject_id === subject.id);
       const t1 = subjectGrades.find(g => g.trimestre === 1);
       const t2 = subjectGrades.find(g => g.trimestre === 2);
       const t3 = subjectGrades.find(g => g.trimestre === 3);
       
       const averages = [t1?.media_trimestral, t2?.media_trimestral, t3?.media_trimestral].filter(v => v !== null && v !== undefined) as number[];
       const mediaAnual = averages.length > 0 ? averages.reduce((a, b) => a + b, 0) / averages.length : null;
 
       return {
         subject,
         t1: t1?.media_trimestral ?? null,
         t2: t2?.media_trimestral ?? null,
         t3: t3?.media_trimestral ?? null,
         mediaAnual: mediaAnual ? Math.round(mediaAnual * 10) / 10 : null
       };
     });
   }, [subjects, grades]);
 
   const handlePrint = () => {
     window.print();
   };
 
   if (studentLoading || gradesLoading) {
     return (
       <MainLayout title="Caderneta do Aluno">
         <div className="space-y-6">
           <Skeleton className="h-40 w-full" />
           <Skeleton className="h-96 w-full" />
         </div>
       </MainLayout>
     );
   }
 
   if (!student) {
     return (
       <MainLayout title="Caderneta do Aluno">
         <div className="text-center py-20">
           <p className="text-muted-foreground">Educando não encontrado.</p>
           <Button variant="link" onClick={() => navigate(-1)}>Voltar</Button>
         </div>
       </MainLayout>
     );
   }
 
   return (
     <MainLayout title="Caderneta do Aluno" subtitle={`Visualização de desempenho de ${student.name}`}>
       <div className="space-y-6 print:m-0 print:p-0">
         <div className="flex justify-between items-center print:hidden">
           <Button variant="ghost" onClick={() => navigate(-1)}>
             <ArrowLeft className="w-4 h-4 mr-2" />
             Voltar
           </Button>
           <div className="flex gap-2">
             <Button variant="outline" onClick={handlePrint}>
               <Printer className="w-4 h-4 mr-2" />
               Imprimir
             </Button>
             <Button>
               <Download className="w-4 h-4 mr-2" />
               Download PDF
             </Button>
           </div>
         </div>
 
         {/* Cabeçalho da Caderneta */}
         <Card className="print:border-none print:shadow-none">
           <CardContent className="pt-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center print:hidden">
                   <User className="h-8 w-8 text-primary" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold">{student.name}</h2>
                   <p className="text-sm text-muted-foreground">Processo: {student.id}</p>
                 </div>
               </div>
               
               <div className="space-y-1">
                 <p className="text-sm text-muted-foreground flex items-center gap-2">
                   <GraduationCap className="h-4 w-4" />
                   Turma: <span className="font-medium text-foreground">{student.class?.name || 'N/A'}</span>
                 </p>
                 <p className="text-sm text-muted-foreground flex items-center gap-2">
                   <Calendar className="h-4 w-4" />
                   Ano Lectivo: <span className="font-medium text-foreground">{student.class?.year || 'N/A'}</span>
                 </p>
               </div>
 
               <div className="space-y-1">
                 <p className="text-sm text-muted-foreground flex items-center gap-2">
                   <User className="h-4 w-4" />
                   Dir. de Turma: <span className="font-medium text-foreground">{(student.class as any)?.teacher?.name || 'N/A'}</span>
                 </p>
                 <p className="text-sm text-muted-foreground flex items-center gap-2">
                   <Badge variant="outline" className={attendanceStats?.presenca && attendanceStats.presenca < 80 ? 'text-red-500' : 'text-green-500'}>
                     Presença: {attendanceStats?.presenca || 0}%
                   </Badge>
                 </p>
               </div>
             </div>
           </CardContent>
         </Card>
 
         {/* Tabela de Notas */}
         <Card className="print:border-none print:shadow-none">
           <CardHeader className="pb-2">
             <CardTitle className="text-lg flex items-center gap-2">
               <BookOpen className="h-5 w-5" />
               Aproveitamento Pedagógico (SiGER)
             </CardTitle>
           </CardHeader>
           <CardContent>
             <Table className="border print:text-xs">
               <TableHeader>
                 <TableRow className="bg-muted/50">
                   <TableHead className="w-1/3">Disciplina</TableHead>
                   <TableHead className="text-center">1º Trim</TableHead>
                   <TableHead className="text-center">2º Trim</TableHead>
                   <TableHead className="text-center">3º Trim</TableHead>
                   <TableHead className="text-center font-bold">Média Anual</TableHead>
                   <TableHead className="text-center">Situação</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {reportData.map((row) => (
                   <TableRow key={row.subject.id}>
                     <TableCell className="font-medium">{row.subject.name}</TableCell>
                     <TableCell className={`text-center ${classifyGrade(row.t1).className}`}>
                       {row.t1 ?? '-'}
                     </TableCell>
                     <TableCell className={`text-center ${classifyGrade(row.t2).className}`}>
                       {row.t2 ?? '-'}
                     </TableCell>
                     <TableCell className={`text-center ${classifyGrade(row.t3).className}`}>
                       {row.t3 ?? '-'}
                     </TableCell>
                     <TableCell className={`text-center font-bold ${classifyGrade(row.mediaAnual).className}`}>
                       {row.mediaAnual ?? '-'}
                     </TableCell>
                     <TableCell className="text-center">
                       {row.mediaAnual !== null ? (
                         <span className={row.mediaAnual >= 10 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                           {row.mediaAnual >= 10 ? 'Apt' : 'Não Apt'}
                         </span>
                       ) : '-'}
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </CardContent>
         </Card>
 
         {/* Resumo de Faltas e Observações */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card className="print:border-none print:shadow-none">
             <CardHeader>
               <CardTitle className="text-sm font-medium flex items-center gap-2">
                 <Clock className="h-4 w-4" />
                 Resumo de Faltas
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-3 gap-4 text-center">
                 <div className="p-3 bg-muted/30 rounded-lg">
                   <p className="text-2xl font-bold">{attendanceStats?.faltas || 0}</p>
                   <p className="text-xs text-muted-foreground">Faltas</p>
                 </div>
                 <div className="p-3 bg-muted/30 rounded-lg">
                   <p className="text-2xl font-bold">{attendanceStats?.justificadas || 0}</p>
                   <p className="text-xs text-muted-foreground">Justificadas</p>
                 </div>
                 <div className="p-3 bg-muted/30 rounded-lg">
                   <p className="text-2xl font-bold">{attendanceStats?.atrasos || 0}</p>
                   <p className="text-xs text-muted-foreground">Atrasos</p>
                 </div>
               </div>
             </CardContent>
           </Card>
 
           <Card className="print:border-none print:shadow-none">
             <CardHeader>
               <CardTitle className="text-sm font-medium flex items-center gap-2">
                 <AlertCircle className="h-4 w-4" />
                 Observações Gerais
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="min-h-[80px] border border-dashed rounded-lg p-3 text-sm text-muted-foreground italic">
                 Espaço reservado para observações do Director de Turma e Conselho de Notas.
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Assinaturas (Print only) */}
         <div className="hidden print:grid grid-cols-2 gap-20 mt-20 text-center">
           <div className="border-t border-black pt-2">
             <p className="text-sm font-bold">O Director de Turma</p>
           </div>
           <div className="border-t border-black pt-2">
             <p className="text-sm font-bold">O Director Pedagógico</p>
           </div>
         </div>
       </div>
     </MainLayout>
   );
 }
