import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LessonPlanField {
  id: number;
  field_name: string;
  field_label: string;
  field_type: string;
  options: string[];
  is_required: boolean;
  display_order: number;
  is_active: boolean;
}

export interface LessonPlanConfig {
  id: number;
  config_key: string;
  config_value: string;
  description: string | null;
}

export interface LessonPlan {
  id: number;
  teacher_id: string;
  teacher_name: string | null;
  class_id: number | null;
  subject_id: number | null;
  title: string;
  form_data: Record<string, any>;
  generated_content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useLessonPlanFields() {
  return useQuery({
    queryKey: ['lesson-plan-fields'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_plan_fields')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data as LessonPlanField[];
    },
  });
}

export function useAllLessonPlanFields() {
  return useQuery({
    queryKey: ['lesson-plan-fields-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_plan_fields')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as LessonPlanField[];
    },
  });
}

export function useLessonPlanConfig() {
  return useQuery({
    queryKey: ['lesson-plan-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_plan_config')
        .select('*')
        .order('config_key');
      if (error) throw error;
      return data as LessonPlanConfig[];
    },
  });
}

export function useLessonPlans() {
  return useQuery({
    queryKey: ['lesson-plans'],
    queryFn: async () => {
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData.user?.id;

      let query = supabase
        .from('lesson_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (currentUserId) {
        query = query.eq('teacher_id', currentUserId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LessonPlan[];
    },
  });
}

export function useLessonPlanMutations() {
  const queryClient = useQueryClient();

  const generatePlan = useMutation({
    mutationFn: async (payload: {
      formData: Record<string, any>;
      className?: string;
      subjectName?: string;
      teacherName?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: payload,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.content as string;
    },
    onError: (error) => {
      toast.error('Erro ao gerar plano de aula', { description: error.message });
    },
  });

  const savePlan = useMutation({
    mutationFn: async (plan: {
      title: string;
      class_id?: number | null;
      subject_id?: number | null;
      form_data: Record<string, any>;
      generated_content: string;
      teacher_name?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('lesson_plans')
        .insert({
          ...plan,
          teacher_id: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      toast.success('Plano de aula guardado!');
    },
    onError: (error) => {
      toast.error('Erro ao guardar plano', { description: error.message });
    },
  });

  const updatePlanStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { error } = await supabase
        .from('lesson_plans')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
    },
  });

  const deletePlan = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('lesson_plans')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      toast.success('Plano de aula removido.');
    },
  });

  // Admin mutations
  const saveField = useMutation({
    mutationFn: async (field: Partial<LessonPlanField> & { field_name: string; field_label: string }) => {
      if (field.id) {
        const { id, ...rest } = field;
        const { error } = await supabase.from('lesson_plan_fields').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { id: _id, ...insertData } = field;
        const { error } = await supabase.from('lesson_plan_fields').insert(insertData as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plan-fields'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-plan-fields-all'] });
      toast.success('Campo guardado!');
    },
    onError: (error) => {
      toast.error('Erro ao guardar campo', { description: error.message });
    },
  });

  const deleteField = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('lesson_plan_fields').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plan-fields'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-plan-fields-all'] });
      toast.success('Campo removido.');
    },
  });

  const saveConfig = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      // Try update first
      const { data: updated, error: updateError } = await supabase
        .from('lesson_plan_config')
        .update({ config_value: value })
        .eq('config_key', key)
        .select();
      if (updateError) throw updateError;
      
      // If no rows updated, insert
      if (!updated || updated.length === 0) {
        const { error: insertError } = await supabase
          .from('lesson_plan_config')
          .insert({ config_key: key, config_value: value });
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plan-config'] });
      toast.success('Configuração guardada!');
    },
    onError: (error) => {
      toast.error('Erro ao guardar configuração', { description: error.message });
    },
  });

  return {
    generatePlan,
    savePlan,
    updatePlanStatus,
    deletePlan,
    saveField,
    deleteField,
    saveConfig,
  };
}
