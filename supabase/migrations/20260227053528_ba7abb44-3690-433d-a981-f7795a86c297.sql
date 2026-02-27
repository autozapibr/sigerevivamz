
-- =============================================================
-- REMOVE ALL DEMO/ANON RLS POLICIES (production hardening)
-- =============================================================

-- academic_years
DROP POLICY IF EXISTS "Anon can delete academic_years for demo" ON public.academic_years;
DROP POLICY IF EXISTS "Anon can insert academic_years for demo" ON public.academic_years;
DROP POLICY IF EXISTS "Anon can update academic_years for demo" ON public.academic_years;
DROP POLICY IF EXISTS "Anon can view academic_years for demo" ON public.academic_years;

-- agreement_installments
DROP POLICY IF EXISTS "Anon can delete agreement_installments for demo" ON public.agreement_installments;
DROP POLICY IF EXISTS "Anon can insert agreement_installments for demo" ON public.agreement_installments;
DROP POLICY IF EXISTS "Anon can update agreement_installments for demo" ON public.agreement_installments;
DROP POLICY IF EXISTS "Anon can view agreement_installments for demo" ON public.agreement_installments;

-- announcement_reads
DROP POLICY IF EXISTS "Anon can delete announcement_reads for demo" ON public.announcement_reads;
DROP POLICY IF EXISTS "Anon can insert announcement_reads for demo" ON public.announcement_reads;
DROP POLICY IF EXISTS "Anon can update announcement_reads for demo" ON public.announcement_reads;
DROP POLICY IF EXISTS "Anon can view announcement_reads for demo" ON public.announcement_reads;

-- announcements
DROP POLICY IF EXISTS "Anon can delete announcements for demo" ON public.announcements;
DROP POLICY IF EXISTS "Anon can insert announcements for demo" ON public.announcements;
DROP POLICY IF EXISTS "Anon can update announcements for demo" ON public.announcements;
DROP POLICY IF EXISTS "Anon can view announcements for demo" ON public.announcements;

-- attendance
DROP POLICY IF EXISTS "Anon can delete attendance for demo" ON public.attendance;
DROP POLICY IF EXISTS "Anon can insert attendance for demo" ON public.attendance;
DROP POLICY IF EXISTS "Anon can update attendance for demo" ON public.attendance;
DROP POLICY IF EXISTS "Anon can view attendance for demo" ON public.attendance;

-- calendar_events
DROP POLICY IF EXISTS "Anon can delete calendar_events for demo" ON public.calendar_events;
DROP POLICY IF EXISTS "Anon can insert calendar_events for demo" ON public.calendar_events;
DROP POLICY IF EXISTS "Anon can update calendar_events for demo" ON public.calendar_events;
DROP POLICY IF EXISTS "Anon can view calendar_events for demo" ON public.calendar_events;

-- class_curriculum
DROP POLICY IF EXISTS "Anon can delete class_curriculum for demo" ON public.class_curriculum;
DROP POLICY IF EXISTS "Anon can insert class_curriculum for demo" ON public.class_curriculum;
DROP POLICY IF EXISTS "Anon can update class_curriculum for demo" ON public.class_curriculum;
DROP POLICY IF EXISTS "Anon can view class_curriculum for demo" ON public.class_curriculum;

-- classes
DROP POLICY IF EXISTS "Anon can delete classes for demo" ON public.classes;
DROP POLICY IF EXISTS "Anon can insert classes for demo" ON public.classes;
DROP POLICY IF EXISTS "Anon can update classes for demo" ON public.classes;
DROP POLICY IF EXISTS "Anon can view classes for demo" ON public.classes;

-- communication_history
DROP POLICY IF EXISTS "Anon can delete communication_history for demo" ON public.communication_history;
DROP POLICY IF EXISTS "Anon can insert communication_history for demo" ON public.communication_history;
DROP POLICY IF EXISTS "Anon can update communication_history for demo" ON public.communication_history;
DROP POLICY IF EXISTS "Anon can view communication_history for demo" ON public.communication_history;

-- contract_signatures
DROP POLICY IF EXISTS "Anon can delete contract_signatures for demo" ON public.contract_signatures;
DROP POLICY IF EXISTS "Anon can insert contract_signatures for demo" ON public.contract_signatures;
DROP POLICY IF EXISTS "Anon can update contract_signatures for demo" ON public.contract_signatures;
DROP POLICY IF EXISTS "Anon can view contract_signatures for demo" ON public.contract_signatures;

-- employees
DROP POLICY IF EXISTS "Anon can delete employees for demo" ON public.employees;
DROP POLICY IF EXISTS "Anon can insert employees for demo" ON public.employees;
DROP POLICY IF EXISTS "Anon can update employees for demo" ON public.employees;
DROP POLICY IF EXISTS "Anon can view employees for demo" ON public.employees;

-- enrollments
DROP POLICY IF EXISTS "Anon can delete enrollments for demo" ON public.enrollments;
DROP POLICY IF EXISTS "Anon can insert enrollments for demo" ON public.enrollments;
DROP POLICY IF EXISTS "Anon can update enrollments for demo" ON public.enrollments;
DROP POLICY IF EXISTS "Anon can view enrollments for demo" ON public.enrollments;

-- exam_notifications
DROP POLICY IF EXISTS "Anon can manage exam_notifications for demo" ON public.exam_notifications;

-- financial_categories
DROP POLICY IF EXISTS "Anon can delete financial_categories for demo" ON public.financial_categories;
DROP POLICY IF EXISTS "Anon can insert financial_categories for demo" ON public.financial_categories;
DROP POLICY IF EXISTS "Anon can update financial_categories for demo" ON public.financial_categories;
DROP POLICY IF EXISTS "Anon can view financial_categories for demo" ON public.financial_categories;

-- grades
DROP POLICY IF EXISTS "Anon can delete grades for demo" ON public.grades;
DROP POLICY IF EXISTS "Anon can insert grades for demo" ON public.grades;
DROP POLICY IF EXISTS "Anon can update grades for demo" ON public.grades;
DROP POLICY IF EXISTS "Anon can view grades for demo" ON public.grades;

-- guardians
DROP POLICY IF EXISTS "Anon can delete guardians for demo" ON public.guardians;
DROP POLICY IF EXISTS "Anon can insert guardians for demo" ON public.guardians;
DROP POLICY IF EXISTS "Anon can update guardians for demo" ON public.guardians;
DROP POLICY IF EXISTS "Anon can view guardians for demo" ON public.guardians;

-- integration_settings
DROP POLICY IF EXISTS "Anon can manage integration_settings for demo" ON public.integration_settings;

-- lesson_plan_config
DROP POLICY IF EXISTS "Anon can manage lesson_plan_config for demo" ON public.lesson_plan_config;
DROP POLICY IF EXISTS "Anon can view lesson_plan_config for demo" ON public.lesson_plan_config;

-- lesson_plan_fields
DROP POLICY IF EXISTS "Anon can manage lesson_plan_fields for demo" ON public.lesson_plan_fields;
DROP POLICY IF EXISTS "Anon can view lesson_plan_fields for demo" ON public.lesson_plan_fields;

-- lesson_plan_training_docs
DROP POLICY IF EXISTS "Anon can manage training_docs for demo" ON public.lesson_plan_training_docs;

-- lesson_plans
DROP POLICY IF EXISTS "Anon can manage lesson_plans for demo" ON public.lesson_plans;

-- payment_agreements
DROP POLICY IF EXISTS "Anon can delete payment_agreements for demo" ON public.payment_agreements;
DROP POLICY IF EXISTS "Anon can insert payment_agreements for demo" ON public.payment_agreements;
DROP POLICY IF EXISTS "Anon can update payment_agreements for demo" ON public.payment_agreements;
DROP POLICY IF EXISTS "Anon can view payment_agreements for demo" ON public.payment_agreements;

-- scheduled_reminders
DROP POLICY IF EXISTS "Anon can delete scheduled_reminders for demo" ON public.scheduled_reminders;
DROP POLICY IF EXISTS "Anon can insert scheduled_reminders for demo" ON public.scheduled_reminders;
DROP POLICY IF EXISTS "Anon can update scheduled_reminders for demo" ON public.scheduled_reminders;
DROP POLICY IF EXISTS "Anon can view scheduled_reminders for demo" ON public.scheduled_reminders;

-- scholarships
DROP POLICY IF EXISTS "Anon can delete scholarships for demo" ON public.scholarships;
DROP POLICY IF EXISTS "Anon can insert scholarships for demo" ON public.scholarships;
DROP POLICY IF EXISTS "Anon can update scholarships for demo" ON public.scholarships;
DROP POLICY IF EXISTS "Anon can view scholarships for demo" ON public.scholarships;

-- staff_documents
DROP POLICY IF EXISTS "Anon can delete staff_documents for demo" ON public.staff_documents;
DROP POLICY IF EXISTS "Anon can insert staff_documents for demo" ON public.staff_documents;
DROP POLICY IF EXISTS "Anon can update staff_documents for demo" ON public.staff_documents;
DROP POLICY IF EXISTS "Anon can view staff_documents for demo" ON public.staff_documents;

-- student_documents
DROP POLICY IF EXISTS "Anon can delete student_documents for demo" ON public.student_documents;
DROP POLICY IF EXISTS "Anon can insert student_documents for demo" ON public.student_documents;
DROP POLICY IF EXISTS "Anon can update student_documents for demo" ON public.student_documents;
DROP POLICY IF EXISTS "Anon can view student_documents for demo" ON public.student_documents;

-- student_enrollments
DROP POLICY IF EXISTS "Anon can delete student_enrollments for demo" ON public.student_enrollments;
DROP POLICY IF EXISTS "Anon can insert student_enrollments for demo" ON public.student_enrollments;
DROP POLICY IF EXISTS "Anon can update student_enrollments for demo" ON public.student_enrollments;
DROP POLICY IF EXISTS "Anon can view student_enrollments for demo" ON public.student_enrollments;

-- student_guardians
DROP POLICY IF EXISTS "Anon can delete student_guardians for demo" ON public.student_guardians;
DROP POLICY IF EXISTS "Anon can insert student_guardians for demo" ON public.student_guardians;
DROP POLICY IF EXISTS "Anon can update student_guardians for demo" ON public.student_guardians;
DROP POLICY IF EXISTS "Anon can view student_guardians for demo" ON public.student_guardians;

-- student_scholarships
DROP POLICY IF EXISTS "Anon can delete student_scholarships for demo" ON public.student_scholarships;
DROP POLICY IF EXISTS "Anon can insert student_scholarships for demo" ON public.student_scholarships;
DROP POLICY IF EXISTS "Anon can update student_scholarships for demo" ON public.student_scholarships;
DROP POLICY IF EXISTS "Anon can view student_scholarships for demo" ON public.student_scholarships;

-- students
DROP POLICY IF EXISTS "Anon can delete students for demo" ON public.students;
DROP POLICY IF EXISTS "Anon can insert students for demo" ON public.students;
DROP POLICY IF EXISTS "Anon can update students for demo" ON public.students;
DROP POLICY IF EXISTS "Anon can view students for demo" ON public.students;

-- subjects
DROP POLICY IF EXISTS "Anon can delete subjects for demo" ON public.subjects;
DROP POLICY IF EXISTS "Anon can insert subjects for demo" ON public.subjects;
DROP POLICY IF EXISTS "Anon can update subjects for demo" ON public.subjects;
DROP POLICY IF EXISTS "Anon can view subjects for demo" ON public.subjects;

-- teachers
DROP POLICY IF EXISTS "Anon can delete teachers for demo" ON public.teachers;
DROP POLICY IF EXISTS "Anon can insert teachers for demo" ON public.teachers;
DROP POLICY IF EXISTS "Anon can update teachers for demo" ON public.teachers;
DROP POLICY IF EXISTS "Anon can view teachers for demo" ON public.teachers;

-- transactions
DROP POLICY IF EXISTS "Anon can delete transactions for demo" ON public.transactions;
DROP POLICY IF EXISTS "Anon can insert transactions for demo" ON public.transactions;
DROP POLICY IF EXISTS "Anon can update transactions for demo" ON public.transactions;
DROP POLICY IF EXISTS "Anon can view transactions for demo" ON public.transactions;

-- tuition_fees
DROP POLICY IF EXISTS "Anon can delete tuition_fees for demo" ON public.tuition_fees;
DROP POLICY IF EXISTS "Anon can insert tuition_fees for demo" ON public.tuition_fees;
DROP POLICY IF EXISTS "Anon can update tuition_fees for demo" ON public.tuition_fees;
DROP POLICY IF EXISTS "Anon can view tuition_fees for demo" ON public.tuition_fees;

-- tickets and related
DROP POLICY IF EXISTS "Anon can manage tickets for demo" ON public.tickets;
DROP POLICY IF EXISTS "Anon can manage ticket_messages for demo" ON public.ticket_messages;
DROP POLICY IF EXISTS "Anon can manage ticket_notifications for demo" ON public.ticket_notifications;

-- Also remove duplicate "Anyone can view" policy on academic_years (redundant with staff policy)
DROP POLICY IF EXISTS "Anyone can view academic_years" ON public.academic_years;

-- Revoke GRANT ALL from anon on key tables (was given for demo)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;

-- Re-grant minimal anon permissions needed for public contract signing
GRANT SELECT ON public.contract_signatures_signing TO anon;
GRANT USAGE ON SCHEMA public TO anon;
