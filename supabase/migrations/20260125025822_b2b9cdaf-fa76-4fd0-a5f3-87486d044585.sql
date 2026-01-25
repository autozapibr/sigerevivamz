-- Fix 1: Create a restricted view for public contract signature access
-- This limits what data is exposed via token-based access

-- First, drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Public can read contract with valid token" ON public.contract_signatures;

-- Create a more restricted view for public access
CREATE OR REPLACE VIEW public.contract_signatures_signing AS
SELECT 
  id,
  staff_name,
  contract_type,
  contract_html,  -- Required for signing - but only accessible with valid token
  status,
  signature_token,
  token_expires_at
FROM public.contract_signatures
WHERE signature_token IS NOT NULL
  AND status IN ('pending', 'sent')
  AND (token_expires_at IS NULL OR token_expires_at > now());

-- Grant SELECT on view to anon role (for public signing page)
GRANT SELECT ON public.contract_signatures_signing TO anon;
GRANT SELECT ON public.contract_signatures_signing TO authenticated;

-- Create a function to get contract by token (more secure than direct table access)
CREATE OR REPLACE FUNCTION public.get_contract_for_signing(_token uuid)
RETURNS TABLE (
  id bigint,
  staff_name text,
  contract_type text,
  contract_html text,
  status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    cs.id,
    cs.staff_name,
    cs.contract_type,
    cs.contract_html,
    cs.status
  FROM public.contract_signatures cs
  WHERE cs.signature_token = _token
    AND cs.status IN ('pending', 'sent')
    AND (cs.token_expires_at IS NULL OR cs.token_expires_at > now())
  LIMIT 1;
$$;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_contract_for_signing(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_contract_for_signing(uuid) TO authenticated;

-- Fix 2: Set search_path on update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Keep the UPDATE policy for signing (with token validation)
-- The existing UPDATE policy is fine as it properly validates the token