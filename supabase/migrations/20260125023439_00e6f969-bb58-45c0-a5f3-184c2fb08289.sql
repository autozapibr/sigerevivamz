-- Security Fix: Add public SELECT policy for contract_signatures
-- This allows unauthenticated users to read contracts they need to sign via their token

CREATE POLICY "Public can read contract with valid token"
ON public.contract_signatures
FOR SELECT
USING (
  signature_token IS NOT NULL 
  AND status IN ('pending', 'sent')
  AND (token_expires_at IS NULL OR token_expires_at > now())
);

-- Security Fix: Make staff-files bucket private
-- This prevents unauthorized access to sensitive employee documents
UPDATE storage.buckets 
SET public = false 
WHERE id = 'staff-files';