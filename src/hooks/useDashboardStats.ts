import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export function useDashboardStats(teacherId?: number | null) {
  return useQuery({
    queryKey: ['dashboard-stats-extended', teacherId],
    queryFn: async () => {
      // Get assigned classes and students if teacherId is provided
      let assignedClassIds: number[] = [];
      let assignedStudentIds: number[] = [];

      if (teacherId) {
        // Get classes where teacher is director
        const { data: directorClasses } = await supabase
          .from('classes')
          .select('id')
          .eq('teacher_id', teacherId);
        
        // Get classes from curriculum
        const { data: curriculumClasses } = await supabase
          .from('class_curriculum')
          .select('class_id')
          .eq('teacher_id', teacherId);

        assignedClassIds = Array.from(new Set([
          ...(directorClasses?.map(c => c.id) || []),
          ...(curriculumClasses?.map(c => c.class_id) || [])
        ]));
      }

      const [
        studentsRes,
        teachersRes,
        classesRes,
        enrollmentsRes,
        employeesRes,
      ] = await Promise.all([
        studentsQuery,
        teachersQuery,
        classesQuery,
        enrollmentsQuery,
        employeesQuery,
      ] = await Promise.all([
        teacherId 
          ? supabase.from('students').select('id, status, gender, class_id').in('class_id', assignedClassIds.length > 0 ? assignedClassIds : [-1])
          : supabase.from('students').select('id, status, gender, class_id'),
        supabase.from('teachers').select('id, status'),
        teacherId
          ? supabase.from('classes').select('id, name').in('id', assignedClassIds.length > 0 ? assignedClassIds : [-1])
          : supabase.from('classes').select('id, name'),
        supabase.from('student_enrollments').select('id, status'),
        supabase.from('employees').select('id, status'),
      ]);

      const students = studentsQuery.data || [];
      const teachers = teachersQuery.data || [];
      const classes = classesQuery.data || [];
      const enrollments = enrollmentsQuery.data || [];
      const employees = employeesQuery.data || [];

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
  return useQuery({
    queryKey: ['dashboard-financial-v2'],
    queryFn: async () => {
      // Fetch all transactions and tuition fees at once for efficiency
      const [transactionsRes, tuitionRes] = await Promise.all([
        supabase.from('transactions').select('type, amount, date'),
        supabase.from('tuition_fees').select('status, month, amount'),
      ]);

      const transactions = transactionsRes.data || [];
      const tuitions = tuitionRes.data || [];

      // Group transactions by month
      const transactionsByMonth: Record<string, { receitas: number; despesas: number }> = {};
      transactions.forEach(t => {
        if (t.date) {
          const monthKey = t.date.substring(0, 7); // YYYY-MM
          if (!transactionsByMonth[monthKey]) {
            transactionsByMonth[monthKey] = { receitas: 0, despesas: 0 };
          }
          if (t.type === 'Receita') {
            transactionsByMonth[monthKey].receitas += t.amount || 0;
          } else {
            transactionsByMonth[monthKey].despesas += t.amount || 0;
          }
        }
      });

      // Group tuitions by month
      const tuitionsByMonth: Record<string, { pago: number; pendente: number; atrasado: number }> = {};
      tuitions.forEach(t => {
        if (t.month) {
          if (!tuitionsByMonth[t.month]) {
            tuitionsByMonth[t.month] = { pago: 0, pendente: 0, atrasado: 0 };
          }
          if (t.status === 'Pago') tuitionsByMonth[t.month].pago++;
          else if (t.status === 'Pendente') tuitionsByMonth[t.month].pendente++;
          else if (t.status === 'Atrasado') tuitionsByMonth[t.month].atrasado++;
        }
      });

      // Get last 6 months including current
      const months: { month: string; receitas: number; despesas: number; saldo: number }[] = [];
      const tuitionTrend: { month: string; pago: number; pendente: number; atrasado: number }[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStr = format(date, 'yyyy-MM');
        
        const txData = transactionsByMonth[monthStr] || { receitas: 0, despesas: 0 };
        months.push({
          month: monthStr,
          receitas: txData.receitas,
          despesas: txData.despesas,
          saldo: txData.receitas - txData.despesas,
        });

        const tuitionData = tuitionsByMonth[monthStr] || { pago: 0, pendente: 0, atrasado: 0 };
        tuitionTrend.push({
          month: monthStr,
          ...tuitionData,
        });
      }

      // Current month summary
      const currentMonth = format(new Date(), 'yyyy-MM');
      const currentTxData = transactionsByMonth[currentMonth] || { receitas: 0, despesas: 0 };
      const currentTuitionData = tuitionsByMonth[currentMonth] || { pago: 0, pendente: 0, atrasado: 0 };
      
      const totalTuitions = currentTuitionData.pago + currentTuitionData.pendente + currentTuitionData.atrasado;
      const taxaAdimplencia = totalTuitions > 0 ? Math.round((currentTuitionData.pago / totalTuitions) * 100) : 0;

      // Also calculate total stats for display
      const totalReceitas = transactions.filter(t => t.type === 'Receita').reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalDespesas = transactions.filter(t => t.type === 'Despesa').reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalPago = tuitions.filter(t => t.status === 'Pago').length;
      const totalPendente = tuitions.filter(t => t.status === 'Pendente').length;
      const totalAtrasado = tuitions.filter(t => t.status === 'Atrasado').length;
      const totalTuitionCount = totalPago + totalPendente + totalAtrasado;
      const overallTaxaAdimplencia = totalTuitionCount > 0 ? Math.round((totalPago / totalTuitionCount) * 100) : 0;

      return {
        monthlyData: months,
        tuitionTrend,
        currentSummary: {
          receitas: currentTxData.receitas || totalReceitas,
          despesas: currentTxData.despesas || totalDespesas,
          saldo: (currentTxData.receitas || totalReceitas) - (currentTxData.despesas || totalDespesas),
          taxaAdimplencia: taxaAdimplencia || overallTaxaAdimplencia,
        },
        totals: {
          receitas: totalReceitas,
          despesas: totalDespesas,
          saldo: totalReceitas - totalDespesas,
          taxaAdimplencia: overallTaxaAdimplencia,
          propinasTotal: totalTuitionCount,
          propinasPagas: totalPago,
        }
      };
    },
  });
}
