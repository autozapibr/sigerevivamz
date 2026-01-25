-- Fix PUBLIC_DATA_EXPOSURE: Employee salary and banking data accessible to all staff
-- This migration restricts sensitive financial data visibility to authorized roles only

-- Step 1: Drop the overly permissive policy
DROP POLICY IF EXISTS "Staff can view employees" ON public.employees;

-- Step 2: Create a new restrictive policy for full data access (only DIRETORIA and FINANCEIRO)
CREATE POLICY "Finance and management can view all employee data"
ON public.employees FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role, 'FINANCEIRO'::app_role]));

-- Step 3: Create a secure view that excludes sensitive financial data for general staff
CREATE OR REPLACE VIEW public.employees_public_info
WITH (security_invoker = on) AS
SELECT 
  id,
  name,
  email,
  phone,
  role,
  department,
  status,
  photo_url,
  gender,
  hire_date,
  contract_type,
  province,
  district,
  created_at,
  updated_at
FROM public.employees;

-- Step 4: Grant access to the view for authenticated users
GRANT SELECT ON public.employees_public_info TO authenticated;

-- Step 5: Add comment explaining the security rationale
COMMENT ON VIEW public.employees_public_info IS 'Public view of employees excluding sensitive financial data (salary, bank details, NUIT, BI). Use this view for general staff access. Full data available only to DIRETORIA and FINANCEIRO roles via the base table.';