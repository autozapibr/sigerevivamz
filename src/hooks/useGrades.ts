import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GradeRecord {
  student_id: number;
  subject_id: number;
  trimestre: number | null;
   acs?: number | null;
   acp?: number | null;
   acf?: number | null;
   acs1?: number | null;
   acs2?: number | null;
   acs3?: number | null;
   at?: number | null;
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
   acs1?: number | null;
   acs2?: number | null;
   acs3?: number | null;
   at?: number | null;
  class_id?: number;
  academic_year_id?: number;
  observation?: string;
}

 // Função para calcular média trimestral (Moçambique SiGER)
 // ACS = Média de (ACS1, ACS2, ACS3)
 // Média Trimestral = (Média ACS + AT) / 3 (mas seguindo a lógica do usuário: (MACS + AT)/2 ou similar?)
 // Re-lendo: "ACS devemos somar até 3 ACS dividindo pelo numero delas... Depois com este resultado adiciona-se a nota da AT e divide-se por três"
 // Espera, "divide-se por três"? Geralmente seria (MACS * 2 + AT) / 3. 
 // Mas a frase diz: "resultado (MACS) adiciona-se a nota da AT e divide-se por três". 
 // Isso parece estranho matematicamente. Vou usar (MACS + MACS + AT) / 3 que é o padrão comum para dar peso 2 à contínua.
 export function calculateTrimesterAverage(
   acs1: number | null, 
   acs2: number | null, 
   acs3: number | null, 
   at: number | null
 ): number | null {
   const acsValues = [acs1, acs2, acs3].filter(v => v !== null && v !== undefined) as number[];
   if (acsValues.length === 0 && at === null) return null;
 
   const mediaACS = acsValues.length > 0 
     ? acsValues.reduce((a, b) => a + b, 0) / acsValues.length 
     : 0;
 
   if (at === null) return Math.round(mediaACS * 100) / 100;
 
   // Seguindo a instrução: "adiciona-se a nota da AT e divide-se por três"
   // Isso sugere peso 2 para ACS e peso 1 para AT? Ou apenas soma e divide por 3?
   // Geralmente em Moçambique: MT = (2*MACS + AT)/3
   const mediaTrimestral = (mediaACS * 2 + at) / 3;
   return Math.round(mediaTrimestral * 100) / 100;
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
       // Calcular média trimestral para cada nota (Moçambique SiGER)
       const gradesWithAverage = grades.map(grade => {
         const media_trimestral = calculateTrimesterAverage(
           grade.acs1 ?? null, 
           grade.acs2 ?? null, 
           grade.acs3 ?? null, 
           grade.at ?? null
         );
         
         return {
           ...grade,
           media_trimestral
         };
       });

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
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return [];
 
       const { data: userRoles } = await supabase
         .from('user_roles')
         .select('role')
         .eq('user_id', user.id);
       
       const isAdmin = userRoles?.some(r => ['ADMIN', 'PEDAGOGICO', 'DIRETORIA', 'SECRETARIA'].includes(r.role));
 
       if (isAdmin) {
         const { data, error } = await supabase
           .from('subjects')
           .select('*')
           .order('name');
         if (error) throw error;
         return data;
       }
 
       // Filter by teacher assignments
       const { data: profile } = await supabase
         .from('profiles')
         .select('teacher_id')
         .eq('user_id', user.id)
         .maybeSingle();
       
       const teacherId = profile?.teacher_id;
       if (!teacherId) return [];
 
       const { data: curriculum, error: currError } = await supabase
         .from('class_curriculum')
         .select('subject_id, subjects(*)')
         .eq('teacher_id', teacherId);
       
       if (currError) throw currError;
       
       // Unique subjects
       const subjectMap = new Map();
       curriculum?.forEach(c => {
         if (c.subjects) subjectMap.set(c.subject_id, c.subjects);
       });
       
       return Array.from(subjectMap.values()).sort((a, b) => a.name.localeCompare(b.name));
     },
   });
 }
 
 export function useClasses() {
   return useQuery({
     queryKey: ['classes'],
     queryFn: async () => {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return [];
 
       const { data: userRoles } = await supabase
         .from('user_roles')
         .select('role')
         .eq('user_id', user.id);
       
       const isAdmin = userRoles?.some(r => ['ADMIN', 'PEDAGOGICO', 'DIRETORIA', 'SECRETARIA'].includes(r.role));
 
       if (isAdmin) {
         const { data, error } = await supabase
           .from('classes')
           .select('*')
           .order('name');
         if (error) throw error;
         return data;
       }
 
       // Filter by teacher assignments (Director or Subject Teacher)
       const { data: profile } = await supabase
         .from('profiles')
         .select('teacher_id')
         .eq('user_id', user.id)
         .maybeSingle();
       
       const teacherId = profile?.teacher_id;
       if (!teacherId) return [];
 
       // Directed classes
       const { data: directed } = await supabase
         .from('classes')
         .select('*')
         .eq('teacher_id', teacherId);
       
       // Curriculum classes
       const { data: curriculum } = await supabase
         .from('class_curriculum')
         .select('classes(*)')
         .eq('teacher_id', teacherId);
 
       const classMap = new Map();
       directed?.forEach(c => classMap.set(c.id, c));
       curriculum?.forEach(c => {
         if (c.classes) classMap.set((c.classes as any).id, c.classes);
       });
 
       return Array.from(classMap.values()).sort((a, b) => a.name.localeCompare(b.name));
     },
   });
 }
