import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, subMonths, parseISO, differenceInDays } from 'date-fns';
import { pt } from 'date-fns/locale';

// Relatório de Inadimplência Detalhado
export function useDefaultersReport() {
  return useQuery({
    queryKey: ['report-defaulters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tuition_fees')
        .select(`
          id, month, amount, due_date, status,
          students (id, name, phone, guardian, class_id, classes (name))
        `)
        .eq('status', 'Atrasado')
        .order('due_date', { ascending: true });

      if (error) throw error;

      return (data || []).map((fee: any) => {
        const dueDate = fee.due_date ? parseISO(fee.due_date) : new Date();
        const daysOverdue = differenceInDays(new Date(), dueDate);
        
        return {
          student_name: fee.students?.name || '-',
          class_name: fee.students?.classes?.name || '-',
          month: fee.month,
          amount: fee.amount || 0,
          due_date: fee.due_date ? format(parseISO(fee.due_date), 'dd/MM/yyyy') : '-',
          days_overdue: Math.max(0, daysOverdue),
          phone: fee.students?.phone || fee.students?.guardian || '-',
          urgency: daysOverdue > 60 ? 'Crítica' : daysOverdue > 30 ? 'Alta' : daysOverdue > 7 ? 'Média' : 'Baixa',
        };
      });
    },
  });
}

// Relatório de Propinas por Status
export function useTuitionStatusReport() {
  return useQuery({
    queryKey: ['report-tuition-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tuition_fees')
        .select(`
          id, month, amount, due_date, status,
          students (name, classes (name))
        `)
        .order('month', { ascending: false });

      if (error) throw error;

      return (data || []).map((fee: any) => ({
        student_name: fee.students?.name || '-',
        class_name: fee.students?.classes?.name || '-',
        month: fee.month,
        amount: fee.amount || 0,
        due_date: fee.due_date ? format(parseISO(fee.due_date), 'dd/MM/yyyy') : '-',
        status: fee.status || 'Pendente',
      }));
    },
  });
}

// Relatório de Acordos de Pagamento
export function usePaymentAgreementsReport() {
  return useQuery({
    queryKey: ['report-payment-agreements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_agreements')
        .select(`
          id, original_amount, agreed_amount, discount_percent, discount_amount,
          installments, promised_date, status, created_at,
          students (name, classes (name))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((agreement: any) => ({
        student_name: agreement.students?.name || '-',
        class_name: agreement.students?.classes?.name || '-',
        original_amount: agreement.original_amount || 0,
        agreed_amount: agreement.agreed_amount || 0,
        discount_percent: agreement.discount_percent || 0,
        installments: agreement.installments || 1,
        promised_date: agreement.promised_date ? format(parseISO(agreement.promised_date), 'dd/MM/yyyy') : '-',
        status: agreement.status || 'PENDENTE',
        created_at: format(parseISO(agreement.created_at), 'dd/MM/yyyy'),
      }));
    },
  });
}

// Relatório de Despesas por Categoria
export function useExpensesByCategoryReport(year: number) {
  return useQuery({
    queryKey: ['report-expenses-category', year],
    queryFn: async () => {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id, date, description, amount, type,
          financial_categories (name)
        `)
        .eq('type', 'Despesa' as const)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;

      return (data || []).map((t: any) => ({
        date: format(parseISO(t.date), 'dd/MM/yyyy'),
        description: t.description || '-',
        category: t.financial_categories?.name || 'Sem categoria',
        amount: t.amount || 0,
      }));
    },
  });
}

// Relatório de Receitas por Categoria
export function useRevenuesByCategoryReport(year: number) {
  return useQuery({
    queryKey: ['report-revenues-category', year],
    queryFn: async () => {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id, date, description, amount, type,
          financial_categories (name)
        `)
        .eq('type', 'Receita' as const)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;

      return (data || []).map((t: any) => ({
        date: format(parseISO(t.date), 'dd/MM/yyyy'),
        description: t.description || '-',
        category: t.financial_categories?.name || 'Sem categoria',
        amount: t.amount || 0,
      }));
    },
  });
}

// Relatório de Comunicações/Cobranças Enviadas
export function useCommunicationsReport() {
  return useQuery({
    queryKey: ['report-communications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communication_history')
        .select(`
          id, communication_type, recipient_name, recipient_phone,
          status, sent_at, message_template,
          students (name, classes (name))
        `)
        .order('sent_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      return (data || []).map((c: any) => ({
        recipient_name: c.recipient_name || c.students?.name || '-',
        class_name: c.students?.classes?.name || '-',
        type: c.communication_type || '-',
        phone: c.recipient_phone || '-',
        template: c.message_template || 'Personalizado',
        status: c.status || 'ENVIADO',
        sent_at: c.sent_at ? format(parseISO(c.sent_at), 'dd/MM/yyyy HH:mm') : '-',
      }));
    },
  });
}

// Relatório de Matrículas e Taxas
export function useEnrollmentFeesReport(year: number) {
  return useQuery({
    queryKey: ['report-enrollment-fees', year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_enrollments')
        .select(`
          id, enrollment_number, enrollment_date, enrollment_fee, monthly_fee, 
          discount_percent, status,
          students (name),
          classes (name),
          academic_years (name)
        `)
        .order('enrollment_date', { ascending: false });

      if (error) throw error;

      return (data || []).map((e: any) => ({
        enrollment_number: e.enrollment_number || '-',
        student_name: e.students?.name || '-',
        class_name: e.classes?.name || '-',
        academic_year: e.academic_years?.name || '-',
        enrollment_fee: e.enrollment_fee || 0,
        monthly_fee: e.monthly_fee || 0,
        discount: e.discount_percent || 0,
        status: e.status || 'PENDENTE',
        date: e.enrollment_date ? format(parseISO(e.enrollment_date), 'dd/MM/yyyy') : '-',
      }));
    },
  });
}

// Relatório Resumo Financeiro por Turma
export function useClassFinancialReport() {
  return useQuery({
    queryKey: ['report-class-financial'],
    queryFn: async () => {
      // Get all tuition fees with student/class info
      const { data: fees, error: feesError } = await supabase
        .from('tuition_fees')
        .select(`
          amount, status,
          students (class_id, classes (id, name))
        `);

      if (feesError) throw feesError;

      // Aggregate by class
      const classMap: Record<number, { 
        name: string; 
        total: number; 
        paid: number; 
        pending: number; 
        overdue: number;
        students: Set<number>;
      }> = {};

      (fees || []).forEach((fee: any) => {
        const classId = fee.students?.class_id;
        const className = fee.students?.classes?.name;
        if (!classId || !className) return;

        if (!classMap[classId]) {
          classMap[classId] = { 
            name: className, 
            total: 0, 
            paid: 0, 
            pending: 0, 
            overdue: 0,
            students: new Set()
          };
        }

        const amount = fee.amount || 0;
        classMap[classId].total += amount;
        
        if (fee.status === 'Pago') classMap[classId].paid += amount;
        else if (fee.status === 'Atrasado') classMap[classId].overdue += amount;
        else classMap[classId].pending += amount;
      });

      return Object.entries(classMap).map(([id, data]) => ({
        class_name: data.name,
        total_expected: data.total,
        total_paid: data.paid,
        total_pending: data.pending,
        total_overdue: data.overdue,
        collection_rate: data.total > 0 ? ((data.paid / data.total) * 100) : 0,
      }));
    },
  });
}
