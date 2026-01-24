-- Corrigir warnings de segurança das funções

-- 1. Corrigir calculate_trimester_average
CREATE OR REPLACE FUNCTION public.calculate_trimester_average(
  _acs NUMERIC,
  _acp NUMERIC,
  _acf NUMERIC
) RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT ROUND(
    COALESCE(_acs, 0) * 0.30 +
    COALESCE(_acp, 0) * 0.30 +
    COALESCE(_acf, 0) * 0.40,
    2
  );
$$;

-- 2. Corrigir calculate_final_average
CREATE OR REPLACE FUNCTION public.calculate_final_average(
  _t1 NUMERIC,
  _t2 NUMERIC,
  _t3 NUMERIC
) RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
SET search_path = public
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

-- 3. Corrigir classify_grade
CREATE OR REPLACE FUNCTION public.classify_grade(_grade NUMERIC)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN _grade >= 18 THEN 'Excelente'
    WHEN _grade >= 14 THEN 'Bom'
    WHEN _grade >= 10 THEN 'Suficiente'
    WHEN _grade >= 5 THEN 'Insuficiente'
    ELSE 'Mau'
  END;
$$;

-- 4. Recriar view com SECURITY INVOKER
DROP VIEW IF EXISTS public.student_attendance_stats;

CREATE VIEW public.student_attendance_stats 
WITH (security_invoker = true)
AS
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