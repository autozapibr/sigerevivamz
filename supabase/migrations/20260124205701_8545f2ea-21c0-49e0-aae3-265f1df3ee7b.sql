-- ============================================================
-- ETAPA 2: GESTÃO ESCOLAR - MIGRATIONS
-- Sistema de Assiduidade, Pauta Digital, Comunicados
-- ============================================================

-- 1. TABELA DE PRESENÇAS (Assiduidade)
CREATE TABLE IF NOT EXISTS public.attendance (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id BIGINT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id BIGINT REFERENCES public.subjects(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('PRESENTE', 'FALTA', 'FALTA_JUSTIFICADA', 'ATRASO')),
  observation TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, date, subject_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON public.attendance(class_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para attendance
CREATE POLICY "Staff can view attendance"
ON public.attendance FOR SELECT
USING (is_staff(auth.uid()));

CREATE POLICY "Teachers can manage attendance"
ON public.attendance FOR ALL
USING (has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role, 'PROFESSOR'::app_role, 'PEDAGOGICO'::app_role]));

-- Trigger para updated_at
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 2. MELHORAR TABELA DE GRADES (Pauta Digital)
-- Adicionar colunas para ACS, ACP, ACF conforme MINEDH
ALTER TABLE public.grades 
ADD COLUMN IF NOT EXISTS trimestre INTEGER CHECK (trimestre BETWEEN 1 AND 3),
ADD COLUMN IF NOT EXISTS acs NUMERIC(4,2) CHECK (acs >= 0 AND acs <= 20),
ADD COLUMN IF NOT EXISTS acp NUMERIC(4,2) CHECK (acp >= 0 AND acp <= 20),
ADD COLUMN IF NOT EXISTS acf NUMERIC(4,2) CHECK (acf >= 0 AND acf <= 20),
ADD COLUMN IF NOT EXISTS media_trimestral NUMERIC(4,2) CHECK (media_trimestral >= 0 AND media_trimestral <= 20),
ADD COLUMN IF NOT EXISTS media_final NUMERIC(4,2) CHECK (media_final >= 0 AND media_final <= 20),
ADD COLUMN IF NOT EXISTS academic_year_id BIGINT REFERENCES public.academic_years(id),
ADD COLUMN IF NOT EXISTS class_id BIGINT REFERENCES public.classes(id),
ADD COLUMN IF NOT EXISTS observation TEXT,
ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Trigger para updated_at em grades
DROP TRIGGER IF EXISTS update_grades_updated_at ON public.grades;
CREATE TRIGGER update_grades_updated_at
BEFORE UPDATE ON public.grades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 3. TABELA DE COMUNICADOS
CREATE TABLE IF NOT EXISTS public.announcements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('GERAL', 'URGENTE', 'INFORMATIVO', 'EVENTO', 'REUNIAO', 'PROPINAS')),
  priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('BAIXA', 'NORMAL', 'ALTA', 'URGENTE')),
  target_audience TEXT[] NOT NULL DEFAULT ARRAY['TODOS'],
  class_ids BIGINT[] DEFAULT NULL,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  expires_at DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para announcements
CREATE POLICY "Staff can view announcements"
ON public.announcements FOR SELECT
USING (is_staff(auth.uid()));

CREATE POLICY "Admin can manage announcements"
ON public.announcements FOR ALL
USING (has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role, 'SECRETARIA'::app_role, 'PEDAGOGICO'::app_role]));

-- Trigger para updated_at
CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4. TABELA DE LEITURA DE COMUNICADOS
CREATE TABLE IF NOT EXISTS public.announcement_reads (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  announcement_id BIGINT NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

-- Enable RLS
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para announcement_reads
CREATE POLICY "Users can read own announcement_reads"
ON public.announcement_reads FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own announcement_reads"
ON public.announcement_reads FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. MELHORAR CALENDAR_EVENTS
ALTER TABLE public.calendar_events 
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS is_all_day BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS recurrence TEXT CHECK (recurrence IN ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')),
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#2D5F3F',
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Trigger para updated_at em calendar_events
DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 6. FUNÇÃO PARA CALCULAR MÉDIA TRIMESTRAL (Sistema MINEDH)
-- ACS (30%) + ACP (30%) + ACF (40%)
CREATE OR REPLACE FUNCTION public.calculate_trimester_average(
  _acs NUMERIC,
  _acp NUMERIC,
  _acf NUMERIC
) RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT ROUND(
    COALESCE(_acs, 0) * 0.30 +
    COALESCE(_acp, 0) * 0.30 +
    COALESCE(_acf, 0) * 0.40,
    2
  );
$$;

-- 7. FUNÇÃO PARA CALCULAR MÉDIA FINAL ANUAL
-- Média dos 3 trimestres
CREATE OR REPLACE FUNCTION public.calculate_final_average(
  _t1 NUMERIC,
  _t2 NUMERIC,
  _t3 NUMERIC
) RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT ROUND(
    (COALESCE(_t1, 0) + COALESCE(_t2, 0) + COALESCE(_t3, 0)) / 
    NULLIF(
      CASE WHEN _t1 IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN _t2 IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN _t3 IS NOT NULL THEN 1 ELSE 0 END,
      0
    ),
    2
  );
$$;

-- 8. FUNÇÃO PARA CLASSIFICAR NOTA (Sistema Moçambicano)
CREATE OR REPLACE FUNCTION public.classify_grade(_grade NUMERIC)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN _grade >= 18 THEN 'Excelente'
    WHEN _grade >= 14 THEN 'Bom'
    WHEN _grade >= 10 THEN 'Suficiente'
    WHEN _grade >= 5 THEN 'Insuficiente'
    ELSE 'Mau'
  END;
$$;

-- 9. VIEW PARA ESTATÍSTICAS DE ASSIDUIDADE POR ALUNO
CREATE OR REPLACE VIEW public.student_attendance_stats AS
SELECT 
  s.id as student_id,
  s.name as student_name,
  c.id as class_id,
  c.name as class_name,
  COUNT(*) FILTER (WHERE a.status = 'PRESENTE') as presencas,
  COUNT(*) FILTER (WHERE a.status = 'FALTA') as faltas,
  COUNT(*) FILTER (WHERE a.status = 'FALTA_JUSTIFICADA') as faltas_justificadas,
  COUNT(*) FILTER (WHERE a.status = 'ATRASO') as atrasos,
  COUNT(*) as total_dias,
  ROUND(
    COUNT(*) FILTER (WHERE a.status = 'PRESENTE')::NUMERIC / NULLIF(COUNT(*), 0) * 100,
    2
  ) as taxa_presenca
FROM public.students s
LEFT JOIN public.classes c ON s.class_id = c.id
LEFT JOIN public.attendance a ON s.id = a.student_id
GROUP BY s.id, s.name, c.id, c.name;