import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link2, Unlink, UserCircle2, GraduationCap, Briefcase } from 'lucide-react';
import { useTeachers } from '@/hooks/useTeachers';
import { useStudents } from '@/hooks/useStudents';
import { useEmployees } from '@/hooks/useEmployees';

interface UserLinkDialogProps {
  userId: string;
  userName: string;
  userRole: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserLinkDialog({ userId, userName, userRole, open, onOpenChange }: UserLinkDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [linkType, setLinkType] = useState<'teacher' | 'student' | 'employee'>(
    userRole === 'PROFESSOR' ? 'teacher' : 
    userRole === 'ALUNO' ? 'student' : 
    'employee'
  );
  const [selectedId, setSelectedId] = useState<string>('');

  const { data: teachers = [] } = useTeachers();
  const { data: students = [] } = useStudents();
  const { data: employees = [] } = useEmployees();
  
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  React.useEffect(() => {
    if (profile) {
      if (profile.teacher_id) {
        setLinkType('teacher');
        setSelectedId(profile.teacher_id.toString());
      } else if (profile.student_id) {
        setLinkType('student');
        setSelectedId(profile.student_id.toString());
      } else if (profile.employee_id) {
        setLinkType('employee');
        setSelectedId(profile.employee_id.toString());
      }
    }
  }, [profile]);

  const linkMutation = useMutation({
    mutationFn: async () => {
      const update: any = {
        teacher_id: linkType === 'teacher' ? Number(selectedId) : null,
        student_id: linkType === 'student' ? Number(selectedId) : null,
        employee_id: linkType === 'employee' ? Number(selectedId) : null,
      };

      const { error } = await supabase
        .from('profiles')
        .update(update)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['current-teacher'] });
      toast({ title: 'Sucesso', description: 'Vínculo actualizado com sucesso' });
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update({
          teacher_id: null,
          student_id: null,
          employee_id: null,
        })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['current-teacher'] });
      toast({ title: 'Sucesso', description: 'Vínculo removido' });
      setSelectedId('');
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });

  const currentList = linkType === 'teacher' ? teachers : linkType === 'student' ? students : employees;
  const isLinked = profile?.teacher_id || profile?.student_id || profile?.employee_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Vincular Utilizador
          </DialogTitle>
          <DialogDescription>
            Vincule a conta de <strong>{userName}</strong> a um registo no sistema para que ele tenha acesso aos seus dados específicos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Tipo de Vínculo</Label>
            <Select value={linkType} onValueChange={(v: any) => { setLinkType(v); setSelectedId(''); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">
                  <div className="flex items-center gap-2">
                    <UserCircle2 className="w-4 h-4" /> Professor
                  </div>
                </SelectItem>
                <SelectItem value="student">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> Educando
                  </div>
                </SelectItem>
                <SelectItem value="employee">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Colaborador/Funcionário
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Seleccionar {linkType === 'teacher' ? 'Professor' : linkType === 'student' ? 'Educando' : 'Colaborador'}</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger>
                <SelectValue placeholder={`Seleccione um ${linkType === 'teacher' ? 'professor' : linkType === 'student' ? 'educando' : 'colaborador'}`} />
              </SelectTrigger>
              <SelectContent>
                {currentList.map((item: any) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name} {item.email ? `(${item.email})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {isLinked && (
            <Button
              variant="outline"
              className="text-destructive border-destructive/20 hover:bg-destructive/10"
              onClick={() => unlinkMutation.mutate()}
              disabled={unlinkMutation.isPending}
            >
              <Unlink className="w-4 h-4 mr-2" />
              Remover Vínculo
            </Button>
          )}
          <div className="flex-1" />
          <Button
            onClick={() => linkMutation.mutate()}
            disabled={linkMutation.isPending || !selectedId}
          >
            {linkMutation.isPending ? 'Guardando...' : 'Salvar Vínculo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}