import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Subject = Database['public']['Tables']['subjects']['Row'];
type SubjectInsert = Database['public']['Tables']['subjects']['Insert'];
type SubjectUpdate = Database['public']['Tables']['subjects']['Update'];

export interface SubjectFilters {
  search?: string;
}

export function useSubjectsList(filters: SubjectFilters = {}) {
  return useQuery({
    queryKey: ['subjects-list', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;

      // Client-side search filter
      let result = data as Subject[];
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(s =>
          s.name.toLowerCase().includes(searchLower) ||
          s.code?.toLowerCase().includes(searchLower)
        );
      }

      return result;
    },
  });
}

export function useSubject(subjectId: number | null) {
  return useQuery({
    queryKey: ['subject', subjectId],
    queryFn: async () => {
      if (!subjectId) return null;

      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .single();

      if (error) throw error;
      return data as Subject;
    },
    enabled: !!subjectId,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (subject: SubjectInsert) => {
      const { data, error } = await supabase
        .from('subjects')
        .insert(subject)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects-list'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({
        title: 'Sucesso',
        description: 'Disciplina criada com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: SubjectUpdate & { id: number }) => {
      const { data: updated, error } = await supabase
        .from('subjects')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subjects-list'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['subject', variables.id] });
      toast({
        title: 'Sucesso',
        description: 'Disciplina actualizada com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (subjectId: number) => {
      // Check if subject is in curriculum
      const { data: curriculum } = await supabase
        .from('class_curriculum')
        .select('class_id')
        .eq('subject_id', subjectId)
        .limit(1);

      if (curriculum && curriculum.length > 0) {
        throw new Error('Não é possível eliminar uma disciplina que está no currículo de uma turma.');
      }

      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects-list'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({
        title: 'Sucesso',
        description: 'Disciplina eliminada com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useSubjectsStats() {
  return useQuery({
    queryKey: ['subjects-stats'],
    queryFn: async () => {
      const [subjectsRes, curriculumRes] = await Promise.all([
        supabase.from('subjects').select('id, workload'),
        supabase.from('class_curriculum').select('subject_id'),
      ]);

      if (subjectsRes.error) throw subjectsRes.error;
      if (curriculumRes.error) throw curriculumRes.error;

      const subjectsInUse = new Set(curriculumRes.data.map(c => c.subject_id));
      const totalWorkload = subjectsRes.data.reduce((sum, s) => sum + (s.workload || 0), 0);

      return {
        total: subjectsRes.data.length,
        emUso: subjectsInUse.size,
        semUso: subjectsRes.data.filter(s => !subjectsInUse.has(s.id)).length,
        cargaHorariaTotal: totalWorkload,
      };
    },
  });
}
