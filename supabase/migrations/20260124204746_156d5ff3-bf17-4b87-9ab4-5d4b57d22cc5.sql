-- =============================================
-- ETAPA 1: FUNDAÇÃO - SEGURANÇA E RBAC
-- =============================================

-- 1.1 & 1.3: Atualizar enum app_role com todos os roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ADMIN';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'PEDAGOGICO';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ALUNO';

-- Corrigir search_path das funções existentes
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Função auxiliar para verificar múltiplos roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)
  );
$$;

-- Função para verificar se é staff (não aluno/encarregado)
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('ADMIN', 'DIRETORIA', 'SECRETARIA', 'FINANCEIRO', 'PROFESSOR', 'PEDAGOGICO')
  );
$$;

-- Corrigir search_path de outras funções
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_enrollment_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  year_suffix TEXT;
  next_number INT;
BEGIN
  SELECT EXTRACT(YEAR FROM CURRENT_DATE)::TEXT INTO year_suffix;
  
  SELECT COALESCE(MAX(
    NULLIF(REGEXP_REPLACE(enrollment_number, '[^0-9]', '', 'g'), '')::INT
  ), 0) + 1
  INTO next_number
  FROM public.student_enrollments
  WHERE enrollment_number LIKE 'MAT-' || year_suffix || '-%';
  
  NEW.enrollment_number := 'MAT-' || year_suffix || '-' || LPAD(next_number::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

-- =============================================
-- REMOVER POLÍTICAS PERMISSIVAS E CRIAR NOVAS
-- =============================================

-- STUDENTS
DROP POLICY IF EXISTS "Public full access" ON public.students;
DROP POLICY IF EXISTS "service_role_delete_students" ON public.students;
DROP POLICY IF EXISTS "service_role_insert_students" ON public.students;
DROP POLICY IF EXISTS "service_role_select_students" ON public.students;
DROP POLICY IF EXISTS "service_role_update_students" ON public.students;

CREATE POLICY "Staff can view students" ON public.students
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage students" ON public.students
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['ADMIN', 'DIRETORIA', 'SECRETARIA']::app_role[])
  );

-- TEACHERS
DROP POLICY IF EXISTS "Public full access" ON public.teachers;
DROP POLICY IF EXISTS "service_role_delete_teachers" ON public.teachers;
DROP POLICY IF EXISTS "service_role_insert_teachers" ON public.teachers;
DROP POLICY IF EXISTS "service_role_select_teachers" ON public.teachers;
DROP POLICY IF EXISTS "service_role_update_teachers" ON public.teachers;

CREATE POLICY "Staff can view teachers" ON public.teachers
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Admin can manage teachers" ON public.teachers
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['ADMIN', 'DIRETORIA', 'SECRETARIA']::app_role[])
  );

-- CLASSES
DROP POLICY IF EXISTS "Public full access" ON public.classes;
DROP POLICY IF EXISTS "service_role_delete_classes" ON public.classes;
DROP POLICY IF EXISTS "service_role_insert_classes" ON public.classes;
DROP POLICY IF EXISTS "service_role_select_classes" ON public.classes;
DROP POLICY IF EXISTS "service_role_update_classes" ON public.classes;

CREATE POLICY "Staff can view classes" ON public.classes
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Admin can manage classes" ON public.classes
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['ADMIN', 'DIRETORIA', 'SECRETARIA']::app_role[])
  );

-- SUBJECTS
DROP POLICY IF EXISTS "Public full access" ON public.subjects;
DROP POLICY IF EXISTS "service_role_delete_subjects" ON public.subjects;
DROP POLICY IF EXISTS "service_role_insert_subjects" ON public.subjects;
DROP POLICY IF EXISTS "service_role_select_subjects" ON public.subjects;
DROP POLICY IF EXISTS "service_role_update_subjects" ON public.subjects;

CREATE POLICY "Staff can view subjects" ON public.subjects
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Admin can manage subjects" ON public.subjects
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['ADMIN', 'DIRETORIA', 'SECRETARIA', 'PEDAGOGICO']::app_role[])
  );

-- GRADES
DROP POLICY IF EXISTS "Public full access" ON public.grades;
DROP POLICY IF EXISTS "service_role_delete_grades" ON public.grades;
DROP POLICY IF EXISTS "service_role_insert_grades" ON public.grades;
DROP POLICY IF EXISTS "service_role_select_grades" ON public.grades;
DROP POLICY IF EXISTS "service_role_update_grades" ON public.grades;

CREATE POLICY "Staff can view grades" ON public.grades
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Teachers can manage grades" ON public.grades
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['ADMIN', 'DIRETORIA', 'PROFESSOR', 'PEDAGOGICO']::app_role[])
  );

-- ENROLLMENTS (tabela antiga)
DROP POLICY IF EXISTS "Public full access" ON public.enrollments;
DROP POLICY IF EXISTS "service_role_delete_enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "service_role_insert_enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "service_role_select_enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "service_role_update_enrollments" ON public.enrollments;

CREATE POLICY "Staff can view enrollments" ON public.enrollments
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Admin can manage enrollments" ON public.enrollments
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['ADMIN', 'DIRETORIA', 'SECRETARIA']::app_role[])
  );

-- TRANSACTIONS
DROP POLICY IF EXISTS "Public full access" ON public.transactions;
DROP POLICY IF EXISTS "service_role_delete_transactions" ON public.transactions;
DROP POLICY IF EXISTS "service_role_insert_transactions" ON public.transactions;
DROP POLICY IF EXISTS "service_role_select_transactions" ON public.transactions;
DROP POLICY IF EXISTS "service_role_update_transactions" ON public.transactions;

CREATE POLICY "Finance can view transactions" ON public.transactions
  FOR SELECT USING (
    public.has_any_role(auth.uid(), ARRAY['ADMIN', 'DIRETORIA', 'FINANCEIRO']::app_role[])
  );

CREATE POLICY "Finance can manage transactions" ON public.transactions
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['ADMIN', 'DIRETORIA', 'FINANCEIRO']::app_role[])
  );

-- TUITION_FEES
DROP POLICY IF EXISTS "Public full access" ON public.tuition_fees;
DROP POLICY IF EXISTS "service_role_delete_tuition_fees" ON public.tuition_fees;
DROP POLICY IF EXISTS "service_role_insert_tuition_fees" ON public.tuition_fees;
DROP POLICY IF EXISTS "service_role_select_tuition_fees" ON public.tuition_fees;
DROP POLICY IF EXISTS "service_role_update_tuition_fees" ON public.tuition_fees;

CREATE POLICY "Finance can view tuition_fees" ON public.tuition_fees
  FOR SELECT USING (
    public.has_any_role(auth.uid(), ARRAY['ADMIN', 'DIRETORIA', 'FINANCEIRO', 'SECRETARIA']::app_role[])
  );

CREATE POLICY "Finance can manage tuition_fees" ON public.tuition_fees
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['ADMIN', 'DIRETORIA', 'FINANCEIRO']::app_role[])
  );

-- FINANCIAL_CATEGORIES
DROP POLICY IF EXISTS "Public full access" ON public.financial_categories;
DROP POLICY IF EXISTS "service_role_delete_financial_categories" ON public.financial_categories;
DROP POLICY IF EXISTS "service_role_insert_financial_categories" ON public.financial_categories;
DROP POLICY IF EXISTS "service_role_select_financial_categories" ON public.financial_categories;
DROP POLICY IF EXISTS "service_role_update_financial_categories" ON public.financial_categories;

CREATE POLICY "Finance can view categories" ON public.financial_categories
  FOR SELECT USING (
    public.has_any_role(auth.uid(), ARRAY['ADMIN', 'DIRETORIA', 'FINANCEIRO']::app_role[])
  );

CREATE POLICY "Finance can manage categories" ON public.financial_categories
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['ADMIN', 'DIRETORIA', 'FINANCEIRO']::app_role[])
  );

-- SCHOLARSHIPS
DROP POLICY IF EXISTS "Public full access" ON public.scholarships;
DROP POLICY IF EXISTS "service_role_delete_scholarships" ON public.scholarships;
DROP POLICY IF EXISTS "service_role_insert_scholarships" ON public.scholarships;
DROP POLICY IF EXISTS "service_role_select_scholarships" ON public.scholarships;
DROP POLICY IF EXISTS "service_role_update_scholarships" ON public.scholarships;

CREATE POLICY "Staff can view scholarships" ON public.scholarships
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Admin can manage scholarships" ON public.scholarships
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['ADMIN', 'DIRETORIA', 'FINANCEIRO']::app_role[])
  );

-- STUDENT_SCHOLARSHIPS
DROP POLICY IF EXISTS "Public full access" ON public.student_scholarships;
DROP POLICY IF EXISTS "service_role_delete_student_scholarships" ON public.student_scholarships;
DROP POLICY IF EXISTS "service_role_insert_student_scholarships" ON public.student_scholarships;
DROP POLICY IF EXISTS "service_role_select_student_scholarships" ON public.student_scholarships;
DROP POLICY IF EXISTS "service_role_update_student_scholarships" ON public.student_scholarships;

CREATE POLICY "Staff can view student_scholarships" ON public.student_scholarships
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Admin can manage student_scholarships" ON public.student_scholarships
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['ADMIN', 'DIRETORIA', 'FINANCEIRO', 'SECRETARIA']::app_role[])
  );

-- CALENDAR_EVENTS
DROP POLICY IF EXISTS "Public full access" ON public.calendar_events;
DROP POLICY IF EXISTS "service_role_delete_calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "service_role_insert_calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "service_role_select_calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "service_role_update_calendar_events" ON public.calendar_events;

CREATE POLICY "Staff can view calendar" ON public.calendar_events
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Admin can manage calendar" ON public.calendar_events
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['ADMIN', 'DIRETORIA', 'SECRETARIA', 'PEDAGOGICO']::app_role[])
  );

-- CLASS_CURRICULUM
DROP POLICY IF EXISTS "Public full access" ON public.class_curriculum;
DROP POLICY IF EXISTS "service_role_delete_class_curriculum" ON public.class_curriculum;
DROP POLICY IF EXISTS "service_role_insert_class_curriculum" ON public.class_curriculum;
DROP POLICY IF EXISTS "service_role_select_class_curriculum" ON public.class_curriculum;
DROP POLICY IF EXISTS "service_role_update_class_curriculum" ON public.class_curriculum;

CREATE POLICY "Staff can view curriculum" ON public.class_curriculum
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Admin can manage curriculum" ON public.class_curriculum
  FOR ALL USING (
    public.has_any_role(auth.uid(), ARRAY['ADMIN', 'DIRETORIA', 'SECRETARIA', 'PEDAGOGICO']::app_role[])
  );