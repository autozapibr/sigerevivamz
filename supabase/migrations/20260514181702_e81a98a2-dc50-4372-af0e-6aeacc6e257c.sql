-- Fix assignment for Professor Abubacar Assane specifically for testing
-- First, find his ID
DO $$
DECLARE
    teacher_id_var BIGINT;
    class12_id BIGINT;
    class10_id BIGINT;
    subject_bio_id BIGINT;
    subject_fr_id BIGINT;
BEGIN
    SELECT id INTO teacher_id_var FROM public.teachers WHERE email = 'prof.abubacar@escolareviva.com';
    
    IF teacher_id_var IS NOT NULL THEN
        -- Find or create classes/subjects if they don't exist for the test
        SELECT id INTO class12_id FROM public.classes WHERE name ILIKE '%12%' LIMIT 1;
        SELECT id INTO class10_id FROM public.classes WHERE name ILIKE '%10%' LIMIT 1;
        SELECT id INTO subject_bio_id FROM public.subjects WHERE name ILIKE '%Biologia%' LIMIT 1;
        SELECT id INTO subject_fr_id FROM public.subjects WHERE name ILIKE '%Francês%' OR name ILIKE '%Francesa%' LIMIT 1;

        -- Assign subjects in class_curriculum if not already there
        IF class12_id IS NOT NULL AND subject_bio_id IS NOT NULL THEN
            INSERT INTO public.class_curriculum (class_id, subject_id, teacher_id)
            VALUES (class12_id, subject_bio_id, teacher_id_var)
            ON CONFLICT (class_id, subject_id) DO UPDATE SET teacher_id = teacher_id_var;
        END IF;

        IF class10_id IS NOT NULL AND subject_fr_id IS NOT NULL THEN
            INSERT INTO public.class_curriculum (class_id, subject_id, teacher_id)
            VALUES (class10_id, subject_fr_id, teacher_id_var)
            ON CONFLICT (class_id, subject_id) DO UPDATE SET teacher_id = teacher_id_var;
        END IF;
    END IF;
END $$;

-- Enable RLS on all relevant tables if not already enabled
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_curriculum ENABLE ROW LEVEL SECURITY;

-- Policy for Classes
-- Admin/Pedagogico see all, Teachers see only their assigned ones
DROP POLICY IF EXISTS "Teachers can see assigned classes" ON public.classes;
CREATE POLICY "Teachers can see assigned classes" ON public.classes
FOR SELECT
USING (
  auth.role() = 'authenticated' AND (
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role IN ('ADMIN', 'PEDAGOGICO', 'DIRETORIA', 'SECRETARIA')
    )
    OR
    teacher_id = (SELECT teacher_id FROM public.profiles WHERE user_id = auth.uid())
    OR
    id IN (
        SELECT class_id FROM public.class_curriculum 
        WHERE teacher_id = (SELECT teacher_id FROM public.profiles WHERE user_id = auth.uid())
    )
  )
);

-- Policy for Students
DROP POLICY IF EXISTS "Teachers can see students in their classes" ON public.students;
CREATE POLICY "Teachers can see students in their classes" ON public.students
FOR SELECT
USING (
  auth.role() = 'authenticated' AND (
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role IN ('ADMIN', 'PEDAGOGICO', 'DIRETORIA', 'SECRETARIA')
    )
    OR
    class_id IN (
        SELECT id FROM public.classes 
        WHERE teacher_id = (SELECT teacher_id FROM public.profiles WHERE user_id = auth.uid())
        OR id IN (
            SELECT class_id FROM public.class_curriculum 
            WHERE teacher_id = (SELECT teacher_id FROM public.profiles WHERE user_id = auth.uid())
        )
    )
  )
);

-- Policy for Grades
DROP POLICY IF EXISTS "Teachers can manage grades for their assignments" ON public.grades;
CREATE POLICY "Teachers can manage grades for their assignments" ON public.grades
FOR ALL
USING (
  auth.role() = 'authenticated' AND (
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role IN ('ADMIN', 'PEDAGOGICO', 'DIRETORIA')
    )
    OR
    EXISTS (
        SELECT 1 FROM public.class_curriculum cc
        WHERE cc.class_id = grades.class_id 
        AND cc.subject_id = grades.subject_id
        AND cc.teacher_id = (SELECT teacher_id FROM public.profiles WHERE user_id = auth.uid())
    )
  )
);

-- Policy for Attendance
DROP POLICY IF EXISTS "Teachers can manage attendance for their assignments" ON public.attendance;
CREATE POLICY "Teachers can manage attendance for their assignments" ON public.attendance
FOR ALL
USING (
  auth.role() = 'authenticated' AND (
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role IN ('ADMIN', 'PEDAGOGICO', 'DIRETORIA')
    )
    OR
    class_id IN (
        SELECT id FROM public.classes 
        WHERE teacher_id = (SELECT teacher_id FROM public.profiles WHERE user_id = auth.uid())
    )
    OR
    EXISTS (
        SELECT 1 FROM public.class_curriculum cc
        WHERE cc.class_id = attendance.class_id 
        AND cc.subject_id = attendance.subject_id
        AND cc.teacher_id = (SELECT teacher_id FROM public.profiles WHERE user_id = auth.uid())
    )
  )
);

-- Policy for Class Curriculum (to see who is assigned to what)
DROP POLICY IF EXISTS "Everyone authenticated can see curriculum" ON public.class_curriculum;
CREATE POLICY "Everyone authenticated can see curriculum" ON public.class_curriculum
FOR SELECT
USING (auth.role() = 'authenticated');
