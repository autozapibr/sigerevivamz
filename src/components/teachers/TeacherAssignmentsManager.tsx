 import React, { useState } from 'react';
 import { Button } from '@/components/ui/button';
 import { Label } from '@/components/ui/label';
 import { Input } from '@/components/ui/input';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Badge } from '@/components/ui/badge';
 import { Card, CardContent } from '@/components/ui/card';
 import { Trash2, Plus, BookOpen, Loader2 } from 'lucide-react';
 import { useClassesList } from '@/hooks/useClasses';
 import { useSubjectsList } from '@/hooks/useSubjects';
 import {
   useTeacherAssignments,
   useUpsertAssignment,
   useDeleteAssignment,
 } from '@/hooks/useTeacherAssignments';
 
 interface Props {
   teacher: { id: number; name: string } | null;
 }
 
 const SHIFTS = ['Manhã', 'Tarde', 'Noite'];
 
 export function TeacherAssignmentsManager({ teacher }: Props) {
   const { data: assignments = [], isLoading } = useTeacherAssignments(teacher?.id ?? null);
   const { data: classes = [] } = useClassesList({});
   const { data: subjects = [] } = useSubjectsList({});
   const upsert = useUpsertAssignment();
   const remove = useDeleteAssignment();
 
   const [classId, setClassId] = useState<string>('');
   const [subjectId, setSubjectId] = useState<string>('');
   const [shift, setShift] = useState<string>('Manhã');
   const [hours, setHours] = useState<string>('');
 
   const totalHours = assignments.reduce((s, a) => s + (a.weekly_hours || 0), 0);
 
   const handleAdd = async () => {
     if (!teacher || !classId || !subjectId) return;
     await upsert.mutateAsync({
       teacher_id: teacher.id,
       class_id: Number(classId),
       subject_id: Number(subjectId),
       weekly_hours: hours ? Number(hours) : 0,
       shift,
     });
     setClassId(''); setSubjectId(''); setHours('');
   };
 
   if (!teacher) return null;
 
   return (
     <div className="space-y-6">
       <Card className="bg-muted/30 border-dashed">
         <CardContent className="pt-6 space-y-4">
           <div className="flex items-center justify-between">
             <h4 className="font-semibold text-sm">Nova atribuição pedagógica</h4>
             <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
               {totalHours}h totais/semana
             </Badge>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <Label className="text-xs font-bold uppercase text-muted-foreground">Turma</Label>
               <Select value={classId} onValueChange={setClassId}>
                 <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar turma" /></SelectTrigger>
                 <SelectContent>
                   {classes.map(c => (
                     <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.year})</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             <div className="space-y-1.5">
               <Label className="text-xs font-bold uppercase text-muted-foreground">Disciplina</Label>
               <Select value={subjectId} onValueChange={setSubjectId}>
                 <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar disciplina" /></SelectTrigger>
                 <SelectContent>
                   {subjects.map(s => (
                     <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             <div className="space-y-1.5">
               <Label className="text-xs font-bold uppercase text-muted-foreground">Turno</Label>
               <Select value={shift} onValueChange={setShift}>
                 <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                 <SelectContent>
                   {SHIFTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                 </SelectContent>
               </Select>
             </div>
             <div className="space-y-1.5">
               <Label className="text-xs font-bold uppercase text-muted-foreground">Carga Horária (h)</Label>
               <Input 
                 type="number" 
                 min={0} 
                 max={40} 
                 value={hours} 
                 onChange={e => setHours(e.target.value)} 
                 placeholder="Ex: 4" 
                 className="h-9"
               />
             </div>
           </div>
           <Button 
             onClick={handleAdd} 
             disabled={!classId || !subjectId || upsert.isPending} 
             className="w-full bg-primary/10 hover:bg-primary/20 text-primary border-0"
             variant="outline"
           >
             {upsert.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
             Vincular Disciplina
           </Button>
         </CardContent>
       </Card>
 
       <div className="space-y-3">
         <h4 className="font-semibold text-sm flex items-center gap-2">
           Disciplinas Atribuídas
           <Badge variant="secondary" className="rounded-full">{assignments.length}</Badge>
         </h4>
 
         {isLoading ? (
           <div className="flex items-center justify-center py-8">
             <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
           </div>
         ) : assignments.length === 0 ? (
           <div className="text-center py-10 bg-muted/10 rounded-lg border-2 border-dashed">
             <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
             <p className="text-sm text-muted-foreground">Ainda não foram atribuídas disciplinas a este professor.</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 gap-2">
             {assignments.map(a => (
               <div 
                 key={a.id} 
                 className="flex items-center justify-between p-3 bg-card border rounded-lg hover:border-primary/30 transition-colors group"
               >
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-3">
                     <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                       {a.class?.name}
                     </Badge>
                     <div>
                       <p className="font-medium text-sm">{a.subject?.name}</p>
                       <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                         <span>{a.shift}</span>
                         {a.weekly_hours > 0 && (
                           <>
                             <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                             <span>{a.weekly_hours}h/semana</span>
                           </>
                         )}
                       </div>
                     </div>
                   </div>
                 </div>
                 <Button
                   variant="ghost"
                   size="icon"
                   onClick={() => remove.mutate(a.id)}
                   disabled={remove.isPending}
                   className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                   <Trash2 className="w-4 h-4" />
                 </Button>
               </div>
             ))}
           </div>
         )}
       </div>
     </div>
   );
 }