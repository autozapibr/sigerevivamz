import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

export type ReportType = 
  | 'students' 
  | 'enrollments' 
  | 'classes' 
  | 'teachers' 
  | 'attendance' 
  | 'guardians';

export interface ReportFilters {
  reportType: ReportType;
  startDate?: string;
  endDate?: string;
  status?: string;
  classId?: number;
  gender?: string;
  province?: string;
}

export interface StudentReportData {
  id: number;
  name: string;
  gender: string | null;
  birth_date: string | null;
  phone: string | null;
  bi_number: string | null;
  status: string | null;
  class_name: string | null;
  province: string | null;
  guardian: string | null;
}

export interface EnrollmentReportData {
  id: number;
  enrollment_number: string | null;
  student_name: string;
  class_name: string | null;
  status: string | null;
  enrollment_date: string | null;
  monthly_fee: number | null;
  enrollment_fee: number | null;
  academic_year: string | null;
}

export interface ClassReportData {
  id: number;
  name: string;
  year: number;
  teacher_name: string | null;
  students_count: number;
}

export interface TeacherReportData {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  status: string | null;
  qualifications: string | null;
  contract_type: string | null;
}

export interface AttendanceReportData {
  student_name: string;
  class_name: string;
  total_days: number;
  presences: number;
  absences: number;
  justified_absences: number;
  delays: number;
  presence_rate: number;
}

export interface GuardianReportData {
  id: number;
  full_name: string;
  relationship: string;
  phone: string;
  email: string | null;
  occupation: string | null;
  students: string[];
}

export function useStudentsReport(filters: Omit<ReportFilters, 'reportType'>) {
  return useQuery({
    queryKey: ['report-students', filters],
    queryFn: async () => {
      let query = supabase
        .from('students')
        .select(`
          id, name, gender, birth_date, phone, bi_number, status, province, guardian,
          classes:class_id (name)
        `)
        .order('name');

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as 'Ativo' | 'Inativo');
      }
      if (filters.classId) {
        query = query.eq('class_id', filters.classId);
      }
      if (filters.gender && filters.gender !== 'all') {
        query = query.eq('gender', filters.gender as 'MASCULINO' | 'FEMININO');
      }
      if (filters.province && filters.province !== 'all') {
        query = query.eq('province', filters.province);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        gender: s.gender === 'MASCULINO' ? 'M' : s.gender === 'FEMININO' ? 'F' : '-',
        birth_date: s.birth_date ? format(parseISO(s.birth_date), 'dd/MM/yyyy', { locale: pt }) : '-',
        phone: s.phone || '-',
        bi_number: s.bi_number || '-',
        status: s.status || '-',
        class_name: s.classes?.name || 'Sem turma',
        province: s.province || '-',
        guardian: s.guardian || '-',
      })) as StudentReportData[];
    },
  });
}

export function useEnrollmentsReport(filters: Omit<ReportFilters, 'reportType'>) {
  return useQuery({
    queryKey: ['report-enrollments', filters],
    queryFn: async () => {
      let query = supabase
        .from('student_enrollments')
        .select(`
          id, enrollment_number, status, enrollment_date, monthly_fee, enrollment_fee,
          students (name),
          classes (name),
          academic_years (name)
        `)
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as any);
      }
      if (filters.classId) {
        query = query.eq('class_id', filters.classId);
      }
      if (filters.startDate) {
        query = query.gte('enrollment_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('enrollment_date', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((e: any) => ({
        id: e.id,
        enrollment_number: e.enrollment_number || '-',
        student_name: e.students?.name || '-',
        class_name: e.classes?.name || 'Sem turma',
        status: e.status || '-',
        enrollment_date: e.enrollment_date ? format(parseISO(e.enrollment_date), 'dd/MM/yyyy', { locale: pt }) : '-',
        monthly_fee: e.monthly_fee || 0,
        enrollment_fee: e.enrollment_fee || 0,
        academic_year: e.academic_years?.name || '-',
      })) as EnrollmentReportData[];
    },
  });
}

export function useClassesReport(filters: Omit<ReportFilters, 'reportType'>) {
  return useQuery({
    queryKey: ['report-classes', filters],
    queryFn: async () => {
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select(`
          id, name, year,
          teacher:teacher_id (name)
        `)
        .order('year', { ascending: false })
        .order('name');

      if (classesError) throw classesError;

      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('class_id')
        .eq('status', 'Ativo');

      if (studentsError) throw studentsError;

      const studentCounts: Record<number, number> = {};
      studentsData?.forEach((s) => {
        if (s.class_id) {
          studentCounts[s.class_id] = (studentCounts[s.class_id] || 0) + 1;
        }
      });

      return (classesData || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        year: c.year,
        teacher_name: c.teacher?.name || 'Sem director',
        students_count: studentCounts[c.id] || 0,
      })) as ClassReportData[];
    },
  });
}

export function useTeachersReport(filters: Omit<ReportFilters, 'reportType'>) {
  return useQuery({
    queryKey: ['report-teachers', filters],
    queryFn: async () => {
      let query = supabase
        .from('teachers')
        .select('id, name, phone, email, status, qualifications, contract_type')
        .order('name');

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as 'Ativo' | 'Inativo');
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        phone: t.phone || '-',
        email: t.email || '-',
        status: t.status || '-',
        qualifications: t.qualifications || '-',
        contract_type: t.contract_type || '-',
      })) as TeacherReportData[];
    },
  });
}

export function useAttendanceReport(filters: Omit<ReportFilters, 'reportType'>) {
  return useQuery({
    queryKey: ['report-attendance', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_attendance_stats')
        .select('*');

      if (error) throw error;

      let results = data || [];
      
      if (filters.classId) {
        results = results.filter((r) => r.class_id === filters.classId);
      }

      return results.map((r: any) => ({
        student_name: r.student_name || '-',
        class_name: r.class_name || '-',
        total_days: r.total_dias || 0,
        presences: r.presencas || 0,
        absences: r.faltas || 0,
        justified_absences: r.faltas_justificadas || 0,
        delays: r.atrasos || 0,
        presence_rate: r.taxa_presenca || 0,
      })) as AttendanceReportData[];
    },
  });
}

export function useGuardiansReport(filters: Omit<ReportFilters, 'reportType'>) {
  return useQuery({
    queryKey: ['report-guardians', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guardians')
        .select(`
          id, full_name, relationship, phone, email, occupation,
          student_guardians (
            students (name)
          )
        `)
        .order('full_name');

      if (error) throw error;

      return (data || []).map((g: any) => ({
        id: g.id,
        full_name: g.full_name,
        relationship: g.relationship || '-',
        phone: g.phone || '-',
        email: g.email || '-',
        occupation: g.occupation || '-',
        students: g.student_guardians?.map((sg: any) => sg.students?.name).filter(Boolean) || [],
      })) as GuardianReportData[];
    },
  });
}

// Statistics for dashboard summary
export function useReportsSummary() {
  return useQuery({
    queryKey: ['reports-summary'],
    queryFn: async () => {
      const [studentsRes, teachersRes, classesRes, enrollmentsRes] = await Promise.all([
        supabase.from('students').select('id, status, gender', { count: 'exact' }),
        supabase.from('teachers').select('id, status', { count: 'exact' }),
        supabase.from('classes').select('id', { count: 'exact' }),
        supabase.from('student_enrollments').select('id, status', { count: 'exact' }),
      ]);

      const students = studentsRes.data || [];
      const teachers = teachersRes.data || [];
      const enrollments = enrollmentsRes.data || [];

      return {
        totalStudents: students.length,
        activeStudents: students.filter((s) => s.status === 'Ativo').length,
        maleStudents: students.filter((s) => s.gender === 'MASCULINO').length,
        femaleStudents: students.filter((s) => s.gender === 'FEMININO').length,
        totalTeachers: teachers.length,
        activeTeachers: teachers.filter((t) => t.status === 'Ativo').length,
        totalClasses: classesRes.data?.length || 0,
        totalEnrollments: enrollments.length,
        pendingEnrollments: enrollments.filter((e) => e.status === 'PENDENTE').length,
        approvedEnrollments: enrollments.filter((e) => e.status === 'APROVADA').length,
      };
    },
  });
}
