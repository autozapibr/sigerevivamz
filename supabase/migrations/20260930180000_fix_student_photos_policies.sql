-- Corrige as políticas do bucket privado student-photos.
-- As políticas antigas usavam a função user_has_role(), que já não existe
-- (foi substituída por has_role(uuid, app_role)) — por isso o upload/visualização
-- de fotos deixou de funcionar. Recriadas com has_role e incluindo ADMIN/FINANCEIRO.

DROP POLICY IF EXISTS "DIRETORIA e SECRETARIA podem ver fotos" ON storage.objects;
DROP POLICY IF EXISTS "DIRETORIA e SECRETARIA podem fazer upload de fotos" ON storage.objects;
DROP POLICY IF EXISTS "DIRETORIA e SECRETARIA podem atualizar fotos" ON storage.objects;
DROP POLICY IF EXISTS "DIRETORIA e SECRETARIA podem deletar fotos" ON storage.objects;
DROP POLICY IF EXISTS "student_photos_select" ON storage.objects;
DROP POLICY IF EXISTS "student_photos_insert" ON storage.objects;
DROP POLICY IF EXISTS "student_photos_update" ON storage.objects;
DROP POLICY IF EXISTS "student_photos_delete" ON storage.objects;

CREATE POLICY "student_photos_select" ON storage.objects FOR SELECT
USING (bucket_id = 'student-photos' AND (
  public.has_role(auth.uid(), 'ADMIN'::public.app_role)
  OR public.has_role(auth.uid(), 'DIRETORIA'::public.app_role)
  OR public.has_role(auth.uid(), 'SECRETARIA'::public.app_role)
  OR public.has_role(auth.uid(), 'FINANCEIRO'::public.app_role)
));

CREATE POLICY "student_photos_insert" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'student-photos' AND (
  public.has_role(auth.uid(), 'ADMIN'::public.app_role)
  OR public.has_role(auth.uid(), 'DIRETORIA'::public.app_role)
  OR public.has_role(auth.uid(), 'SECRETARIA'::public.app_role)
  OR public.has_role(auth.uid(), 'FINANCEIRO'::public.app_role)
));

CREATE POLICY "student_photos_update" ON storage.objects FOR UPDATE
USING (bucket_id = 'student-photos' AND (
  public.has_role(auth.uid(), 'ADMIN'::public.app_role)
  OR public.has_role(auth.uid(), 'DIRETORIA'::public.app_role)
  OR public.has_role(auth.uid(), 'SECRETARIA'::public.app_role)
  OR public.has_role(auth.uid(), 'FINANCEIRO'::public.app_role)
));

CREATE POLICY "student_photos_delete" ON storage.objects FOR DELETE
USING (bucket_id = 'student-photos' AND (
  public.has_role(auth.uid(), 'ADMIN'::public.app_role)
  OR public.has_role(auth.uid(), 'DIRETORIA'::public.app_role)
  OR public.has_role(auth.uid(), 'SECRETARIA'::public.app_role)
  OR public.has_role(auth.uid(), 'FINANCEIRO'::public.app_role)
));
