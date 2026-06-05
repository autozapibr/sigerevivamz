import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { EducationLevel, EducationLevelFee, EnrollmentPeriod, EnrollmentType } from '@/types/enrollment';

export function useEducationLevels() {
  return useQuery({
    queryKey: ['education-levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('education_levels')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as EducationLevel[];
    },
  });
}

export function useEducationLevelFees(academicYearId?: number) {
  return useQuery({
    queryKey: ['education-level-fees', academicYearId],
    queryFn: async () => {
      let query = supabase
        .from('education_level_fees')
        .select('*, education_levels(*)');
      
      if (academicYearId) {
        query = query.eq('academic_year_id', academicYearId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data.map(d => ({
        ...d,
        education_level: d.education_levels
      })) as EducationLevelFee[];
    },
    enabled: !!academicYearId,
  });
}

export function useEnrollmentPeriods(academicYearId?: number) {
  return useQuery({
    queryKey: ['enrollment-periods', academicYearId],
    queryFn: async () => {
      let query = supabase
        .from('enrollment_periods')
        .select('*, education_levels(*)');
      
      if (academicYearId) {
        query = query.eq('academic_year_id', academicYearId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data.map(d => ({
        ...d,
        education_level: d.education_levels
      })) as EnrollmentPeriod[];
    },
    enabled: !!academicYearId,
  });
}

export function useUpsertEducationLevelFee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (fee: Partial<EducationLevelFee> & { education_level_id: number; academic_year_id: number }) => {
      const { data, error } = await supabase
        .from('education_level_fees')
        .upsert(fee, { onConflict: 'education_level_id,academic_year_id' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-level-fees'] });
      toast({ title: 'Configuração salva', description: 'Valores actualizados com sucesso.' });
    },
  });
}

export function useUpsertEnrollmentPeriod() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (period: Partial<EnrollmentPeriod> & { 
      academic_year_id: number; 
      education_level_id: number; 
      type: EnrollmentType;
      start_date: string;
      end_date: string;
    }) => {
      const { data, error } = await supabase
        .from('enrollment_periods')
        .upsert(period)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-periods'] });
      toast({ title: 'Período salvo', description: 'Período de matrícula actualizado com sucesso.' });
    },
  });
}
