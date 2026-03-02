import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Student = Database['public']['Tables']['students']['Row'];
type StudentInsert = Database['public']['Tables']['students']['Insert'];
type StudentUpdate = Database['public']['Tables']['students']['Update'];

export interface StudentWithClass extends Student {
  classes?: {
    id: number;
    name: string;
    year: number;
  } | null;
}

export interface StudentFilters {
  search?: string;
  status?: 'Ativo' | 'Inativo' | 'all';
  class_id?: number | null;
  gender?: 'MASCULINO' | 'FEMININO' | 'all';
}

export function useStudents(filters: StudentFilters = {}) {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: async () => {
      let query = supabase
        .from('students')
        .select(`
          *,
          classes:class_id (id, name, year)
        `)
        .order('name');

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.class_id) {
        query = query.eq('class_id', filters.class_id);
      }

      if (filters.gender && filters.gender !== 'all') {
        query = query.eq('gender', filters.gender);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Client-side search filter
      let result = data as StudentWithClass[];
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(s =>
          s.name.toLowerCase().includes(searchLower) ||
          s.bi_number?.toLowerCase().includes(searchLower) ||
          s.phone?.includes(searchLower)
        );
      }

      return result;
    },
  });
}

export function useStudent(studentId: number | null) {
  return useQuery({
    queryKey: ['student', studentId],
    queryFn: async () => {
      if (!studentId) return null;

      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          classes:class_id (id, name, year)
        `)
        .eq('id', studentId)
        .single();

      if (error) throw error;
      return data as StudentWithClass;
    },
    enabled: !!studentId,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (student: StudentInsert) => {
      const { data, error } = await supabase
        .from('students')
        .insert(student)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Sucesso',
        description: 'Educando registado com sucesso',
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

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Omit<StudentUpdate, 'id'> & { id: number }) => {
      const { data: updated, error } = await supabase
        .from('students')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] });
      toast({
        title: 'Sucesso',
        description: 'Dados do educando actualizados',
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

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (studentId: number) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Sucesso',
        description: 'Educando removido com sucesso',
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

export function useStudentsStats() {
  return useQuery({
    queryKey: ['students-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, status, gender, class_id');

      if (error) throw error;

      return {
        total: data.length,
        ativos: data.filter(s => s.status === 'Ativo').length,
        inativos: data.filter(s => s.status === 'Inativo').length,
        masculino: data.filter(s => s.gender === 'MASCULINO').length,
        feminino: data.filter(s => s.gender === 'FEMININO').length,
        comTurma: data.filter(s => s.class_id).length,
        semTurma: data.filter(s => !s.class_id).length,
      };
    },
  });
}
