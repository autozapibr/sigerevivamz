-- ============================================================
-- SGE REVIVA - MIGRAÇÃO COMPLETA - PARTE 2: RLS POLICIES
-- Data: 2026-03-01
-- ============================================================

-- ===================== ENABLE RLS =====================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tuition_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_curriculum ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plan_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plan_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plan_training_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_files ENABLE ROW LEVEL SECURITY;

-- ===================== RLS POLICIES =====================

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- user_roles (managed by admin functions, no direct user access needed beyond read)
-- Note: user_roles policies should be configured based on your auth setup

-- academic_years
CREATE POLICY "Admin can manage academic_years" ON public.academic_years FOR ALL USING (has_role(auth.uid(), 'DIRETORIA') OR has_role(auth.uid(), 'SECRETARIA'));

-- teachers
CREATE POLICY "Admin can manage teachers" ON public.teachers FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA']::app_role[]));
CREATE POLICY "Staff can view teachers" ON public.teachers FOR SELECT USING (is_staff(auth.uid()));

-- classes
CREATE POLICY "Admin can manage classes" ON public.classes FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA']::app_role[]));
CREATE POLICY "Staff can view classes" ON public.classes FOR SELECT USING (is_staff(auth.uid()));

-- subjects
CREATE POLICY "Admin can manage subjects" ON public.subjects FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA','PEDAGOGICO']::app_role[]));
CREATE POLICY "Staff can view subjects" ON public.subjects FOR SELECT USING (is_staff(auth.uid()));

-- students
CREATE POLICY "Staff can manage students" ON public.students FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA']::app_role[]));
CREATE POLICY "Staff can view students" ON public.students FOR SELECT USING (is_staff(auth.uid()));

-- guardians
CREATE POLICY "Staff can manage guardians" ON public.guardians FOR ALL USING (has_role(auth.uid(), 'DIRETORIA') OR has_role(auth.uid(), 'SECRETARIA'));
CREATE POLICY "Staff can view guardians" ON public.guardians FOR SELECT USING (has_role(auth.uid(), 'DIRETORIA') OR has_role(auth.uid(), 'SECRETARIA'));

-- student_guardians
CREATE POLICY "Staff can manage student_guardians" ON public.student_guardians FOR ALL USING (has_role(auth.uid(), 'DIRETORIA') OR has_role(auth.uid(), 'SECRETARIA'));
CREATE POLICY "Staff can view student_guardians" ON public.student_guardians FOR SELECT USING (has_role(auth.uid(), 'DIRETORIA') OR has_role(auth.uid(), 'SECRETARIA'));

-- employees
CREATE POLICY "Admin can manage employees" ON public.employees FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA']::app_role[]));
CREATE POLICY "Finance and management can view all employee data" ON public.employees FOR SELECT USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO']::app_role[]));

-- financial_categories
CREATE POLICY "Finance can manage categories" ON public.financial_categories FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO']::app_role[]));
CREATE POLICY "Finance can view categories" ON public.financial_categories FOR SELECT USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO']::app_role[]));

-- transactions
CREATE POLICY "Finance can manage transactions" ON public.transactions FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO']::app_role[]));
CREATE POLICY "Finance can view transactions" ON public.transactions FOR SELECT USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO']::app_role[]));

-- tuition_fees
CREATE POLICY "Finance can manage tuition_fees" ON public.tuition_fees FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[]));
CREATE POLICY "Finance can view tuition_fees" ON public.tuition_fees FOR SELECT USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[]));

-- enrollments
CREATE POLICY "Admin can manage enrollments" ON public.enrollments FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA']::app_role[]));
CREATE POLICY "Staff can view enrollments" ON public.enrollments FOR SELECT USING (is_staff(auth.uid()));

-- student_enrollments
CREATE POLICY "Staff can manage enrollments" ON public.student_enrollments FOR ALL USING (has_role(auth.uid(), 'DIRETORIA') OR has_role(auth.uid(), 'SECRETARIA'));
CREATE POLICY "Staff can view enrollments" ON public.student_enrollments FOR SELECT USING (has_role(auth.uid(), 'DIRETORIA') OR has_role(auth.uid(), 'SECRETARIA') OR has_role(auth.uid(), 'FINANCEIRO'));

-- grades
CREATE POLICY "Teachers can manage grades" ON public.grades FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','PROFESSOR','PEDAGOGICO']::app_role[]));
CREATE POLICY "Staff can view grades" ON public.grades FOR SELECT USING (is_staff(auth.uid()));

-- attendance
CREATE POLICY "Teachers can manage attendance" ON public.attendance FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','PROFESSOR','PEDAGOGICO']::app_role[]));
CREATE POLICY "Staff can view attendance" ON public.attendance FOR SELECT USING (is_staff(auth.uid()));

-- scholarships
CREATE POLICY "Admin can manage scholarships" ON public.scholarships FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO']::app_role[]));
CREATE POLICY "Staff can view scholarships" ON public.scholarships FOR SELECT USING (is_staff(auth.uid()));

-- student_scholarships
CREATE POLICY "Admin can manage student_scholarships" ON public.student_scholarships FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[]));
CREATE POLICY "Staff can view student_scholarships" ON public.student_scholarships FOR SELECT USING (is_staff(auth.uid()));

-- class_curriculum
CREATE POLICY "Admin can manage curriculum" ON public.class_curriculum FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA','PEDAGOGICO']::app_role[]));
CREATE POLICY "Staff can view curriculum" ON public.class_curriculum FOR SELECT USING (is_staff(auth.uid()));

-- announcements
CREATE POLICY "Admin can manage announcements" ON public.announcements FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA','PEDAGOGICO']::app_role[]));
CREATE POLICY "Staff can view announcements" ON public.announcements FOR SELECT USING (is_staff(auth.uid()));

-- announcement_reads
CREATE POLICY "Users can read own announcement_reads" ON public.announcement_reads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own announcement_reads" ON public.announcement_reads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- calendar_events
CREATE POLICY "Admin can manage calendar" ON public.calendar_events FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA','PEDAGOGICO']::app_role[]));
CREATE POLICY "Staff can view calendar" ON public.calendar_events FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Students can view exams for their class" ON public.calendar_events FOR SELECT USING (type = 'Prova' AND has_role(auth.uid(), 'ALUNO'));

-- contract_signatures
CREATE POLICY "Admin can manage contract_signatures" ON public.contract_signatures FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA']::app_role[]));
CREATE POLICY "Public can read own contract by token" ON public.contract_signatures FOR SELECT USING (false);
CREATE POLICY "Public can sign with valid token" ON public.contract_signatures FOR UPDATE 
  USING (signature_token IS NOT NULL AND status = ANY (ARRAY['pending', 'sent']) AND (token_expires_at IS NULL OR token_expires_at > now()))
  WITH CHECK (signature_token IS NOT NULL AND status = ANY (ARRAY['pending', 'sent']) AND (token_expires_at IS NULL OR token_expires_at > now()));

-- student_documents
CREATE POLICY "Staff can manage documents" ON public.student_documents FOR ALL USING (has_role(auth.uid(), 'DIRETORIA') OR has_role(auth.uid(), 'SECRETARIA'));
CREATE POLICY "Staff can view documents" ON public.student_documents FOR SELECT USING (has_role(auth.uid(), 'DIRETORIA') OR has_role(auth.uid(), 'SECRETARIA'));

-- staff_documents
CREATE POLICY "Admin can manage staff_documents" ON public.staff_documents FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA']::app_role[]));
CREATE POLICY "Staff can view staff_documents" ON public.staff_documents FOR SELECT USING (is_staff(auth.uid()));

-- communication_history
CREATE POLICY "Finance can manage communications" ON public.communication_history FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[]));
CREATE POLICY "Finance can view communications" ON public.communication_history FOR SELECT USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[]));

-- payment_agreements
CREATE POLICY "Finance can manage agreements" ON public.payment_agreements FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[]));
CREATE POLICY "Finance can view agreements" ON public.payment_agreements FOR SELECT USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[]));

-- agreement_installments
CREATE POLICY "Finance can manage installments" ON public.agreement_installments FOR ALL USING (
  EXISTS (SELECT 1 FROM payment_agreements pa WHERE pa.id = agreement_installments.agreement_id 
    AND has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[])));
CREATE POLICY "Finance can view installments" ON public.agreement_installments FOR SELECT USING (
  EXISTS (SELECT 1 FROM payment_agreements pa WHERE pa.id = agreement_installments.agreement_id 
    AND has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[])));

-- scheduled_reminders
CREATE POLICY "Finance can manage reminders" ON public.scheduled_reminders FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[]));
CREATE POLICY "Finance can view reminders" ON public.scheduled_reminders FOR SELECT USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[]));

-- exam_notifications
CREATE POLICY "Staff can manage exam_notifications" ON public.exam_notifications FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','PROFESSOR','PEDAGOGICO']::app_role[]));
CREATE POLICY "Users can view own exam_notifications" ON public.exam_notifications FOR SELECT USING (
  recipient_user_id = auth.uid() OR recipient_role IN (SELECT role FROM user_roles WHERE user_id = auth.uid()));

-- integration_settings
CREATE POLICY "Admin can manage integration_settings" ON public.integration_settings FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA']::app_role[]));

-- lesson_plan_config
CREATE POLICY "Admin can manage lesson_plan_config" ON public.lesson_plan_config FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA']::app_role[]));
CREATE POLICY "Staff can view lesson_plan_config" ON public.lesson_plan_config FOR SELECT USING (is_staff(auth.uid()));

-- lesson_plan_fields
CREATE POLICY "Admin can manage lesson_plan_fields" ON public.lesson_plan_fields FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA']::app_role[]));
CREATE POLICY "Staff can view lesson_plan_fields" ON public.lesson_plan_fields FOR SELECT USING (is_staff(auth.uid()));

-- lesson_plan_training_docs
CREATE POLICY "Admin can manage training docs" ON public.lesson_plan_training_docs FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA']::app_role[]));
CREATE POLICY "Staff can view training docs" ON public.lesson_plan_training_docs FOR SELECT USING (is_staff(auth.uid()));

-- lesson_plans
CREATE POLICY "Teachers can manage own lesson_plans" ON public.lesson_plans FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Admin can view all lesson_plans" ON public.lesson_plans FOR SELECT USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','PEDAGOGICO']::app_role[]));

-- registration_invitations
CREATE POLICY "Staff can manage invitations" ON public.registration_invitations FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA']::app_role[]));

-- tickets (need to add policies based on your current setup)
CREATE POLICY "Users can create tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own tickets" ON public.tickets FOR SELECT USING (created_by = auth.uid() OR is_staff(auth.uid()));
CREATE POLICY "Staff can manage tickets" ON public.tickets FOR ALL USING (is_staff(auth.uid()));

-- ticket_messages
CREATE POLICY "Users can view ticket messages" ON public.ticket_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_messages.ticket_id AND (t.created_by = auth.uid() OR is_staff(auth.uid()))));
CREATE POLICY "Users can send ticket messages" ON public.ticket_messages FOR INSERT WITH CHECK (true);

-- ticket_notifications
CREATE POLICY "Users can view own ticket notifications" ON public.ticket_notifications FOR SELECT USING (user_id = auth.uid()::text OR is_staff(auth.uid()));
CREATE POLICY "Staff can manage ticket notifications" ON public.ticket_notifications FOR ALL USING (is_staff(auth.uid()));

-- teacher_files
CREATE POLICY "Teachers can manage own files" ON public.teacher_files FOR ALL USING (auth.uid() = teacher_user_id);
CREATE POLICY "Admin can view all teacher files" ON public.teacher_files FOR SELECT USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','PEDAGOGICO']::app_role[]));

-- ===================== STORAGE BUCKETS =====================
-- Execute these manually in the Supabase Dashboard SQL Editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('student-documents', 'student-documents', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('staff-files', 'staff-files', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('aep-training-docs', 'aep-training-docs', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('teacher-files', 'teacher-files', false);
