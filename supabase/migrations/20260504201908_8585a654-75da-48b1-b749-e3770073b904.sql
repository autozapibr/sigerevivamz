
-- =============================================
-- 1. Fix privilege escalation on user_roles
-- =============================================

-- Deny all mutations to non-admins
CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role]));

CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role]));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role]));

-- =============================================
-- 2. Fix contract_signatures public update
-- Drop the overly permissive public policies and replace with secure ones
-- =============================================

DROP POLICY IF EXISTS "Public can sign with valid token" ON public.contract_signatures;
DROP POLICY IF EXISTS "Public can read contract by token" ON public.contract_signatures;

-- Contract signing should only work through the secure RPC get_contract_for_signing
-- No direct public access needed since we have the RPC

-- =============================================
-- 3. Fix teacher-files storage: restrict reads to own files
-- =============================================

DROP POLICY IF EXISTS "Teachers can read own files" ON storage.objects;

CREATE POLICY "Teachers can read own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'teacher-files'
  AND auth.uid() IS NOT NULL
  AND (
    -- Teacher can read their own files (path starts with their user id)
    (storage.foldername(name))[1] = auth.uid()::text
    -- Admins can read all
    OR public.has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role])
  )
);

-- =============================================
-- 4. Make student-photos and staff-files buckets private
-- =============================================

UPDATE storage.buckets SET public = false WHERE id IN ('student-photos', 'staff-files');

-- =============================================
-- 5. Restrict SECURITY DEFINER function execution
-- Revoke anon execution on internal helper functions
-- =============================================

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_any_role(uuid, app_role[]) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.audit_trigger_fn() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_exam_created() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_ticket_message() FROM anon;
REVOKE EXECUTE ON FUNCTION public.supaon_insert_next() FROM anon;
REVOKE EXECUTE ON FUNCTION public.supaon_cleanup_if_due() FROM anon;

-- Keep validate_invitation and get_contract_for_signing accessible to anon (needed for public flows)
-- Keep consume_invitation accessible to anon (used during registration)
