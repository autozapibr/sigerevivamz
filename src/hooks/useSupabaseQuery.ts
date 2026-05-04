import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sanitizeErrorMessage } from '@/lib/sanitizeError';

// Generic hook for Supabase queries
export function useSupabaseQuery<T>(
  key: string[],
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await queryFn();
      if (error) throw error;
      return data;
    },
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
}

// Generic hook for Supabase mutations
export function useSupabaseMutation<T, V>(
  mutationFn: (variables: V) => Promise<{ data: T | null; error: any }>,
  options?: {
    onSuccess?: (data: T | null) => void;
    onError?: (error: any) => void;
    invalidateQueries?: string[][];
  }
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (variables: V) => {
      const { data, error } = await mutationFn(variables);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
    },
    onError: (error) => {
      if (import.meta.env.DEV) console.error('Mutation error:', error);
      toast({
        title: 'Erro',
        description: sanitizeErrorMessage(error),
        variant: 'destructive',
      });
      options?.onError?.(error);
    },
  });
}