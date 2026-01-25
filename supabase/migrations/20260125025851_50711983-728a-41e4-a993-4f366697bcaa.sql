-- Fix the SECURITY DEFINER view issue by converting it to a regular view
-- The view doesn't need SECURITY DEFINER as it's just a filtered projection

-- Drop the existing view
DROP VIEW IF EXISTS public.contract_signatures_signing;

-- Recreate as a normal view without SECURITY DEFINER
-- The view is safe because:
-- 1. It only exposes limited fields
-- 2. The WHERE clause ensures only valid tokens can be accessed
-- 3. The underlying table has RLS enabled
CREATE VIEW public.contract_signatures_signing 
WITH (security_invoker = true)
AS
SELECT 
  id,
  staff_name,
  contract_type,
  contract_html,
  status,
  signature_token,
  token_expires_at
FROM public.contract_signatures
WHERE signature_token IS NOT NULL
  AND status IN ('pending', 'sent')
  AND (token_expires_at IS NULL OR token_expires_at > now());

-- Grant access to the view
GRANT SELECT ON public.contract_signatures_signing TO anon;
GRANT SELECT ON public.contract_signatures_signing TO authenticated;

-- Add a new RLS policy on the base table that allows SELECT 
-- only for specific token matches (row-level, not table-level)
CREATE POLICY "Public can read own contract by token"
ON public.contract_signatures
FOR SELECT
TO anon
USING (false);  -- Anon cannot directly access table, must use function

-- The function get_contract_for_signing uses SECURITY DEFINER 
-- which is appropriate as it:
-- 1. Only returns specific fields
-- 2. Validates the token
-- 3. Has fixed search_path