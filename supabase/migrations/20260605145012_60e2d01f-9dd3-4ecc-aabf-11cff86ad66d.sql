DROP POLICY IF EXISTS "Staff can manage student_enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Staff can view student_enrollments" ON public.student_enrollments;

CREATE POLICY "Staff can manage student_enrollments"
ON public.student_enrollments
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'ADMIN'::app_role)
  OR has_role(auth.uid(), 'DIRETORIA'::app_role)
  OR has_role(auth.uid(), 'SECRETARIA'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'ADMIN'::app_role)
  OR has_role(auth.uid(), 'DIRETORIA'::app_role)
  OR has_role(auth.uid(), 'SECRETARIA'::app_role)
);

CREATE POLICY "Staff can view student_enrollments"
ON public.student_enrollments
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'ADMIN'::app_role)
  OR has_role(auth.uid(), 'DIRETORIA'::app_role)
  OR has_role(auth.uid(), 'SECRETARIA'::app_role)
  OR has_role(auth.uid(), 'FINANCEIRO'::app_role)
);

DROP POLICY IF EXISTS "Teachers can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete own files" ON storage.objects;

CREATE POLICY "Teachers can upload own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teacher-files'
  AND auth.uid() IS NOT NULL
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role])
  )
);

CREATE POLICY "Teachers can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'teacher-files'
  AND auth.uid() IS NOT NULL
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role])
  )
);