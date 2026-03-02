
-- Limpar dados fictícios para produção
-- Ordem: tabelas dependentes primeiro (CASCADE cuida das FK)

TRUNCATE TABLE public.announcement_reads CASCADE;
TRUNCATE TABLE public.announcements CASCADE;
TRUNCATE TABLE public.calendar_events CASCADE;
TRUNCATE TABLE public.exam_notifications CASCADE;
TRUNCATE TABLE public.lesson_plans CASCADE;
TRUNCATE TABLE public.contract_signatures CASCADE;
TRUNCATE TABLE public.communication_history CASCADE;
TRUNCATE TABLE public.scheduled_reminders CASCADE;
TRUNCATE TABLE public.agreement_installments CASCADE;
TRUNCATE TABLE public.payment_agreements CASCADE;
TRUNCATE TABLE public.tuition_fees CASCADE;
TRUNCATE TABLE public.grades CASCADE;
TRUNCATE TABLE public.attendance CASCADE;
TRUNCATE TABLE public.student_documents CASCADE;
TRUNCATE TABLE public.student_scholarships CASCADE;
TRUNCATE TABLE public.student_guardians CASCADE;
TRUNCATE TABLE public.student_enrollments CASCADE;
TRUNCATE TABLE public.enrollments CASCADE;
TRUNCATE TABLE public.class_curriculum CASCADE;
TRUNCATE TABLE public.teacher_files CASCADE;
TRUNCATE TABLE public.staff_documents CASCADE;
TRUNCATE TABLE public.students CASCADE;
TRUNCATE TABLE public.guardians CASCADE;
TRUNCATE TABLE public.teachers CASCADE;
TRUNCATE TABLE public.employees CASCADE;
TRUNCATE TABLE public.classes CASCADE;
TRUNCATE TABLE public.subjects CASCADE;
TRUNCATE TABLE public.scholarships CASCADE;

-- Manter: academic_years (estrutural), financial_categories (estrutural), 
-- integration_settings (config), lesson_plan_config, lesson_plan_fields,
-- profiles, user_roles, registration_invitations
