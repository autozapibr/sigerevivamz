import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  open: boolean;
  onOpenChange: (v: boolean) => void;
  teacher: { id: number; name: string } | null;
}

const SHIFTS = ['Manhã', 'Tarde', 'Noite'];

export function TeacherAssignmentsDialog({ open, onOpenChange, teacher }: Props) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Atribuições — {teacher?.name}</DialogTitle>
          <DialogDescription>
            Defina as turmas e disciplinas que este professor lecciona. Cada combinação turma+disciplina pode ter um único responsável.
          </DialogDescription>
        </DialogHeader>

        <Card className="bg-muted/30">
          <CardContent className="pt-6 space-y-4">
            <h4 className="font-semibold text-sm">Adicionar atribuição</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Turma</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar turma" /></SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.year})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Disciplina</Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar disciplina" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Turno</Label>
                <Select value={shift} onValueChange={setShift}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SHIFTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Carga (h/semana)</Label>
                <Input type="number" min={0} max={40} value={hours} onChange={e => setHours(e.target.value)} placeholder="0" />
              </div>
            </div>
            <Button onClick={handleAdd} disabled={!classId || !subjectId || upsert.isPending} className="w-full">
              {upsert.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Adicionar / Substituir
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">
              Atribuições actuais ({assignments.length})
            </h4>
            <Badge variant="secondary">Total: {totalHours}h/semana</Badge>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">A carregar…</p>
          ) : assignments.length === 0 ? (
            <Card className="bg-muted/20">
              <CardContent className="py-8 text-center">
                <BookOpen className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma atribuição ainda.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {assignments.map(a => (
                <Card key={a.id}>
                  <CardContent className="py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono">{a.class?.name}</Badge>
                        <span className="font-medium">{a.subject?.name}</span>
                        {a.shift && <Badge variant="secondary">{a.shift}</Badge>}
                        {a.weekly_hours ? <Badge variant="secondary">{a.weekly_hours}h</Badge> : null}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove.mutate(a.id)}
                      disabled={remove.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
