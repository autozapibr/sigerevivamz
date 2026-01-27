import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { pt } from 'date-fns/locale';

// ============ LIVRO CAIXA (Cash Book) ============
export function useCashBookReport(filters: {
  year: number;
  month?: string;
  type?: 'Receita' | 'Despesa' | 'all';
}) {
  return useQuery({
    queryKey: ['report-cash-book', filters],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          id, date, description, amount, type,
          financial_categories (name)
        `)
        .order('date', { ascending: false });

      // Apply date filters
      if (filters.month) {
        const monthDate = parseISO(`${filters.month}-01`);
        const startDate = format(startOfMonth(monthDate), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');
        query = query.gte('date', startDate).lte('date', endDate);
      } else {
        const startDate = `${filters.year}-01-01`;
        const endDate = `${filters.year}-12-31`;
        query = query.gte('date', startDate).lte('date', endDate);
      }

      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      const { data, error } = await query;
      if (error) throw error;

      let runningBalance = 0;
      const dataWithBalance = (data || []).reverse().map((t: any) => {
        const amount = t.amount || 0;
        if (t.type === 'Receita') {
          runningBalance += amount;
        } else {
          runningBalance -= amount;
        }
        return {
          ...t,
          category: t.financial_categories?.name || 'Sem categoria',
          formatted_date: t.date ? format(parseISO(t.date), 'dd/MM/yyyy') : '-',
          balance: runningBalance,
        };
      }).reverse();

      // Calculate totals
      const totalReceitas = (data || [])
        .filter((t: any) => t.type === 'Receita')
        .reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
      const totalDespesas = (data || [])
        .filter((t: any) => t.type === 'Despesa')
        .reduce((acc: number, t: any) => acc + (t.amount || 0), 0);

      return {
        data: dataWithBalance,
        totals: {
          receitas: totalReceitas,
          despesas: totalDespesas,
          saldo: totalReceitas - totalDespesas,
        },
      };
    },
  });
}

// ============ MATRÍCULAS (Enrollments) ============
export function useEnrollmentsFinancialReport(filters: {
  year: number;
  status?: string;
  classId?: number;
}) {
  return useQuery({
    queryKey: ['report-enrollments-financial', filters],
    queryFn: async () => {
      let query = supabase
        .from('student_enrollments')
        .select(`
          id, enrollment_number, enrollment_date, enrollment_fee, monthly_fee,
          discount_percent, status,
          students (id, name),
          classes (id, name),
          academic_years (id, name)
        `)
        .order('enrollment_date', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as 'APROVADA' | 'CANCELADA' | 'EM_ANALISE' | 'PENDENTE' | 'REJEITADA');
      }
      if (filters.classId) {
        query = query.eq('class_id', filters.classId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mappedData = (data || []).map((e: any) => {
        const enrollmentFee = e.enrollment_fee || 0;
        const monthlyFee = e.monthly_fee || 0;
        const discount = e.discount_percent || 0;
        const discountedMonthly = monthlyFee * (1 - discount / 100);
        const annualProjected = enrollmentFee + (discountedMonthly * 12);

        return {
          id: e.id,
          enrollment_number: e.enrollment_number || '-',
          student_name: e.students?.name || '-',
          class_name: e.classes?.name || '-',
          academic_year: e.academic_years?.name || '-',
          enrollment_date: e.enrollment_date ? format(parseISO(e.enrollment_date), 'dd/MM/yyyy') : '-',
          enrollment_fee: enrollmentFee,
          monthly_fee: monthlyFee,
          discount_percent: discount,
          discounted_monthly: discountedMonthly,
          annual_projected: annualProjected,
          status: e.status || 'PENDENTE',
        };
      });

      // Calculate totals
      const totalEnrollmentFees = mappedData.reduce((acc, e) => acc + e.enrollment_fee, 0);
      const totalMonthlyFees = mappedData.reduce((acc, e) => acc + e.monthly_fee, 0);
      const totalAnnualProjected = mappedData.reduce((acc, e) => acc + e.annual_projected, 0);

      return {
        data: mappedData,
        totals: {
          count: mappedData.length,
          enrollmentFees: totalEnrollmentFees,
          monthlyFees: totalMonthlyFees,
          annualProjected: totalAnnualProjected,
          approved: mappedData.filter(e => e.status === 'APROVADA').length,
          pending: mappedData.filter(e => e.status === 'PENDENTE').length,
        },
      };
    },
  });
}

// ============ PROPINAS (Tuition Fees) ============
export function useTuitionFeesReport(filters: {
  year: number;
  month?: string;
  status?: string;
  classId?: number;
}) {
  return useQuery({
    queryKey: ['report-tuition-fees', filters],
    queryFn: async () => {
      let query = supabase
        .from('tuition_fees')
        .select(`
          id, month, amount, due_date, status, paid_at, payment_method,
          students (id, name, class_id, classes (id, name))
        `)
        .order('month', { ascending: false });

      if (filters.month) {
        query = query.eq('month', filters.month);
      } else {
        // Filter by year - months are in YYYY-MM format
        query = query.like('month', `${filters.year}-%`);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as 'Atrasado' | 'Pago' | 'Pendente');
      }

      const { data, error } = await query;
      if (error) throw error;

      // Client-side filter for class
      let filteredData = data || [];
      if (filters.classId) {
        filteredData = filteredData.filter((f: any) => f.students?.class_id === filters.classId);
      }

      const mappedData = filteredData.map((f: any) => {
        const monthParts = f.month?.split('-');
        let formattedMonth = f.month || '-';
        if (monthParts?.length === 2) {
          try {
            formattedMonth = format(new Date(parseInt(monthParts[0]), parseInt(monthParts[1]) - 1, 1), 'MMMM yyyy', { locale: pt });
          } catch {
            formattedMonth = f.month;
          }
        }

        return {
          id: f.id,
          student_name: f.students?.name || '-',
          class_name: f.students?.classes?.name || '-',
          month: formattedMonth,
          month_raw: f.month,
          amount: f.amount || 0,
          due_date: f.due_date ? format(parseISO(f.due_date), 'dd/MM/yyyy') : '-',
          status: f.status || 'Pendente',
          paid_at: f.paid_at ? format(parseISO(f.paid_at), 'dd/MM/yyyy') : '-',
          payment_method: f.payment_method || '-',
        };
      });

      // Calculate totals
      const totalExpected = mappedData.reduce((acc, f) => acc + f.amount, 0);
      const totalPaid = mappedData
        .filter(f => f.status === 'Pago')
        .reduce((acc, f) => acc + f.amount, 0);
      const totalPending = mappedData
        .filter(f => f.status === 'Pendente')
        .reduce((acc, f) => acc + f.amount, 0);
      const totalOverdue = mappedData
        .filter(f => f.status === 'Atrasado')
        .reduce((acc, f) => acc + f.amount, 0);

      return {
        data: mappedData,
        totals: {
          count: mappedData.length,
          expected: totalExpected,
          paid: totalPaid,
          pending: totalPending,
          overdue: totalOverdue,
          collectionRate: totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0,
        },
        byStatus: {
          pago: mappedData.filter(f => f.status === 'Pago').length,
          pendente: mappedData.filter(f => f.status === 'Pendente').length,
          atrasado: mappedData.filter(f => f.status === 'Atrasado').length,
        },
      };
    },
  });
}

// ============ SALÁRIOS (Salaries) ============
export function useSalariesReport(filters: {
  year: number;
  month?: string;
  department?: string;
  staffType?: 'teachers' | 'employees' | 'all';
}) {
  return useQuery({
    queryKey: ['report-salaries', filters],
    queryFn: async () => {
      // Fetch teachers
      const { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select('id, name, phone, salary, status, contract_type, payment_method, bank_name, mobile_money_provider')
        .eq('status', 'Ativo')
        .order('name');

      if (teachersError) throw teachersError;

      // Fetch employees
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id, name, phone, salary, status, department, role, contract_type, payment_method, bank_name, mobile_money_provider')
        .eq('status', 'Ativo')
        .order('name');

      if (employeesError) throw employeesError;

      // Combine and format data
      const teachersData = (teachers || []).map(t => ({
        id: `teacher-${t.id}`,
        name: t.name,
        type: 'Professor' as const,
        department: 'Corpo Docente',
        role: 'Professor',
        salary: t.salary || 0,
        contract_type: t.contract_type || 'Efectivo',
        payment_method: t.payment_method === 'CARTEIRA_MOVEL' 
          ? `Carteira Móvel (${t.mobile_money_provider || 'N/A'})`
          : t.payment_method === 'CONTA_BANCARIA'
          ? `Banco (${t.bank_name || 'N/A'})`
          : 'Numerário',
        status: (t.status || 'Ativo') as 'Ativo' | 'Inativo',
      }));

      const employeesData = (employees || []).map(e => ({
        id: `employee-${e.id}`,
        name: e.name,
        type: 'Funcionário' as const,
        department: e.department || 'Geral',
        role: e.role || '-',
        salary: e.salary || 0,
        contract_type: e.contract_type || 'Efectivo',
        payment_method: e.payment_method === 'CARTEIRA_MOVEL'
          ? `Carteira Móvel (${e.mobile_money_provider || 'N/A'})`
          : e.payment_method === 'CONTA_BANCARIA'
          ? `Banco (${e.bank_name || 'N/A'})`
          : 'Numerário',
        status: (e.status || 'Ativo') as 'Ativo' | 'Inativo',
      }));

      // Define type for staff data
      type StaffData = {
        id: string;
        name: string;
        type: string;
        department: string;
        role: string;
        salary: number;
        contract_type: string;
        payment_method: string;
        status: string;
      };

      // Combine based on filter
      let allStaff: StaffData[] = [];
      if (filters.staffType === 'teachers') {
        allStaff = teachersData;
      } else if (filters.staffType === 'employees') {
        allStaff = employeesData;
      } else {
        allStaff = [...teachersData, ...employeesData];
      }

      // Filter by department
      if (filters.department && filters.department !== 'all') {
        allStaff = allStaff.filter(s => s.department === filters.department);
      }

      // Calculate totals
      const totalSalaries = allStaff.reduce((acc, s) => acc + s.salary, 0);
      const teachersTotal = teachersData.reduce((acc, s) => acc + s.salary, 0);
      const employeesTotal = employeesData.reduce((acc, s) => acc + s.salary, 0);

      // Get unique departments
      const departments = [...new Set(allStaff.map(s => s.department))];

      return {
        data: allStaff,
        totals: {
          count: allStaff.length,
          totalSalaries,
          teachersCount: teachersData.length,
          teachersTotal,
          employeesCount: employeesData.length,
          employeesTotal,
          averageSalary: allStaff.length > 0 ? totalSalaries / allStaff.length : 0,
        },
        departments,
      };
    },
  });
}

// ============ RESUMO MENSAL (Monthly Summary) ============
export function useMonthlyFinancialSummary(year: number) {
  return useQuery({
    queryKey: ['report-monthly-summary', year],
    queryFn: async () => {
      const months = [];

      for (let month = 1; month <= 12; month++) {
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        const monthDate = new Date(year, month - 1, 1);
        const startDate = format(monthDate, 'yyyy-MM-dd');
        const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');

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

        const propinasTotal = tuitions.reduce((sum, t) => sum + (t.amount || 0), 0);

        months.push({
          month: format(monthDate, 'MMM', { locale: pt }),
          monthNum: month,
          monthFull: format(monthDate, 'MMMM yyyy', { locale: pt }),
          receitas,
          despesas,
          saldo: receitas - despesas,
          propinas: propinasPagas,
          propinasTotal,
          collectionRate: propinasTotal > 0 ? (propinasPagas / propinasTotal) * 100 : 0,
        });
      }

      return months;
    },
  });
}
