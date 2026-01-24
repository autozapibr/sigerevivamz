import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GradeRecord {
  student_id: number;
  subject_id: number;
  trimestre: number | null;
  acs: number | null;
  acp: number | null;
  acf: number | null;
  media_trimestral: number | null;
  media_final: number | null;
  nota1: number | null;
  nota2: number | null;
  final_exam: number | null;
  academic_year_id: number | null;
  class_id: number | null;
  observation: string | null;
  students?: {
    id: number;
    name: string;
  };
  subjects?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface GradeInsert {
  student_id: number;
  subject_id: number;
  trimestre?: number;
  acs?: number | null;
  acp?: number | null;
  acf?: number | null;
  class_id?: number;
  academic_year_id?: number;
  observation?: string;
}

// Função para calcular média trimestral (MINEDH: ACS 30% + ACP 30% + ACF 40%)
export function calculateTrimesterAverage(acs: number | null, acp: number | null, acf: number | null): number | null {
  if (acs === null && acp === null && acf === null) return null;
  return Math.round(((acs || 0) * 0.30 + (acp || 0) * 0.30 + (acf || 0) * 0.40) * 100) / 100;
}

// Função para classificar nota
export function classifyGrade(grade: number | null): { label: string; className: string } {
  if (grade === null) return { label: '-', className: 'text-muted-foreground' };
  if (grade >= 18) return { label: 'Excelente', className: 'grade-excelente' };
  if (grade >= 14) return { label: 'Bom', className: 'grade-bom' };
  if (grade >= 10) return { label: 'Suficiente', className: 'grade-suficiente' };
  if (grade >= 5) return { label: 'Insuficiente', className: 'grade-insuficiente' };
  return { label: 'Mau', className: 'grade-mau' };
}

export function useGradesByClass(classId: number | null, subjectId?: number | null, trimestre?: number | null) {
  return useQuery({
    queryKey: ['grades', classId, subjectId, trimestre],
    queryFn: async () => {
      if (!classId) return [];
      
      let query = supabase
        .from('grades')
        .select(`
          *,
          students:student_id (id, name),
          subjects:subject_id (id, name, code)
        `)
        .eq('class_id', classId);

      if (subjectId) query = query.eq('subject_id', subjectId);
      if (trimestre) query = query.eq('trimestre', trimestre);

      const { data, error } = await query.order('students(name)');
      if (error) throw error;
      return data as GradeRecord[];
    },
    enabled: !!classId,
  });
}

export function useGradesByStudent(studentId: number | null) {
  return useQuery({
    queryKey: ['grades-student', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const { data, error } = await supabase
        .from('grades')
        .select(`
          *,
          subjects:subject_id (id, name, code)
        `)
        .eq('student_id', studentId)
        .order('subjects(name)');

      if (error) throw error;
      return data as GradeRecord[];
    },
    enabled: !!studentId,
  });
}

export function useSaveGrades() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (grades: GradeInsert[]) => {
      // Calcular média trimestral para cada grade
      const gradesWithAverage = grades.map(grade => ({
        ...grade,
        media_trimestral: calculateTrimesterAverage(grade.acs ?? null, grade.acp ?? null, grade.acf ?? null),
      }));

      const { data, error } = await supabase
        .from('grades')
        .upsert(gradesWithAverage, {
          onConflict: 'student_id,subject_id',
          ignoreDuplicates: false,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast({
        title: 'Sucesso',
        description: 'Notas guardadas com sucesso',
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

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
}

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
}
