import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats-extended'],
    queryFn: async () => {
      const [
        studentsRes,
        teachersRes,
        classesRes,
        enrollmentsRes,
        employeesRes,
      ] = await Promise.all([
        supabase.from('students').select('id, status, gender, class_id'),
        supabase.from('teachers').select('id, status'),
        supabase.from('classes').select('id, name'),
        supabase.from('student_enrollments').select('id, status'),
        supabase.from('employees').select('id, status'),
      ]);

      const students = studentsRes.data || [];
      const teachers = teachersRes.data || [];
      const classes = classesRes.data || [];
      const enrollments = enrollmentsRes.data || [];
      const employees = employeesRes.data || [];

      // Student gender distribution
      const genderDistribution = [
        { 
          name: 'Masculino', 
          value: students.filter(s => s.gender === 'MASCULINO').length,
          color: 'hsl(221, 83%, 53%)' // blue
        },
        { 
          name: 'Feminino', 
          value: students.filter(s => s.gender === 'FEMININO').length,
          color: 'hsl(330, 81%, 60%)' // pink
        },
      ];

      // Enrollment status distribution
      const enrollmentStatus = [
        { 
          name: 'Aprovadas', 
          value: enrollments.filter(e => e.status === 'APROVADA').length,
          color: 'hsl(var(--success))'
        },
        { 
          name: 'Pendentes', 
          value: enrollments.filter(e => e.status === 'PENDENTE').length,
          color: 'hsl(var(--warning))'
        },
        { 
          name: 'Rejeitadas', 
          value: enrollments.filter(e => e.status === 'REJEITADA').length,
          color: 'hsl(var(--destructive))'
        },
      ];

      // Students per class
      const classStudentCount: Record<string, number> = {};
      students.forEach(s => {
        if (s.class_id) {
          const className = classes.find(c => c.id === s.class_id)?.name || `Turma ${s.class_id}`;
          classStudentCount[className] = (classStudentCount[className] || 0) + 1;
        }
      });

      const classDistribution = Object.entries(classStudentCount)
        .map(([name, alunos]) => ({ name, alunos }))
        .sort((a, b) => b.alunos - a.alunos)
        .slice(0, 8); // Top 8 classes

      return {
        counts: {
          students: students.filter(s => s.status === 'Ativo').length,
          teachers: teachers.filter(t => t.status === 'Ativo').length,
          classes: classes.length,
          pendingEnrollments: enrollments.filter(e => e.status === 'PENDENTE').length,
          employees: employees.filter(e => e.status === 'Ativo').length,
          totalStudents: students.length,
        },
        genderDistribution,
        enrollmentStatus,
        classDistribution,
      };
    },
  });
}

export function useFinancialDashboard() {
  const currentYear = new Date().getFullYear();
  
  return useQuery({
    queryKey: ['dashboard-financial', currentYear],
    queryFn: async () => {
      const months: { month: string; receitas: number; despesas: number; saldo: number }[] = [];
      const tuitionTrend: { month: string; pago: number; pendente: number; atrasado: number }[] = [];
      
      // Get last 6 months of data
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStr = format(date, 'yyyy-MM');
        const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(date), 'yyyy-MM-dd');

        const [transactionsRes, tuitionRes] = await Promise.all([
          supabase
            .from('transactions')
            .select('type, amount')
            .gte('date', startDate)
            .lte('date', endDate),
          supabase
            .from('tuition_fees')
            .select('status')
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

        months.push({
          month: monthStr,
          receitas,
          despesas,
          saldo: receitas - despesas,
        });

        tuitionTrend.push({
          month: monthStr,
          pago: tuitions.filter(t => t.status === 'Pago').length,
          pendente: tuitions.filter(t => t.status === 'Pendente').length,
          atrasado: tuitions.filter(t => t.status === 'Atrasado').length,
        });
      }

      // Current month summary
      const currentMonth = format(new Date(), 'yyyy-MM');
      const currentData = months.find(m => m.month === currentMonth) || { receitas: 0, despesas: 0, saldo: 0 };
      const currentTuition = tuitionTrend.find(t => t.month === currentMonth) || { pago: 0, pendente: 0, atrasado: 0 };
      
      const totalTuitions = currentTuition.pago + currentTuition.pendente + currentTuition.atrasado;
      const taxaAdimplencia = totalTuitions > 0 ? Math.round((currentTuition.pago / totalTuitions) * 100) : 0;

      return {
        monthlyData: months,
        tuitionTrend,
        currentSummary: {
          receitas: currentData.receitas,
          despesas: currentData.despesas,
          saldo: currentData.saldo,
          taxaAdimplencia,
        },
      };
    },
  });
}
