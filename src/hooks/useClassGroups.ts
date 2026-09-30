import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DEFAULT_CLASS_GROUPS, type ClassGroup } from '@/lib/classGroups';

export function useClassGroups() {
  return useQuery({
    queryKey: ['class-group-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_group_settings')
        .select('groups')
        .eq('id', 1)
        .maybeSingle();

      if (error) throw error;

      const groups = (data?.groups as unknown as ClassGroup[]) ?? null;
      return Array.isArray(groups) && groups.length > 0 ? groups : DEFAULT_CLASS_GROUPS;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateClassGroups() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groups: ClassGroup[]) => {
      const { error } = await supabase
        .from('class_group_settings')
        .upsert(
          { id: 1, groups, updated_at: new Date().toISOString() } as any,
          { onConflict: 'id' }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-group-settings'] });
      toast.success('Grupos de turmas guardados!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao guardar grupos: ' + error.message);
    },
  });
}
