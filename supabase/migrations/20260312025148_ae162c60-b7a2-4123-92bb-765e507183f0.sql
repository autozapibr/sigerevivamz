-- Storage policies for aep-training-docs bucket
CREATE POLICY "Admin can upload training docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'aep-training-docs' 
  AND public.has_any_role(auth.uid(), ARRAY['ADMIN'::public.app_role, 'DIRETORIA'::public.app_role])
);

CREATE POLICY "Admin can update training docs"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'aep-training-docs'
  AND public.has_any_role(auth.uid(), ARRAY['ADMIN'::public.app_role, 'DIRETORIA'::public.app_role])
);

CREATE POLICY "Admin can delete training docs"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'aep-training-docs'
  AND public.has_any_role(auth.uid(), ARRAY['ADMIN'::public.app_role, 'DIRETORIA'::public.app_role])
);

CREATE POLICY "Staff can read training docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'aep-training-docs'
  AND public.is_staff(auth.uid())
);

-- Storage policies for teacher-files bucket
CREATE POLICY "Teachers can upload own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'teacher-files'
  AND public.is_staff(auth.uid())
);

CREATE POLICY "Teachers can read own files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'teacher-files'
  AND public.is_staff(auth.uid())
);

CREATE POLICY "Teachers can delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'teacher-files'
  AND public.is_staff(auth.uid())
);

-- Storage policies for student-documents bucket
CREATE POLICY "Staff can upload student docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'student-documents'
  AND (public.has_role(auth.uid(), 'DIRETORIA'::public.app_role) OR public.has_role(auth.uid(), 'SECRETARIA'::public.app_role))
);

CREATE POLICY "Staff can read student docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'student-documents'
  AND (public.has_role(auth.uid(), 'DIRETORIA'::public.app_role) OR public.has_role(auth.uid(), 'SECRETARIA'::public.app_role))
);

CREATE POLICY "Staff can delete student docs"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'student-documents'
  AND (public.has_role(auth.uid(), 'DIRETORIA'::public.app_role) OR public.has_role(auth.uid(), 'SECRETARIA'::public.app_role))
);

-- Storage policies for staff-files bucket
CREATE POLICY "Admin can upload staff files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'staff-files'
  AND public.has_any_role(auth.uid(), ARRAY['ADMIN'::public.app_role, 'DIRETORIA'::public.app_role, 'SECRETARIA'::public.app_role])
);

CREATE POLICY "Admin can read staff files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'staff-files'
  AND public.has_any_role(auth.uid(), ARRAY['ADMIN'::public.app_role, 'DIRETORIA'::public.app_role, 'SECRETARIA'::public.app_role])
);

CREATE POLICY "Admin can delete staff files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'staff-files'
  AND public.has_any_role(auth.uid(), ARRAY['ADMIN'::public.app_role, 'DIRETORIA'::public.app_role, 'SECRETARIA'::public.app_role])
);