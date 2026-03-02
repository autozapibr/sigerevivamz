import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Teacher = Database['public']['Tables']['teachers']['Row'];
type TeacherInsert = Database['public']['Tables']['teachers']['Insert'];
type TeacherUpdate = Database['public']['Tables']['teachers']['Update'];

export interface TeacherWithClasses extends Teacher {
  classes_count?: number;
  subjects_count?: number;
}

export interface TeacherFilters {
  search?: string;
  status?: 'Ativo' | 'Inativo' | 'all';
}

export function useTeachers(filters: TeacherFilters = {}) {
  return useQuery({
    queryKey: ['teachers', filters],
    queryFn: async () => {
      let query = supabase
        .from('teachers')
        .select('*')
        .order('name');

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Client-side search filter
      let result = data as Teacher[];
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(t =>
          t.name.toLowerCase().includes(searchLower) ||
          t.email?.toLowerCase().includes(searchLower) ||
          t.phone?.includes(searchLower)
        );
      }

      return result;
    },
  });
}

export function useTeacher(teacherId: number | null) {
  return useQuery({
    queryKey: ['teacher', teacherId],
    queryFn: async () => {
      if (!teacherId) return null;

      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', teacherId)
        .single();

      if (error) throw error;
      return data as Teacher;
    },
    enabled: !!teacherId,
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (teacher: TeacherInsert) => {
      const { data, error } = await supabase
        .from('teachers')
        .insert(teacher)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: 'Sucesso',
        description: 'Professor registado com sucesso',
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

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Omit<TeacherUpdate, 'id'> & { id: number }) => {
      const { data: updated, error } = await supabase
        .from('teachers')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', variables.id] });
      toast({
        title: 'Sucesso',
        description: 'Dados do professor actualizados',
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

export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (teacherId: number) => {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacherId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: 'Sucesso',
        description: 'Professor removido com sucesso',
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

export function useTeachersStats() {
  return useQuery({
    queryKey: ['teachers-stats'],
    queryFn: async () => {
      const [teachersRes, classesRes, curriculumRes] = await Promise.all([
        supabase.from('teachers').select('id, status'),
        supabase.from('classes').select('id, teacher_id'),
        supabase.from('class_curriculum').select('teacher_id'),
      ]);

      if (teachersRes.error) throw teachersRes.error;
      if (classesRes.error) throw classesRes.error;
      if (curriculumRes.error) throw curriculumRes.error;

      // Teachers with classes as director
      const teachersAsDirector = new Set(classesRes.data.filter(c => c.teacher_id).map(c => c.teacher_id));
      // Teachers with curriculum assignments
      const teachersWithCurriculum = new Set(curriculumRes.data.map(c => c.teacher_id));
      // Combined set
      const teachersWithClasses = new Set([...teachersAsDirector, ...teachersWithCurriculum]);

      return {
        total: teachersRes.data.length,
        ativos: teachersRes.data.filter(t => t.status === 'Ativo').length,
        inativos: teachersRes.data.filter(t => t.status === 'Inativo').length,
        comTurmas: teachersWithClasses.size,
        semTurmas: teachersRes.data.filter(t => !teachersWithClasses.has(t.id)).length,
      };
    },
  });
}

// Hook to get teacher's classes (as director)
export function useTeacherClasses(teacherId: number | null) {
  return useQuery({
    queryKey: ['teacher-classes', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, year')
        .eq('teacher_id', teacherId)
        .order('year', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!teacherId,
  });
}
