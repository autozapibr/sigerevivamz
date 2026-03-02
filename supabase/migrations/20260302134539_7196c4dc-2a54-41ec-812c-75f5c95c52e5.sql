
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
CREATE TABLE public.profiles (
  user_id UUID NOT NULL PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'PROFESSOR'
);

CREATE TABLE public.academic_years (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.teachers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL, email TEXT, phone TEXT, qualifications TEXT,
  status public.teacher_status DEFAULT 'Ativo',
  bi_number TEXT, nuit TEXT, photo_url TEXT, hire_date DATE,
  contract_number TEXT, contract_type TEXT DEFAULT 'Efectivo',
  contract_start DATE, contract_end DATE, salary NUMERIC,
  address TEXT, province TEXT, district TEXT, birth_date DATE, gender TEXT,
  emergency_contact TEXT, emergency_phone TEXT, bank_name TEXT, bank_account TEXT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(),
  payment_method TEXT DEFAULT 'bank', mobile_money_provider TEXT, mobile_money_number TEXT
);

CREATE TABLE public.classes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL, year INTEGER NOT NULL,
  teacher_id BIGINT REFERENCES public.teachers(id)
);

CREATE TABLE public.subjects (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL, code TEXT, workload INTEGER
);

CREATE TABLE public.students (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL, phone TEXT, guardian TEXT, age INTEGER,
  class_id BIGINT REFERENCES public.classes(id),
  status public.student_status DEFAULT 'Ativo',
  bi_number TEXT, nuit TEXT, birth_date DATE, gender public.gender_type,
  nationality TEXT DEFAULT 'Moçambicana', province TEXT, district TEXT,
  address TEXT, email TEXT, photo_url TEXT, health_notes TEXT, previous_school TEXT,
  enrollment_status public.enrollment_status DEFAULT 'PENDENTE',
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.guardians (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name TEXT NOT NULL, relationship TEXT NOT NULL, phone TEXT NOT NULL,
  bi_number TEXT, nuit TEXT, email TEXT, phone_alt TEXT,
  occupation TEXT, workplace TEXT, address TEXT, province TEXT, district TEXT,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.student_guardians (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES public.students(id),
  guardian_id BIGINT NOT NULL REFERENCES public.guardians(id),
  is_primary BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.employees (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL, role TEXT NOT NULL, email TEXT, phone TEXT,
  bi_number TEXT, nuit TEXT, photo_url TEXT, gender TEXT, birth_date DATE,
  hire_date DATE, salary NUMERIC, status TEXT DEFAULT 'Ativo',
  department TEXT, contract_type TEXT DEFAULT 'Efectivo',
  contract_number TEXT, contract_start DATE, contract_end DATE,
  address TEXT, province TEXT, district TEXT,
  emergency_contact TEXT, emergency_phone TEXT, bank_name TEXT, bank_account TEXT,
  payment_method TEXT DEFAULT 'bank', mobile_money_provider TEXT, mobile_money_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.financial_categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL, type public.transaction_type NOT NULL
);

CREATE TABLE public.transactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date DATE NOT NULL, description TEXT, type public.transaction_type NOT NULL,
  category_id BIGINT REFERENCES public.financial_categories(id), amount NUMERIC NOT NULL
);

CREATE TABLE public.tuition_fees (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES public.students(id),
  month TEXT NOT NULL, due_date DATE, amount NUMERIC,
  status public.tuition_status, paid_at TIMESTAMPTZ
);

CREATE TABLE public.enrollments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_name TEXT, date DATE, amount NUMERIC, discount NUMERIC,
  status public.payment_status
);

CREATE TABLE public.student_enrollments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES public.students(id),
  academic_year_id BIGINT NOT NULL REFERENCES public.academic_years(id),
  class_id BIGINT REFERENCES public.classes(id),
  enrollment_number TEXT, enrollment_date DATE DEFAULT CURRENT_DATE,
  status public.enrollment_status DEFAULT 'PENDENTE',
  monthly_fee NUMERIC DEFAULT 0, enrollment_fee NUMERIC DEFAULT 0,
  discount_percent NUMERIC DEFAULT 0, notes TEXT,
  approved_by UUID, approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.grades (
  student_id BIGINT NOT NULL REFERENCES public.students(id),
  subject_id BIGINT NOT NULL REFERENCES public.subjects(id),
  trimestre INTEGER, acs NUMERIC, acp NUMERIC, acf NUMERIC,
  media_trimestral NUMERIC, media_final NUMERIC,
  nota1 NUMERIC, nota2 NUMERIC, final_exam NUMERIC,
  academic_year_id BIGINT REFERENCES public.academic_years(id),
  class_id BIGINT REFERENCES public.classes(id),
  observation TEXT, recorded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (student_id, subject_id)
);

CREATE TABLE public.attendance (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES public.students(id),
  class_id BIGINT NOT NULL REFERENCES public.classes(id),
  subject_id BIGINT REFERENCES public.subjects(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE, status TEXT NOT NULL,
  observation TEXT, recorded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.scholarships (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL, type public.scholarship_type NOT NULL, value NUMERIC NOT NULL
);

CREATE TABLE public.student_scholarships (
  student_id BIGINT NOT NULL REFERENCES public.students(id),
  scholarship_id BIGINT NOT NULL REFERENCES public.scholarships(id),
  PRIMARY KEY (student_id, scholarship_id)
);

CREATE TABLE public.class_curriculum (
  class_id BIGINT NOT NULL REFERENCES public.classes(id),
  subject_id BIGINT NOT NULL REFERENCES public.subjects(id),
  teacher_id BIGINT NOT NULL REFERENCES public.teachers(id),
  PRIMARY KEY (class_id, subject_id)
);

CREATE TABLE public.announcements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL, content TEXT NOT NULL, type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'NORMAL',
  target_audience TEXT[] NOT NULL DEFAULT ARRAY['TODOS'],
  class_ids INTEGER[], is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ, expires_at DATE, created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.announcement_reads (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  announcement_id BIGINT NOT NULL REFERENCES public.announcements(id),
  user_id UUID NOT NULL, read_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.calendar_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL, description TEXT, date DATE NOT NULL,
  type public.calendar_event_type NOT NULL,
  start_time TIME, end_time TIME, is_all_day BOOLEAN DEFAULT true,
  location TEXT, color TEXT DEFAULT '#2D5F3F', recurrence TEXT,
  class_id BIGINT REFERENCES public.classes(id),
  subject_id BIGINT REFERENCES public.subjects(id),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.contract_signatures (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  staff_id BIGINT NOT NULL, staff_name TEXT NOT NULL, staff_type TEXT NOT NULL,
  contract_type TEXT NOT NULL, contract_number TEXT, contract_html TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  signature_data TEXT, signature_ip TEXT, signature_user_agent TEXT,
  signature_token UUID DEFAULT gen_random_uuid(),
  token_expires_at TIMESTAMPTZ, signed_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ, sent_via TEXT, sent_to TEXT, created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.student_documents (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES public.students(id),
  document_type public.document_type NOT NULL,
  document_name TEXT NOT NULL, file_url TEXT NOT NULL,
  file_size BIGINT, mime_type TEXT,
  is_verified BOOLEAN DEFAULT false, verified_by UUID, verified_at TIMESTAMPTZ,
  notes TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.staff_documents (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  staff_id BIGINT NOT NULL, staff_type TEXT NOT NULL,
  document_type TEXT NOT NULL, document_name TEXT NOT NULL, file_url TEXT NOT NULL,
  file_size BIGINT, mime_type TEXT,
  is_verified BOOLEAN DEFAULT false, verified_by UUID, verified_at TIMESTAMPTZ,
  expiry_date DATE, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.communication_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id BIGINT REFERENCES public.students(id),
  tuition_fee_id BIGINT REFERENCES public.tuition_fees(id),
  agreement_id BIGINT,
  communication_type public.communication_type NOT NULL,
  recipient_name TEXT NOT NULL, recipient_phone TEXT, recipient_email TEXT,
  message_content TEXT NOT NULL, message_template TEXT,
  status public.communication_status DEFAULT 'ENVIADO',
  sent_by UUID, sent_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ, read_at TIMESTAMPTZ, scheduled_at TIMESTAMPTZ,
  external_id TEXT, external_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.payment_agreements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES public.students(id),
  tuition_fee_id BIGINT NOT NULL REFERENCES public.tuition_fees(id),
  original_amount NUMERIC NOT NULL,
  discount_percent NUMERIC DEFAULT 0, discount_amount NUMERIC DEFAULT 0,
  agreed_amount NUMERIC NOT NULL, installments INTEGER DEFAULT 1,
  installment_amount NUMERIC, promised_date DATE, notes TEXT,
  status public.payment_agreement_status DEFAULT 'PENDENTE',
  created_by UUID, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.agreement_installments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  agreement_id BIGINT NOT NULL REFERENCES public.payment_agreements(id),
  installment_number INTEGER NOT NULL, amount NUMERIC NOT NULL,
  due_date DATE NOT NULL, paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ, payment_method TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.scheduled_reminders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES public.students(id),
  tuition_fee_id BIGINT REFERENCES public.tuition_fees(id),
  agreement_id BIGINT REFERENCES public.payment_agreements(id),
  reminder_type public.reminder_type NOT NULL,
  channel public.communication_type DEFAULT 'WHATSAPP',
  scheduled_for TIMESTAMPTZ NOT NULL, processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  communication_id BIGINT REFERENCES public.communication_history(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.exam_notifications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  calendar_event_id BIGINT NOT NULL REFERENCES public.calendar_events(id),
  recipient_user_id UUID, recipient_role public.app_role,
  recipient_class_id BIGINT REFERENCES public.classes(id),
  notification_type TEXT NOT NULL DEFAULT 'NEW_EXAM',
  message TEXT NOT NULL, is_read BOOLEAN DEFAULT false, read_at TIMESTAMPTZ,
  sent_via_whatsapp BOOLEAN DEFAULT false, whatsapp_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.integration_settings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  integration_name TEXT NOT NULL, api_key TEXT, api_url TEXT, instance_name TEXT,
  is_active BOOLEAN DEFAULT false, additional_config JSONB DEFAULT '{}'::jsonb,
  last_tested_at TIMESTAMPTZ, last_test_success BOOLEAN,
  created_by UUID, updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.lesson_plan_config (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  config_key TEXT NOT NULL, config_value TEXT NOT NULL, description TEXT,
  updated_by UUID, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.lesson_plan_fields (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  field_name TEXT NOT NULL, field_label TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'select',
  options TEXT[] DEFAULT '{}'::text[],
  is_required BOOLEAN DEFAULT true, is_active BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.lesson_plan_training_docs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  file_name TEXT NOT NULL, file_path TEXT NOT NULL,
  file_size BIGINT, mime_type TEXT, description TEXT,
  is_active BOOLEAN DEFAULT true, uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.lesson_plans (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  teacher_id UUID NOT NULL, teacher_name TEXT,
  title TEXT NOT NULL, generated_content TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'rascunho',
  class_id BIGINT REFERENCES public.classes(id),
  subject_id BIGINT REFERENCES public.subjects(id),
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.registration_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  email TEXT, intended_role public.app_role NOT NULL DEFAULT 'PROFESSOR',
  intended_name TEXT, notes TEXT,
  is_used BOOLEAN NOT NULL DEFAULT false, used_by UUID, used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.tickets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_number TEXT, title TEXT NOT NULL, description TEXT NOT NULL,
  category public.ticket_category NOT NULL DEFAULT 'OUTRO',
  priority public.ticket_priority NOT NULL DEFAULT 'NORMAL',
  status public.ticket_status NOT NULL DEFAULT 'ABERTO',
  created_by UUID, created_by_name TEXT NOT NULL, created_by_role TEXT,
  assigned_to UUID, assigned_to_name TEXT, assigned_department TEXT,
  resolved_at TIMESTAMPTZ, resolved_by UUID, closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ticket_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES public.tickets(id),
  sender_id UUID, sender_name TEXT NOT NULL, sender_role TEXT,
  message TEXT NOT NULL, is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ticket_notifications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES public.tickets(id),
  user_id TEXT NOT NULL, message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false, recipient_role TEXT, recipient_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.teacher_files (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  teacher_user_id UUID NOT NULL, teacher_name TEXT NOT NULL,
  file_name TEXT NOT NULL, file_path TEXT NOT NULL,
  file_size BIGINT, mime_type TEXT,
  category TEXT NOT NULL DEFAULT 'Outro', description TEXT,
  class_id BIGINT REFERENCES public.classes(id),
  subject_id BIGINT REFERENCES public.subjects(id),
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===================== VIEWS =====================
CREATE OR REPLACE VIEW public.student_attendance_stats AS
SELECT s.id AS student_id, s.name AS student_name, c.id AS class_id, c.name AS class_name,
  count(*) FILTER (WHERE a.status = 'PRESENTE') AS presencas,
  count(*) FILTER (WHERE a.status = 'FALTA') AS faltas,
  count(*) FILTER (WHERE a.status = 'FALTA_JUSTIFICADA') AS faltas_justificadas,
  count(*) FILTER (WHERE a.status = 'ATRASO') AS atrasos,
  count(*) AS total_dias,
  round((count(*) FILTER (WHERE a.status = 'PRESENTE'))::numeric / NULLIF(count(*), 0)::numeric * 100, 2) AS taxa_presenca
FROM students s LEFT JOIN classes c ON s.class_id = c.id LEFT JOIN attendance a ON s.id = a.student_id
GROUP BY s.id, s.name, c.id, c.name;

CREATE OR REPLACE VIEW public.employees_public_info AS
SELECT id, name, email, phone, role, department, status, photo_url, gender, hire_date, contract_type, province, district, created_at, updated_at FROM employees;

CREATE OR REPLACE VIEW public.contract_signatures_signing AS
SELECT id, staff_name, contract_type, contract_html, status, signature_token, token_expires_at
FROM contract_signatures WHERE signature_token IS NOT NULL AND status = ANY (ARRAY['pending', 'sent'])
  AND (token_expires_at IS NULL OR token_expires_at > now());

-- ===================== FUNCTIONS =====================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

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
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id 
    AND role IN ('ADMIN', 'DIRETORIA', 'SECRETARIA', 'FINANCEIRO', 'PROFESSOR', 'PEDAGOGICO'));
$$;

CREATE OR REPLACE FUNCTION public.calculate_trimester_average(_acs numeric, _acp numeric, _acf numeric)
RETURNS numeric LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT ROUND(COALESCE(_acs, 0) * 0.30 + COALESCE(_acp, 0) * 0.30 + COALESCE(_acf, 0) * 0.40, 2);
$$;

CREATE OR REPLACE FUNCTION public.calculate_final_average(_t1 numeric, _t2 numeric, _t3 numeric)
RETURNS numeric LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT ROUND((COALESCE(_t1, 0) + COALESCE(_t2, 0) + COALESCE(_t3, 0)) / 
    NULLIF(CASE WHEN _t1 IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN _t2 IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN _t3 IS NOT NULL THEN 1 ELSE 0 END, 0), 2);
$$;

CREATE OR REPLACE FUNCTION public.classify_grade(_grade numeric)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT CASE WHEN _grade >= 18 THEN 'Excelente' WHEN _grade >= 14 THEN 'Bom'
    WHEN _grade >= 10 THEN 'Suficiente' WHEN _grade >= 5 THEN 'Insuficiente' ELSE 'Mau' END;
$$;

CREATE OR REPLACE FUNCTION public.generate_enrollment_number()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE year_suffix TEXT; next_number INT;
BEGIN
  SELECT EXTRACT(YEAR FROM CURRENT_DATE)::TEXT INTO year_suffix;
  SELECT COALESCE(MAX(NULLIF(REGEXP_REPLACE(enrollment_number, '[^0-9]', '', 'g'), '')::INT), 0) + 1
  INTO next_number FROM public.student_enrollments WHERE enrollment_number LIKE 'MAT-' || year_suffix || '-%';
  NEW.enrollment_number := 'MAT-' || year_suffix || '-' || LPAD(next_number::TEXT, 5, '0');
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE year_suffix TEXT; next_number INT;
BEGIN
  SELECT EXTRACT(YEAR FROM CURRENT_DATE)::TEXT INTO year_suffix;
  SELECT COALESCE(MAX(NULLIF(REGEXP_REPLACE(ticket_number, '[^0-9]', '', 'g'), '')::INT), 0) + 1
  INTO next_number FROM public.tickets WHERE ticket_number LIKE 'TKT-' || year_suffix || '-%';
  NEW.ticket_number := 'TKT-' || year_suffix || '-' || LPAD(next_number::TEXT, 5, '0');
  RETURN NEW;
END; $$;

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
END; $$;

CREATE OR REPLACE FUNCTION public.get_contract_for_signing(_token uuid)
RETURNS TABLE(id bigint, staff_name text, contract_type text, contract_html text, status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT cs.id, cs.staff_name, cs.contract_type, cs.contract_html, cs.status
  FROM public.contract_signatures cs WHERE cs.signature_token = _token AND cs.status IN ('pending', 'sent')
    AND (cs.token_expires_at IS NULL OR cs.token_expires_at > now()) LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.notify_exam_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE class_name_var text; subject_name_var text;
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
END; $$;

CREATE OR REPLACE FUNCTION public.notify_ticket_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE ticket_record RECORD; notification_message text;
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
END; $$;

-- ===================== TRIGGERS =====================
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guardians_updated_at BEFORE UPDATE ON public.guardians FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_enrollments_updated_at BEFORE UPDATE ON public.student_enrollments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contract_signatures_updated_at BEFORE UPDATE ON public.contract_signatures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER generate_enrollment_number_trigger BEFORE INSERT ON public.student_enrollments FOR EACH ROW WHEN (NEW.enrollment_number IS NULL) EXECUTE FUNCTION public.generate_enrollment_number();
CREATE TRIGGER generate_ticket_number_trigger BEFORE INSERT ON public.tickets FOR EACH ROW WHEN (NEW.ticket_number IS NULL) EXECUTE FUNCTION public.generate_ticket_number();
CREATE TRIGGER notify_exam_created_trigger AFTER INSERT ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.notify_exam_created();
CREATE TRIGGER notify_ticket_message_trigger AFTER INSERT ON public.ticket_messages FOR EACH ROW EXECUTE FUNCTION public.notify_ticket_message();

-- ===================== RLS =====================
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
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage academic_years" ON public.academic_years FOR ALL USING (has_role(auth.uid(), 'DIRETORIA') OR has_role(auth.uid(), 'SECRETARIA'));
CREATE POLICY "Admin can manage teachers" ON public.teachers FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA']::app_role[]));
CREATE POLICY "Staff can view teachers" ON public.teachers FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Admin can manage classes" ON public.classes FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA']::app_role[]));
CREATE POLICY "Staff can view classes" ON public.classes FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Admin can manage subjects" ON public.subjects FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA','PEDAGOGICO']::app_role[]));
CREATE POLICY "Staff can view subjects" ON public.subjects FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Staff can manage students" ON public.students FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA']::app_role[]));
CREATE POLICY "Staff can view students" ON public.students FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Staff can manage guardians" ON public.guardians FOR ALL USING (has_role(auth.uid(), 'DIRETORIA') OR has_role(auth.uid(), 'SECRETARIA'));
CREATE POLICY "Staff can view guardians" ON public.guardians FOR SELECT USING (has_role(auth.uid(), 'DIRETORIA') OR has_role(auth.uid(), 'SECRETARIA'));
CREATE POLICY "Staff can manage student_guardians" ON public.student_guardians FOR ALL USING (has_role(auth.uid(), 'DIRETORIA') OR has_role(auth.uid(), 'SECRETARIA'));
CREATE POLICY "Staff can view student_guardians" ON public.student_guardians FOR SELECT USING (has_role(auth.uid(), 'DIRETORIA') OR has_role(auth.uid(), 'SECRETARIA'));
CREATE POLICY "Admin can manage employees" ON public.employees FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA']::app_role[]));
CREATE POLICY "Finance and management can view employees" ON public.employees FOR SELECT USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO']::app_role[]));
CREATE POLICY "Finance can manage categories" ON public.financial_categories FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO']::app_role[]));
CREATE POLICY "Finance can view categories" ON public.financial_categories FOR SELECT USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO']::app_role[]));
CREATE POLICY "Finance can manage transactions" ON public.transactions FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO']::app_role[]));
CREATE POLICY "Finance can view transactions" ON public.transactions FOR SELECT USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO']::app_role[]));
CREATE POLICY "Finance can manage tuition_fees" ON public.tuition_fees FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[]));
CREATE POLICY "Finance can view tuition_fees" ON public.tuition_fees FOR SELECT USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[]));
CREATE POLICY "Admin can manage enrollments" ON public.enrollments FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA']::app_role[]));
CREATE POLICY "Staff can view enrollments" ON public.enrollments FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Staff can manage student_enrollments" ON public.student_enrollments FOR ALL USING (has_role(auth.uid(), 'DIRETORIA') OR has_role(auth.uid(), 'SECRETARIA'));
CREATE POLICY "Staff can view student_enrollments" ON public.student_enrollments FOR SELECT USING (has_role(auth.uid(), 'DIRETORIA') OR has_role(auth.uid(), 'SECRETARIA') OR has_role(auth.uid(), 'FINANCEIRO'));
CREATE POLICY "Teachers can manage grades" ON public.grades FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','PROFESSOR','PEDAGOGICO']::app_role[]));
CREATE POLICY "Staff can view grades" ON public.grades FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Teachers can manage attendance" ON public.attendance FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','PROFESSOR','PEDAGOGICO']::app_role[]));
CREATE POLICY "Staff can view attendance" ON public.attendance FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Admin can manage scholarships" ON public.scholarships FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO']::app_role[]));
CREATE POLICY "Staff can view scholarships" ON public.scholarships FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Admin can manage student_scholarships" ON public.student_scholarships FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[]));
CREATE POLICY "Staff can view student_scholarships" ON public.student_scholarships FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Admin can manage curriculum" ON public.class_curriculum FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA','PEDAGOGICO']::app_role[]));
CREATE POLICY "Staff can view curriculum" ON public.class_curriculum FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Admin can manage announcements" ON public.announcements FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA','PEDAGOGICO']::app_role[]));
CREATE POLICY "Staff can view announcements" ON public.announcements FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Users can read own announcement_reads" ON public.announcement_reads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own announcement_reads" ON public.announcement_reads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can manage calendar" ON public.calendar_events FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA','PEDAGOGICO']::app_role[]));
CREATE POLICY "Staff can view calendar" ON public.calendar_events FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Students can view exams" ON public.calendar_events FOR SELECT USING (type = 'Prova' AND has_role(auth.uid(), 'ALUNO'));
CREATE POLICY "Admin can manage contract_signatures" ON public.contract_signatures FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA']::app_role[]));
CREATE POLICY "Public can read contract by token" ON public.contract_signatures FOR SELECT USING (false);
CREATE POLICY "Public can sign with valid token" ON public.contract_signatures FOR UPDATE 
  USING (signature_token IS NOT NULL AND status = ANY (ARRAY['pending', 'sent']) AND (token_expires_at IS NULL OR token_expires_at > now()))
  WITH CHECK (signature_token IS NOT NULL AND status = ANY (ARRAY['pending', 'sent']) AND (token_expires_at IS NULL OR token_expires_at > now()));
CREATE POLICY "Staff can manage student_documents" ON public.student_documents FOR ALL USING (has_role(auth.uid(), 'DIRETORIA') OR has_role(auth.uid(), 'SECRETARIA'));
CREATE POLICY "Staff can view student_documents" ON public.student_documents FOR SELECT USING (has_role(auth.uid(), 'DIRETORIA') OR has_role(auth.uid(), 'SECRETARIA'));
CREATE POLICY "Admin can manage staff_documents" ON public.staff_documents FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA']::app_role[]));
CREATE POLICY "Staff can view staff_documents" ON public.staff_documents FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Finance can manage communications" ON public.communication_history FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[]));
CREATE POLICY "Finance can view communications" ON public.communication_history FOR SELECT USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[]));
CREATE POLICY "Finance can manage agreements" ON public.payment_agreements FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[]));
CREATE POLICY "Finance can view agreements" ON public.payment_agreements FOR SELECT USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[]));
CREATE POLICY "Finance can manage installments" ON public.agreement_installments FOR ALL USING (
  EXISTS (SELECT 1 FROM payment_agreements pa WHERE pa.id = agreement_installments.agreement_id 
    AND has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[])));
CREATE POLICY "Finance can view installments" ON public.agreement_installments FOR SELECT USING (
  EXISTS (SELECT 1 FROM payment_agreements pa WHERE pa.id = agreement_installments.agreement_id 
    AND has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[])));
CREATE POLICY "Finance can manage reminders" ON public.scheduled_reminders FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[]));
CREATE POLICY "Finance can view reminders" ON public.scheduled_reminders FOR SELECT USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','FINANCEIRO','SECRETARIA']::app_role[]));
CREATE POLICY "Staff can manage exam_notifications" ON public.exam_notifications FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','PROFESSOR','PEDAGOGICO']::app_role[]));
CREATE POLICY "Users can view own exam_notifications" ON public.exam_notifications FOR SELECT USING (
  recipient_user_id = auth.uid() OR recipient_role IN (SELECT role FROM user_roles WHERE user_id = auth.uid()));
CREATE POLICY "Admin can manage integration_settings" ON public.integration_settings FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA']::app_role[]));
CREATE POLICY "Admin can manage lesson_plan_config" ON public.lesson_plan_config FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA']::app_role[]));
CREATE POLICY "Staff can view lesson_plan_config" ON public.lesson_plan_config FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Admin can manage lesson_plan_fields" ON public.lesson_plan_fields FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA']::app_role[]));
CREATE POLICY "Staff can view lesson_plan_fields" ON public.lesson_plan_fields FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Admin can manage training docs" ON public.lesson_plan_training_docs FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA']::app_role[]));
CREATE POLICY "Staff can view training docs" ON public.lesson_plan_training_docs FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Teachers can manage own lesson_plans" ON public.lesson_plans FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Admin can view all lesson_plans" ON public.lesson_plans FOR SELECT USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','PEDAGOGICO']::app_role[]));
CREATE POLICY "Staff can manage invitations" ON public.registration_invitations FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','SECRETARIA']::app_role[]));
CREATE POLICY "Users can create tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own tickets" ON public.tickets FOR SELECT USING (created_by = auth.uid() OR is_staff(auth.uid()));
CREATE POLICY "Staff can manage tickets" ON public.tickets FOR ALL USING (is_staff(auth.uid()));
CREATE POLICY "Users can view ticket messages" ON public.ticket_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_messages.ticket_id AND (t.created_by = auth.uid() OR is_staff(auth.uid()))));
CREATE POLICY "Users can send ticket messages" ON public.ticket_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own ticket notifications" ON public.ticket_notifications FOR SELECT USING (user_id = auth.uid()::text OR is_staff(auth.uid()));
CREATE POLICY "Staff can manage ticket notifications" ON public.ticket_notifications FOR ALL USING (is_staff(auth.uid()));
CREATE POLICY "Teachers can manage own files" ON public.teacher_files FOR ALL USING (auth.uid() = teacher_user_id);
CREATE POLICY "Admin can view all teacher files" ON public.teacher_files FOR SELECT USING (has_any_role(auth.uid(), ARRAY['ADMIN','DIRETORIA','PEDAGOGICO']::app_role[]));

-- ===================== STORAGE =====================
INSERT INTO storage.buckets (id, name, public) VALUES ('student-documents', 'student-documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('staff-files', 'staff-files', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('aep-training-docs', 'aep-training-docs', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('teacher-files', 'teacher-files', false);

-- ===================== SEED DATA =====================
INSERT INTO public.academic_years OVERRIDING SYSTEM VALUE VALUES
(1, '2025', '2025-02-01', '2025-12-15', false, '2026-01-24 20:35:18.591596+00'),
(2, '2026', '2026-02-01', '2026-12-15', true, '2026-01-25 03:40:31.830676+00');
SELECT setval(pg_get_serial_sequence('academic_years', 'id'), (SELECT MAX(id) FROM academic_years));

INSERT INTO public.teachers (id, name, email, phone, qualifications, status, contract_type, payment_method, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES
(1, 'Carlos Neto', 'carlos.neto@reviva.com', '84 111 2222', 'Licenciatura em Pedagogia', 'Ativo', 'Efectivo', 'bank', '2026-01-24 22:22:21+00', '2026-01-24 22:22:21+00'),
(2, 'Fernanda Alves', 'fernanda.alves@reviva.com', '82 333 4444', 'Mestrado em Matemática', 'Ativo', 'Efectivo', 'bank', '2026-01-24 22:22:21+00', '2026-01-24 22:22:21+00'),
(3, 'Mariana Lima', 'mariana.lima@reviva.com', '86 555 6666', 'Licenciatura em Letras', 'Ativo', 'Efectivo', 'bank', '2026-01-24 22:22:21+00', '2026-01-24 22:22:21+00'),
(4, 'Ricardo Sousa', 'ricardo.sousa@reviva.com', '87 888 9999', 'Doutoramento em Ciências', 'Inativo', 'Efectivo', 'bank', '2026-01-24 22:22:21+00', '2026-01-24 22:22:21+00'),
(9, 'Raquel Cossa', 'professor449@escola.co.mz', '+258 85 202 3325', 'Licenciatura em Ensino de Português', 'Ativo', 'Efectivo', 'bank', '2026-01-25 01:09:01+00', '2026-01-25 01:09:01+00'),
(10, 'Maria Manjate', 'professor341@escola.co.mz', '+258 87 337 4663', 'Licenciatura em Pedagogia', 'Ativo', 'Efectivo', 'bank', '2026-01-25 01:09:01+00', '2026-01-25 01:09:01+00'),
(11, 'José Massinga', 'professor542@escola.co.mz', '+258 86 150 9739', 'Mestrado em Educação', 'Ativo', 'Efectivo', 'bank', '2026-01-25 01:09:01+00', '2026-01-25 01:09:01+00'),
(12, 'Helena Tembe', 'professor408@escola.co.mz', '+258 87 178 3254', 'Mestrado em Educação', 'Ativo', 'Efectivo', 'bank', '2026-01-25 01:09:01+00', '2026-01-25 01:09:01+00'),
(13, 'Maria Fernanda Lopes', 'mflopes@escola.co.mz', '+258 84 521 3847', 'Mestrado em Letras', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31+00', '2026-01-25 03:40:31+00'),
(14, 'João Pedro Machava', 'jpmachava@escola.co.mz', '+258 87 632 9154', 'Licenciatura em Matemática', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31+00', '2026-01-25 03:40:31+00'),
(15, 'Ana Cristina Sitoe', 'acsitoe@escola.co.mz', '+258 82 743 6281', 'Licenciatura em Biologia', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31+00', '2026-01-25 03:40:31+00'),
(16, 'Roberto Carlos Tembe', 'rctembe@escola.co.mz', '+258 86 854 7392', 'Doutoramento em Física', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31+00', '2026-01-25 03:40:31+00'),
(17, 'Esperança Mondlane', 'emondlane@escola.co.mz', '+258 85 965 8413', 'Licenciatura em História', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31+00', '2026-01-25 03:40:31+00'),
(18, 'Francisco Cossa', 'fcossa@escola.co.mz', '+258 84 176 9524', 'Mestrado em Geografia', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31+00', '2026-01-25 03:40:31+00'),
(19, 'Graça Helena Langa', 'ghlanga@escola.co.mz', '+258 87 287 0635', 'Licenciatura em Educação Física', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31+00', '2026-01-25 03:40:31+00'),
(20, 'Manuel António Mutemba', 'mamutemba@escola.co.mz', '+258 82 398 1746', 'Licenciatura em Artes Visuais', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31+00', '2026-01-25 03:40:31+00'),
(21, 'Teresa Beatriz Nguenha', 'tbnguenha@escola.co.mz', '+258 86 409 2857', 'Mestrado em Química', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31+00', '2026-01-25 03:40:31+00'),
(22, 'Carlos Alberto Chissano', 'cachissano@escola.co.mz', '+258 85 510 3968', 'Licenciatura em Filosofia', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31+00', '2026-01-25 03:40:31+00'),
(23, 'Rosa Maria Bila', 'rmbila@escola.co.mz', '+258 84 621 4079', 'Licenciatura em Inglês', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31+00', '2026-01-25 03:40:31+00'),
(24, 'Fernando José Guebuza', 'fjguebuza@escola.co.mz', '+258 87 732 5180', 'Mestrado em Educação Moral', 'Ativo', 'Efectivo', 'bank', '2026-01-25 03:40:31+00', '2026-01-25 03:40:31+00');
SELECT setval(pg_get_serial_sequence('teachers', 'id'), (SELECT MAX(id) FROM teachers));

INSERT INTO public.classes OVERRIDING SYSTEM VALUE VALUES
(1, '5ª Classe A', 2024, 1),(2, '7ª Classe B', 2024, 4),(3, '3ª Classe Única', 2024, 3),
(4, '8ª A', 8, NULL),(5, '8ª B', 8, NULL),(6, '9ª A', 9, NULL),(7, '9ª B', 9, NULL),
(8, '10ª A', 10, NULL),(9, '10ª B', 10, NULL),(10, '11ª A', 11, NULL),(11, '12ª A', 12, NULL),
(12, '8ª Classe A', 2026, 3),(13, '8ª Classe B', 2026, 20),(14, '9ª Classe A', 2026, 17),
(15, '9ª Classe B', 2026, 1),(16, '10ª Classe A', 2026, 23),(17, '10ª Classe B', 2026, 24),
(18, '11ª Classe A', 2026, 13),(19, '12ª Classe A', 2026, 16);
SELECT setval(pg_get_serial_sequence('classes', 'id'), (SELECT MAX(id) FROM classes));

INSERT INTO public.subjects OVERRIDING SYSTEM VALUE VALUES
(1, 'Matemática', 'MAT01', 80),(2, 'Língua Portuguesa', 'LP01', 100),(3, 'Ciências Naturais', 'CN01', 60),
(4, 'História', 'HIS01', 50),(5, 'Geografia', 'GEO01', 50),(6, 'Educação Física', 'EDF001', 60),
(7, 'Inglês', 'ING001', 80),(8, 'Educação Visual', 'EDV001', 60),(9, 'Matemática', 'MAT001', 120),
(10, 'Português', 'POR001', 100),(11, 'História', 'HIS001', 80),(12, 'Geografia', 'GEO001', 80),
(13, 'Ciências Naturais', 'CIE001', 100),(14, 'Português', 'PORT', 6),(15, 'Matemática', 'MAT', 6),
(16, 'Inglês', 'ING', 4),(17, 'Ciências Naturais', 'CN', 4),(18, 'História', 'HIST', 3),
(19, 'Geografia', 'GEO', 3),(20, 'Educação Física', 'EF', 2),(21, 'Educação Visual', 'EV', 2),
(22, 'Física', 'FIS', 4),(23, 'Química', 'QUIM', 4),(24, 'Biologia', 'BIO', 4),
(25, 'Filosofia', 'FIL', 2),(26, 'Educação Moral', 'EM', 2);
SELECT setval(pg_get_serial_sequence('subjects', 'id'), (SELECT MAX(id) FROM subjects));

INSERT INTO public.students (id, name, phone, guardian, age, class_id, status, gender, nationality, province, district, enrollment_status) OVERRIDING SYSTEM VALUE VALUES
(1, 'Ana Silva', '84 123 4567', 'João Silva', 10, 1, 'Ativo', NULL, 'Moçambicana', NULL, NULL, 'PENDENTE'),
(2, 'Bruno Costa', '82 987 6543', 'Maria Costa', 12, 2, 'Ativo', NULL, 'Moçambicana', NULL, NULL, 'PENDENTE'),
(4, 'David Martins', '84 111 2233', 'Sofia Martins', 10, 1, 'Ativo', NULL, 'Moçambicana', NULL, NULL, 'PENDENTE'),
(5, 'Elisa Ferreira', '82 444 5566', 'Rui Ferreira', 11, 2, 'Ativo', NULL, 'Moçambicana', NULL, NULL, 'PENDENTE'),
(6, 'Fábio Gomes', '87 777 8899', 'Cátia Gomes', 7, 3, 'Ativo', NULL, 'Moçambicana', NULL, NULL, 'PENDENTE'),
(7, 'Aluno Teste Final', '84 888 7777', 'Responsável Final', 9, 1, 'Ativo', NULL, 'Moçambicana', NULL, NULL, 'PENDENTE'),
(8, 'João Carlos Machava', NULL, NULL, 15, 1, 'Ativo', 'MASCULINO', 'Moçambicana', 'Maputo Cidade', 'KaMpfumo', 'PENDENTE'),
(9, 'Maria Helena Sitoe', NULL, NULL, 14, 1, 'Ativo', 'FEMININO', 'Moçambicana', 'Maputo', 'Matola', 'PENDENTE'),
(10, 'Pedro António Cossa', NULL, NULL, 16, 2, 'Ativo', 'MASCULINO', 'Moçambicana', 'Gaza', 'Xai-Xai', 'PENDENTE'),
(11, 'Ana Beatriz Langa', NULL, NULL, 15, 2, 'Ativo', 'FEMININO', 'Moçambicana', 'Inhambane', 'Maxixe', 'PENDENTE'),
(12, 'Carlos Manuel Tembe', NULL, NULL, 17, 3, 'Ativo', 'MASCULINO', 'Moçambicana', 'Sofala', 'Beira', 'PENDENTE'),
(13, 'Teresa Isabel Mutemba', NULL, NULL, 16, 3, 'Ativo', 'FEMININO', 'Moçambicana', 'Manica', 'Chimoio', 'PENDENTE'),
(14, 'Alberto José Mondlane', NULL, NULL, 14, 1, 'Ativo', 'MASCULINO', 'Moçambicana', 'Tete', 'Tete', 'PENDENTE'),
(15, 'Helena Maria Nguenha', NULL, NULL, 13, 2, 'Ativo', 'FEMININO', 'Moçambicana', 'Zambézia', 'Quelimane', 'PENDENTE'),
(16, 'Fernando Carlos Chissano', NULL, NULL, 15, 3, 'Ativo', 'MASCULINO', 'Moçambicana', 'Nampula', 'Nampula', 'PENDENTE'),
(17, 'Esperança Rosa Langa', NULL, NULL, 16, 1, 'Ativo', 'FEMININO', 'Moçambicana', 'Cabo Delgado', 'Pemba', 'PENDENTE'),
(18, 'José Manuel Guebuza', NULL, NULL, 14, 2, 'Ativo', 'MASCULINO', 'Moçambicana', 'Niassa', 'Lichinga', 'PENDENTE'),
(19, 'Graça Helena Bila', NULL, NULL, 15, 3, 'Ativo', 'FEMININO', 'Moçambicana', 'Maputo Cidade', 'KaMubukwana', 'PENDENTE'),
(20, 'Roberto Carlos Machava', NULL, NULL, 13, 1, 'Ativo', 'MASCULINO', 'Moçambicana', 'Maputo', 'Boane', 'PENDENTE'),
(21, 'Rosa Maria Tembe', NULL, NULL, 14, 2, 'Ativo', 'FEMININO', 'Moçambicana', 'Gaza', 'Chokwé', 'PENDENTE'),
(22, 'Manuel António Sitoe', NULL, NULL, 16, 3, 'Ativo', 'MASCULINO', 'Moçambicana', 'Inhambane', 'Inhambane', 'PENDENTE'),
(23, 'Amélia Fernanda Machava', NULL, NULL, 14, 12, 'Ativo', 'FEMININO', 'Moçambicana', 'Maputo Cidade', 'KaMpfumo', 'PENDENTE'),
(24, 'Bernardo Rafael Sitoe', NULL, NULL, 13, 12, 'Ativo', 'MASCULINO', 'Moçambicana', 'Maputo', 'Matola', 'PENDENTE'),
(25, 'Carolina Isabel Tembe', NULL, NULL, 14, 13, 'Ativo', 'FEMININO', 'Moçambicana', 'Gaza', 'Xai-Xai', 'PENDENTE'),
(26, 'Daniel José Langa', NULL, NULL, 13, 13, 'Ativo', 'MASCULINO', 'Moçambicana', 'Inhambane', 'Maxixe', 'PENDENTE'),
(27, 'Eva Maria Mondlane', NULL, NULL, 15, 14, 'Ativo', 'FEMININO', 'Moçambicana', 'Sofala', 'Beira', 'PENDENTE'),
(28, 'Francisco Carlos Cossa', NULL, NULL, 14, 14, 'Ativo', 'MASCULINO', 'Moçambicana', 'Manica', 'Chimoio', 'PENDENTE'),
(29, 'Graça Helena Nguenha', NULL, NULL, 15, 15, 'Ativo', 'FEMININO', 'Moçambicana', 'Tete', 'Tete', 'PENDENTE'),
(30, 'Hélio Manuel Chissano', NULL, NULL, 14, 15, 'Ativo', 'MASCULINO', 'Moçambicana', 'Zambézia', 'Quelimane', 'PENDENTE'),
(31, 'Inês Catarina Guebuza', NULL, NULL, 16, 16, 'Ativo', 'FEMININO', 'Moçambicana', 'Nampula', 'Nampula', 'PENDENTE'),
(32, 'João Pedro Bila', NULL, NULL, 15, 16, 'Ativo', 'MASCULINO', 'Moçambicana', 'Cabo Delgado', 'Pemba', 'PENDENTE'),
(33, 'Kátia Rosa Machava', NULL, NULL, 16, 17, 'Ativo', 'FEMININO', 'Moçambicana', 'Niassa', 'Lichinga', 'PENDENTE'),
(34, 'Luís Fernando Tembe', NULL, NULL, 15, 17, 'Ativo', 'MASCULINO', 'Moçambicana', 'Maputo Cidade', 'KaMubukwana', 'PENDENTE'),
(35, 'Maria Esperança Sitoe', NULL, NULL, 17, 18, 'Ativo', 'FEMININO', 'Moçambicana', 'Maputo', 'Boane', 'PENDENTE'),
(36, 'Nelson José Mondlane', NULL, NULL, 16, 18, 'Ativo', 'MASCULINO', 'Moçambicana', 'Gaza', 'Chokwé', 'PENDENTE'),
(37, 'Olga Maria Langa', NULL, NULL, 18, 19, 'Ativo', 'FEMININO', 'Moçambicana', 'Inhambane', 'Inhambane', 'PENDENTE'),
(38, 'Paulo António Cossa', NULL, NULL, 17, 19, 'Ativo', 'MASCULINO', 'Moçambicana', 'Sofala', 'Beira', 'PENDENTE'),
(39, 'Rita Helena Mutemba', NULL, NULL, 14, 12, 'Ativo', 'FEMININO', 'Moçambicana', 'Manica', 'Chimoio', 'PENDENTE'),
(40, 'Samuel Carlos Nguenha', NULL, NULL, 15, 14, 'Ativo', 'MASCULINO', 'Moçambicana', 'Tete', 'Tete', 'PENDENTE'),
(41, 'Teresa Rosa Chissano', NULL, NULL, 16, 16, 'Ativo', 'FEMININO', 'Moçambicana', 'Zambézia', 'Quelimane', 'PENDENTE');
SELECT setval(pg_get_serial_sequence('students', 'id'), (SELECT MAX(id) FROM students));

INSERT INTO public.guardians (id, full_name, relationship, phone, bi_number, nuit, occupation, province, phone_alt, email, address, workplace, is_primary) OVERRIDING SYSTEM VALUE VALUES
(1, 'Joana Ana Machava', 'Tio', '+258 84 955 3229', '03870 417390 3', '051963054', 'Motorista', 'Maputo Cidade', NULL, NULL, NULL, NULL, true),
(2, 'Ana Isabel Magaia', 'Avô', '+258 87 230 6499', '24944 556822 3', '895820116', 'Professor', 'Manica', '+258 85 973 9375', NULL, NULL, NULL, true),
(3, 'Inês Isabel Machava', 'Pai', '+258 85 709 3288', '30880 679070 8', '678052758', 'Agricultor', 'Maputo Cidade', NULL, NULL, NULL, NULL, true),
(4, 'Francisco Fernando Mondlane', 'Tio', '+258 86 799 0628', '98560 156484 6', '861913889', 'Médico', 'Manica', '+258 85 887 9555', NULL, NULL, NULL, true),
(5, 'Helena Catarina Manjate', 'Pai', '+258 84 340 8983', '55014 147621 0', '550871479', 'Empresário', 'Inhambane', '+258 86 466 0559', NULL, NULL, NULL, true),
(6, 'Beatriz Maria Mutemba', 'Pai', '+258 85 171 3241', '34232 070432 6', '506334005', 'Médico', 'Zambézia', NULL, NULL, NULL, NULL, true),
(7, 'António Machava', 'Pai', '+258861234567', 'AAA111222333', '111222333', 'Engenheiro', 'Maputo', '+258871234567', 'antonio.machava@email.mz', 'Av. 24 de Julho, 123', 'EDM', true),
(8, 'Lurdes Tembe', 'Mãe', '+258862345678', 'BBB222333444', '222333444', 'Enfermeira', 'Maputo', NULL, 'lurdes.tembe@email.mz', 'Rua do Bagamoyo, 456', 'Hospital Central', true),
(9, 'Fernando Sitoe', 'Pai', '+258863456789', 'CCC333444555', '333444555', 'Professor', 'Gaza', '+258873456789', 'fernando.sitoe@email.mz', 'Av. Eduardo Mondlane, 789', 'UEM', true),
(10, 'Graça Cossa', 'Mãe', '+258864567890', 'DDD444555666', '444555666', 'Médica', 'Maputo', NULL, 'graca.cossa@email.mz', 'Rua da Mesquita, 101', 'Clínica Privada', true),
(11, 'Manuel Langa', 'Avô', '+258865678901', 'EEE555666777', '555666777', 'Reformado', 'Inhambane', '+258875678901', 'manuel.langa@email.mz', 'Av. Acordos de Lusaka, 202', NULL, true),
(12, 'Rosa Mondlane', 'Mãe', '+258866789012', 'FFF666777888', '666777888', 'Comerciante', 'Maputo', NULL, 'rosa.mondlane@email.mz', 'Rua 3 de Fevereiro, 303', 'Mercado Central', true),
(13, 'José Chissano', 'Pai', '+258867890123', 'GGG777888999', '777888999', 'Advogado', 'Sofala', '+258877890123', 'jose.chissano@email.mz', 'Av. Julius Nyerere, 404', 'Escritório Próprio', true),
(14, 'Maria Guebuza', 'Mãe', '+258868901234', 'HHH888999000', '888999000', 'Empresária', 'Nampula', NULL, 'maria.guebuza@email.mz', 'Rua da Zambézia, 505', 'Empresa Própria', true),
(15, 'Alberto Nguenha', 'Pai', '+258869012345', 'III999000111', '999000111', 'Funcionário Público', 'Tete', '+258879012345', 'alberto.nguenha@email.mz', 'Av. Samora Machel, 606', 'Ministério', true),
(16, 'Esperança Bila', 'Mãe', '+258860123456', 'JJJ000111222', '000111222', 'Professora', 'Zambézia', NULL, 'esperanca.bila@email.mz', 'Rua 25 de Setembro, 707', 'Escola Primária', true),
(17, 'Carlos Mutemba', 'Pai', '+258861234560', 'KKK111222333', '111000222', 'Engenheiro', 'Cabo Delgado', '+258871234560', 'carlos.mutemba@email.mz', 'Av. da Independência, 808', 'Construtora', true),
(18, 'Helena Machava', 'Mãe', '+258862345670', 'LLL222333444', '222000333', 'Médica', 'Niassa', NULL, 'helena.machava@email.mz', 'Rua do Lago, 909', 'Hospital Provincial', true);
SELECT setval(pg_get_serial_sequence('guardians', 'id'), (SELECT MAX(id) FROM guardians));

INSERT INTO public.student_guardians OVERRIDING SYSTEM VALUE VALUES
(1, 1, 1, true, '2026-01-25 01:09:03+00'),(2, 2, 2, true, '2026-01-25 01:09:03+00'),
(3, 4, 3, true, '2026-01-25 01:09:03+00'),(4, 5, 4, true, '2026-01-25 01:09:03+00'),
(5, 6, 5, true, '2026-01-25 01:09:03+00'),(6, 7, 6, true, '2026-01-25 01:09:03+00');
SELECT setval(pg_get_serial_sequence('student_guardians', 'id'), (SELECT MAX(id) FROM student_guardians));

INSERT INTO public.employees (id, name, role, email, phone, bi_number, nuit, gender, hire_date, salary, status, department, contract_type, province, district, bank_name, bank_account, payment_method) OVERRIDING SYSTEM VALUE VALUES
(1, 'Helena Mondlane', 'Secretária', 'helena.mondlane@escola.mz', '+258851234567', '111222333AA', '123456789', 'Feminino', '2019-01-15', 35000, 'Ativo', 'Administração', 'Efectivo', 'Maputo', 'KaMpfumo', 'BCI', '123456789012', 'bank'),
(2, 'Alberto Chissano', 'Contabilista', 'alberto.chissano@escola.mz', '+258852345678', '222333444BB', '234567890', 'Masculino', '2018-06-01', 42000, 'Ativo', 'Finanças', 'Efectivo', 'Maputo', 'Matola', 'BIM', '234567890123', 'bank'),
(3, 'Graça Machel', 'Bibliotecária', 'graca.machel@escola.mz', '+258853456789', '333444555CC', '345678901', 'Feminino', '2020-03-01', 28000, 'Ativo', 'Biblioteca', 'Prazo', 'Gaza', 'Xai-Xai', 'Standard Bank', '345678901234', 'bank'),
(4, 'Manuel Nguenha', 'Vigilante', 'manuel.nguenha@escola.mz', '+258854567890', '444555666DD', '456789012', 'Masculino', '2021-01-10', 18000, 'Ativo', 'Segurança', 'Prazo', 'Maputo', 'Boane', NULL, NULL, 'mobile_money'),
(5, 'Rosa Bila', 'Servente', 'rosa.bila@escola.mz', '+258855678901', '555666777EE', '567890123', 'Feminino', '2022-02-15', 15000, 'Ativo', 'Limpeza', 'Prazo', 'Maputo', 'KaMubukwana', NULL, NULL, 'mobile_money'),
(6, 'Fernando Guebuza', 'Motorista', 'fernando.guebuza@escola.mz', '+258856789012', '666777888FF', '678901234', 'Masculino', '2019-08-01', 25000, 'Ativo', 'Transporte', 'Efectivo', 'Inhambane', 'Maxixe', 'BCI', '456789012345', 'bank'),
(7, 'Esperança Langa', 'Cozinheira', 'esperanca.langa@escola.mz', '+258857890123', '777888999GG', '789012345', 'Feminino', '2020-05-01', 20000, 'Ativo', 'Cantina', 'Prazo', 'Sofala', 'Beira', NULL, NULL, 'mobile_money'),
(8, 'Zacarias Maputo', 'Técnico TI', 'zacarias.maputo@escola.mz', '+258858901234', '888999000HH', '890123456', 'Masculino', '2023-01-10', 38000, 'Ativo', 'TI', 'Prazo', 'Nampula', 'Nampula', 'FNB', '567890123456', 'bank');
SELECT setval(pg_get_serial_sequence('employees', 'id'), (SELECT MAX(id) FROM employees));

INSERT INTO public.financial_categories OVERRIDING SYSTEM VALUE VALUES
(1, 'Mensalidades', 'Receita'),(2, 'Matrículas', 'Receita'),(3, 'Uniformes', 'Receita'),
(4, 'Material Escolar', 'Receita'),(5, 'Eventos', 'Receita'),(6, 'Doações', 'Receita'),
(9, 'Manutenção', 'Despesa'),(10, 'Água e Luz', 'Despesa'),(11, 'Equipamentos', 'Despesa'),
(101, 'Salários', 'Despesa'),(102, 'Material Didático', 'Despesa'),(103, 'Alimentação', 'Despesa'),
(104, 'Utilities (Água, Luz, Internet)', 'Despesa'),(105, 'Transporte', 'Despesa');
SELECT setval(pg_get_serial_sequence('financial_categories', 'id'), (SELECT MAX(id) FROM financial_categories));

INSERT INTO public.scholarships OVERRIDING SYSTEM VALUE VALUES
(1, 'Bolsa de Mérito Académico', 'Percentagem', 25),(2, 'Apoio Social', 'Valor Fixo', 500),(3, 'Bolsa de Desporto', 'Percentagem', 15);
SELECT setval(pg_get_serial_sequence('scholarships', 'id'), (SELECT MAX(id) FROM scholarships));

INSERT INTO public.student_scholarships VALUES (2, 1), (6, 2);
INSERT INTO public.class_curriculum VALUES (1, 1, 2),(1, 2, 3),(2, 1, 2),(2, 3, 1),(2, 4, 1),(3, 2, 3),(3, 5, 1);

INSERT INTO public.enrollments OVERRIDING SYSTEM VALUE VALUES
(1, 'Ana Silva', '2024-01-10', 5000, 0, 'Pago'),(2, 'Bruno Costa', '2024-01-11', 5000, 500, 'Pago'),
(3, 'Carla Dias', '2024-01-12', 5000, 0, 'Pago'),(4, 'Novo Aluno', '2024-07-20', 5000, 0, 'Pendente');
SELECT setval(pg_get_serial_sequence('enrollments', 'id'), (SELECT MAX(id) FROM enrollments));

INSERT INTO public.student_enrollments (id, student_id, academic_year_id, class_id, enrollment_number, enrollment_date, status, monthly_fee, enrollment_fee, discount_percent) OVERRIDING SYSTEM VALUE VALUES
(5, 23, 2, 12, 'MAT-2026-00001', '2026-01-15', 'APROVADA', 2500, 1500, 0),
(6, 24, 2, 12, 'MAT-2026-00002', '2026-01-15', 'APROVADA', 2500, 1500, 0),
(7, 25, 2, 13, 'MAT-2026-00003', '2026-01-15', 'APROVADA', 2500, 1500, 10),
(8, 26, 2, 13, 'MAT-2026-00004', '2026-01-15', 'APROVADA', 2500, 1500, 0),
(9, 27, 2, 14, 'MAT-2026-00005', '2026-01-15', 'APROVADA', 2800, 1500, 0),
(10, 28, 2, 14, 'MAT-2026-00006', '2026-01-15', 'APROVADA', 2800, 1500, 0),
(11, 29, 2, 15, 'MAT-2026-00007', '2026-01-15', 'APROVADA', 2800, 1500, 0),
(12, 30, 2, 15, 'MAT-2026-00008', '2026-01-15', 'APROVADA', 2800, 1500, 10),
(13, 31, 2, 16, 'MAT-2026-00009', '2026-01-15', 'APROVADA', 3200, 1500, 0),
(14, 32, 2, 16, 'MAT-2026-00010', '2026-01-15', 'APROVADA', 3200, 1500, 0),
(15, 33, 2, 17, 'MAT-2026-00011', '2026-01-15', 'APROVADA', 3200, 1500, 0),
(16, 34, 2, 17, 'MAT-2026-00012', '2026-01-15', 'APROVADA', 3200, 1500, 0),
(17, 35, 2, 18, 'MAT-2026-00013', '2026-01-15', 'APROVADA', 3500, 1500, 10),
(18, 36, 2, 18, 'MAT-2026-00014', '2026-01-15', 'APROVADA', 3500, 1500, 0),
(19, 37, 2, 19, 'MAT-2026-00015', '2026-01-15', 'APROVADA', 4000, 1500, 0),
(20, 38, 2, 19, 'MAT-2026-00016', '2026-01-15', 'APROVADA', 4000, 1500, 0),
(21, 39, 2, 12, 'MAT-2026-00017', '2026-01-15', 'APROVADA', 2500, 1500, 0);
SELECT setval(pg_get_serial_sequence('student_enrollments', 'id'), (SELECT MAX(id) FROM student_enrollments));

INSERT INTO public.calendar_events (id, title, description, date, type, is_all_day, location, color, class_id, subject_id) OVERRIDING SYSTEM VALUE VALUES
(1, 'Início do 2º Trimestre', 'Marca o começo do segundo trimestre letivo.', '2024-04-15', 'Evento', true, NULL, '#2D5F3F', NULL, NULL),
(2, 'Dia da Paz', 'Feriado nacional.', '2024-04-04', 'Feriado', true, NULL, '#2D5F3F', NULL, NULL),
(3, 'Prova de Matemática - 7ª Classe', NULL, '2024-05-20', 'Prova', true, NULL, '#2D5F3F', 2, 1),
(7, 'Entrega de Boletins 1º Trimestre', 'Reunião com encarregados', '2026-04-28', 'Evento', false, 'Auditório', '#2D5F3F', NULL, NULL),
(8, 'Dia do Herói Moçambicano', 'Feriado Nacional', '2026-02-03', 'Feriado', true, NULL, '#DC2626', NULL, NULL),
(10, 'Feira de Ciências', 'Exposição de projetos dos alunos', '2026-03-20', 'Evento', true, 'Pátio Central', '#8B5CF6', NULL, NULL),
(11, 'Provas do 2º Trimestre', 'Início das provas trimestrais', '2026-07-06', 'Prova', true, 'Salas de Aula', '#F59E0B', NULL, NULL),
(12, 'Férias Escolares', 'Início das férias do meio do ano', '2026-07-20', 'Evento', true, NULL, '#06B6D4', NULL, NULL);
SELECT setval(pg_get_serial_sequence('calendar_events', 'id'), (SELECT MAX(id) FROM calendar_events));

INSERT INTO public.announcements (id, title, content, type, priority, target_audience, is_published, published_at) OVERRIDING SYSTEM VALUE VALUES
(1, 'Bem-vindos ao Ano Lectivo 2026!', 'É com grande alegria que damos as boas-vindas a todos.', 'GERAL', 'ALTA', ARRAY['TODOS'], true, '2026-01-25 03:42:37+00'),
(2, 'Calendário de Pagamentos 2026', 'Pagamento das propinas até ao dia 10 de cada mês.', 'PROPINAS', 'URGENTE', ARRAY['ENCARREGADOS'], true, '2026-01-25 03:42:37+00'),
(3, 'Reunião de Pais - 8ª Classe', 'Reunião no dia 08 de Fevereiro às 14h.', 'REUNIAO', 'NORMAL', ARRAY['ENCARREGADOS'], true, '2026-01-25 03:42:37+00'),
(4, 'Horário das Aulas', 'Horário do 1º trimestre disponível na secretaria.', 'INFORMATIVO', 'NORMAL', ARRAY['PROFESSORES', 'ALUNOS'], true, '2026-01-25 03:42:37+00'),
(5, 'Feira de Ciências 2026', 'Inscrições abertas para a Feira de Ciências.', 'EVENTO', 'BAIXA', ARRAY['ALUNOS', 'PROFESSORES'], true, '2026-01-25 03:42:37+00'),
(6, 'Manutenção do Sistema', 'Sistema indisponível no dia 02/02 das 22h às 06h.', 'INFORMATIVO', 'ALTA', ARRAY['TODOS'], false, NULL);
SELECT setval(pg_get_serial_sequence('announcements', 'id'), (SELECT MAX(id) FROM announcements));

INSERT INTO public.integration_settings (id, integration_name, api_url, instance_name, is_active, additional_config) OVERRIDING SYSTEM VALUE VALUES
(1, 'evolution_api', 'https://evoapi.autozapi.com', 'SGE-REVIVA', true, '{"description":"WhatsApp Business API"}'),
(2, 'openai', NULL, NULL, true, '{"description":"OpenAI GPT API"}'),
(3, 'google_ai', NULL, NULL, true, '{"description":"Google AI Studio (Gemini)"}');
SELECT setval(pg_get_serial_sequence('integration_settings', 'id'), (SELECT MAX(id) FROM integration_settings));

INSERT INTO public.lesson_plan_config (id, config_key, config_value, description) OVERRIDING SYSTEM VALUE VALUES
(2, 'model', 'google/gemini-2.5-flash', 'Modelo de IA a utilizar'),
(3, 'temperature', '0.2', 'Temperatura da geração (0-1)'),
(4, 'max_tokens', '16000', 'Máximo de tokens na resposta'),
(5, 'llm_provider', 'google', 'Provedor de IA');
SELECT setval(pg_get_serial_sequence('lesson_plan_config', 'id'), (SELECT MAX(id) FROM lesson_plan_config));

INSERT INTO public.lesson_plan_fields (id, field_name, field_label, field_type, options, is_required, is_active, display_order) OVERRIDING SYSTEM VALUE VALUES
(9, 'tema_aula', 'Tema da Aula', 'text', '{}', true, true, 1),
(10, 'objetivos_competencias', 'Objectivos e Competências', 'textarea', '{}', false, true, 2),
(11, 'num_aulas', 'Número de aulas pretendido', 'select', ARRAY['1','2','3','4','5','6','7','8','9'], true, true, 3),
(12, 'principio', 'Princípios da AEP', 'multiselect', ARRAY['Mordomia','Caráter','Semeadura e Colheita','Autogoverno','Soberania','Individualidade','União / Aliança'], true, true, 4),
(13, 'palavras_chave', 'Palavras-Chave', 'textarea', '{}', true, true, 5),
(14, 'versiculos_biblicos', 'Textos Bíblicos', 'textarea', '{}', false, true, 6),
(15, 'ideia_guia', 'Ideia-Guia', 'textarea', '{}', false, true, 7),
(16, 'ferramentas_aep', 'Ferramentas da AEP', 'multiselect', ARRAY['Fichário','Estudo de palavras (Webster)','Ensaio (produção textual)','Belas Artes','Clássicos literários','Biografias','Linha do tempo','Memoriais','Celebração','Avaliações e Revisões','Oportunidade de Serviço'], true, true, 8);
SELECT setval(pg_get_serial_sequence('lesson_plan_fields', 'id'), (SELECT MAX(id) FROM lesson_plan_fields));
