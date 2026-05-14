import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TeacherAssignment {
  id: number;
  teacher_id: number;
  class_id: number;
  subject_id: number;
  weekly_hours: number | null;
  shift: string | null;
  class?: { id: number; name: string; year: number } | null;
  subject?: { id: number; name: string; code: string | null } | null;
}

export function useTeacherAssignments(teacherId: number | null) {
  return useQuery({
    queryKey: ['teacher-assignments', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      const { data, error } = await supabase
        .from('class_curriculum')
        .select('id, teacher_id, class_id, subject_id, weekly_hours, shift, class:class_id(id,name,year), subject:subject_id(id,name,code)')
        .eq('teacher_id', teacherId);
      if (error) throw error;
      return (data || []) as unknown as TeacherAssignment[];
    },
    enabled: !!teacherId,
  });
}

export function useAllAssignments() {
  return useQuery({
    queryKey: ['all-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_curriculum')
        .select('id, teacher_id, class_id, subject_id, weekly_hours, shift');
      if (error) throw error;
      return data || [];
    },
  });
}

export function useUpsertAssignment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: {
      teacher_id: number;
      class_id: number;
      subject_id: number;
      weekly_hours?: number;
      shift?: string;
    }) => {
      const { data, error } = await supabase
        .from('class_curriculum')
        .upsert(payload, { onConflict: 'class_id,subject_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-assignments'] });
      qc.invalidateQueries({ queryKey: ['all-assignments'] });
      qc.invalidateQueries({ queryKey: ['teachers-stats'] });
      toast({ title: 'Atribuição guardada', description: 'Disciplina atribuída ao professor.' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteAssignment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('class_curriculum').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-assignments'] });
      qc.invalidateQueries({ queryKey: ['all-assignments'] });
      toast({ title: 'Atribuição removida' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}
