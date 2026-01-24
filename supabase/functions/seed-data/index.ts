import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Dados de teste para Moçambique
const PROVINCIAS = [
  'Maputo Cidade', 'Maputo', 'Gaza', 'Inhambane', 'Sofala', 
  'Manica', 'Tete', 'Zambézia', 'Nampula', 'Cabo Delgado', 'Niassa'
];

const NOMES_MASCULINOS = [
  'João', 'Pedro', 'Carlos', 'António', 'Manuel', 'Francisco', 'José', 
  'Paulo', 'Miguel', 'Rafael', 'Domingos', 'Alberto', 'Fernando', 'Ricardo'
];

const NOMES_FEMININOS = [
  'Maria', 'Ana', 'Joana', 'Teresa', 'Beatriz', 'Catarina', 'Isabel', 
  'Luísa', 'Helena', 'Marta', 'Sofia', 'Inês', 'Clara', 'Raquel'
];

const APELIDOS = [
  'Machava', 'Mondlane', 'Chissano', 'Guebuza', 'Mutemba', 'Sitoe', 
  'Cossa', 'Langa', 'Nhantumbo', 'Manjate', 'Matsinhe', 'Tembe', 
  'Macuácua', 'Magaia', 'Massinga', 'Mabjaia'
];

const DISCIPLINAS = [
  { name: 'Português', code: 'PORT', workload: 5 },
  { name: 'Matemática', code: 'MAT', workload: 5 },
  { name: 'Inglês', code: 'ING', workload: 4 },
  { name: 'Ciências Naturais', code: 'CN', workload: 3 },
  { name: 'História', code: 'HIST', workload: 2 },
  { name: 'Geografia', code: 'GEO', workload: 2 },
  { name: 'Educação Física', code: 'EDF', workload: 2 },
  { name: 'Educação Visual', code: 'EVT', workload: 2 },
  { name: 'Educação Musical', code: 'MUS', workload: 1 },
  { name: 'Ofícios', code: 'OFI', workload: 2 },
  { name: 'Física', code: 'FIS', workload: 3 },
  { name: 'Química', code: 'QUI', workload: 3 },
  { name: 'Biologia', code: 'BIO', workload: 3 },
];

const TURMAS = [
  { name: '8ª A', year: 8 },
  { name: '8ª B', year: 8 },
  { name: '9ª A', year: 9 },
  { name: '9ª B', year: 9 },
  { name: '10ª A', year: 10 },
  { name: '10ª B', year: 10 },
  { name: '11ª A', year: 11 },
  { name: '12ª A', year: 12 },
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateBI(): string {
  const numbers = Array.from({ length: 12 }, () => randomInt(0, 9)).join('');
  return `${numbers.slice(0, 5)} ${numbers.slice(5, 11)} ${numbers.slice(11)}`;
}

function generateNUIT(): string {
  return Array.from({ length: 9 }, () => randomInt(0, 9)).join('');
}

function generatePhone(): string {
  const prefix = randomItem(['84', '85', '86', '87']);
  const number = Array.from({ length: 7 }, () => randomInt(0, 9)).join('');
  return `+258 ${prefix} ${number.slice(0, 3)} ${number.slice(3)}`;
}

function generateBirthDate(minAge: number, maxAge: number): string {
  const today = new Date();
  const age = randomInt(minAge, maxAge);
  const year = today.getFullYear() - age;
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function generateStudentName(gender: 'MASCULINO' | 'FEMININO'): string {
  const firstName = randomItem(gender === 'MASCULINO' ? NOMES_MASCULINOS : NOMES_FEMININOS);
  const middleName = randomItem(gender === 'MASCULINO' ? NOMES_MASCULINOS : NOMES_FEMININOS);
  const lastName = randomItem(APELIDOS);
  return `${firstName} ${middleName} ${lastName}`;
}

function generateTeacherName(): string {
  const gender = Math.random() > 0.5 ? 'MASCULINO' : 'FEMININO';
  const firstName = randomItem(gender === 'MASCULINO' ? NOMES_MASCULINOS : NOMES_FEMININOS);
  const lastName = randomItem(APELIDOS);
  return `${firstName} ${lastName}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: Record<string, any> = {};

    // 1. Seed Disciplinas (se não existirem)
    const { data: existingSubjects } = await supabase.from('subjects').select('id');
    if (!existingSubjects || existingSubjects.length < 10) {
      const { data: subjects, error } = await supabase
        .from('subjects')
        .upsert(DISCIPLINAS.map(d => ({
          name: d.name,
          code: d.code,
          workload: d.workload,
        })), { onConflict: 'code' })
        .select();
      results.subjects = { inserted: subjects?.length || 0, error };
    }

    // 2. Seed Turmas
    const { data: existingClasses } = await supabase.from('classes').select('id');
    if (!existingClasses || existingClasses.length < 5) {
      const { data: classes, error } = await supabase
        .from('classes')
        .insert(TURMAS)
        .select();
      results.classes = { inserted: classes?.length || 0, error };
    }

    // 3. Seed Professores (10 professores)
    const { data: existingTeachers } = await supabase.from('teachers').select('id');
    if (!existingTeachers || existingTeachers.length < 8) {
      const teachers = Array.from({ length: 10 }, () => ({
        name: generateTeacherName(),
        email: `professor${randomInt(1, 999)}@escola.co.mz`,
        phone: generatePhone(),
        qualifications: randomItem([
          'Licenciatura em Ensino de Matemática',
          'Licenciatura em Ensino de Português',
          'Licenciatura em Pedagogia',
          'Mestrado em Educação',
          'Bacharelato em Ciências'
        ]),
        status: 'Ativo',
      }));
      
      const { data, error } = await supabase
        .from('teachers')
        .insert(teachers)
        .select();
      results.teachers = { inserted: data?.length || 0, error };
    }

    // 4. Seed Estudantes (50 estudantes)
    const { data: existingStudents } = await supabase.from('students').select('id');
    const { data: classes } = await supabase.from('classes').select('id');
    
    if ((!existingStudents || existingStudents.length < 30) && classes && classes.length > 0) {
      const students = Array.from({ length: 50 }, () => {
        const gender = Math.random() > 0.5 ? 'MASCULINO' : 'FEMININO';
        const province = randomItem(PROVINCIAS);
        
        return {
          name: generateStudentName(gender as any),
          age: randomInt(12, 18),
          phone: generatePhone(),
          guardian: generateStudentName(Math.random() > 0.5 ? 'MASCULINO' : 'FEMININO'),
          class_id: randomItem(classes).id,
          status: 'Ativo',
          bi_number: Math.random() > 0.3 ? generateBI() : null,
          nuit: Math.random() > 0.5 ? generateNUIT() : null,
          birth_date: generateBirthDate(12, 18),
          gender: gender,
          nationality: 'Moçambicana',
          province: province,
          district: `Distrito de ${province}`,
          address: `Bairro ${randomItem(['Central', 'Alto Maé', 'Polana', 'Sommerschield', 'Mafalala', 'Chamanculo'])}`,
          enrollment_status: randomItem(['PENDENTE', 'APROVADA', 'APROVADA', 'APROVADA']),
        };
      });
      
      const { data, error } = await supabase
        .from('students')
        .insert(students)
        .select();
      results.students = { inserted: data?.length || 0, error };
    }

    // 5. Seed Matrículas
    const { data: allStudents } = await supabase.from('students').select('id, class_id');
    const { data: academicYears } = await supabase.from('academic_years').select('id').eq('is_current', true);
    const { data: existingEnrollments } = await supabase.from('student_enrollments').select('id');
    
    if (allStudents && academicYears && academicYears.length > 0 && 
        (!existingEnrollments || existingEnrollments.length < 20)) {
      const enrollments = allStudents.slice(0, 30).map(student => ({
        student_id: student.id,
        academic_year_id: academicYears[0].id,
        class_id: student.class_id,
        enrollment_date: new Date().toISOString().split('T')[0],
        status: randomItem(['PENDENTE', 'APROVADA', 'APROVADA', 'EM_ANALISE']),
        monthly_fee: randomItem([2500, 3000, 3500, 4000, 4500]),
        enrollment_fee: randomItem([1500, 2000, 2500]),
        discount_percent: randomItem([0, 0, 0, 10, 15, 20, 25]),
      }));
      
      const { data, error } = await supabase
        .from('student_enrollments')
        .insert(enrollments)
        .select();
      results.enrollments = { inserted: data?.length || 0, error };
    }

    // 6. Seed Propinas
    const { data: enrolledStudents } = await supabase
      .from('student_enrollments')
      .select('student_id, monthly_fee')
      .eq('status', 'APROVADA');
    
    const { data: existingFees } = await supabase.from('tuition_fees').select('id');
    
    if (enrolledStudents && enrolledStudents.length > 0 && 
        (!existingFees || existingFees.length < 50)) {
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'];
      const fees = enrolledStudents.flatMap(student => 
        months.map((month, idx) => ({
          student_id: student.student_id,
          month: month,
          amount: student.monthly_fee,
          due_date: `2025-${String(idx + 1).padStart(2, '0')}-10`,
          status: idx < 3 ? randomItem(['Pago', 'Pago', 'Pendente']) : 'Pendente',
        }))
      );
      
      const { data, error } = await supabase
        .from('tuition_fees')
        .insert(fees.slice(0, 100))
        .select();
      results.tuition_fees = { inserted: data?.length || 0, error };
    }

    // 7. Seed Encarregados (para estudantes sem encarregado)
    const { data: studentsForGuardians } = await supabase
      .from('students')
      .select('id, name')
      .limit(20);
    
    const { data: existingGuardians } = await supabase.from('guardians').select('id');
    
    if (studentsForGuardians && studentsForGuardians.length > 0 && 
        (!existingGuardians || existingGuardians.length < 10)) {
      const guardians = studentsForGuardians.map(student => ({
        full_name: generateStudentName(Math.random() > 0.5 ? 'MASCULINO' : 'FEMININO'),
        relationship: randomItem(['Pai', 'Mãe', 'Tio', 'Tia', 'Avó', 'Avô']),
        bi_number: generateBI(),
        nuit: generateNUIT(),
        phone: generatePhone(),
        phone_alt: Math.random() > 0.5 ? generatePhone() : null,
        occupation: randomItem([
          'Professor', 'Comerciante', 'Funcionário Público', 'Empresário', 
          'Agricultor', 'Médico', 'Enfermeiro', 'Motorista'
        ]),
        province: randomItem(PROVINCIAS),
        is_primary: true,
      }));
      
      const { data: insertedGuardians, error: gError } = await supabase
        .from('guardians')
        .insert(guardians)
        .select();
      
      if (insertedGuardians && insertedGuardians.length > 0) {
        // Link guardians to students
        const links = insertedGuardians.map((g, idx) => ({
          student_id: studentsForGuardians[idx].id,
          guardian_id: g.id,
          is_primary: true,
        }));
        
        await supabase.from('student_guardians').insert(links);
      }
      
      results.guardians = { inserted: insertedGuardians?.length || 0, error: gError };
    }

    // 8. Seed Transações Financeiras
    const { data: existingTransactions } = await supabase.from('transactions').select('id');
    
    if (!existingTransactions || existingTransactions.length < 20) {
      const transactions = Array.from({ length: 30 }, (_, i) => ({
        type: i < 20 ? 'Entrada' : 'Saída',
        amount: randomInt(1000, 50000),
        description: i < 20 
          ? randomItem(['Propina Janeiro', 'Propina Fevereiro', 'Taxa de Matrícula', 'Material Escolar'])
          : randomItem(['Salários', 'Material Didáctico', 'Manutenção', 'Electricidade', 'Água']),
        date: `2025-${String(randomInt(1, 6)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
      }));
      
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactions)
        .select();
      results.transactions = { inserted: data?.length || 0, error };
    }

    // Get final counts
    const counts = await Promise.all([
      supabase.from('students').select('id', { count: 'exact', head: true }),
      supabase.from('teachers').select('id', { count: 'exact', head: true }),
      supabase.from('classes').select('id', { count: 'exact', head: true }),
      supabase.from('subjects').select('id', { count: 'exact', head: true }),
      supabase.from('student_enrollments').select('id', { count: 'exact', head: true }),
      supabase.from('guardians').select('id', { count: 'exact', head: true }),
      supabase.from('tuition_fees').select('id', { count: 'exact', head: true }),
      supabase.from('transactions').select('id', { count: 'exact', head: true }),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Seed concluído com sucesso!',
        results,
        totals: {
          students: counts[0].count,
          teachers: counts[1].count,
          classes: counts[2].count,
          subjects: counts[3].count,
          enrollments: counts[4].count,
          guardians: counts[5].count,
          tuition_fees: counts[6].count,
          transactions: counts[7].count,
        },
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
