-- ============================================================
-- SGE REVIVA - MIGRAÇÃO COMPLETA - PARTE 1: SCHEMA
-- Data: 2026-03-01
-- ============================================================

-- ===================== ENUMS =====================

CREATE TYPE public.app_role AS ENUM ('ADMIN','DIRETORIA','SECRETARIA','FINANCEIRO','PROFESSOR','PEDAGOGICO','ENCARREGADO','ALUNO');
CREATE TYPE public.student_status AS ENUM ('Ativo','Inativo');
CREATE TYPE public.payment_status AS ENUM ('Pago','Pendente');
CREATE TYPE public.enrollment_status AS ENUM ('PENDENTE','EM_ANALISE','APROVADA','REJEITADA','CANCELADA');
CREATE TYPE public.calendar_event_type AS ENUM ('Feriado','Evento','Prova','Prazo','Actividade');
CREATE TYPE public.transaction_type AS ENUM ('Receita','Despesa');
CREATE TYPE public.communication_type AS ENUM ('WHATSAPP','SMS','TELEFONE','EMAIL','PRESENCIAL');
CREATE TYPE public.communication_status AS ENUM ('ENVIADO','ENTREGUE','LIDO','FALHOU','AGENDADO');
CREATE TYPE public.document_type AS ENUM ('BI','NUIT','CERTIDAO_NASCIMENTO','CERTIFICADO_HABILITACOES','DECLARACAO_ESCOLA_ANTERIOR','ATESTADO_MEDICO','FOTO','OUTRO');
CREATE TYPE public.scholarship_type AS ENUM ('Percentagem','Valor Fixo');
CREATE TYPE public.payment_agreement_status AS ENUM ('PENDENTE','ATIVO','CUMPRIDO','QUEBRADO','CANCELADO');
CREATE TYPE public.reminder_type AS ENUM ('VENCIMENTO_PROXIMO','DIA_VENCIMENTO','ATRASO_LEVE','ATRASO_MODERADO','ATRASO_GRAVE','PARCELA_ACORDO');
CREATE TYPE public.gender_type AS ENUM ('MASCULINO','FEMININO');
CREATE TYPE public.ticket_category AS ENUM ('RECLAMACAO','INFORMACAO','SUGESTAO','SUPORTE','FINANCEIRO','PEDAGOGICO','RH','OUTRO','SECRETARIA');
CREATE TYPE public.ticket_priority AS ENUM ('BAIXA','NORMAL','ALTA','URGENTE');
CREATE TYPE public.ticket_status AS ENUM ('ABERTO','EM_ANDAMENTO','AGUARDANDO','RESOLVIDO','FECHADO');
CREATE TYPE public.teacher_status AS ENUM ('Ativo','Inativo');
CREATE TYPE public.tuition_status AS ENUM ('Pago','Atrasado','Pendente');

-- ===================== TABLES =====================

-- profiles
CREATE TABLE public.profiles (
  user_id UUID NOT NULL PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- user_roles
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'PROFESSOR'
);

-- academic_years
CREATE TABLE public.academic_years (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- teachers
CREATE TABLE public.teachers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  qualifications TEXT,
  status public.teacher_status DEFAULT 'Ativo',
  bi_number TEXT,
  nuit TEXT,
  photo_url TEXT,
  hire_date DATE,
  contract_number TEXT,
  contract_type TEXT DEFAULT 'Efectivo',
  contract_start DATE,
  contract_end DATE,
  salary NUMERIC,
  address TEXT,
  province TEXT,
  district TEXT,
  birth_date DATE,
  gender TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  bank_name TEXT,
  bank_account TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  payment_method TEXT DEFAULT 'bank',
  mobile_money_provider TEXT,
  mobile_money_number TEXT
);

-- classes
CREATE TABLE public.classes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  teacher_id BIGINT REFERENCES public.teachers(id)
);

-- subjects
CREATE TABLE public.subjects (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  workload INTEGER
);

-- students
CREATE TABLE public.students (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  guardian TEXT,
  age INTEGER,
  class_id BIGINT REFERENCES public.classes(id),
  status public.student_status DEFAULT 'Ativo',
  bi_number TEXT,
  nuit TEXT,
  birth_date DATE,
  gender public.gender_type,
  nationality TEXT DEFAULT 'Moçambicana',
  province TEXT,
  district TEXT,
  address TEXT,
  email TEXT,
  photo_url TEXT,
  health_notes TEXT,
  previous_school TEXT,
  enrollment_status public.enrollment_status DEFAULT 'PENDENTE',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- guardians
CREATE TABLE public.guardians (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  bi_number TEXT,
  nuit TEXT,
  email TEXT,
  phone_alt TEXT,
  occupation TEXT,
  workplace TEXT,
  address TEXT,
  province TEXT,
  district TEXT,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- student_guardians
CREATE TABLE public.student_guardians (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES public.students(id),
  guardian_id BIGINT NOT NULL REFERENCES public.guardians(id),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- employees
CREATE TABLE public.employees (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  bi_number TEXT,
  nuit TEXT,
  photo_url TEXT,
  gender TEXT,
  birth_date DATE,
  hire_date DATE,
  salary NUMERIC,
  status TEXT DEFAULT 'Ativo',
  department TEXT,
  contract_type TEXT DEFAULT 'Efectivo',
  contract_number TEXT,
  contract_start DATE,
  contract_end DATE,
  address TEXT,
  province TEXT,
  district TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  bank_name TEXT,
  bank_account TEXT,
  payment_method TEXT DEFAULT 'bank',
  mobile_money_provider TEXT,
  mobile_money_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- financial_categories
CREATE TABLE public.financial_categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  type public.transaction_type NOT NULL
);

-- transactions
CREATE TABLE public.transactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT,
  type public.transaction_type NOT NULL,
  category_id BIGINT REFERENCES public.financial_categories(id),
  amount NUMERIC NOT NULL
);

-- tuition_fees
CREATE TABLE public.tuition_fees (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES public.students(id),
  month TEXT NOT NULL,
  due_date DATE,
  amount NUMERIC,
  status public.tuition_status,
  paid_at TIMESTAMPTZ
);

-- enrollments
CREATE TABLE public.enrollments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_name TEXT,
  date DATE,
  amount NUMERIC,
  discount NUMERIC,
  status public.payment_status
);

-- student_enrollments
CREATE TABLE public.student_enrollments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES public.students(id),
  academic_year_id BIGINT NOT NULL REFERENCES public.academic_years(id),
  class_id BIGINT REFERENCES public.classes(id),
  enrollment_number TEXT,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status public.enrollment_status DEFAULT 'PENDENTE',
  monthly_fee NUMERIC DEFAULT 0,
  enrollment_fee NUMERIC DEFAULT 0,
  discount_percent NUMERIC DEFAULT 0,
  notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- grades
CREATE TABLE public.grades (
  student_id BIGINT NOT NULL REFERENCES public.students(id),
  subject_id BIGINT NOT NULL REFERENCES public.subjects(id),
  trimestre INTEGER,
  acs NUMERIC,
  acp NUMERIC,
  acf NUMERIC,
  media_trimestral NUMERIC,
  media_final NUMERIC,
  nota1 NUMERIC,
  nota2 NUMERIC,
  final_exam NUMERIC,
  academic_year_id BIGINT REFERENCES public.academic_years(id),
  class_id BIGINT REFERENCES public.classes(id),
  observation TEXT,
  recorded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (student_id, subject_id)
);

-- attendance
CREATE TABLE public.attendance (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES public.students(id),
  class_id BIGINT NOT NULL REFERENCES public.classes(id),
  subject_id BIGINT REFERENCES public.subjects(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL,
  observation TEXT,
  recorded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- scholarships
CREATE TABLE public.scholarships (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  type public.scholarship_type NOT NULL,
  value NUMERIC NOT NULL
);

-- student_scholarships
CREATE TABLE public.student_scholarships (
  student_id BIGINT NOT NULL REFERENCES public.students(id),
  scholarship_id BIGINT NOT NULL REFERENCES public.scholarships(id),
  PRIMARY KEY (student_id, scholarship_id)
);

-- class_curriculum
CREATE TABLE public.class_curriculum (
  class_id BIGINT NOT NULL REFERENCES public.classes(id),
  subject_id BIGINT NOT NULL REFERENCES public.subjects(id),
  teacher_id BIGINT NOT NULL REFERENCES public.teachers(id),
  PRIMARY KEY (class_id, subject_id)
);

-- announcements
CREATE TABLE public.announcements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'NORMAL',
  target_audience TEXT[] NOT NULL DEFAULT ARRAY['TODOS'],
  class_ids INTEGER[],
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  expires_at DATE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- announcement_reads
CREATE TABLE public.announcement_reads (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  announcement_id BIGINT NOT NULL REFERENCES public.announcements(id),
  user_id UUID NOT NULL,
  read_at TIMESTAMPTZ DEFAULT now()
);

-- calendar_events
CREATE TABLE public.calendar_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  type public.calendar_event_type NOT NULL,
  start_time TIME,
  end_time TIME,
  is_all_day BOOLEAN DEFAULT true,
  location TEXT,
  color TEXT DEFAULT '#2D5F3F',
  recurrence TEXT,
  class_id BIGINT REFERENCES public.classes(id),
  subject_id BIGINT REFERENCES public.subjects(id),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- contract_signatures
CREATE TABLE public.contract_signatures (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  staff_id BIGINT NOT NULL,
  staff_name TEXT NOT NULL,
  staff_type TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  contract_number TEXT,
  contract_html TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  signature_data TEXT,
  signature_ip TEXT,
  signature_user_agent TEXT,
  signature_token UUID DEFAULT gen_random_uuid(),
  token_expires_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  sent_via TEXT,
  sent_to TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- student_documents
CREATE TABLE public.student_documents (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES public.students(id),
  document_type public.document_type NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- staff_documents
CREATE TABLE public.staff_documents (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  staff_id BIGINT NOT NULL,
  staff_type TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- communication_history
CREATE TABLE public.communication_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id BIGINT REFERENCES public.students(id),
  tuition_fee_id BIGINT REFERENCES public.tuition_fees(id),
  agreement_id BIGINT,
  communication_type public.communication_type NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT,
  recipient_email TEXT,
  message_content TEXT NOT NULL,
  message_template TEXT,
  status public.communication_status DEFAULT 'ENVIADO',
  sent_by UUID,
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  external_id TEXT,
  external_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- payment_agreements
CREATE TABLE public.payment_agreements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES public.students(id),
  tuition_fee_id BIGINT NOT NULL REFERENCES public.tuition_fees(id),
  original_amount NUMERIC NOT NULL,
  discount_percent NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  agreed_amount NUMERIC NOT NULL,
  installments INTEGER DEFAULT 1,
  installment_amount NUMERIC,
  promised_date DATE,
  notes TEXT,
  status public.payment_agreement_status DEFAULT 'PENDENTE',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- agreement_installments
CREATE TABLE public.agreement_installments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  agreement_id BIGINT NOT NULL REFERENCES public.payment_agreements(id),
  installment_number INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- scheduled_reminders
CREATE TABLE public.scheduled_reminders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES public.students(id),
  tuition_fee_id BIGINT REFERENCES public.tuition_fees(id),
  agreement_id BIGINT REFERENCES public.payment_agreements(id),
  reminder_type public.reminder_type NOT NULL,
  channel public.communication_type DEFAULT 'WHATSAPP',
  scheduled_for TIMESTAMPTZ NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  communication_id BIGINT REFERENCES public.communication_history(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- exam_notifications
CREATE TABLE public.exam_notifications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  calendar_event_id BIGINT NOT NULL REFERENCES public.calendar_events(id),
  recipient_user_id UUID,
  recipient_role public.app_role,
  recipient_class_id BIGINT REFERENCES public.classes(id),
  notification_type TEXT NOT NULL DEFAULT 'NEW_EXAM',
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  sent_via_whatsapp BOOLEAN DEFAULT false,
  whatsapp_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- integration_settings
CREATE TABLE public.integration_settings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  integration_name TEXT NOT NULL,
  api_key TEXT,
  api_url TEXT,
  instance_name TEXT,
  is_active BOOLEAN DEFAULT false,
  additional_config JSONB DEFAULT '{}'::jsonb,
  last_tested_at TIMESTAMPTZ,
  last_test_success BOOLEAN,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- lesson_plan_config
CREATE TABLE public.lesson_plan_config (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  config_key TEXT NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- lesson_plan_fields
CREATE TABLE public.lesson_plan_fields (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'select',
  options TEXT[] DEFAULT '{}'::text[],
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- lesson_plan_training_docs
CREATE TABLE public.lesson_plan_training_docs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- lesson_plans
CREATE TABLE public.lesson_plans (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  teacher_id UUID NOT NULL,
  teacher_name TEXT,
  title TEXT NOT NULL,
  generated_content TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'rascunho',
  class_id BIGINT REFERENCES public.classes(id),
  subject_id BIGINT REFERENCES public.subjects(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- registration_invitations
CREATE TABLE public.registration_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  email TEXT,
  intended_role public.app_role NOT NULL DEFAULT 'PROFESSOR',
  intended_name TEXT,
  notes TEXT,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_by UUID,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- tickets
CREATE TABLE public.tickets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_number TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category public.ticket_category NOT NULL DEFAULT 'OUTRO',
  priority public.ticket_priority NOT NULL DEFAULT 'NORMAL',
  status public.ticket_status NOT NULL DEFAULT 'ABERTO',
  created_by UUID,
  created_by_name TEXT NOT NULL,
  created_by_role TEXT,
  assigned_to UUID,
  assigned_to_name TEXT,
  assigned_department TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ticket_messages
CREATE TABLE public.ticket_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES public.tickets(id),
  sender_id UUID,
  sender_name TEXT NOT NULL,
  sender_role TEXT,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ticket_notifications
CREATE TABLE public.ticket_notifications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES public.tickets(id),
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  recipient_role TEXT,
  recipient_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- teacher_files
CREATE TABLE public.teacher_files (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  teacher_user_id UUID NOT NULL,
  teacher_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  category TEXT NOT NULL DEFAULT 'Outro',
  description TEXT,
  class_id BIGINT REFERENCES public.classes(id),
  subject_id BIGINT REFERENCES public.subjects(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===================== VIEWS =====================

CREATE OR REPLACE VIEW public.student_attendance_stats AS
SELECT s.id AS student_id,
    s.name AS student_name,
    c.id AS class_id,
    c.name AS class_name,
    count(*) FILTER (WHERE (a.status = 'PRESENTE')) AS presencas,
    count(*) FILTER (WHERE (a.status = 'FALTA')) AS faltas,
    count(*) FILTER (WHERE (a.status = 'FALTA_JUSTIFICADA')) AS faltas_justificadas,
    count(*) FILTER (WHERE (a.status = 'ATRASO')) AS atrasos,
    count(*) AS total_dias,
    round(((count(*) FILTER (WHERE (a.status = 'PRESENTE')))::numeric / NULLIF(count(*), 0)::numeric * 100), 2) AS taxa_presenca
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
LEFT JOIN attendance a ON s.id = a.student_id
GROUP BY s.id, s.name, c.id, c.name;

CREATE OR REPLACE VIEW public.employees_public_info AS
SELECT id, name, email, phone, role, department, status, photo_url, gender, hire_date, contract_type, province, district, created_at, updated_at
FROM employees;

CREATE OR REPLACE VIEW public.contract_signatures_signing AS
SELECT id, staff_name, contract_type, contract_html, status, signature_token, token_expires_at
FROM contract_signatures
WHERE signature_token IS NOT NULL
  AND status = ANY (ARRAY['pending', 'sent'])
  AND (token_expires_at IS NULL OR token_expires_at > now());

-- ===================== FUNCTIONS =====================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles));
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id 
    AND role IN ('ADMIN', 'DIRETORIA', 'SECRETARIA', 'FINANCEIRO', 'PROFESSOR', 'PEDAGOGICO')
  );
$$;

CREATE OR REPLACE FUNCTION public.calculate_trimester_average(_acs numeric, _acp numeric, _acf numeric)
RETURNS numeric LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT ROUND(COALESCE(_acs, 0) * 0.30 + COALESCE(_acp, 0) * 0.30 + COALESCE(_acf, 0) * 0.40, 2);
$$;

CREATE OR REPLACE FUNCTION public.calculate_final_average(_t1 numeric, _t2 numeric, _t3 numeric)
RETURNS numeric LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT ROUND(
    (COALESCE(_t1, 0) + COALESCE(_t2, 0) + COALESCE(_t3, 0)) / 
    NULLIF(
      CASE WHEN _t1 IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN _t2 IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN _t3 IS NOT NULL THEN 1 ELSE 0 END, 0), 2);
$$;

CREATE OR REPLACE FUNCTION public.classify_grade(_grade numeric)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT CASE
    WHEN _grade >= 18 THEN 'Excelente'
    WHEN _grade >= 14 THEN 'Bom'
    WHEN _grade >= 10 THEN 'Suficiente'
    WHEN _grade >= 5 THEN 'Insuficiente'
    ELSE 'Mau'
  END;
$$;

CREATE OR REPLACE FUNCTION public.generate_enrollment_number()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE
  year_suffix TEXT;
  next_number INT;
BEGIN
  SELECT EXTRACT(YEAR FROM CURRENT_DATE)::TEXT INTO year_suffix;
  SELECT COALESCE(MAX(NULLIF(REGEXP_REPLACE(enrollment_number, '[^0-9]', '', 'g'), '')::INT), 0) + 1
  INTO next_number FROM public.student_enrollments
  WHERE enrollment_number LIKE 'MAT-' || year_suffix || '-%';
  NEW.enrollment_number := 'MAT-' || year_suffix || '-' || LPAD(next_number::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE
  year_suffix TEXT;
  next_number INT;
BEGIN
  SELECT EXTRACT(YEAR FROM CURRENT_DATE)::TEXT INTO year_suffix;
  SELECT COALESCE(MAX(NULLIF(REGEXP_REPLACE(ticket_number, '[^0-9]', '', 'g'), '')::INT), 0) + 1
  INTO next_number FROM public.tickets
  WHERE ticket_number LIKE 'TKT-' || year_suffix || '-%';
  NEW.ticket_number := 'TKT-' || year_suffix || '-' || LPAD(next_number::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_invitation(_token uuid)
RETURNS TABLE(id uuid, email text, intended_role app_role, intended_name text, is_valid boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT ri.id, ri.email, ri.intended_role, ri.intended_name,
    (ri.is_used = false AND ri.expires_at > now()) as is_valid
  FROM public.registration_invitations ri WHERE ri.token = _token LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.consume_invitation(_token uuid, _user_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.registration_invitations SET is_used = true, used_at = now(), used_by = _user_id
  WHERE token = _token AND is_used = false AND expires_at > now();
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_contract_for_signing(_token uuid)
RETURNS TABLE(id bigint, staff_name text, contract_type text, contract_html text, status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT cs.id, cs.staff_name, cs.contract_type, cs.contract_html, cs.status
  FROM public.contract_signatures cs
  WHERE cs.signature_token = _token AND cs.status IN ('pending', 'sent')
    AND (cs.token_expires_at IS NULL OR cs.token_expires_at > now()) LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.notify_exam_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  class_name_var text;
  subject_name_var text;
BEGIN
  IF NEW.type != 'Prova' THEN RETURN NEW; END IF;
  SELECT name INTO class_name_var FROM classes WHERE id = NEW.class_id;
  SELECT name INTO subject_name_var FROM subjects WHERE id = NEW.subject_id;
  INSERT INTO exam_notifications (calendar_event_id, recipient_role, recipient_class_id, notification_type, message)
  VALUES (NEW.id, 'PROFESSOR', NEW.class_id, 'NEW_EXAM',
    'Nova prova agendada: ' || NEW.title || COALESCE(' - Turma: ' || class_name_var, '') ||
    COALESCE(' - Disciplina: ' || subject_name_var, '') || ' - Data: ' || to_char(NEW.date, 'DD/MM/YYYY'));
  IF NEW.class_id IS NOT NULL THEN
    INSERT INTO exam_notifications (calendar_event_id, recipient_role, recipient_class_id, notification_type, message)
    VALUES (NEW.id, 'ENCARREGADO', NEW.class_id, 'NEW_EXAM',
      'Prova agendada para seu educando: ' || NEW.title || COALESCE(' - Turma: ' || class_name_var, '') ||
      COALESCE(' - Disciplina: ' || subject_name_var, '') || ' - Data: ' || to_char(NEW.date, 'DD/MM/YYYY'));
    INSERT INTO exam_notifications (calendar_event_id, recipient_role, recipient_class_id, notification_type, message)
    VALUES (NEW.id, 'ALUNO', NEW.class_id, 'NEW_EXAM',
      'Prova agendada: ' || NEW.title || COALESCE(' - Disciplina: ' || subject_name_var, '') ||
      ' - Data: ' || to_char(NEW.date, 'DD/MM/YYYY'));
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_ticket_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  ticket_record RECORD;
  notification_message text;
BEGIN
  SELECT * INTO ticket_record FROM tickets WHERE id = NEW.ticket_id;
  IF ticket_record.status = 'FECHADO' THEN RETURN NEW; END IF;
  notification_message := 'Nova resposta no ticket ' || ticket_record.ticket_number || ': ' || LEFT(NEW.message, 100);
  IF NEW.sender_role IN ('ADMIN', 'DIRETORIA', 'SECRETARIA', 'FINANCEIRO', 'PEDAGOGICO') THEN
    INSERT INTO ticket_notifications (ticket_id, user_id, recipient_name, recipient_role, message, is_read)
    VALUES (NEW.ticket_id, COALESCE(ticket_record.created_by::text, 'anonymous'),
      ticket_record.created_by_name, ticket_record.created_by_role, notification_message, false);
  ELSE
    INSERT INTO ticket_notifications (ticket_id, user_id, recipient_name, recipient_role, message, is_read)
    VALUES (NEW.ticket_id, COALESCE(ticket_record.assigned_to::text, 'department'),
      ticket_record.assigned_to_name, ticket_record.assigned_department, notification_message, false);
  END IF;
  RETURN NEW;
END;
$$;

-- ===================== TRIGGERS =====================

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guardians_updated_at BEFORE UPDATE ON public.guardians
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_enrollments_updated_at BEFORE UPDATE ON public.student_enrollments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contract_signatures_updated_at BEFORE UPDATE ON public.contract_signatures
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER generate_enrollment_number_trigger BEFORE INSERT ON public.student_enrollments
FOR EACH ROW WHEN (NEW.enrollment_number IS NULL) EXECUTE FUNCTION public.generate_enrollment_number();

CREATE TRIGGER generate_ticket_number_trigger BEFORE INSERT ON public.tickets
FOR EACH ROW WHEN (NEW.ticket_number IS NULL) EXECUTE FUNCTION public.generate_ticket_number();

CREATE TRIGGER notify_exam_created_trigger AFTER INSERT ON public.calendar_events
FOR EACH ROW EXECUTE FUNCTION public.notify_exam_created();

CREATE TRIGGER notify_ticket_message_trigger AFTER INSERT ON public.ticket_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_ticket_message();
