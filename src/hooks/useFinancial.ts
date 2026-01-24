import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

// Types from database
type TransactionType = Database['public']['Enums']['transaction_type'];
type TuitionStatus = Database['public']['Enums']['tuition_status'];

export interface TuitionFee {
  id: number;
  student_id: number;
  month: string;
  amount: number | null;
  due_date: string | null;
  status: TuitionStatus | null;
  student?: {
    id: number;
    name: string;
    class_id: number | null;
    phone: string | null;
    guardian?: string | null;
  };
}

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  date: string;
  description: string | null;
  category_id: number | null;
  category?: {
    id: number;
    name: string;
    type: TransactionType;
  };
}

export interface FinancialCategory {
  id: number;
  name: string;
  type: TransactionType;
}

export interface FinancialSummary {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  propinasPagas: number;
  propinasPendentes: number;
  propinasAtrasadas: number;
  taxaAdimplencia: number;
}

// ============ QUERIES ============

export function useFinancialCategories() {
  return useQuery({
    queryKey: ['financial-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as FinancialCategory[];
    },
  });
}

export function useTransactions(filters?: {
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  categoryId?: number;
}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          category:financial_categories(id, name, type)
        `)
        .order('date', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Transaction[];
    },
  });
}

export function useTuitionFees(filters?: {
  status?: TuitionStatus;
  month?: string;
  classId?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ['tuition-fees', filters],
    queryFn: async () => {
      let query = supabase
        .from('tuition_fees')
        .select(`
          *,
          student:students(id, name, class_id, phone, guardian)
        `)
        .order('due_date', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.month) {
        query = query.eq('month', filters.month);
      }

      const { data, error } = await query;
      if (error) throw error;

      let result = data as TuitionFee[];

      // Client-side filtering
      if (filters?.classId) {
        result = result.filter(f => f.student?.class_id === filters.classId);
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        result = result.filter(f => 
          f.student?.name?.toLowerCase().includes(search)
        );
      }

      return result;
    },
  });
}

export function useFinancialSummary(month?: string) {
  const currentMonth = month || format(new Date(), 'yyyy-MM');
  
  return useQuery({
    queryKey: ['financial-summary', currentMonth],
    queryFn: async () => {
      // Get transactions for current month
      const startDate = startOfMonth(parseISO(`${currentMonth}-01`));
      const endDate = endOfMonth(parseISO(`${currentMonth}-01`));

      const [transactionsRes, tuitionRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('type, amount')
          .gte('date', format(startDate, 'yyyy-MM-dd'))
          .lte('date', format(endDate, 'yyyy-MM-dd')),
        supabase
          .from('tuition_fees')
          .select('status, amount')
          .eq('month', currentMonth),
      ]);

      if (transactionsRes.error) throw transactionsRes.error;
      if (tuitionRes.error) throw tuitionRes.error;

      const transactions = transactionsRes.data || [];
      const tuitions = tuitionRes.data || [];

      const totalReceitas = transactions
        .filter(t => t.type === 'Receita')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const totalDespesas = transactions
        .filter(t => t.type === 'Despesa')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const propinasPagas = tuitions.filter(t => t.status === 'Pago').length;
      const propinasPendentes = tuitions.filter(t => t.status === 'Pendente').length;
      const propinasAtrasadas = tuitions.filter(t => t.status === 'Atrasado').length;
      const totalPropinas = tuitions.length;

      return {
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
        propinasPagas,
        propinasPendentes,
        propinasAtrasadas,
        taxaAdimplencia: totalPropinas > 0 
          ? Math.round((propinasPagas / totalPropinas) * 100) 
          : 0,
      } as FinancialSummary;
    },
  });
}

export function useOverdueFees() {
  return useQuery({
    queryKey: ['overdue-fees'],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('tuition_fees')
        .select(`
          *,
          student:students(id, name, class_id, phone, guardian)
        `)
        .eq('status', 'Pendente')
        .lt('due_date', today)
        .order('due_date', { ascending: true });

      if (error) throw error;

      // Update status to Atrasado for overdue fees
      const overdueIds = (data || []).map(f => f.id);
      if (overdueIds.length > 0) {
        await supabase
          .from('tuition_fees')
          .update({ status: 'Atrasado' })
          .in('id', overdueIds);
      }

      return data as TuitionFee[];
    },
  });
}

export function useMonthlyReport(year: number) {
  return useQuery({
    queryKey: ['monthly-report', year],
    queryFn: async () => {
      const months = [];
      
      for (let month = 1; month <= 12; month++) {
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        const startDate = `${monthStr}-01`;
        const endDate = `${monthStr}-31`;

        const [transactionsRes, tuitionRes] = await Promise.all([
          supabase
            .from('transactions')
            .select('type, amount')
            .gte('date', startDate)
            .lte('date', endDate),
          supabase
            .from('tuition_fees')
            .select('status, amount')
            .eq('month', monthStr),
        ]);

        const transactions = transactionsRes.data || [];
        const tuitions = tuitionRes.data || [];

        const receitas = transactions
          .filter(t => t.type === 'Receita')
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        const despesas = transactions
          .filter(t => t.type === 'Despesa')
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        const propinasPagas = tuitions
          .filter(t => t.status === 'Pago')
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        months.push({
          month: format(new Date(year, month - 1, 1), 'MMM', { locale: pt }),
          monthNum: month,
          receitas,
          despesas,
          saldo: receitas - despesas,
          propinas: propinasPagas,
        });
      }

      return months;
    },
  });
}

// ============ MUTATIONS ============

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      type: TransactionType;
      amount: number;
      date: string;
      description?: string;
      category_id?: number;
    }) => {
      const { data: result, error } = await supabase
        .from('transactions')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast.success('Movimento registado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao registar movimento: ' + error.message);
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { 
      id: number;
      type?: TransactionType;
      amount?: number;
      date?: string;
      description?: string;
      category_id?: number;
    }) => {
      const { error } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast.success('Movimento actualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao actualizar: ' + error.message);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast.success('Movimento eliminado!');
    },
    onError: (error) => {
      toast.error('Erro ao eliminar: ' + error.message);
    },
  });
}

export function usePayTuition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      feeId, 
      paymentMethod 
    }: { 
      feeId: number; 
      paymentMethod: string;
    }) => {
      // Update tuition status
      const { data: fee, error: feeError } = await supabase
        .from('tuition_fees')
        .update({ status: 'Pago' as TuitionStatus })
        .eq('id', feeId)
        .select(`
          *,
          student:students(name)
        `)
        .single();

      if (feeError) throw feeError;

      // Create transaction for the payment
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          type: 'Receita' as TransactionType,
          amount: fee.amount || 0,
          date: format(new Date(), 'yyyy-MM-dd'),
          description: `Propina ${fee.month} - ${fee.student?.name} (${paymentMethod})`,
        });

      if (txError) throw txError;

      return fee;
    },
    onSuccess: (fee) => {
      queryClient.invalidateQueries({ queryKey: ['tuition-fees'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-fees'] });
      toast.success(`Pagamento de ${fee.student?.name} registado!`);
    },
    onError: (error) => {
      toast.error('Erro ao registar pagamento: ' + error.message);
    },
  });
}

export function useGenerateMonthlyFees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      month, 
      dueDay = 10,
      defaultAmount = 2500 
    }: { 
      month: string; 
      dueDay?: number;
      defaultAmount?: number;
    }) => {
      // Get all active students with enrollments
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, name')
        .eq('status', 'Ativo');

      if (studentsError) throw studentsError;

      // Check which students already have fees for this month
      const { data: existingFees, error: existingError } = await supabase
        .from('tuition_fees')
        .select('student_id')
        .eq('month', month);

      if (existingError) throw existingError;

      const existingStudentIds = new Set((existingFees || []).map(f => f.student_id));
      
      // Create fees for students who don't have one yet
      const newFees = (students || [])
        .filter(s => !existingStudentIds.has(s.id))
        .map(s => ({
          student_id: s.id,
          month,
          amount: defaultAmount,
          due_date: `${month}-${String(dueDay).padStart(2, '0')}`,
          status: 'Pendente' as TuitionStatus,
        }));

      if (newFees.length === 0) {
        return { created: 0 };
      }

      const { error: insertError } = await supabase
        .from('tuition_fees')
        .insert(newFees);

      if (insertError) throw insertError;

      return { created: newFees.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tuition-fees'] });
      toast.success(`${result.created} propinas geradas com sucesso!`);
    },
    onError: (error) => {
      toast.error('Erro ao gerar propinas: ' + error.message);
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; type: TransactionType }) => {
      const { data: result, error } = await supabase
        .from('financial_categories')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-categories'] });
      toast.success('Categoria criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar categoria: ' + error.message);
    },
  });
}
