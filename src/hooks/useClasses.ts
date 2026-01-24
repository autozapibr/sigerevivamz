import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Class = Database['public']['Tables']['classes']['Row'];
type ClassInsert = Database['public']['Tables']['classes']['Insert'];
type ClassUpdate = Database['public']['Tables']['classes']['Update'];

export interface ClassWithDetails extends Class {
  teacher?: {
    id: number;
    name: string;
    email: string | null;
  } | null;
  students_count?: number;
}

export interface ClassFilters {
  search?: string;
  year?: number | null;
}

export function useClassesList(filters: ClassFilters = {}) {
  return useQuery({
    queryKey: ['classes-list', filters],
    queryFn: async () => {
      let query = supabase
        .from('classes')
        .select(`
          *,
          teacher:teacher_id (id, name, email)
        `)
        .order('year', { ascending: false })
        .order('name');

      if (filters.year) {
        query = query.eq('year', filters.year);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get students count per class
      const { data: studentsData } = await supabase
        .from('students')
        .select('class_id')
        .eq('status', 'Ativo');

      const studentCounts: Record<number, number> = {};
      studentsData?.forEach(s => {
        if (s.class_id) {
          studentCounts[s.class_id] = (studentCounts[s.class_id] || 0) + 1;
        }
      });

      // Apply search filter and add counts
      let result = data.map(c => ({
        ...c,
        students_count: studentCounts[c.id] || 0,
      })) as ClassWithDetails[];

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(c =>
          c.name.toLowerCase().includes(searchLower)
        );
      }

      return result;
    },
  });
}

export function useClass(classId: number | null) {
  return useQuery({
    queryKey: ['class', classId],
    queryFn: async () => {
      if (!classId) return null;

      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          teacher:teacher_id (id, name, email, phone)
        `)
        .eq('id', classId)
        .single();

      if (error) throw error;
      return data as ClassWithDetails;
    },
    enabled: !!classId,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (classData: ClassInsert) => {
      const { data, error } = await supabase
        .from('classes')
        .insert(classData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes-list'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: 'Sucesso',
        description: 'Turma criada com sucesso',
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

export function useUpdateClass() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: ClassUpdate & { id: number }) => {
      const { data: updated, error } = await supabase
        .from('classes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classes-list'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['class', variables.id] });
      toast({
        title: 'Sucesso',
        description: 'Turma actualizada com sucesso',
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

export function useDeleteClass() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (classId: number) => {
      // First check if there are students in this class
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', classId)
        .limit(1);

      if (students && students.length > 0) {
        throw new Error('Não é possível eliminar uma turma com educandos. Transfira os educandos primeiro.');
      }

      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes-list'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: 'Sucesso',
        description: 'Turma eliminada com sucesso',
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

export function useClassesStats() {
  return useQuery({
    queryKey: ['classes-stats'],
    queryFn: async () => {
      const [classesRes, studentsRes] = await Promise.all([
        supabase.from('classes').select('id, year, teacher_id'),
        supabase.from('students').select('class_id').eq('status', 'Ativo'),
      ]);

      if (classesRes.error) throw classesRes.error;
      if (studentsRes.error) throw studentsRes.error;

      const studentCounts: Record<number, number> = {};
      studentsRes.data.forEach(s => {
        if (s.class_id) {
          studentCounts[s.class_id] = (studentCounts[s.class_id] || 0) + 1;
        }
      });

      const currentYear = new Date().getFullYear();

      return {
        total: classesRes.data.length,
        anoCorrente: classesRes.data.filter(c => c.year === currentYear).length,
        comProfessor: classesRes.data.filter(c => c.teacher_id).length,
        semProfessor: classesRes.data.filter(c => !c.teacher_id).length,
        vazias: classesRes.data.filter(c => !studentCounts[c.id]).length,
        totalEducandos: studentsRes.data.length,
      };
    },
  });
}
