
-- Drop anonymous demo policies on contract_signatures
DROP POLICY IF EXISTS "Anon can view contract_signatures for demo" ON public.contract_signatures;
DROP POLICY IF EXISTS "Anon can insert contract_signatures for demo" ON public.contract_signatures;
DROP POLICY IF EXISTS "Anon can update contract_signatures for demo" ON public.contract_signatures;
DROP POLICY IF EXISTS "Anon can delete contract_signatures for demo" ON public.contract_signatures;
