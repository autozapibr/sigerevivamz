-- Reforçar políticas RLS com correções de tipos (UUID vs text)

-- 1. Classes (Turmas)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Professores veem turmas atribuídas" ON public.classes;
CREATE POLICY "Professores veem turmas atribuídas" 
ON public.classes 
FOR SELECT 
USING (
  auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role::text IN ('ADMIN', 'PEDAGOGICO', 'DIRETORIA', 'SECRETARIA'))
  OR teacher_id IN (SELECT teacher_id FROM public.profiles WHERE user_id = auth.uid())
  OR id IN (SELECT class_id FROM public.class_curriculum WHERE teacher_id IN (SELECT teacher_id FROM public.profiles WHERE user_id = auth.uid()))
);

-- 2. Grades (Notas)
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Professores gerem notas de suas disciplinas" ON public.grades;
CREATE POLICY "Professores gerem notas de suas disciplinas"
ON public.grades
FOR ALL
USING (
  auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role::text IN ('ADMIN', 'PEDAGOGICO', 'DIRETORIA'))
  OR (class_id, subject_id) IN (
    SELECT class_id, subject_id FROM public.class_curriculum 
    WHERE teacher_id IN (SELECT teacher_id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- 3. Attendance (Faltas/Chamada)
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Professores gerem chamadas de suas turmas" ON public.attendance;
CREATE POLICY "Professores gerem chamadas de suas turmas"
ON public.attendance
FOR ALL
USING (
  auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role::text IN ('ADMIN', 'PEDAGOGICO', 'DIRETORIA'))
  OR (class_id, COALESCE(subject_id, 0)) IN (
    SELECT id, 0 FROM public.classes WHERE teacher_id IN (SELECT teacher_id FROM public.profiles WHERE user_id = auth.uid())
    UNION
    SELECT class_id, subject_id FROM public.class_curriculum WHERE teacher_id IN (SELECT teacher_id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- 4. Lesson Plans (Planos de Aula)
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Professores veem apenas seus planos" ON public.lesson_plans;
CREATE POLICY "Professores veem apenas seus planos"
ON public.lesson_plans
FOR ALL
USING (
  auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role::text IN ('ADMIN', 'PEDAGOGICO', 'DIRETORIA'))
  OR teacher_id::text = auth.uid()::text
);

-- 5. Student data
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Professores veem alunos de suas turmas" ON public.students;
CREATE POLICY "Professores veem alunos de suas turmas"
ON public.students
FOR SELECT
USING (
  auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role::text IN ('ADMIN', 'PEDAGOGICO', 'DIRETORIA', 'SECRETARIA'))
  OR class_id IN (
    SELECT id FROM public.classes WHERE teacher_id IN (SELECT teacher_id FROM public.profiles WHERE user_id = auth.uid())
    UNION
    SELECT class_id FROM public.class_curriculum WHERE teacher_id IN (SELECT teacher_id FROM public.profiles WHERE user_id = auth.uid())
  )
);
