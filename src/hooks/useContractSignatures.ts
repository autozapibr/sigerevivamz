import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContractSignature {
  id: number;
  staff_id: number;
  staff_type: 'teacher' | 'employee';
  staff_name: string;
  contract_type: string;
  contract_number: string | null;
  contract_html: string;
  signature_data: string | null;
  signature_ip: string | null;
  signature_user_agent: string | null;
  signed_at: string | null;
  signature_token: string;
  token_expires_at: string | null;
  status: 'pending' | 'sent' | 'signed' | 'expired' | 'cancelled';
  sent_via: 'email' | 'whatsapp' | 'direct' | null;
  sent_to: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export function useContractSignatures() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: signatures, isLoading, error } = useQuery({
    queryKey: ['contract-signatures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contract_signatures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ContractSignature[];
    },
  });

  const cancelSignature = useMutation({
    mutationFn: async (signatureId: number) => {
      const { error } = await supabase
        .from('contract_signatures')
        .update({ status: 'cancelled' })
        .eq('id', signatureId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-signatures'] });
      toast({
        title: 'Pedido cancelado',
        description: 'O pedido de assinatura foi cancelado.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível cancelar o pedido.',
        variant: 'destructive',
      });
    },
  });

  const resendSignature = useMutation({
    mutationFn: async ({ signatureId, expiryDays }: { signatureId: number; expiryDays: number }) => {
      const tokenExpiry = new Date();
      tokenExpiry.setDate(tokenExpiry.getDate() + expiryDays);

      const { data, error } = await supabase
        .from('contract_signatures')
        .update({ 
          status: 'pending',
          token_expires_at: tokenExpiry.toISOString(),
          signature_token: crypto.randomUUID(),
        })
        .eq('id', signatureId)
        .select()
        .single();

      if (error) throw error;
      return data as ContractSignature;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-signatures'] });
      toast({
        title: 'Link renovado',
        description: 'Um novo link de assinatura foi gerado.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível renovar o link.',
        variant: 'destructive',
      });
    },
  });

  return {
    signatures,
    isLoading,
    error,
    cancelSignature,
    resendSignature,
  };
}
