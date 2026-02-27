
-- Create table to track teacher files
CREATE TABLE public.teacher_files (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  teacher_user_id uuid NOT NULL,
  teacher_name text NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  mime_type text,
  category text NOT NULL DEFAULT 'Outro',
  description text,
  subject_id bigint REFERENCES public.subjects(id) ON DELETE SET NULL,
  class_id bigint REFERENCES public.classes(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.teacher_files ENABLE ROW LEVEL SECURITY;

-- Teachers can manage their own files
CREATE POLICY "Teachers can manage own files"
ON public.teacher_files FOR ALL
USING (auth.uid() = teacher_user_id)
WITH CHECK (auth.uid() = teacher_user_id);

-- Admin/Diretoria/Pedagógico can view all files
CREATE POLICY "Admin can view all teacher files"
ON public.teacher_files FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role, 'PEDAGOGICO'::app_role]));

-- Trigger for updated_at
CREATE TRIGGER update_teacher_files_updated_at
BEFORE UPDATE ON public.teacher_files
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for teacher files
INSERT INTO storage.buckets (id, name, public) VALUES ('teacher-files', 'teacher-files', false);

-- Storage RLS: teachers can upload to their own folder
CREATE POLICY "Teachers can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'teacher-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Teachers can view own files"
ON storage.objects FOR SELECT
USING (bucket_id = 'teacher-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Teachers can delete own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'teacher-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admin can view all teacher files in storage
CREATE POLICY "Admin can view all teacher storage files"
ON storage.objects FOR SELECT
USING (bucket_id = 'teacher-files' AND has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role, 'PEDAGOGICO'::app_role]));
