
-- 1) Bucket privado para backups
INSERT INTO storage.buckets (id, name, public)
VALUES ('database-backups', 'database-backups', false)
ON CONFLICT (id) DO NOTHING;

-- 2) Policies: apenas ADMIN/DIRETORIA podem ver/descarregar/eliminar
DROP POLICY IF EXISTS "Admin can view database backups" ON storage.objects;
CREATE POLICY "Admin can view database backups"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'database-backups'
    AND public.has_any_role(auth.uid(), ARRAY['ADMIN'::public.app_role, 'DIRETORIA'::public.app_role])
  );

DROP POLICY IF EXISTS "Admin can delete database backups" ON storage.objects;
CREATE POLICY "Admin can delete database backups"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'database-backups'
    AND public.has_any_role(auth.uid(), ARRAY['ADMIN'::public.app_role, 'DIRETORIA'::public.app_role])
  );

-- (INSERT/UPDATE são feitos pela edge function via service_role e ignoram RLS.)

-- 3) Extensões necessárias para agendamento HTTP
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
