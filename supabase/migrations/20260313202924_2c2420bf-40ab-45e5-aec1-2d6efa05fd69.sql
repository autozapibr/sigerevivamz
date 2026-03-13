
-- Fix all 3 views to use SECURITY INVOKER explicitly

-- 1. contract_signatures_signing
DROP VIEW IF EXISTS public.contract_signatures_signing;
CREATE VIEW public.contract_signatures_signing
WITH (security_invoker = on) AS
SELECT id, staff_name, contract_type, contract_html, status, signature_token, token_expires_at
FROM public.contract_signatures
WHERE status IN ('pending', 'sent')
  AND (token_expires_at IS NULL OR token_expires_at > now());

-- 2. employees_public_info
DROP VIEW IF EXISTS public.employees_public_info;
CREATE VIEW public.employees_public_info
WITH (security_invoker = on) AS
SELECT id, name, email, phone, role, department, status, photo_url, gender,
       hire_date, contract_type, province, district, created_at, updated_at
FROM public.employees;

-- 3. student_attendance_stats
DROP VIEW IF EXISTS public.student_attendance_stats;
CREATE VIEW public.student_attendance_stats
WITH (security_invoker = on) AS
SELECT s.id AS student_id, s.name AS student_name,
       c.id AS class_id, c.name AS class_name,
       count(*) FILTER (WHERE a.status = 'PRESENTE') AS presencas,
       count(*) FILTER (WHERE a.status = 'FALTA') AS faltas,
       count(*) FILTER (WHERE a.status = 'FALTA_JUSTIFICADA') AS faltas_justificadas,
       count(*) FILTER (WHERE a.status = 'ATRASO') AS atrasos,
       count(*) AS total_dias,
       round((count(*) FILTER (WHERE a.status = 'PRESENTE')::numeric / NULLIF(count(*), 0)::numeric) * 100, 2) AS taxa_presenca
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
LEFT JOIN attendance a ON s.id = a.student_id
GROUP BY s.id, s.name, c.id, c.name;
