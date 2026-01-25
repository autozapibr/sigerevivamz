import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { addDays, format } from 'date-fns';

// Types
export interface PaymentAgreement {
  id: number;
  tuition_fee_id: number;
  student_id: number;
  original_amount: number;
  discount_percent: number;
  discount_amount: number;
  agreed_amount: number;
  installments: number;
  installment_amount: number | null;
  promised_date: string | null;
  status: 'PENDENTE' | 'ATIVO' | 'CUMPRIDO' | 'QUEBRADO' | 'CANCELADO';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  student?: {
    id: number;
    name: string;
    phone: string | null;
    guardian: string | null;
  };
}

export interface AgreementInstallment {
  id: number;
  agreement_id: number;
  installment_number: number;
  amount: number;
  due_date: string;
  paid: boolean;
  paid_at: string | null;
  payment_method: string | null;
}

export interface CommunicationHistory {
  id: number;
  tuition_fee_id: number | null;
  agreement_id: number | null;
  student_id: number;
  communication_type: 'WHATSAPP' | 'SMS' | 'TELEFONE' | 'EMAIL' | 'PRESENCIAL';
  recipient_name: string;
  recipient_phone: string | null;
  message_content: string;
  status: 'ENVIADO' | 'ENTREGUE' | 'LIDO' | 'FALHOU' | 'AGENDADO';
  sent_at: string;
  created_at: string;
}

export interface CreateAgreementParams {
  tuitionFeeId: number;
  studentId: number;
  originalAmount: number;
  discountPercent?: number;
  installments?: number;
  promisedDate?: string;
  notes?: string;
}

// Hook: Buscar acordos de pagamento
export function usePaymentAgreements(studentId?: number) {
  return useQuery({
    queryKey: ['payment-agreements', studentId],
    queryFn: async () => {
      let query = supabase
        .from('payment_agreements')
        .select(`
          *,
          student:students(id, name, phone, guardian)
        `)
        .order('created_at', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PaymentAgreement[];
    },
  });
}

// Hook: Buscar parcelas de um acordo
export function useAgreementInstallments(agreementId: number) {
  return useQuery({
    queryKey: ['agreement-installments', agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agreement_installments')
        .select('*')
        .eq('agreement_id', agreementId)
        .order('installment_number');

      if (error) throw error;
      return data as AgreementInstallment[];
    },
    enabled: !!agreementId,
  });
}

// Hook: Histórico de comunicações
export function useCommunicationHistory(studentId?: number, limit = 50) {
  return useQuery({
    queryKey: ['communication-history', studentId, limit],
    queryFn: async () => {
      let query = supabase
        .from('communication_history')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CommunicationHistory[];
    },
  });
}

// Hook: Criar acordo de pagamento
export function useCreateAgreement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: CreateAgreementParams) => {
      const discountAmount = (params.originalAmount * (params.discountPercent || 0)) / 100;
      const agreedAmount = params.originalAmount - discountAmount;
      const installmentAmount = params.installments && params.installments > 1 
        ? agreedAmount / params.installments 
        : agreedAmount;

      // Create agreement
      const { data: agreement, error: agreementError } = await supabase
        .from('payment_agreements')
        .insert({
          tuition_fee_id: params.tuitionFeeId,
          student_id: params.studentId,
          original_amount: params.originalAmount,
          discount_percent: params.discountPercent || 0,
          discount_amount: discountAmount,
          agreed_amount: agreedAmount,
          installments: params.installments || 1,
          installment_amount: installmentAmount,
          promised_date: params.promisedDate,
          notes: params.notes,
          status: 'ATIVO',
        })
        .select()
        .single();

      if (agreementError) throw agreementError;

      // Create installments if more than 1
      if (params.installments && params.installments > 1 && params.promisedDate) {
        const installments = [];
        for (let i = 0; i < params.installments; i++) {
          installments.push({
            agreement_id: agreement.id,
            installment_number: i + 1,
            amount: installmentAmount,
            due_date: format(addDays(new Date(params.promisedDate), i * 30), 'yyyy-MM-dd'),
          });
        }

        const { error: installmentsError } = await supabase
          .from('agreement_installments')
          .insert(installments);

        if (installmentsError) throw installmentsError;
      }

      return agreement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-agreements'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-fees'] });
      toast({
        title: 'Acordo criado',
        description: 'O acordo de pagamento foi registado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar acordo',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}

// Hook: Enviar notificação via WhatsApp/SMS
export function useSendNotification() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      type: 'whatsapp' | 'sms';
      phone: string;
      message: string;
      studentId?: number;
      tuitionFeeId?: number;
      agreementId?: number;
      recipientName?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['communication-history'] });
      toast({
        title: data.success ? 'Mensagem enviada' : 'Atenção',
        description: data.message,
        variant: data.success ? 'default' : 'destructive',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}

// Hook: Enviar notificações em massa
export function useBulkSendNotifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notifications: Array<{
      type: 'whatsapp' | 'sms';
      phone: string;
      message: string;
      studentId?: number;
      tuitionFeeId?: number;
      recipientName?: string;
    }>) => {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: { notifications },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['communication-history'] });
      toast({
        title: 'Envio em massa concluído',
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro no envio em massa',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}

// Hook: Pagar parcela de acordo
export function usePayInstallment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ installmentId, paymentMethod }: { installmentId: number; paymentMethod: string }) => {
      const { data, error } = await supabase
        .from('agreement_installments')
        .update({
          paid: true,
          paid_at: new Date().toISOString(),
          payment_method: paymentMethod,
        })
        .eq('id', installmentId)
        .select()
        .single();

      if (error) throw error;

      // Check if all installments are paid
      const { data: allInstallments } = await supabase
        .from('agreement_installments')
        .select('paid')
        .eq('agreement_id', data.agreement_id);

      const allPaid = allInstallments?.every(i => i.paid);

      if (allPaid) {
        await supabase
          .from('payment_agreements')
          .update({ status: 'CUMPRIDO' })
          .eq('id', data.agreement_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-agreements'] });
      queryClient.invalidateQueries({ queryKey: ['agreement-installments'] });
      toast({
        title: 'Parcela paga',
        description: 'O pagamento da parcela foi registado.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao registar pagamento',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}
