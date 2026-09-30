import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { LateFeeSettings } from '@/lib/lateFee';

const DEFAULT_SETTINGS: LateFeeSettings = {
  id: 1,
  mode: 'FIXED_ONCE',
  fixed_amount: 50,
  percent: 0,
  grace_days: 0,
  is_active: true,
};

export function useLateFeeSettings() {
  return useQuery({
    queryKey: ['late-fee-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('late_fee_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) throw error;
      return (data ?? DEFAULT_SETTINGS) as LateFeeSettings;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateLateFeeSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<LateFeeSettings>) => {
      const { error } = await supabase
        .from('late_fee_settings')
        .upsert(
          { id: 1, ...settings, updated_at: new Date().toISOString() },
          { onConflict: 'id' }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['late-fee-settings'] });
      queryClient.invalidateQueries({ queryKey: ['tuition-fees'] });
      toast.success('Configuração de multas guardada!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao guardar configuração: ' + error.message);
    },
  });
}
