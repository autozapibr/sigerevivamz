import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AttendanceStatus = 'PRESENTE' | 'FALTA' | 'FALTA_JUSTIFICADA' | 'ATRASO';

export interface AttendanceRecord {
  id: number;
  student_id: number;
  class_id: number;
  subject_id: number | null;
  date: string;
  status: AttendanceStatus;
  observation: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
  students?: {
    id: number;
    name: string;
  };
}

export interface AttendanceInsert {
  student_id: number;
  class_id: number;
  subject_id?: number | null;
  date: string;
  status: AttendanceStatus;
  observation?: string | null;
}

export function useAttendanceByClass(classId: number | null, date: string) {
  return useQuery({
    queryKey: ['attendance', classId, date],
    queryFn: async () => {
      if (!classId) return [];
      
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          students:student_id (id, name)
        `)
        .eq('class_id', classId)
        .eq('date', date)
        .order('students(name)');

      if (error) throw error;
      return data as AttendanceRecord[];
    },
    enabled: !!classId,
  });
}

export function useStudentsByClass(classId: number | null) {
  return useQuery({
    queryKey: ['students-by-class', classId],
    queryFn: async () => {
      if (!classId) return [];
      
      const { data, error } = await supabase
        .from('students')
        .select('id, name, photo_url')
        .eq('class_id', classId)
        .eq('status', 'Ativo')
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });
}

export function useRecordAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (records: AttendanceInsert[]) => {
      // Upsert para permitir atualização
      const { data, error } = await supabase
        .from('attendance')
        .upsert(records, {
          onConflict: 'student_id,date,subject_id',
          ignoreDuplicates: false,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: 'Sucesso',
        description: 'Presenças registadas com sucesso',
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

export function useAttendanceStats(classId: number | null, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['attendance-stats', classId, startDate, endDate],
    queryFn: async () => {
      if (!classId) return null;
      
      let query = supabase
        .from('attendance')
        .select('student_id, status')
        .eq('class_id', classId);

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data, error } = await query;
      if (error) throw error;

      // Calcular estatísticas
      const stats = {
        total: data.length,
        presentes: data.filter(r => r.status === 'PRESENTE').length,
        faltas: data.filter(r => r.status === 'FALTA').length,
        faltasJustificadas: data.filter(r => r.status === 'FALTA_JUSTIFICADA').length,
        atrasos: data.filter(r => r.status === 'ATRASO').length,
      };

      stats.total > 0
        ? (stats as any).taxaPresenca = Math.round((stats.presentes / stats.total) * 100)
        : (stats as any).taxaPresenca = 0;

      return stats;
    },
    enabled: !!classId,
  });
}
