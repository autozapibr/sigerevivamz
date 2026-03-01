import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface IntegrationSetting {
  id: number;
  integration_name: string;
  api_url: string | null;
  api_key: string | null;
  instance_name: string | null;
  is_active: boolean;
  last_tested_at: string | null;
  last_test_success: boolean | null;
  additional_config: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export function useIntegrationSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['integration-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .order('integration_name');

      if (error) throw error;
      return data as IntegrationSetting[];
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({
      integrationName,
      updates,
    }: {
      integrationName: string;
      updates: {
        instance_name?: string;
        is_active?: boolean;
        last_tested_at?: string;
        last_test_success?: boolean;
      };
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Try update first
      const { data: updateData, error: updateError } = await supabase
        .from('integration_settings')
        .update({
          ...updates,
          updated_by: user?.id,
        })
        .eq('integration_name', integrationName)
        .select();

      if (updateError) throw updateError;
      
      // If no rows updated, insert
      if (!updateData || updateData.length === 0) {
        const { data: insertData, error: insertError } = await supabase
          .from('integration_settings')
          .insert({
            integration_name: integrationName,
            ...updates,
            created_by: user?.id,
            updated_by: user?.id,
          })
          .select()
          .single();
        if (insertError) throw insertError;
        return insertData;
      }
      
      return updateData[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-settings'] });
      toast.success('Configuração guardada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating integration:', error);
      toast.error('Erro ao guardar configuração', {
        description: error.message,
      });
    },
  });

  const testConnection = useMutation({
    mutationFn: async (integrationName: string) => {
      const setting = settings?.find(s => s.integration_name === integrationName);
      
      if (!setting?.api_url || !setting?.api_key) {
        throw new Error('Configure a URL e a chave da API primeiro');
      }

      if (integrationName === 'evolution_api') {
        // Test Evolution API by sending a test message
        const { data, error } = await supabase.functions.invoke('send-notification', {
          body: {
            type: 'whatsapp',
            phone: '258840000000',
            message: 'Teste de conexão - SGE REVIVA',
            recipientName: 'Teste',
          },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.details || data.error);
        
        return { success: true };
      }

      if (integrationName === 'openai') {
        // Test OpenAI by calling the generate-contract function
        const { data, error } = await supabase.functions.invoke('generate-contract', {
          body: {
            type: 'generate',
            category: 'teste',
            customInstructions: 'Apenas diga: "Conexão bem sucedida!"',
          },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        
        return { success: true };
      }

      throw new Error('Integração não suportada');
    },
    onSuccess: (_, integrationName) => {
      // Update the test status in the database
      updateSetting.mutate({
        integrationName,
        updates: {
          last_tested_at: new Date().toISOString(),
          last_test_success: true,
          is_active: true,
        },
      });
      toast.success('Conexão bem sucedida!');
    },
    onError: (error, integrationName) => {
      // Update the test status as failed
      updateSetting.mutate({
        integrationName,
        updates: {
          last_tested_at: new Date().toISOString(),
          last_test_success: false,
        },
      });
      toast.error('Falha na conexão', {
        description: error.message,
      });
    },
  });

  const getIntegration = (name: string) => {
    return settings?.find(s => s.integration_name === name);
  };

  return {
    settings,
    isLoading,
    error,
    updateSetting,
    testConnection,
    getIntegration,
  };
}
