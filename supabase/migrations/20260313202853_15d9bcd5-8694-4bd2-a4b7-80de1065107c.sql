
-- Fix 1: Recreate contract_signatures_signing view as SECURITY INVOKER (default)
DROP VIEW IF EXISTS public.contract_signatures_signing;
CREATE VIEW public.contract_signatures_signing AS
SELECT id, staff_name, contract_type, contract_html, status, signature_token, token_expires_at
FROM public.contract_signatures
WHERE status IN ('pending', 'sent')
  AND (token_expires_at IS NULL OR token_expires_at > now());

-- Fix 2: Enable RLS on db_ativo and add admin-only policy
ALTER TABLE public.db_ativo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage db_ativo"
  ON public.db_ativo FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role]));
